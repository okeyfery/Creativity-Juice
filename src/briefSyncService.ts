/**
 * Creativity Juice — Real-Time 'briefs' Collection & Cross-Deployment Synchronization Service
 * Stores and synchronizes briefs directly in the server 'briefs' collection (/api/briefs)
 * and works seamlessly across all deployed versions (Vercel *.vercel.app, AI Studio *.run.app, custom domains).
 */

import { ClientWorkspace, ProjectBriefSubmission } from './data/clientPortalData';
import {
  sortBriefsNewestFirst,
  playNotificationChime,
  getNotificationConfig,
  NEW_BRIEF_NOTIFICATION_EVENT,
  SERVER_SYNC_STATUS_EVENT,
} from './serverSync';

const STORAGE_KEY_WORKSPACES = 'cj_client_workspaces_v1';
const STORAGE_KEY_ARCHIVED_BRIEFS = 'cj_studio_archived_briefs_v1';
const STORAGE_KEY_NOTIF_LOGS = 'cj_studio_notif_logs_v1';
const STORAGE_KEY_PENDING_OUTBOX = 'cj_pending_brief_outbox_v1';
const STORAGE_KEY_SYNCED_BRIEF_IDS = 'cj_synced_brief_ids_v1';

// Shared Cloud Run backend URL so Vercel static deployments (*.vercel.app) and all versions share the same 'briefs' collection
export const CENTRAL_CLOUD_BACKEND_ORIGIN =
  'https://ais-pre-rca5qk5qqfew2kqzbjykqn-828392234327.europe-west2.run.app';

export const BRIEF_REALTIME_SYNC_EVENT = 'CJ_BRIEF_REALTIME_SYNC_EVENT';

export interface PendingBriefOutboxItem {
  brief: ProjectBriefSubmission;
  workspace?: ClientWorkspace;
  queuedAt: number;
  attempts: number;
}

export interface BriefSyncTelemetry {
  streamConnected: boolean;
  isReconciling: boolean;
  lastSyncedAt: string | null;
  lastEventType: string | null;
  revision: number;
  totalServerBriefs: number;
  pendingOutboxCount: number;
  syncedBriefIdsCount: number;
  collectionName: string;
  activeEndpointOrigin: string;
}

let eventSourceInstance: EventSource | null = null;
let broadcastChannel: BroadcastChannel | null = null;
let reconnectTimer: number | null = null;
let isServiceStarted = false;
let detectedRemoteOriginRequired = false;

const snapshotSubscribers = new Set<(docs: ProjectBriefSubmission[]) => void>();

const telemetryState: BriefSyncTelemetry = {
  streamConnected: false,
  isReconciling: false,
  lastSyncedAt: null,
  lastEventType: null,
  revision: 0,
  totalServerBriefs: 0,
  pendingOutboxCount: 0,
  syncedBriefIdsCount: 0,
  collectionName: 'briefs',
  activeEndpointOrigin: 'local',
};

function formatNowTimeFa(): string {
  try {
    return new Date().toLocaleTimeString('fa-IR');
  } catch {
    return new Date().toISOString().slice(11, 19);
  }
}

/**
 * Smart Cross-Deployment Fetch:
 * Tries the local `/api/...` route first. If the current deployment is a static host (e.g., Vercel static rewrite
 * returning `text/html` instead of `application/json`), automatically falls back to CENTRAL_CLOUD_BACKEND_ORIGIN
 * so all deployed versions (Vercel + AI Studio) read/write the exact same 'briefs' database collection.
 */
