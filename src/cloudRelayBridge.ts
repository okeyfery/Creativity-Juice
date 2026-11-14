/**
 * Creativity Juice — Cross-Cloud Relay Bridge
 * Synchronizes briefs ('projects'), portfolios ('portfolios'), client workspaces, and studio state
 * across AI Studio (Cloud Run + Cloud SQL PostgreSQL), Vercel (*.vercel.app), and Netlify (*.netlify.app).
 */

export const CLOUD_RELAY_BUCKET_URL =
  'https://kvdb.io/LdzET9uDQKp5yojXMSwJWM/cj_cloud_bridge_v1';

export interface CloudRelaySnapshot {
  revision: number;
  updatedAt: string;
  archivedBriefs: any[];
  projectsRows: any[];
  portfoliosRows: any[];
  clientWorkspaces: any[];
  projects: any[] | null;
  team: any[] | null;
  services: any[] | null;
  manifesto: any[] | null;
  media: any[] | null;
  settings: Record<string, any> | null;
  notificationConfig: Record<string, any> | null;
  notificationLogs: any[];
  deletedBriefCodes: string[];
  deletedPortfolioIds: string[];
  pendingNotifBriefCodes: string[];
}

const DEFAULT_RELAY_NOTIF_CONFIG = {
  enabled: true,
  adminEmail: 'youthefzadeh@gmail.com',
  adminWhatsapp: '',
  autoEmailEnabled: true,
  autoWhatsappEnabled: true,
  whatsappWebhookUrl: '',
  emailWebhookUrl: '',
  soundAlertEnabled: true,
};

export function createEmptyRelaySnapshot(): CloudRelaySnapshot {
  return {
    revision: Date.now(),
    updatedAt: new Date().toISOString(),
    archivedBriefs: [],
    projectsRows: [],
    portfoliosRows: [],
    clientWorkspaces: [],
    projects: null,
    team: null,
    services: null,
    manifesto: null,
    media: null,
    settings: null,
    notificationConfig: { ...DEFAULT_RELAY_NOTIF_CONFIG },
    notificationLogs: [],
    deletedBriefCodes: [],
    deletedPortfolioIds: [],
    pendingNotifBriefCodes: [],
  };
}

export function normalizeRelaySnapshot(raw: any): CloudRelaySnapshot {
  const base = createEmptyRelaySnapshot();
  if (!raw || typeof raw !== 'object') return base;
  return {
    revision: typeof raw.revision === 'number' ? raw.revision : base.revision,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : base.updatedAt,
    archivedBriefs: Array.isArray(raw.archivedBriefs) ? raw.archivedBriefs : [],
    projectsRows: Array.isArray(raw.projectsRows) ? raw.projectsRows : [],
    portfoliosRows: Array.isArray(raw.portfoliosRows) ? raw.portfoliosRows : [],
    clientWorkspaces: Array.isArray(raw.clientWorkspaces) ? raw.clientWorkspaces : [],
    projects: Array.isArray(raw.projects) ? raw.projects : null,
    team: Array.isArray(raw.team) ? raw.team : null,
    services: Array.isArray(raw.services) ? raw.services : null,
    manifesto: Array.isArray(raw.manifesto) ? raw.manifesto : null,
    media: Array.isArray(raw.media) ? raw.media : null,
    settings: raw.settings && typeof raw.settings === 'object' ? raw.settings : null,
    notificationConfig:
      raw.notificationConfig && typeof raw.notificationConfig === 'object'
        ? { ...DEFAULT_RELAY_NOTIF_CONFIG, ...raw.notificationConfig }
        : { ...DEFAULT_RELAY_NOTIF_CONFIG },
    notificationLogs: Array.isArray(raw.notificationLogs) ? raw.notificationLogs : [],
    deletedBriefCodes: Array.isArray(raw.deletedBriefCodes)
      ? Array.from(new Set(raw.deletedBriefCodes.map(String)))
      : [],
    deletedPortfolioIds: Array.isArray(raw.deletedPortfolioIds)
      ? Array.from(new Set(raw.deletedPortfolioIds.map(String)))
      : [],
    pendingNotifBriefCodes: Array.isArray(raw.pendingNotifBriefCodes)
      ? Array.from(new Set(raw.pendingNotifBriefCodes.map(String)))
      : [],
  };
}

