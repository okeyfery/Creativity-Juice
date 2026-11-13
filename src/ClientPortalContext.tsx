import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  CLIENT_PORTAL_EVENT,
} from './clientPortalStore';
import { isAdminAuthenticated, CJ_STUDIO_DATA_EVENT } from './adminStore';
import { initServerSync } from './serverSync';

interface ClientPortalContextValue {
  /** Only the authenticated client's own workspace (strictly filtered by trackingCode & password) */
  activeClient: ClientWorkspace | null;
  /** True only when logged into the Studio Admin Gate */
  isAdmin: boolean;
  /** Admin-only list of all workspaces; empty array for regular visitors/clients */
  adminWorkspaces: ClientWorkspace[];
  /** Archived briefs visible to current user (all briefs for Admin, or only activeClient's briefs for logged-in client) */
  visibleBriefs: ProjectBriefSubmission[];
  /** Authenticate with unique trackingCode/username + password */
  loginWithCredentials: (identifier: string, password: string) => { success: boolean; workspace?: ClientWorkspace; error?: string };
  /** Logout from current client profile */
  logoutClient: () => void;
  /** Submit a brief, archive it in the project profile, and send it to Studio Admin */
  submitBrief: (payload: SubmitBriefPayload) => {
    workspace: ClientWorkspace;
    brief: ProjectBriefSubmission;
    isNewWorkspace: boolean;
  };
  /** Refresh state from localStorage */
  refreshPortalState: () => void;
}

const ClientPortalContext = createContext<ClientPortalContextValue | undefined>(undefined);

export const ClientPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allWorkspaces, setAllWorkspaces] = useState<ClientWorkspace[]>(() => getClientWorkspaces());
  const [activeId, setActiveId] = useState<string | null>(() => getActiveClientId());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminAuthenticated());
  const [allBriefs, setAllBriefs] = useState<ProjectBriefSubmission[]>(() => getAllArchivedBriefs());

  const refreshPortalState = useCallback(() => {
    setAllWorkspaces(getClientWorkspaces());
    setActiveId(getActiveClientId());
    setIsAdmin(isAdminAuthenticated());
    setAllBriefs(getAllArchivedBriefs());
  }, []);

  useEffect(() => {
    initServerSync();
    window.addEventListener(CLIENT_PORTAL_EVENT, refreshPortalState);
    window.addEventListener(CJ_STUDIO_DATA_EVENT, refreshPortalState);
    return () => {
      window.removeEventListener(CLIENT_PORTAL_EVENT, refreshPortalState);
      window.removeEventListener(CJ_STUDIO_DATA_EVENT, refreshPortalState);
    };
  }, [refreshPortalState]);

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
        error: 'کد رهگیری / نام کاربری یا رمز عبور اشتباه است. هر کارفرما تنها با رمز اختصاصی خود به پرونده پروژه دسترسی دارد.',
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
      return result;
    },
    [refreshPortalState]
  );

  const value = useMemo<ClientPortalContextValue>(
    () => ({
      activeClient,
      isAdmin,
      adminWorkspaces,
      visibleBriefs,
      loginWithCredentials,
      logoutClient,
      submitBrief,
      refreshPortalState,
    }),
    [activeClient, isAdmin, adminWorkspaces, visibleBriefs, loginWithCredentials, logoutClient, submitBrief, refreshPortalState]
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