export async function smartCollectionFetch(
  apiPath: string,
  init?: RequestInit
): Promise<{ ok: boolean; data?: any; usedOrigin: string }> {
  const originsToTry: string[] = [];

  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    if (!detectedRemoteOriginRequired) {
      originsToTry.push('');
    }
    if (currentOrigin !== CENTRAL_CLOUD_BACKEND_ORIGIN) {
      originsToTry.push(CENTRAL_CLOUD_BACKEND_ORIGIN);
    } else if (originsToTry.length === 0) {
      originsToTry.push('');
    }
  } else {
    originsToTry.push('');
  }

  for (const baseOrigin of originsToTry) {
    const url = `${baseOrigin}${apiPath}`;
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          Accept: 'application/json',
          ...(init?.headers || {}),
        },
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (baseOrigin === CENTRAL_CLOUD_BACKEND_ORIGIN) {
          detectedRemoteOriginRequired = true;
          telemetryState.activeEndpointOrigin = 'cloud-shared (Vercel ⇄ Cloud)';
        } else {
          telemetryState.activeEndpointOrigin = 'direct-cloud';
        }
        return { ok: true, data, usedOrigin: baseOrigin || 'local' };
      }

      // If local origin returned HTML (Vercel SPA fallback), mark remote origin required
      if (baseOrigin === '' && contentType.includes('text/html')) {
        detectedRemoteOriginRequired = true;
      }
    } catch {
      // try next origin
    }
  }

  return { ok: false, usedOrigin: 'offline' };
}

export function getPendingOutbox(): PendingBriefOutboxItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING_OUTBOX);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePendingOutbox(items: PendingBriefOutboxItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PENDING_OUTBOX, JSON.stringify(items));
    telemetryState.pendingOutboxCount = items.length;
  } catch {
    // ignore storage errors
  }
}

export function getSyncedBriefIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYNCED_BRIEF_IDS);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function markBriefIdsAsSynced(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    const current = getSyncedBriefIds();
    ids.forEach((id) => {
      if (id) current.add(id);
    });
    const arr = Array.from(current);
    localStorage.setItem(STORAGE_KEY_SYNCED_BRIEF_IDS, JSON.stringify(arr));
    telemetryState.syncedBriefIdsCount = arr.length;
  } catch {
    // ignore
  }
}

function notifyCollectionSubscribers(docs: ProjectBriefSubmission[]) {
  snapshotSubscribers.forEach((cb) => {
    try {
      cb(docs);
    } catch {
      // ignore subscriber error
    }
  });
}

function emitSyncTelemetry() {
  if (typeof window === 'undefined') return;
  const outbox = getPendingOutbox();
  const synced = getSyncedBriefIds();
  telemetryState.pendingOutboxCount = outbox.length;
  telemetryState.syncedBriefIdsCount = synced.size;

  window.dispatchEvent(
    new CustomEvent(BRIEF_REALTIME_SYNC_EVENT, {
      detail: { ...telemetryState },
    })
  );
  window.dispatchEvent(
    new CustomEvent(SERVER_SYNC_STATUS_EVENT, {
      detail: {
        connected: telemetryState.streamConnected,
        lastSyncAt: telemetryState.lastSyncedAt,
      },
    })
  );
}

export function getBriefSyncTelemetry(): BriefSyncTelemetry {
  if (typeof window !== 'undefined') {
    telemetryState.pendingOutboxCount = getPendingOutbox().length;
    telemetryState.syncedBriefIdsCount = getSyncedBriefIds().size;
    try {
      const rawBriefs = localStorage.getItem(STORAGE_KEY_ARCHIVED_BRIEFS);
      const parsed = rawBriefs ? JSON.parse(rawBriefs) : [];
      if (Array.isArray(parsed)) {
        telemetryState.totalServerBriefs = parsed.length;
      }
    } catch {
      // ignore
    }
  }
  return { ...telemetryState };
}

/**
 * Applies incoming authoritative brief documents from the 'briefs' collection
 * and triggers real-time listeners in the Admin Panel.
 */