export async function fetchCloudRelaySnapshot(): Promise<CloudRelaySnapshot | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${CLOUD_RELAY_BUCKET_URL}?_t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.status === 404) {
      return createEmptyRelaySnapshot();
    }
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || !text.trim()) return createEmptyRelaySnapshot();
    const parsed = JSON.parse(text);
    return normalizeRelaySnapshot(parsed);
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function saveCloudRelaySnapshot(snapshot: CloudRelaySnapshot): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    snapshot.revision = Date.now();
    snapshot.updatedAt = new Date().toISOString();
    const res = await fetch(CLOUD_RELAY_BUCKET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: JSON.stringify(snapshot),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

export function isBriefDeleted(item: any, deletedSet: Set<string>): boolean {
  if (!item) return true;
  const id = String(item.id || '');
  const dbId = item.dbId !== undefined ? String(item.dbId) : '';
  const code = String(item.trackingCode || item.tracking_code || '');
  if (id.startsWith('brief-init-')) return true;
  if (id && deletedSet.has(id)) return true;
  if (dbId && (deletedSet.has(dbId) || deletedSet.has(`db-proj-${dbId}`))) return true;
  if (code && deletedSet.has(code)) return true;
  return false;
}

export function briefToProjectRow(brief: any, fallbackId?: number): Record<string, any> {
  const numericId =
    typeof brief.dbId === 'number'
      ? brief.dbId
      : Number(String(brief.id || '').replace(/\D+/g, '').slice(-8)) || fallbackId || Date.now();
  const trackingCode =
    brief.trackingCode || brief.tracking_code || `CJ-${Math.floor(1000 + Math.random() * 9000)}`;
  const clientName = brief.ownerName || brief.client_name || brief.brandName || 'کارفرما';
  const contactInfo = brief.contactInfo || brief.contact_info || '-';
  const projectTitle = brief.brandName || brief.project_title || 'پروژه جدید';
  const description = brief.problem || brief.description || '-';
  const budget = brief.productionScale
    ? `${brief.marketTier || ''} • ${brief.productionScale}`.trim()
    : brief.marketTier || brief.budget || 'استاندارد استودیو';

  return {
    id: numericId,
    client_name: clientName,
    contact_info: contactInfo,
    project_title: projectTitle,
    description,
    budget,
    tracking_code: trackingCode,
    status: brief.status || 'new',
    is_read: Boolean(brief.isRead ?? brief.is_read ?? false),
    full_summary_text: brief.fullSummaryText || brief.full_summary_text || description,
    created_at: brief.created_at || new Date(brief.createdAtMs || Date.now()).toISOString(),
  };
}

export function projectRowToBrief(row: any): Record<string, any> {
  const createdAtDate = row.created_at ? new Date(row.created_at) : new Date();
  const createdAtMs = !isNaN(createdAtDate.getTime()) ? createdAtDate.getTime() : Date.now();
  let submittedAtFa = '۱۴۰۵/۰۱/۰۱';
  try {
    submittedAtFa = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(createdAtDate);
  } catch {
    submittedAtFa = createdAtDate.toISOString().slice(0, 16);
  }

  const tracking = row.tracking_code || row.trackingCode || `CJ-DB-${row.id}`;
  return {
    id: row.id ? `db-proj-${row.id}` : `brief-${createdAtMs}`,
    dbId: row.id,
    trackingCode: tracking,
    clientId: `client-db-${row.id || createdAtMs}`,
    brandName: row.project_title || row.brandName || row.client_name || 'پروژه جدید',
    ownerName: row.client_name || row.ownerName || 'کارفرما',
    contactInfo: row.contact_info || row.contactInfo || '-',
    submittedAt: row.submittedAt || submittedAtFa,
    selectedTrack: row.selectedTrack || 'ثبت‌شده در دیتابیس (جدول projects)',
    marketTier: row.budget || row.marketTier || 'استاندارد استودیو',
    problem: row.description || row.problem || '-',
    productionScale: row.budget || row.productionScale || '-',
    fullSummaryText:
      row.full_summary_text ||
      row.fullSummaryText ||
      `نام کارفرما: ${row.client_name}\nاطلاعات تماس: ${row.contact_info}\nعنوان پروژه: ${row.project_title}\nبودجه / مقیاس: ${row.budget}\nتوضیحات پروژه:\n${row.description}`,
    status: (row.status as 'new' | 'reviewed' | 'in-production') || 'new',
    isRead: Boolean(row.is_read ?? row.isRead ?? false),
    createdAtMs,
  };
}

export function deduplicateAndSortBriefs(
  briefsList: any[],
  deletedCodes: Set<string>
): any[] {
  const byKey = new Map<string, any>();
  for (const item of briefsList) {
    if (!item || isBriefDeleted(item, deletedCodes)) continue;
    const key = String(item.trackingCode || item.tracking_code || item.id || '');
    if (!key) continue;
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, item);
    } else {
      // Prefer db-proj-* ID if available, and preserve read/reviewed status
      const preferDbId = String(item.id || '').startsWith('db-proj-') ? item.id : prev.id;
      byKey.set(key, {
        ...prev,
        ...item,
        id: preferDbId,
        dbId: item.dbId ?? prev.dbId,
        isRead: Boolean(item.isRead || prev.isRead),
        status:
          item.status && item.status !== 'new'
            ? item.status
            : prev.status || item.status || 'new',
      });
    }
  }
  return Array.from(byKey.values()).sort(
    (a, b) => (Number(b.createdAtMs) || 0) - (Number(a.createdAtMs) || 0)
  );
}

