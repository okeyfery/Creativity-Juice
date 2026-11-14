import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ClientWorkspace, ProjectBriefSubmission } from './data/clientPortalData';
import {
  getClientWorkspaces,
  getActiveClientId,
  setActiveClientId,
  getClientById,
  authenticateClient,
  submitAndArchiveProjectBrief,
  SubmitBriefPayload,
  getAllArchivedBriefs,
  toggleBriefReadStatus,
  markAllBriefsAsRead,
  updateBriefStatus,
  deleteSubmittedBrief,
  syncProjectsTableIntoBriefs,
  CLIENT_PORTAL_EVENT,
} from './clientPortalStore';
import {
  isAdminAuthenticated,
  syncPortfoliosFromDatabase,
  CJ_STUDIO_DATA_EVENT,
} from './adminStore';
import { initServerSync, pullStateFromServer, NEW_BRIEF_NOTIFICATION_EVENT } from './serverSync';
import {
  startBriefRealtimeSyncService,
  BriefsCollection,
  BRIEF_REALTIME_SYNC_EVENT,
} from './briefSyncService';
import {
  supabase,
  ensureSupabaseClient,
  isSupabaseConfigured,
  fetchProjectsFromDatabase,
  insertProjectToDatabase,
  deleteProjectFromDatabase,
  fetchPortfoliosFromDatabase,
  insertPortfolioToDatabase,
  deletePortfolioFromDatabase,
  type SupabaseProjectRow,
  type SupabasePortfolioRow,
} from './supabaseClient';

export interface ClientPortalContextValue {
  /** Direct reference to the initialized Supabase client */
  supabase: SupabaseClient | null;
  /** True when Supabase or Cloud SQL PostgreSQL is connected */
  isDatabaseConnected: boolean;
  /** Loading state for briefs/projects from Supabase */
  isLoadingBriefs: boolean;
  /** Loading state for portfolios from Supabase */
  isLoadingPortfolios: boolean;
  /** Last database error message, if any */
  dbError: string | null;
  /** Formatted timestamp of the most recent database sync */
  lastSyncedAt: string | null;
  /** Raw project rows fetched from the 'projects' table in Supabase */
  supabaseProjects: SupabaseProjectRow[];
  /** Raw portfolio rows fetched from the 'portfolios' table in Supabase */
  supabasePortfolios: SupabasePortfolioRow[];
  /** All briefs loaded from Supabase and synchronized with the studio store */
  briefs: ProjectBriefSubmission[];
  /** Only the authenticated client's own workspace (strictly filtered by trackingCode & password) */
  activeClient: ClientWorkspace | null;
  /** True only when logged into the Studio Admin Gate */
  isAdmin: boolean;
  /** Admin-only list of all workspaces; empty array for regular visitors/clients */
  adminWorkspaces: ClientWorkspace[];
  /** Archived briefs visible to current user (all briefs for Admin, or only activeClient's briefs for logged-in client) */
  visibleBriefs: ProjectBriefSubmission[];
  /** Authenticate with unique trackingCode/username + password */
  loginWithCredentials: (
    identifier: string,
    password: string
  ) => { success: boolean; workspace?: ClientWorkspace; error?: string };
  /** Logout from current client profile */
  logoutClient: () => void;
  /** Submit a brief, save it directly to Supabase 'projects' table, and archive in workspace */
  submitBrief: (payload: SubmitBriefPayload) => {
    workspace: ClientWorkspace;
    brief: ProjectBriefSubmission;
    isNewWorkspace: boolean;
  };
  /** Fetch and synchronize briefs directly from Supabase 'projects' table */
  loadBriefsFromSupabase: () => Promise<ProjectBriefSubmission[]>;
  /** Fetch and synchronize portfolios directly from Supabase 'portfolios' table */
  loadPortfoliosFromSupabase: () => Promise<SupabasePortfolioRow[]>;
  /** Toggle read/unread status of a brief in Supabase and local state */
  toggleBriefReadInSupabase: (briefId: string, isRead?: boolean) => Promise<void>;
  /** Mark all briefs as read in Supabase and local state */
  markAllBriefsReadInSupabase: () => Promise<void>;
  /** Update execution status of a brief in Supabase and local state */
  updateBriefStatusInSupabase: (
    briefId: string,
    status: 'new' | 'reviewed' | 'in-production'
  ) => Promise<void>;
  /** Delete a brief/project from Supabase 'projects' table */
  deleteBriefFromSupabase: (briefId: string) => Promise<boolean>;
  /** Insert a new portfolio item directly into Supabase 'portfolios' table */
  addPortfolioToSupabase: (
    row: Omit<SupabasePortfolioRow, 'id' | 'created_at'>
  ) => Promise<SupabasePortfolioRow | null>;
  /** Delete a portfolio item directly from Supabase 'portfolios' table */
  removePortfolioFromSupabase: (id: number | string) => Promise<boolean>;
  /** Refresh local state and trigger background Supabase sync */
  refreshPortalState: () => void;
}