function applyIncomingServerPayload(payload: {
  type?: string;
  revision?: number;
  docs?: ProjectBriefSubmission[];
  archivedBriefs?: ProjectBriefSubmission[];
  clientWorkspaces?: ClientWorkspace[];
  notificationLogs?: any[];
  doc?: ProjectBriefSubmission;
  brief?: ProjectBriefSubmission;
  notification?: any;
}) {
  if (typeof window === 'undefined') return;

  let changed = false;
  const incomingBriefsList = payload.docs || payload.archivedBriefs;

  if (Array.isArray(incomingBriefsList)) {
    const rawLocal = localStorage.getItem(STORAGE_KEY_ARCHIVED_BRIEFS);
    const sorted = sortBriefsNewestFirst(
      incomingBriefsList.filter((b) => b && b.id && !String(b.id).startsWith('brief-init-'))
    );
    const nextJson = JSON.stringify(sorted);
    if (nextJson !== rawLocal) {
      localStorage.setItem(STORAGE_KEY_ARCHIVED_BRIEFS, nextJson);
      changed = true;
    }
    telemetryState.totalServerBriefs = sorted.length;
    markBriefIdsAsSynced(sorted.map((b) => b.id));
    notifyCollectionSubscribers(sorted);
  }

  if (Array.isArray(payload.clientWorkspaces) && payload.clientWorkspaces.length > 0) {
    const rawWs = localStorage.getItem(STORAGE_KEY_WORKSPACES);
    const localWs: ClientWorkspace[] = rawWs ? JSON.parse(rawWs) : [];
    const wsMap = new Map<string, ClientWorkspace>();
    localWs.forEach((w) => {
      if (w && w.id) wsMap.set(w.id, w);
    });
    payload.clientWorkspaces.forEach((sw) => {
      if (sw && sw.id) {
        const prev = wsMap.get(sw.id);
        wsMap.set(sw.id, prev ? { ...prev, ...sw } : sw);
      }
    });
    const mergedWs = Array.from(wsMap.values());
    const nextWsJson = JSON.stringify(mergedWs);
    if (nextWsJson !== rawWs) {
      localStorage.setItem(STORAGE_KEY_WORKSPACES, nextWsJson);
      changed = true;
    }
  }

  if (Array.isArray(payload.notificationLogs)) {
    const rawLogs = localStorage.getItem(STORAGE_KEY_NOTIF_LOGS);
    const nextLogsJson = JSON.stringify(payload.notificationLogs);
    if (nextLogsJson !== rawLogs) {
      localStorage.setItem(STORAGE_KEY_NOTIF_LOGS, nextLogsJson);
      changed = true;
    }
  }

  if (payload.revision) {
    telemetryState.revision = payload.revision;
  }
  if (payload.type) {
    telemetryState.lastEventType = payload.type;
  }
  telemetryState.lastSyncedAt = formatNowTimeFa();

  if (payload.type === 'brief:created' && payload.notification) {
    const cfg = getNotificationConfig();
    if (cfg.soundAlertEnabled) {
      playNotificationChime();
    }
    window.dispatchEvent(
      new CustomEvent(NEW_BRIEF_NOTIFICATION_EVENT, { detail: payload.notification })
    );
  }

  if (
    changed ||
    payload.type === 'brief:created' ||
    payload.type === 'brief:updated' ||
    payload.type === 'brief:reconciled' ||
    payload.type === 'db:project:created' ||
    payload.type === 'db:project:updated' ||
    payload.type === 'db:project:deleted'
  ) {
    window.dispatchEvent(new CustomEvent('CJ_CLIENT_PORTAL_CHANGED'));
  }

  emitSyncTelemetry();
}

/**
 * Writes a newly submitted brief directly to the 'briefs' collection (/api/briefs)
 * across all deployed versions (Vercel & Cloud).
 */
export async function syncSubmittedBriefRealtime(
  brief: ProjectBriefSubmission,
  workspace: ClientWorkspace
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // 1. Add to persistent outbox so it is never lost even if offline
  const currentOutbox = getPendingOutbox().filter((item) => item.brief.id !== brief.id);
  savePendingOutbox([
    {
      brief,
      workspace,
      queuedAt: Date.now(),
      attempts: 1,
    },
    ...currentOutbox,
  ]);
  emitSyncTelemetry();

  // 2. Broadcast immediately to any open Admin Panel tab in the same browser
  try {
    broadcastChannel?.postMessage({
      type: 'brief:created',
      brief,
      workspace,
      timestamp: Date.now(),
    });
  } catch {
    // ignore BroadcastChannel errors
  }

  // 3. Write directly to the 'briefs' collection on the server
  const res = await smartCollectionFetch('/api/briefs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brief, workspace }),
  });

  if (res.ok && res.data?.ok) {
    const data = res.data;
    const remaining = getPendingOutbox().filter((item) => item.brief.id !== brief.id);
    savePendingOutbox(remaining);
    markBriefIdsAsSynced([brief.id]);
    telemetryState.streamConnected = true;

    applyIncomingServerPayload({
      type: 'brief:created',
      revision: data.revision,
      docs: data.docs,
      brief: data.doc || brief,
      notification: data.notification,
    });
    return true;
  }

  return false;
}