export function deduplicateProjectsRows(
  rowsList: any[],
  deletedCodes: Set<string>
): any[] {
  const byKey = new Map<string, any>();
  for (const row of rowsList) {
    if (!row || isBriefDeleted(row, deletedCodes)) continue;
    const key = String(
      row.tracking_code || row.trackingCode || `${row.client_name}::${row.project_title}`
    );
    if (!key) continue;
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, row);
    } else {
      byKey.set(key, {
        ...prev,
        ...row,
        id: prev.id ?? row.id,
        is_read: Boolean(row.is_read || prev.is_read),
        status:
          row.status && row.status !== 'new'
            ? row.status
            : prev.status || row.status || 'new',
      });
    }
  }
  return Array.from(byKey.values());
}

function mergeWorkspacesList(
  existingList: any[] = [],
  incomingList: any[] = [],
  deletedBriefCodes: Set<string>
): any[] {
  const map = new Map<string, any>();
  for (const ws of existingList) {
    if (ws && ws.id) {
      map.set(ws.id, {
        ...ws,
        archivedBriefs: Array.isArray(ws.archivedBriefs)
          ? deduplicateAndSortBriefs(ws.archivedBriefs, deletedBriefCodes)
          : [],
      });
    }
  }
  for (const ws of incomingList) {
    if (ws && ws.id) {
      const prev = map.get(ws.id);
      if (prev) {
        const mergedBriefs = deduplicateAndSortBriefs(
          [...(prev.archivedBriefs || []), ...(ws.archivedBriefs || [])],
          deletedBriefCodes
        );
        const fbMap = new Map<string, any>();
        [...(prev.feedbacks || []), ...(ws.feedbacks || [])].forEach((f) => {
          if (f && f.id) fbMap.set(f.id, f);
        });
        map.set(ws.id, {
          ...prev,
          ...ws,
          archivedBriefs: mergedBriefs,
          feedbacks: Array.from(fbMap.values()),
        });
      } else {
        map.set(ws.id, {
          ...ws,
          archivedBriefs: Array.isArray(ws.archivedBriefs)
            ? deduplicateAndSortBriefs(ws.archivedBriefs, deletedBriefCodes)
            : [],
        });
      }
    }
  }
  return Array.from(map.values());
}

