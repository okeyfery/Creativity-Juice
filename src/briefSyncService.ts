/**
 * Creativity Juice — Real-Time Brief Synchronization Service (BriefSyncService)
 * Synchronizes client-submitted briefs with the central server in real time using:
 * 1. Persistent Outbox Queue (for guaranteed delivery of client briefs)
 * 2. Bi-directional Reconciliation (/api/studio-state/briefs/reconcile)
 * 3. Server-Sent Events Real-Time Stream (/api/studio-state/stream)
 * 4. Cross-Tab BroadcastChannel (0ms same-browser Admin Panel updates)
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
}

let eventSourceInstance: EventSource | null = null;
let broadcastChannel: BroadcastChannel | null = null;
let reconnectTimer: number | null = null;
let isServiceStarted = false;

const telemetryState: BriefSyncTelemetry = {
  streamConnected: false,
  isReconciling: false,
  lastSyncedAt: null,
  lastEventType: null,
  revision: 0,
  totalServerBriefs: 0,
  pendingOutboxCount: 0,
  syncedBriefIdsCount: 0,
};

function formatNowTimeFa(): string {
  try {
    return new Date().toLocaleTimeString('fa-IR');
  } catch {
    return new Date().toISOString().slice(11, 19);
  }
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
 * Applies incoming authoritative brief & workspace data from the server
 * to client storage idempotently and notifies the Admin Panel in real time.
 */
function applyIncomingServerPayload(payload: {
  type?: string;
  revision?: number;
  archivedBriefs?: ProjectBriefSubmission[];
  clientWorkspaces?: ClientWorkspace[];
  notificationLogs?: any[];
  brief?: ProjectBriefSubmission;
  notification?: any;
}) {
  if (typeof window === 'undefined') return;

  let changed = false;

  if (Array.isArray(payload.archivedBriefs) && payload.archivedBriefs.length > 0) {
    const rawLocal = localStorage.getItem(STORAGE_KEY_ARCHIVED_BRIEFS);
    const localList: ProjectBriefSubmission[] = rawLocal ? JSON.parse(rawLocal) : [];

    // Merge idempotently by ID, preferring server's newest list while preserving local unsynced briefs
    const map = new Map<string, ProjectBriefSubmission>();
    localList.forEach((b) => {
      if (b && b.id) map.set(b.id, b);
    });
    payload.archivedBriefs.forEach((sb) => {
      if (sb && sb.id) {
        const existing = map.get(sb.id);
        map.set(sb.id, existing ? { ...existing, ...sb } : sb);
      }
    });

    const sorted = sortBriefsNewestFirst(Array.from(map.values()));
    const nextJson = JSON.stringify(sorted);
    if (nextJson !== rawLocal) {
      localStorage.setItem(STORAGE_KEY_ARCHIVED_BRIEFS, nextJson);
      changed = true;
    }
    telemetryState.totalServerBriefs = sorted.length;
    markBriefIdsAsSynced(payload.archivedBriefs.map((b) => b.id));
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

  if (changed || payload.type === 'brief:created' || payload.type === 'brief:reconciled') {
    window.dispatchEvent(new CustomEvent('CJ_CLIENT_PORTAL_CHANGED'));
  }

  emitSyncTelemetry();
}

/**
 * Enqueues a newly submitted client brief and immediately synchronizes it with the server,
 * plus broadcasts across tabs for 0ms local latency.
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

  // 3. Push atomically to the server
  try {
    const res = await fetch('/api/studio-state/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief, workspace }),
    });

    if (res.ok) {
      const data = await res.json();
      // Remove from outbox upon server confirmation
      const remaining = getPendingOutbox().filter((item) => item.brief.id !== brief.id);
      savePendingOutbox(remaining);
      markBriefIdsAsSynced([brief.id]);

      if (data?.state) {
        applyIncomingServerPayload({
          type: 'brief:created',
          revision: data.revision,
          archivedBriefs: data.state.archivedBriefs,
          clientWorkspaces: data.state.clientWorkspaces,
          notificationLogs: data.state.notificationLogs,
          brief,
          notification: data.notification,
        });
      }
      return true;
    }
  } catch (err) {
    console.warn('Immediate brief sync failed, queued for automatic reconciliation:', err);
  }

  return false;
}

/**
 * Full bidirectional reconciliation between all briefs stored in client localStorage/outbox
 * and the central server database.
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

    // Combine local briefs, workspace briefs, and pending outbox briefs
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

    const res = await fetch('/api/studio-state/briefs/reconcile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientBriefs,
        clientWorkspaces: localWorkspaces,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      savePendingOutbox([]);
      applyIncomingServerPayload({
        type: 'brief:reconciled',
        revision: data.revision,
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
 * Connects to the Server-Sent Events (SSE) stream at /api/studio-state/stream
 * for real-time server-to-admin push notifications and state updates.
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

  try {
    const es = new EventSource('/api/studio-state/stream');
    eventSourceInstance = es;

    es.onopen = () => {
      telemetryState.streamConnected = true;
      telemetryState.lastSyncedAt = formatNowTimeFa();
      emitSyncTelemetry();

      // Flush any pending client briefs in outbox on reconnect
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
      telemetryState.streamConnected = false;
      emitSyncTelemetry();
      try {
        es.close();
      } catch {
        // ignore
      }
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      reconnectTimer = window.setTimeout(() => {
        connectRealtimeStream();
      }, 4000);
    };
  } catch {
    telemetryState.streamConnected = false;
    emitSyncTelemetry();
  }
}

/**
 * Starts the Real-Time Brief Sync Service (SSE + BroadcastChannel + Auto-Reconcile).
 */
export function startBriefRealtimeSyncService() {
  if (typeof window === 'undefined' || isServiceStarted) return;
  isServiceStarted = true;

  // 1. Setup Cross-Tab BroadcastChannel for 0ms local tab updates
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
      // ignore if BroadcastChannel is restricted
    }
  }

  // 2. Perform initial bidirectional reconciliation between client storage and server
  void reconcileClientBriefsWithServer();

  // 3. Connect to SSE Real-Time Stream
  connectRealtimeStream();

  // 4. Reconcile automatically when tab regains focus or network comes back online
  window.addEventListener('online', () => {
    void reconcileClientBriefsWithServer();
    connectRealtimeStream();
  });

  window.addEventListener('focus', () => {
    if (getPendingOutbox().length > 0) {
      void reconcileClientBriefsWithServer();
    }
  });
}