/**
 * Updates a specific brief document inside the 'briefs' collection (/api/briefs/:id)
 * e.g., when Admin toggles Read/Unread or changes status.
 */
export async function updateBriefInCollection(
  briefId: string,
  updates: Partial<ProjectBriefSubmission>
): Promise<boolean> {
  if (typeof window === 'undefined' || !briefId) return false;
  const res = await smartCollectionFetch(`/api/briefs/${encodeURIComponent(briefId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (res.ok && res.data?.ok) {
    markBriefIdsAsSynced([briefId]);
    applyIncomingServerPayload({
      type: 'brief:updated',
      revision: res.data.revision,
      docs: res.data.docs,
      doc: res.data.doc,
    });
    return true;
  }
  return false;
}

/**
 * Reads all brief documents directly from the 'briefs' collection (/api/briefs).
 */
export async function fetchBriefsCollection(): Promise<ProjectBriefSubmission[]> {
  const res = await smartCollectionFetch('/api/briefs', {
    method: 'GET',
    cache: 'no-store',
  });
  if (res.ok && Array.isArray(res.data?.docs)) {
    telemetryState.streamConnected = true;
    applyIncomingServerPayload({
      type: 'collection:read',
      revision: res.data.revision,
      docs: res.data.docs,
    });
    return res.data.docs;
  }
  return [];
}

/**
 * Full bidirectional reconciliation between any local briefs and the server 'briefs' collection.
 */
export async function reconcileClientBriefsWithServer(): Promise<{
  ok: boolean;
  syncedCount: number;
  newlyAddedCount: number;
}> {
  if (typeof window === 'undefined') {
    return { ok: false, syncedCount: 0, newlyAddedCount: 0 };
  }

  telemetryState.isReconciling = true;
  emitSyncTelemetry();

  try {
    const rawBriefs = localStorage.getItem(STORAGE_KEY_ARCHIVED_BRIEFS);
    const localBriefs: ProjectBriefSubmission[] = rawBriefs ? JSON.parse(rawBriefs) : [];

    const rawWs = localStorage.getItem(STORAGE_KEY_WORKSPACES);
    const localWorkspaces: ClientWorkspace[] = rawWs ? JSON.parse(rawWs) : [];

    const outbox = getPendingOutbox();

    const combinedBriefsMap = new Map<string, ProjectBriefSubmission>();
    localBriefs.forEach((b) => {
      if (b && b.id) combinedBriefsMap.set(b.id, b);
    });
    localWorkspaces.forEach((w) => {
      if (w && Array.isArray(w.archivedBriefs)) {
        w.archivedBriefs.forEach((b) => {
          if (b && b.id && !combinedBriefsMap.has(b.id)) {
            combinedBriefsMap.set(b.id, b);
          }
        });
      }
    });
    outbox.forEach((item) => {
      if (item?.brief?.id) {
        combinedBriefsMap.set(item.brief.id, item.brief);
      }
    });

    const clientBriefs = sortBriefsNewestFirst(Array.from(combinedBriefsMap.values()));

    const res = await smartCollectionFetch('/api/studio-state/briefs/reconcile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientBriefs,
        clientWorkspaces: localWorkspaces,
      }),
    });

    if (res.ok && res.data?.ok) {
      const data = res.data;
      savePendingOutbox([]);
      applyIncomingServerPayload({
        type: 'brief:reconciled',
        revision: data.revision,
        docs: data.archivedBriefs,
        archivedBriefs: data.archivedBriefs,
        clientWorkspaces: data.clientWorkspaces,
        notificationLogs: data.notificationLogs,
      });

      telemetryState.isReconciling = false;
      telemetryState.streamConnected = true;
      emitSyncTelemetry();

      return {
        ok: true,
        syncedCount: data.syncedCount || clientBriefs.length,
        newlyAddedCount: data.newlyAddedCount || 0,
      };
    }
  } catch (err) {
    console.warn('Reconcile briefs error:', err);
  }

  telemetryState.isReconciling = false;
  emitSyncTelemetry();
  return { ok: false, syncedCount: 0, newlyAddedCount: 0 };
}

/**
 * Connects to the real-time 'briefs' collection stream (/api/briefs/stream)
 * with automatic fallback to CENTRAL_CLOUD_BACKEND_ORIGIN when running on Vercel.
 */
function connectRealtimeStream() {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

  if (eventSourceInstance) {
    try {
      eventSourceInstance.close();
    } catch {
      // ignore
    }
  }

  const streamBase = detectedRemoteOriginRequired ? CENTRAL_CLOUD_BACKEND_ORIGIN : '';
  const streamUrl = `${streamBase}/api/briefs/stream`;

  try {
    const es = new EventSource(streamUrl);
    eventSourceInstance = es;

    es.onopen = () => {
      telemetryState.streamConnected = true;
      telemetryState.lastSyncedAt = formatNowTimeFa();
      emitSyncTelemetry();

      if (getPendingOutbox().length > 0) {
        void reconcileClientBriefsWithServer();
      }
    };

    es.onmessage = (event) => {
      if (!event.data) return;
      try {
        const parsed = JSON.parse(event.data);
        telemetryState.streamConnected = true;
        applyIncomingServerPayload(parsed);
      } catch {
        // ignore malformed message
      }
    };

    es.onerror = () => {
      try {
        es.close();
      } catch {
        // ignore
      }
      // If local stream failed (e.g. on Vercel static deployment), switch to CENTRAL_CLOUD_BACKEND_ORIGIN
      if (!detectedRemoteOriginRequired && window.location.origin !== CENTRAL_CLOUD_BACKEND_ORIGIN) {
        detectedRemoteOriginRequired = true;
        telemetryState.activeEndpointOrigin = 'cloud-shared (Vercel ⇄ Cloud)';
      }
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      reconnectTimer = window.setTimeout(() => {
        connectRealtimeStream();
      }, 3000);
    };
  } catch {
    telemetryState.streamConnected = false;
    emitSyncTelemetry();
  }
}

/**
 * Firestore-like Collection API for 'briefs'
 */
export const BriefsCollection = {
  name: 'briefs',
  add: syncSubmittedBriefRealtime,
  update: updateBriefInCollection,
  getAll: fetchBriefsCollection,
  reconcile: reconcileClientBriefsWithServer,
  onSnapshot(callback: (docs: ProjectBriefSubmission[]) => void): () => void {
    snapshotSubscribers.add(callback);
    void fetchBriefsCollection();
    return () => {
      snapshotSubscribers.delete(callback);
    };
  },
};

/**
 * Starts the Real-Time 'briefs' Collection Sync Service.
 */
export function startBriefRealtimeSyncService() {
  if (typeof window === 'undefined' || isServiceStarted) return;
  isServiceStarted = true;

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      broadcastChannel = new BroadcastChannel('cj_brief_realtime_channel');
      broadcastChannel.onmessage = (ev) => {
        const msg = ev.data;
        if (msg && msg.type === 'brief:created' && msg.brief) {
          window.dispatchEvent(new CustomEvent('CJ_CLIENT_PORTAL_CHANGED'));
          emitSyncTelemetry();
        }
      };
    } catch {
      // ignore
    }
  }

  void reconcileClientBriefsWithServer().then(() => {
    connectRealtimeStream();
  });

  // Periodic collection snapshot poll as a safety net for serverless/proxy environments
  window.setInterval(() => {
    void fetchBriefsCollection();
  }, 3500);

  window.addEventListener('online', () => {
    void reconcileClientBriefsWithServer();
    connectRealtimeStream();
  });

  window.addEventListener('focus', () => {
    void fetchBriefsCollection();
    if (getPendingOutbox().length > 0) {
      void reconcileClientBriefsWithServer();
    }
  });
}