/**
 * Handles any `/api/...` request directly against the shared Cloud Relay
 * when the browser is running on a static deployment (Vercel *.vercel.app, Netlify *.netlify.app).
 */
export async function handleCloudRelayApiRequest(
  apiPath: string,
  init?: RequestInit
): Promise<{ ok: boolean; data?: any; usedOrigin: string }> {
  const method = (init?.method || 'GET').toUpperCase();
  const cleanPath = apiPath.split('?')[0];

  let bodyObj: any = {};
  if (init?.body && typeof init.body === 'string') {
    try {
      bodyObj = JSON.parse(init.body);
    } catch {
      bodyObj = {};
    }
  }

  // 0. /api/supabase-config
  if (cleanPath === '/api/supabase-config') {
    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        supabaseUrl: '',
        supabaseAnonKey: '',
        isSupabaseConfigured: false,
        isPostgresConnected: true,
      },
    };
  }

  const snap = (await fetchCloudRelaySnapshot()) || createEmptyRelaySnapshot();
  const deletedBriefSet = new Set<string>(snap.deletedBriefCodes || []);
  const deletedPortfolioSet = new Set<string>(snap.deletedPortfolioIds || []);

  // Ensure snap.archivedBriefs and snap.projectsRows are mutually consistent
  const combinedBriefs = deduplicateAndSortBriefs(
    [
      ...(snap.archivedBriefs || []),
      ...(snap.projectsRows || []).map((r) => projectRowToBrief(r)),
    ],
    deletedBriefSet
  );
  snap.archivedBriefs = combinedBriefs;
  snap.projectsRows = deduplicateProjectsRows(
    [
      ...(snap.projectsRows || []),
      ...combinedBriefs.map((b) => briefToProjectRow(b)),
    ],
    deletedBriefSet
  );

  // 1. GET /api/briefs
  if (cleanPath === '/api/briefs' && method === 'GET') {
    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        collection: 'briefs',
        revision: snap.revision,
        count: snap.archivedBriefs.length,
        docs: snap.archivedBriefs,
      },
    };
  }

  // 2. POST /api/briefs or POST /api/studio-state/brief
  if (
    (cleanPath === '/api/briefs' || cleanPath === '/api/studio-state/brief') &&
    method === 'POST'
  ) {
    const incomingBrief = bodyObj.brief || bodyObj || {};
    const incomingWs = bodyObj.workspace;

    const projRow = briefToProjectRow(incomingBrief);
    const enrichedBrief = {
      ...projectRowToBrief(projRow),
      ...incomingBrief,
      trackingCode: projRow.tracking_code,
    };

    // If re-submitting a code, ensure it's not in deletedBriefSet
    deletedBriefSet.delete(String(enrichedBrief.id));
    deletedBriefSet.delete(String(enrichedBrief.trackingCode));
    snap.deletedBriefCodes = Array.from(deletedBriefSet);

    snap.archivedBriefs = deduplicateAndSortBriefs(
      [enrichedBrief, ...snap.archivedBriefs],
      deletedBriefSet
    );
    snap.projectsRows = deduplicateProjectsRows(
      [projRow, ...snap.projectsRows],
      deletedBriefSet
    );

    if (incomingWs && incomingWs.id) {
      snap.clientWorkspaces = mergeWorkspacesList(
        snap.clientWorkspaces,
        [incomingWs],
        deletedBriefSet
      );
    }

    const pendingSet = new Set<string>(snap.pendingNotifBriefCodes || []);
    if (enrichedBrief.trackingCode) {
      pendingSet.add(enrichedBrief.trackingCode);
    }
    snap.pendingNotifBriefCodes = Array.from(pendingSet);

    await saveCloudRelaySnapshot(snap);

    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        collection: 'briefs',
        revision: snap.revision,
        doc: enrichedBrief,
        docs: snap.archivedBriefs,
        state: {
          ...snap,
          portfolios: snap.portfoliosRows,
        },
      },
    };
  }

  // 3. PATCH /api/briefs/:id or PATCH /api/db/projects/:id
  if (
    (cleanPath.startsWith('/api/briefs/') || cleanPath.startsWith('/api/db/projects/')) &&
    method === 'PATCH'
  ) {
    const targetId = decodeURIComponent(cleanPath.split('/').pop() || '');
    const cleanTargetNum = targetId.replace(/^db-proj-/, '');

    let updatedDoc: any = null;
    snap.archivedBriefs = snap.archivedBriefs.map((b) => {
      const match =
        String(b.id) === targetId ||
        String(b.dbId) === cleanTargetNum ||
        String(b.trackingCode) === targetId;
      if (!match) return b;
      updatedDoc = {
        ...b,
        ...(bodyObj.status !== undefined ? { status: bodyObj.status } : {}),
        ...(bodyObj.isRead !== undefined ? { isRead: Boolean(bodyObj.isRead) } : {}),
        ...(bodyObj.is_read !== undefined ? { isRead: Boolean(bodyObj.is_read) } : {}),
        ...(bodyObj.adminNotes !== undefined ? { adminNotes: bodyObj.adminNotes } : {}),
      };
      return updatedDoc;
    });

    snap.projectsRows = snap.projectsRows.map((r) => {
      const match =
        String(r.id) === cleanTargetNum ||
        `db-proj-${r.id}` === targetId ||
        String(r.tracking_code) === targetId ||
        (updatedDoc && String(r.tracking_code) === String(updatedDoc.trackingCode));
      if (!match) return r;
      return {
        ...r,
        ...(bodyObj.status !== undefined ? { status: bodyObj.status } : {}),
        ...(bodyObj.isRead !== undefined ? { is_read: Boolean(bodyObj.isRead) } : {}),
        ...(bodyObj.is_read !== undefined ? { is_read: Boolean(bodyObj.is_read) } : {}),
      };
    });

    await saveCloudRelaySnapshot(snap);

    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        collection: 'briefs',
        revision: snap.revision,
        doc: updatedDoc,
        project: updatedDoc,
        docs: snap.archivedBriefs,
      },
    };
  }

  // 4. DELETE /api/db/projects/:id
  if (cleanPath.startsWith('/api/db/projects/') && method === 'DELETE') {
    const targetId = decodeURIComponent(cleanPath.split('/').pop() || '');
    const cleanTargetNum = targetId.replace(/^db-proj-/, '');

    deletedBriefSet.add(targetId);
    deletedBriefSet.add(cleanTargetNum);
    deletedBriefSet.add(`db-proj-${cleanTargetNum}`);

    snap.archivedBriefs.forEach((b) => {
      if (
        String(b.id) === targetId ||
        String(b.dbId) === cleanTargetNum ||
        String(b.trackingCode) === targetId
      ) {
        if (b.id) deletedBriefSet.add(String(b.id));
        if (b.dbId !== undefined) {
          deletedBriefSet.add(String(b.dbId));
          deletedBriefSet.add(`db-proj-${b.dbId}`);
        }
        if (b.trackingCode) deletedBriefSet.add(String(b.trackingCode));
      }
    });

    snap.projectsRows.forEach((r) => {
      if (
        String(r.id) === cleanTargetNum ||
        `db-proj-${r.id}` === targetId ||
        String(r.tracking_code) === targetId
      ) {
        if (r.id !== undefined) {
          deletedBriefSet.add(String(r.id));
          deletedBriefSet.add(`db-proj-${r.id}`);
        }
        if (r.tracking_code) deletedBriefSet.add(String(r.tracking_code));
      }
    });

    snap.deletedBriefCodes = Array.from(deletedBriefSet);
    snap.archivedBriefs = deduplicateAndSortBriefs(snap.archivedBriefs, deletedBriefSet);
    snap.projectsRows = deduplicateProjectsRows(snap.projectsRows, deletedBriefSet);
    snap.clientWorkspaces = mergeWorkspacesList(snap.clientWorkspaces, [], deletedBriefSet);

    await saveCloudRelaySnapshot(snap);

    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        deletedId: targetId,
        docs: snap.archivedBriefs,
      },
    };
  }

  // 5. POST /api/studio-state/briefs/reconcile
  if (cleanPath === '/api/studio-state/briefs/reconcile' && method === 'POST') {
    const clientBriefs = Array.isArray(bodyObj.clientBriefs) ? bodyObj.clientBriefs : [];
    const clientWorkspaces = Array.isArray(bodyObj.clientWorkspaces)
      ? bodyObj.clientWorkspaces
      : [];

    const existingCodes = new Set(
      snap.archivedBriefs.map((b) => String(b.trackingCode || b.id || '')).filter(Boolean)
    );

    let newlyAddedCount = 0;
    let modified = false;
    const pendingSet = new Set<string>(snap.pendingNotifBriefCodes || []);

    for (const cb of clientBriefs) {
      if (!cb || isBriefDeleted(cb, deletedBriefSet)) continue;
      const idStr = String(cb.id || '');
      // Do not re-insert synthetic db-proj-* items that were deleted on the server
      if (idStr.startsWith('db-proj-') && !existingCodes.has(String(cb.trackingCode || ''))) {
        continue;
      }
      const code = String(cb.trackingCode || '');
      if (code && !existingCodes.has(code)) {
        const projRow = briefToProjectRow(cb);
        const enriched = {
          ...projectRowToBrief(projRow),
          ...cb,
          trackingCode: code,
        };
        snap.archivedBriefs.unshift(enriched);
        snap.projectsRows.unshift(projRow);
        existingCodes.add(code);
        pendingSet.add(code);
        newlyAddedCount++;
        modified = true;
      }
    }

    if (clientWorkspaces.length > 0) {
      const prevLen = snap.clientWorkspaces.length;
      snap.clientWorkspaces = mergeWorkspacesList(
        snap.clientWorkspaces,
        clientWorkspaces,
        deletedBriefSet
      );
      if (snap.clientWorkspaces.length !== prevLen) {
        modified = true;
      }
    }

    snap.archivedBriefs = deduplicateAndSortBriefs(snap.archivedBriefs, deletedBriefSet);
    snap.projectsRows = deduplicateProjectsRows(snap.projectsRows, deletedBriefSet);
    snap.pendingNotifBriefCodes = Array.from(pendingSet);

    if (modified) {
      await saveCloudRelaySnapshot(snap);
    }

    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        revision: snap.revision,
        syncedCount: snap.archivedBriefs.length,
        newlyAddedCount,
        archivedBriefs: snap.archivedBriefs,
        clientWorkspaces: snap.clientWorkspaces,
        notificationLogs: snap.notificationLogs,
      },
    };
  }

  // 6. GET /api/studio-state
  if (cleanPath === '/api/studio-state' && method === 'GET') {
    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        revision: snap.revision,
        state: {
          ...snap,
          archivedBriefs: snap.archivedBriefs,
          portfolios: snap.portfoliosRows,
        },
      },
    };
  }

  // 7. POST /api/studio-state/sync
  if (cleanPath === '/api/studio-state/sync' && method === 'POST') {
    if (Array.isArray(bodyObj.archivedBriefs)) {
      if (bodyObj.replaceBriefs) {
        const incomingCodes = new Set(
          bodyObj.archivedBriefs.map((b: any) => String(b.trackingCode || b.id || ''))
        );
        snap.archivedBriefs.forEach((oldB) => {
          const oldCode = String(oldB.trackingCode || oldB.id || '');
          if (oldCode && !incomingCodes.has(oldCode)) {
            if (oldB.id) deletedBriefSet.add(String(oldB.id));
            if (oldB.dbId !== undefined) deletedBriefSet.add(String(oldB.dbId));
            if (oldB.trackingCode) deletedBriefSet.add(String(oldB.trackingCode));
          }
        });
        snap.deletedBriefCodes = Array.from(deletedBriefSet);
        snap.archivedBriefs = deduplicateAndSortBriefs(bodyObj.archivedBriefs, deletedBriefSet);
      } else {
        snap.archivedBriefs = deduplicateAndSortBriefs(
          [...bodyObj.archivedBriefs, ...snap.archivedBriefs],
          deletedBriefSet
        );
      }
      snap.projectsRows = deduplicateProjectsRows(
        snap.archivedBriefs.map((b) => briefToProjectRow(b)),
        deletedBriefSet
      );
    }

    if (Array.isArray(bodyObj.clientWorkspaces)) {
      if (bodyObj.replaceWorkspaces) {
        snap.clientWorkspaces = mergeWorkspacesList([], bodyObj.clientWorkspaces, deletedBriefSet);
      } else {
        snap.clientWorkspaces = mergeWorkspacesList(
          snap.clientWorkspaces,
          bodyObj.clientWorkspaces,
          deletedBriefSet
        );
      }
    }

    if (Array.isArray(bodyObj.projects)) snap.projects = bodyObj.projects;
    if (Array.isArray(bodyObj.team)) snap.team = bodyObj.team;
    if (Array.isArray(bodyObj.services)) snap.services = bodyObj.services;
    if (Array.isArray(bodyObj.manifesto)) snap.manifesto = bodyObj.manifesto;
    if (Array.isArray(bodyObj.media)) snap.media = bodyObj.media;
    if (bodyObj.settings && typeof bodyObj.settings === 'object') {
      snap.settings = { ...(snap.settings || {}), ...bodyObj.settings };
    }
    if (bodyObj.notificationConfig && typeof bodyObj.notificationConfig === 'object') {
      snap.notificationConfig = {
        ...(snap.notificationConfig || DEFAULT_RELAY_NOTIF_CONFIG),
        ...bodyObj.notificationConfig,
      };
    }

    await saveCloudRelaySnapshot(snap);

    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        revision: snap.revision,
        state: {
          ...snap,
          portfolios: snap.portfoliosRows,
        },
      },
    };
  }

  // 8. GET /api/db/projects
  if (cleanPath === '/api/db/projects' && method === 'GET') {
    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        projects: snap.projectsRows,
      },
    };
  }

  // 9. POST /api/db/projects
  if (cleanPath === '/api/db/projects' && method === 'POST') {
    const projRow = briefToProjectRow(bodyObj);
    const enrichedBrief = projectRowToBrief(projRow);

    deletedBriefSet.delete(String(projRow.id));
    deletedBriefSet.delete(String(projRow.tracking_code));
    snap.deletedBriefCodes = Array.from(deletedBriefSet);

    snap.projectsRows = deduplicateProjectsRows(
      [projRow, ...snap.projectsRows],
      deletedBriefSet
    );
    snap.archivedBriefs = deduplicateAndSortBriefs(
      [enrichedBrief, ...snap.archivedBriefs],
      deletedBriefSet
    );

    const pendingSet = new Set<string>(snap.pendingNotifBriefCodes || []);
    if (projRow.tracking_code) pendingSet.add(String(projRow.tracking_code));
    snap.pendingNotifBriefCodes = Array.from(pendingSet);

    await saveCloudRelaySnapshot(snap);

    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        project: projRow,
        docs: snap.archivedBriefs,
      },
    };
  }

  // 10. GET /api/db/portfolios
  if (cleanPath === '/api/db/portfolios' && method === 'GET') {
    const filteredPortfolios = (snap.portfoliosRows || []).filter(
      (p) => !deletedPortfolioSet.has(String(p.id)) && !deletedPortfolioSet.has(String(p.title))
    );
    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        portfolios: filteredPortfolios,
      },
    };
  }

  // 11. POST /api/db/portfolios
  if (cleanPath === '/api/db/portfolios' && method === 'POST') {
    const newRow = {
      id: bodyObj.id || Date.now(),
      title: bodyObj.title || 'نمونه‌کار جدید',
      category: bodyObj.category || 'branding',
      image_url:
        bodyObj.image_url ||
        bodyObj.coverImage ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      project_link: bodyObj.project_link || '#',
      description: bodyObj.description || '',
      title_en: bodyObj.title_en || bodyObj.titleEn || bodyObj.title,
      client: bodyObj.client || bodyObj.title,
      year: bodyObj.year || '۱۴۰۵',
      extra_json: bodyObj.extra_json || null,
      created_at: new Date().toISOString(),
    };

    deletedPortfolioSet.delete(String(newRow.id));
    deletedPortfolioSet.delete(String(newRow.title));
    snap.deletedPortfolioIds = Array.from(deletedPortfolioSet);

    const existingIdx = snap.portfoliosRows.findIndex(
      (p) => p.title === newRow.title || String(p.id) === String(newRow.id)
    );
    if (existingIdx >= 0) {
      snap.portfoliosRows[existingIdx] = {
        ...snap.portfoliosRows[existingIdx],
        ...newRow,
      };
    } else {
      snap.portfoliosRows = [newRow, ...snap.portfoliosRows];
    }

    await saveCloudRelaySnapshot(snap);

    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        portfolio: newRow,
      },
    };
  }

  // 12. DELETE /api/db/portfolios/:id
  if (cleanPath.startsWith('/api/db/portfolios/') && method === 'DELETE') {
    const targetId = decodeURIComponent(cleanPath.split('/').pop() || '');
    const cleanId = targetId.replace(/^portfolio-db-/, '');
    deletedPortfolioSet.add(targetId);
    deletedPortfolioSet.add(cleanId);

    snap.portfoliosRows = (snap.portfoliosRows || []).filter((p) => {
      const match =
        String(p.id) === cleanId ||
        `portfolio-db-${p.id}` === targetId ||
        String(p.title) === targetId;
      if (match) {
        if (p.id !== undefined) deletedPortfolioSet.add(String(p.id));
        if (p.title) deletedPortfolioSet.add(String(p.title));
      }
      return !match;
    });
    snap.deletedPortfolioIds = Array.from(deletedPortfolioSet);

    await saveCloudRelaySnapshot(snap);

    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: {
        ok: true,
        deletedId: targetId,
      },
    };
  }

  // 13. Notification endpoints
  if (cleanPath === '/api/studio-state/notifications/config' && method === 'POST') {
    snap.notificationConfig = {
      ...(snap.notificationConfig || DEFAULT_RELAY_NOTIF_CONFIG),
      ...bodyObj,
    };
    await saveCloudRelaySnapshot(snap);
    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: { ok: true, notificationConfig: snap.notificationConfig, state: snap },
    };
  }

  if (cleanPath === '/api/studio-state/notifications/mark-read' && method === 'POST') {
    const targetId = bodyObj?.id;
    snap.notificationLogs = (snap.notificationLogs || []).map((l) =>
      !targetId || l.id === targetId ? { ...l, readByAdmin: true } : l
    );
    await saveCloudRelaySnapshot(snap);
    return {
      ok: true,
      usedOrigin: 'cloud-relay',
      data: { ok: true, notificationLogs: snap.notificationLogs },
    };
  }

  return { ok: false, usedOrigin: 'offline' };
}