const ClientPortalContext = createContext<ClientPortalContextValue | undefined>(undefined);

/**
 * Helper to map a Supabase 'projects' table row into a ProjectBriefSubmission object
 */
function mapSupabaseProjectRowToBrief(row: SupabaseProjectRow, index = 0): ProjectBriefSubmission {
  const rowId = row.id ?? index + 1;
  const createdDate = row.created_at ? new Date(row.created_at) : new Date();
  const createdAtMs = !isNaN(createdDate.getTime()) ? createdDate.getTime() : Date.now() - index;
  let submittedAtFa = '۱۴۰۵/۰۱/۰۱';
  try {
    submittedAtFa = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(createdDate);
  } catch {
    submittedAtFa = createdDate.toISOString().slice(0, 16);
  }

  return {
    id: `db-proj-${rowId}`,
    trackingCode: row.tracking_code || `CJ-DB-${rowId}`,
    clientId: `client-db-${rowId}`,
    brandName: row.project_title || row.client_name || 'پروژه جدید',
    ownerName: row.client_name || 'کارفرما',
    contactInfo: row.contact_info || '-',
    submittedAt: submittedAtFa,
    selectedTrack: 'ثبت‌شده در دیتابیس (جدول projects)',
    marketTier: row.budget || 'استاندارد استودیو',
    problem: row.description || '-',
    productionScale: row.budget || '-',
    fullSummaryText:
      row.full_summary_text ||
      [
        `=== پرونده پروژه ثبت‌شده در دیتابیس Supabase (جدول projects) ===`,
        `• کد رهگیری: ${row.tracking_code || `CJ-DB-${rowId}`}`,
        `• نام کارفرما (client_name): ${row.client_name || '-'}`,
        `• اطلاعات تماس (contact_info): ${row.contact_info || '-'}`,
        `• عنوان پروژه (project_title): ${row.project_title || '-'}`,
        `• بودجه / مقیاس (budget): ${row.budget || '-'}`,
        `• توضیحات پروژه (description):`,
        `${row.description || '-'}`,
      ].join('\n'),
    status: (row.status as 'new' | 'reviewed' | 'in-production') || 'new',
    isRead: Boolean(row.is_read),
    createdAtMs,
  };
}

export const ClientPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseInstance, setSupabaseInstance] = useState<SupabaseClient | null>(supabase);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState<boolean>(
    Boolean(isSupabaseConfigured || supabase)
  );
  const [isLoadingBriefs, setIsLoadingBriefs] = useState<boolean>(true);
  const [isLoadingPortfolios, setIsLoadingPortfolios] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [supabaseProjects, setSupabaseProjects] = useState<SupabaseProjectRow[]>([]);
  const [supabasePortfolios, setSupabasePortfolios] = useState<SupabasePortfolioRow[]>([]);

  const [allWorkspaces, setAllWorkspaces] = useState<ClientWorkspace[]>(() => getClientWorkspaces());
  const [activeId, setActiveId] = useState<string | null>(() => getActiveClientId());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminAuthenticated());
  const [allBriefs, setAllBriefs] = useState<ProjectBriefSubmission[]>(() => getAllArchivedBriefs());

  const formatNowFa = () => {
    try {
      return new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date());
    } catch {
      return new Date().toLocaleTimeString();
    }
  };

  const refreshPortalState = useCallback(() => {
    setAllWorkspaces(getClientWorkspaces());
    setActiveId(getActiveClientId());
    setIsAdmin(isAdminAuthenticated());
    setAllBriefs(getAllArchivedBriefs());
  }, []);

  /**
   * Reads briefs/projects directly from Supabase ('projects' table) + database API
   * and updates the Context state so all subscribed components receive fresh data.
   */
  const loadBriefsFromSupabase = useCallback(async (): Promise<ProjectBriefSubmission[]> => {
    setIsLoadingBriefs(true);
    setDbError(null);
    try {
      const client = await ensureSupabaseClient();
      if (client) {
        setSupabaseInstance(client);
        setIsDatabaseConnected(true);
      }

      // Fetch rows from Supabase 'projects' table & database endpoint
      const rows = await fetchProjectsFromDatabase();
      setSupabaseProjects(rows);
      setIsDatabaseConnected(true);

      // Sync rows into clientPortalStore so all portal views stay consistent
      await syncProjectsTableIntoBriefs();
      await pullStateFromServer(true);

      const storeBriefs = getAllArchivedBriefs();
      if (storeBriefs.length > 0) {
        setAllBriefs(storeBriefs);
        setAllWorkspaces(getClientWorkspaces());
        setLastSyncedAt(formatNowFa());
        return storeBriefs;
      }

      const mapped = rows.map((r, idx) => mapSupabaseProjectRowToBrief(r, idx));
      setAllBriefs(mapped);
      setLastSyncedAt(formatNowFa());
      return mapped;
    } catch (err: any) {
      setDbError(err?.message || 'خطا در دریافت اطلاعات بریف‌ها از دیتابیس Supabase');
      const fallback = getAllArchivedBriefs();
      setAllBriefs(fallback);
      return fallback;
    } finally {
      setIsLoadingBriefs(false);
    }
  }, []);

  /**
   * Reads studio portfolio items directly from Supabase ('portfolios' table) + database API
   */
  const loadPortfoliosFromSupabase = useCallback(async (): Promise<SupabasePortfolioRow[]> => {
    setIsLoadingPortfolios(true);
    try {
      const client = await ensureSupabaseClient();
      if (client) {
        setSupabaseInstance(client);
        setIsDatabaseConnected(true);
      }

      const rows = await fetchPortfoliosFromDatabase();
      setSupabasePortfolios(rows);
      setIsDatabaseConnected(true);
      await syncPortfoliosFromDatabase();
      setLastSyncedAt(formatNowFa());
      return rows;
    } catch (err: any) {
      setDbError(err?.message || 'خطا در دریافت نمونه‌کارها از دیتابیس Supabase');
      return [];
    } finally {
      setIsLoadingPortfolios(false);
    }
  }, []);

  useEffect(() => {
    initServerSync();
    startBriefRealtimeSyncService();

    // Initial load from Supabase for both briefs ('projects') and portfolios ('portfolios')
    void loadBriefsFromSupabase();
    void loadPortfoliosFromSupabase();

    const unsubscribeSnapshot = BriefsCollection.onSnapshot(() => {
      refreshPortalState();
    });

    // Subscribe to Supabase Realtime Postgres Changes if client is configured
    let realtimeChannel: any = null;
    void ensureSupabaseClient().then((client) => {
      if (!client) return;
      setSupabaseInstance(client);
      setIsDatabaseConnected(true);
      try {
        realtimeChannel = client
          .channel('public:studio_supabase_sync')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'projects' },
            () => {
              void loadBriefsFromSupabase();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'portfolios' },
            () => {
              void loadPortfoliosFromSupabase();
            }
          )
          .subscribe();
      } catch {
        // Ignore if Realtime is not enabled on the user's Supabase table
      }
    });

    const handleDatabaseProjectsChanged = () => {
      refreshPortalState();
    };

    const handleDatabasePortfoliosChanged = () => {
      void fetchPortfoliosFromDatabase().then((rows) => {
        setSupabasePortfolios(rows);
      });
    };

    window.addEventListener(CLIENT_PORTAL_EVENT, refreshPortalState);
    window.addEventListener(CJ_STUDIO_DATA_EVENT, refreshPortalState);
    window.addEventListener(NEW_BRIEF_NOTIFICATION_EVENT, refreshPortalState);
    window.addEventListener(BRIEF_REALTIME_SYNC_EVENT, refreshPortalState);
    window.addEventListener('CJ_DATABASE_PROJECTS_CHANGED', handleDatabaseProjectsChanged);
    window.addEventListener('CJ_DATABASE_PORTFOLIOS_CHANGED', handleDatabasePortfoliosChanged);

    return () => {
      unsubscribeSnapshot();
      if (realtimeChannel && supabaseInstance) {
        try {
          void supabaseInstance.removeChannel(realtimeChannel);
        } catch {
          // ignore
        }
      }
      window.removeEventListener(CLIENT_PORTAL_EVENT, refreshPortalState);
      window.removeEventListener(CJ_STUDIO_DATA_EVENT, refreshPortalState);
      window.removeEventListener(NEW_BRIEF_NOTIFICATION_EVENT, refreshPortalState);
      window.removeEventListener(BRIEF_REALTIME_SYNC_EVENT, refreshPortalState);
      window.removeEventListener('CJ_DATABASE_PROJECTS_CHANGED', handleDatabaseProjectsChanged);
      window.removeEventListener('CJ_DATABASE_PORTFOLIOS_CHANGED', handleDatabasePortfoliosChanged);
    };
  }, [loadBriefsFromSupabase, loadPortfoliosFromSupabase, refreshPortalState]);

  const activeClient = useMemo(() => {
    if (!activeId) return null;
    return getClientById(activeId) || allWorkspaces.find((w) => w.id === activeId) || null;
  }, [activeId, allWorkspaces]);

  const adminWorkspaces = useMemo(() => {
    return isAdmin ? allWorkspaces : [];
  }, [isAdmin, allWorkspaces]);

  const visibleBriefs = useMemo(() => {
    if (isAdmin) return allBriefs;
    if (activeClient) return activeClient.archivedBriefs || [];
    return [];
  }, [isAdmin, allBriefs, activeClient]);

  const loginWithCredentials = useCallback((identifier: string, password: string) => {
    if (!identifier.trim()) {
      return { success: false, error: 'لطفاً کد رهگیری یکتا یا نام کاربری پروژه را وارد کنید.' };
    }
    if (!password.trim()) {
      return { success: false, error: 'لطفاً رمز عبور اختصاصی پروژه را وارد کنید.' };
    }

    const matched = authenticateClient(identifier, password);
    if (!matched) {
      return {
        success: false,
        error:
          'کد رهگیری / نام کاربری یا رمز عبور اشتباه است. هر کارفرما تنها با رمز اختصاصی خود به پرونده پروژه دسترسی دارد.',
      };
    }

    setActiveClientId(matched.id);
    setActiveId(matched.id);
    return { success: true, workspace: matched };
  }, []);

  const logoutClient = useCallback(() => {
    setActiveClientId(null);
    setActiveId(null);
  }, []);

  const submitBrief = useCallback(
    (payload: SubmitBriefPayload) => {
      const result = submitAndArchiveProjectBrief(payload);
      refreshPortalState();
      void loadBriefsFromSupabase();
      return result;
    },
    [refreshPortalState, loadBriefsFromSupabase]
  );

  const toggleBriefReadInSupabase = useCallback(
    async (briefId: string, isRead?: boolean) => {
      const current = allBriefs.find((b) => b.id === briefId);
      const nextRead = isRead !== undefined ? isRead : !current?.isRead;
      toggleBriefReadStatus(briefId, nextRead);
      refreshPortalState();

      const client = await ensureSupabaseClient();
      if (client) {
        const numericId = briefId.startsWith('db-proj-')
          ? Number(briefId.replace('db-proj-', ''))
          : null;
        try {
          if (numericId && !isNaN(numericId)) {
            await client.from('projects').update({ is_read: nextRead }).eq('id', numericId);
          } else if (current?.trackingCode) {
            await client
              .from('projects')
              .update({ is_read: nextRead })
              .eq('tracking_code', current.trackingCode);
          }
        } catch {
          // Ignore if optional column is_read is not on custom Supabase table
        }
      }
    },
    [allBriefs, refreshPortalState]
  );

  const markAllBriefsReadInSupabase = useCallback(async () => {
    markAllBriefsAsRead();
    refreshPortalState();

    const client = await ensureSupabaseClient();
    if (client) {
      try {
        await client.from('projects').update({ is_read: true }).eq('is_read', false);
      } catch {
        // Ignore if optional column is_read is not on custom Supabase table
      }
    }
  }, [refreshPortalState]);

  const updateBriefStatusInSupabase = useCallback(
    async (briefId: string, status: 'new' | 'reviewed' | 'in-production') => {
      updateBriefStatus(briefId, status);
      refreshPortalState();

      const client = await ensureSupabaseClient();
      if (client) {
        const current = allBriefs.find((b) => b.id === briefId);
        const numericId = briefId.startsWith('db-proj-')
          ? Number(briefId.replace('db-proj-', ''))
          : null;
        try {
          if (numericId && !isNaN(numericId)) {
            await client
              .from('projects')
              .update({ status, is_read: status !== 'new' })
              .eq('id', numericId);
          } else if (current?.trackingCode) {
            await client
              .from('projects')
              .update({ status, is_read: status !== 'new' })
              .eq('tracking_code', current.trackingCode);
          }
        } catch {
          // Ignore if optional columns are not on custom Supabase table
        }
      }
    },
    [allBriefs, refreshPortalState]
  );

  const deleteBriefFromSupabase = useCallback(
    async (briefId: string): Promise<boolean> => {
      await deleteSubmittedBrief(briefId);
      const numericId = briefId.startsWith('db-proj-')
        ? briefId.replace('db-proj-', '')
        : briefId;
      const deleted = await deleteProjectFromDatabase(numericId);
      refreshPortalState();
      await loadBriefsFromSupabase();
      return deleted;
    },
    [refreshPortalState, loadBriefsFromSupabase]
  );

  const addPortfolioToSupabase = useCallback(
    async (row: Omit<SupabasePortfolioRow, 'id' | 'created_at'>) => {
      const inserted = await insertPortfolioToDatabase(row);
      await loadPortfoliosFromSupabase();
      return inserted;
    },
    [loadPortfoliosFromSupabase]
  );

  const removePortfolioFromSupabase = useCallback(
    async (id: number | string) => {
      const deleted = await deletePortfolioFromDatabase(id);
      await loadPortfoliosFromSupabase();
      return deleted;
    },
    [loadPortfoliosFromSupabase]
  );

  const value = useMemo<ClientPortalContextValue>(
    () => ({
      supabase: supabaseInstance,
      isDatabaseConnected,
      isLoadingBriefs,
      isLoadingPortfolios,
      dbError,
      lastSyncedAt,
      supabaseProjects,
      supabasePortfolios,
      briefs: allBriefs,
      activeClient,
      isAdmin,
      adminWorkspaces,
      visibleBriefs,
      loginWithCredentials,
      logoutClient,
      submitBrief,
      loadBriefsFromSupabase,
      loadPortfoliosFromSupabase,
      toggleBriefReadInSupabase,
      markAllBriefsReadInSupabase,
      updateBriefStatusInSupabase,
      deleteBriefFromSupabase,
      addPortfolioToSupabase,
      removePortfolioFromSupabase,
      refreshPortalState,
    }),
    [
      supabaseInstance,
      isDatabaseConnected,
      isLoadingBriefs,
      isLoadingPortfolios,
      dbError,
      lastSyncedAt,
      supabaseProjects,
      supabasePortfolios,
      allBriefs,
      activeClient,
      isAdmin,
      adminWorkspaces,
      visibleBriefs,
      loginWithCredentials,
      logoutClient,
      submitBrief,
      loadBriefsFromSupabase,
      loadPortfoliosFromSupabase,
      toggleBriefReadInSupabase,
      markAllBriefsReadInSupabase,
      updateBriefStatusInSupabase,
      deleteBriefFromSupabase,
      addPortfolioToSupabase,
      removePortfolioFromSupabase,
      refreshPortalState,
    ]
  );

  return <ClientPortalContext.Provider value={value}>{children}</ClientPortalContext.Provider>;
};

export function useClientPortal(): ClientPortalContextValue {
  const ctx = useContext(ClientPortalContext);
  if (!ctx) {
    throw new Error('useClientPortal must be used within a ClientPortalProvider');
  }
  return ctx;
}
