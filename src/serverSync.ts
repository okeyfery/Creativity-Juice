/**
 * Creativity Juice — Central Server Synchronization & Instant Notification Engine
 * Synchronizes Briefs, Client Workspaces, Projects, Team Credits, and Instant Notifications
 * across all devices via /api/studio-state and generates direct WhatsApp / Email alerts.
 */

import { ClientWorkspace, ProjectBriefSubmission } from './data/clientPortalData';

const STORAGE_KEY_WORKSPACES = 'cj_client_workspaces_v1';
const STORAGE_KEY_ARCHIVED_BRIEFS = 'cj_studio_archived_briefs_v1';
const STORAGE_KEY_PROJECTS = 'cj_studio_projects_v4';
const STORAGE_KEY_TEAM = 'cj_studio_team_v5';
const STORAGE_KEY_SERVICES = 'cj_studio_services_v5';
const STORAGE_KEY_MANIFESTO = 'cj_studio_manifesto_v6';
const STORAGE_KEY_MEDIA = 'cj_studio_media_v3';
const STORAGE_KEY_SETTINGS = 'cj_studio_settings_v3';
const STORAGE_KEY_NOTIF_CONFIG = 'cj_studio_notif_config_v1';
const STORAGE_KEY_NOTIF_LOGS = 'cj_studio_notif_logs_v1';

export const SERVER_SYNC_STATUS_EVENT = 'CJ_SERVER_SYNC_STATUS';
export const NEW_BRIEF_NOTIFICATION_EVENT = 'CJ_NEW_BRIEF_NOTIFICATION';

export interface NotificationConfig {
  enabled: boolean;
  adminEmail: string;
  adminWhatsapp: string;
  autoEmailEnabled: boolean;
  autoWhatsappEnabled: boolean;
  whatsappWebhookUrl?: string;
  emailWebhookUrl?: string;
  soundAlertEnabled: boolean;
}

export interface BriefNotificationRecord {
  id: string;
  briefId: string;
  trackingCode: string;
  brandName: string;
  ownerName: string;
  contactInfo: string;
  selectedTrack: string;
  marketTier: string;
  problemSummary: string;
  createdAt: string;
  emailTarget: string;
  whatsappTarget: string;
  emailStatus: 'sent' | 'queued' | 'manual-ready';
  whatsappStatus: 'sent' | 'ready-to-send';
  readByAdmin: boolean;
  whatsappUrl: string;
  mailtoUrl: string;
  isTest?: boolean;
}

const DEFAULT_NOTIF_CONFIG: NotificationConfig = {
  enabled: true,
  adminEmail: 'youthefzadeh@gmail.com',
  adminWhatsapp: '',
  autoEmailEnabled: true,
  autoWhatsappEnabled: true,
  whatsappWebhookUrl: '',
  emailWebhookUrl: '',
  soundAlertEnabled: true,
};

let isSyncInitialized = false;
let isApplyingServerState = false;
let lastServerSyncAt: string | null = null;
let serverConnected = true;
const seenNotificationIds = new Set<string>();

export function getServerSyncStatus() {
  return {
    connected: serverConnected,
    lastSyncAt: lastServerSyncAt,
  };
}

export function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.12); // A5
    osc2.frequency.setValueAtTime(293.66, now);
    osc2.frequency.setValueAtTime(440, now + 0.12);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch {
    // ignore audio context restrictions
  }
}

export function getNotificationConfig(): NotificationConfig {
  if (typeof window === 'undefined') return DEFAULT_NOTIF_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIF_CONFIG);
    const rawSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const settings = rawSettings ? JSON.parse(rawSettings) : {};
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...DEFAULT_NOTIF_CONFIG,
      adminEmail: settings.contactEmail || DEFAULT_NOTIF_CONFIG.adminEmail,
      adminWhatsapp: settings.adminWhatsapp || DEFAULT_NOTIF_CONFIG.adminWhatsapp,
      ...parsed,
    };
  } catch {
    return DEFAULT_NOTIF_CONFIG;
  }
}

export function getNotificationLogs(): BriefNotificationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIF_LOGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveNotificationConfig(
  partial: Partial<NotificationConfig>
): Promise<NotificationConfig> {
  const current = getNotificationConfig();
  const updated: NotificationConfig = { ...current, ...partial };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_NOTIF_CONFIG, JSON.stringify(updated));
    try {
      const rawSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      const settings = rawSettings ? JSON.parse(rawSettings) : {};
      if (updated.adminEmail) settings.contactEmail = updated.adminEmail;
      if (updated.adminWhatsapp !== undefined) settings.adminWhatsapp = updated.adminWhatsapp;
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('CJ_CLIENT_PORTAL_CHANGED'));
  }

  try {
    await fetch('/api/studio-state/notifications/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  } catch {
    // ignore offline error
  }
  return updated;
}

export async function markNotificationsRead(id?: string): Promise<void> {
  const logs = getNotificationLogs().map((l) => (!id || l.id === id ? { ...l, readByAdmin: true } : l));
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_NOTIF_LOGS, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('CJ_CLIENT_PORTAL_CHANGED'));
  }
  try {
    await fetch('/api/studio-state/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  } catch {
    // ignore
  }
}

export async function triggerTestNotification(
  customConfig?: Partial<NotificationConfig>
): Promise<{ ok: boolean; notification?: BriefNotificationRecord }> {
  try {
    const configToSend = { ...getNotificationConfig(), ...(customConfig || {}) };
    const res = await fetch('/api/studio-state/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: configToSend }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.notification) {
        const existing = getNotificationLogs().filter((x) => x.id !== data.notification.id);
        const nextLogs = [data.notification, ...existing];
        localStorage.setItem(STORAGE_KEY_NOTIF_LOGS, JSON.stringify(nextLogs));
        if (configToSend.soundAlertEnabled) {
          playNotificationChime();
        }
        window.dispatchEvent(new CustomEvent('CJ_CLIENT_PORTAL_CHANGED'));
        window.dispatchEvent(
          new CustomEvent(NEW_BRIEF_NOTIFICATION_EVENT, { detail: data.notification })
        );
        return { ok: true, notification: data.notification };
      }
    }
  } catch (err) {
    console.error('Failed triggering test notification:', err);
  }
  return { ok: false };
}

function extractBriefTimestamp(item: any): number {
  if (!item || typeof item !== 'object') return 0;
  if (typeof item.createdAtMs === 'number' && item.createdAtMs > 0) return item.createdAtMs;
  if (typeof item.id === 'string') {
    if (item.id.startsWith('brief-init-')) return 1000;
    const match = item.id.match(/brief-(?:test-)?(\d{10,})/);
    if (match) return Number(match[1]);
  }
  return 2000;
}

export function sortBriefsNewestFirst(briefs: ProjectBriefSubmission[]): ProjectBriefSubmission[] {
  if (!Array.isArray(briefs)) return [];
  return [...briefs].sort((a, b) => {
    const aIsInit = typeof a?.id === 'string' && a.id.startsWith('brief-init-');
    const bIsInit = typeof b?.id === 'string' && b.id.startsWith('brief-init-');
    if (aIsInit !== bIsInit) return aIsInit ? 1 : -1;
    const timeDiff = extractBriefTimestamp(b) - extractBriefTimestamp(a);
    if (timeDiff !== 0) return timeDiff;
    return 0;
  });
}

function mergeArrayById<T extends { id?: string }>(localArr: T[], serverArr: T[]): T[] {
  const map = new Map<string, T>();
  localArr.forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  serverArr.forEach((item) => {
    if (item && item.id) {
      const existing = map.get(item.id) as any;
      if (existing && Array.isArray(existing.archivedBriefs) && Array.isArray((item as any).archivedBriefs)) {
        const mergedBriefs = sortBriefsNewestFirst(
          mergeArrayById(existing.archivedBriefs, (item as any).archivedBriefs)
        );
        const mergedFeedbacks = mergeArrayById(existing.feedbacks || [], (item as any).feedbacks || []);
        map.set(item.id, {
          ...existing,
          ...item,
          archivedBriefs: mergedBriefs,
          feedbacks: mergedFeedbacks,
        });
      } else if (existing) {
        map.set(item.id, { ...existing, ...item });
      } else {
        map.set(item.id, item);
      }
    }
  });
  const serverIds = new Set(serverArr.map((x) => x.id));
  const orderedFromServer = serverArr.map((s) => (s.id ? map.get(s.id)! : s));
  const localOnly = localArr.filter((l) => l.id && !serverIds.has(l.id));
  return [...orderedFromServer, ...localOnly];
}

export async function pullStateFromServer(forceDispatch = false): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/studio-state', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      serverConnected = false;
      return false;
    }
    const data = await res.json();
    if (!data || !data.ok || !data.state) return false;

    serverConnected = true;
    lastServerSyncAt = new Date().toLocaleTimeString('fa-IR');
    const st = data.state;

    isApplyingServerState = true;
    let portalChanged = false;
    let studioChanged = false;

    // 1. Merge Archived Briefs (always sort real submitted briefs newest-first)
    if (Array.isArray(st.archivedBriefs) && st.archivedBriefs.length > 0) {
      const rawLocalBriefs = localStorage.getItem(STORAGE_KEY_ARCHIVED_BRIEFS);
      const localBriefs: ProjectBriefSubmission[] = rawLocalBriefs ? JSON.parse(rawLocalBriefs) : [];
      const mergedBriefs = sortBriefsNewestFirst(mergeArrayById(localBriefs, st.archivedBriefs));
      const mergedJson = JSON.stringify(mergedBriefs);
      if (mergedJson !== rawLocalBriefs) {
        localStorage.setItem(STORAGE_KEY_ARCHIVED_BRIEFS, mergedJson);
        portalChanged = true;
      }
    }

    // 2. Merge Client Workspaces
    if (Array.isArray(st.clientWorkspaces) && st.clientWorkspaces.length > 0) {
      const rawLocalWs = localStorage.getItem(STORAGE_KEY_WORKSPACES);
      const localWs: ClientWorkspace[] = rawLocalWs ? JSON.parse(rawLocalWs) : [];
      const mergedWs = mergeArrayById(localWs, st.clientWorkspaces);
      const mergedWsJson = JSON.stringify(mergedWs);
      if (mergedWsJson !== rawLocalWs) {
        localStorage.setItem(STORAGE_KEY_WORKSPACES, mergedWsJson);
        portalChanged = true;
      }
    }

    // 3. Sync Notification Config & Notification Logs
    if (st.notificationConfig && typeof st.notificationConfig === 'object') {
      const rawNotifCfg = localStorage.getItem(STORAGE_KEY_NOTIF_CONFIG);
      const nextNotifCfg = JSON.stringify(st.notificationConfig);
      if (nextNotifCfg !== rawNotifCfg) {
        localStorage.setItem(STORAGE_KEY_NOTIF_CONFIG, nextNotifCfg);
        portalChanged = true;
      }
    }

    if (Array.isArray(st.notificationLogs)) {
      const rawLogs = localStorage.getItem(STORAGE_KEY_NOTIF_LOGS);
      const prevLogs: BriefNotificationRecord[] = rawLogs ? JSON.parse(rawLogs) : [];
      prevLogs.forEach((l) => seenNotificationIds.add(l.id));

      const nextLogsJson = JSON.stringify(st.notificationLogs);
      if (nextLogsJson !== rawLogs) {
        localStorage.setItem(STORAGE_KEY_NOTIF_LOGS, nextLogsJson);
        portalChanged = true;

        // Check if there is a brand-new unread notification
        const newestUnread = (st.notificationLogs as BriefNotificationRecord[]).find(
          (l) => !l.readByAdmin && !seenNotificationIds.has(l.id)
        );
        if (newestUnread) {
          seenNotificationIds.add(newestUnread.id);
          const cfg = getNotificationConfig();
          if (cfg.soundAlertEnabled) {
            playNotificationChime();
          }
          window.dispatchEvent(
            new CustomEvent(NEW_BRIEF_NOTIFICATION_EVENT, { detail: newestUnread })
          );
        }
      }
      (st.notificationLogs as BriefNotificationRecord[]).forEach((l) => seenNotificationIds.add(l.id));
    }

    // 4. Sync Projects & Credits
    if (Array.isArray(st.projects) && st.projects.length > 0) {
      const rawLocalProj = localStorage.getItem(STORAGE_KEY_PROJECTS);
      const serverProjJson = JSON.stringify(st.projects);
      if (serverProjJson !== rawLocalProj) {
        localStorage.setItem(STORAGE_KEY_PROJECTS, serverProjJson);
        localStorage.setItem('creativity_juice_projects_v2', serverProjJson);
        studioChanged = true;
      }
    }

    // 5. Sync Team Members
    if (Array.isArray(st.team) && st.team.length > 0) {
      const rawLocalTeam = localStorage.getItem(STORAGE_KEY_TEAM);
      const serverTeamJson = JSON.stringify(st.team);
      if (serverTeamJson !== rawLocalTeam) {
        localStorage.setItem(STORAGE_KEY_TEAM, serverTeamJson);
        studioChanged = true;
      }
    }

    // 6. Sync Services, Manifesto, Settings
    if (Array.isArray(st.services) && st.services.length > 0) {
      const raw = localStorage.getItem(STORAGE_KEY_SERVICES);
      const next = JSON.stringify(st.services);
      if (next !== raw) {
        localStorage.setItem(STORAGE_KEY_SERVICES, next);
        studioChanged = true;
      }
    }
    if (Array.isArray(st.manifesto) && st.manifesto.length > 0) {
      const raw = localStorage.getItem(STORAGE_KEY_MANIFESTO);
      const next = JSON.stringify(st.manifesto);
      if (next !== raw) {
        localStorage.setItem(STORAGE_KEY_MANIFESTO, next);
        studioChanged = true;
      }
    }
    if (st.settings && typeof st.settings === 'object') {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      const next = JSON.stringify(st.settings);
      if (next !== raw) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, next);
        studioChanged = true;
      }
    }

    isApplyingServerState = false;

    if (portalChanged || forceDispatch) {
      window.dispatchEvent(new CustomEvent('CJ_CLIENT_PORTAL_CHANGED'));
    }
    if (studioChanged || forceDispatch) {
      window.dispatchEvent(new CustomEvent('CJ_STUDIO_DATA_CHANGED', { detail: { type: 'server-sync' } }));
    }
    window.dispatchEvent(
      new CustomEvent(SERVER_SYNC_STATUS_EVENT, {
        detail: { connected: true, lastSyncAt: lastServerSyncAt },
      })
    );
    return true;
  } catch {
    isApplyingServerState = false;
    serverConnected = false;
    return false;
  }
}

export async function pushBriefToServer(
  brief: ProjectBriefSubmission,
  workspace: ClientWorkspace
): Promise<{ ok: boolean; notification?: BriefNotificationRecord }> {
  if (typeof window === 'undefined') return { ok: false };
  try {
    const res = await fetch('/api/studio-state/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief, workspace }),
    });
    if (res.ok) {
      const data = await res.json();
      serverConnected = true;
      lastServerSyncAt = new Date().toLocaleTimeString('fa-IR');

      if (data?.notification) {
        seenNotificationIds.add(data.notification.id);
        const existing = getNotificationLogs().filter((x) => x.id !== data.notification.id);
        localStorage.setItem(
          STORAGE_KEY_NOTIF_LOGS,
          JSON.stringify([data.notification, ...existing])
        );
        window.dispatchEvent(
          new CustomEvent(NEW_BRIEF_NOTIFICATION_EVENT, { detail: data.notification })
        );
      }

      window.dispatchEvent(
        new CustomEvent(SERVER_SYNC_STATUS_EVENT, {
          detail: { connected: true, lastSyncAt: lastServerSyncAt },
        })
      );
      window.dispatchEvent(new CustomEvent('CJ_CLIENT_PORTAL_CHANGED'));
      return { ok: true, notification: data?.notification };
    }
  } catch (err) {
    console.error('Failed pushing brief to server:', err);
  }
  return { ok: false };
}

export async function pushServerSyncPayload(payload: {
  archivedBriefs?: ProjectBriefSubmission[];
  clientWorkspaces?: ClientWorkspace[];
  replaceWorkspaces?: boolean;
  replaceBriefs?: boolean;
  projects?: any[];
  team?: any[];
  services?: any[];
  manifesto?: any[];
  media?: any[];
  settings?: any;
  notificationConfig?: Partial<NotificationConfig>;
}): Promise<boolean> {
  if (typeof window === 'undefined' || isApplyingServerState) return false;
  try {
    const res = await fetch('/api/studio-state/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      serverConnected = true;
      lastServerSyncAt = new Date().toLocaleTimeString('fa-IR');
      window.dispatchEvent(
        new CustomEvent(SERVER_SYNC_STATUS_EVENT, {
          detail: { connected: true, lastSyncAt: lastServerSyncAt },
        })
      );
      return true;
    }
  } catch {
    // ignore offline errors
  }
  return false;
}

export function initServerSync() {
  if (typeof window === 'undefined' || isSyncInitialized) return;
  isSyncInitialized = true;

  pullStateFromServer(true).then(() => {
    try {
      const rawBriefs = localStorage.getItem(STORAGE_KEY_ARCHIVED_BRIEFS);
      const rawWs = localStorage.getItem(STORAGE_KEY_WORKSPACES);
      const rawProj = localStorage.getItem(STORAGE_KEY_PROJECTS);
      const rawTeam = localStorage.getItem(STORAGE_KEY_TEAM);
      pushServerSyncPayload({
        archivedBriefs: rawBriefs ? JSON.parse(rawBriefs) : undefined,
        clientWorkspaces: rawWs ? JSON.parse(rawWs) : undefined,
        projects: rawProj ? JSON.parse(rawProj) : undefined,
        team: rawTeam ? JSON.parse(rawTeam) : undefined,
      });
    } catch {
      // ignore
    }
  });

  window.setInterval(() => {
    pullStateFromServer(false);
  }, 4000);

  window.addEventListener('focus', () => {
    pullStateFromServer(false);
  });
}

/**
 * Generates direct WhatsApp and Email URLs so a client or admin can forward/notify a copy of the brief
 */
export function buildBriefForwardLinks(params: {
  brandName: string;
  trackingCode: string;
  username?: string;
  password?: string;
  selectedTrack: string;
  problem: string;
  fullSummaryText: string;
  whatsappPhone?: string;
  adminEmail?: string;
}) {
  const notifCfg = getNotificationConfig();
  let whatsappNumber = notifCfg.adminWhatsapp || '';
  let emailAddr = notifCfg.adminEmail || 'youthefzadeh@gmail.com';

  if (params.whatsappPhone) whatsappNumber = params.whatsappPhone;
  if (params.adminEmail) emailAddr = params.adminEmail;

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '').replace(/^0/, '98');

  const messageBody = [
    `🔔 *اعلان فوری ثبت بریف جدید — استودیو Creativity Juice*`,
    `• نام برند / پروژه: ${params.brandName}`,
    `• کد رهگیری یکتا: ${params.trackingCode}`,
    params.username ? `• نام کاربری پورتال: ${params.username}` : '',
    params.password ? `• رمز عبور پروژه: ${params.password}` : '',
    `• دپارتمان انتخابی: ${params.selectedTrack}`,
    `• خلاصه صورت‌مسئله: ${params.problem}`,
    ``,
    `--- جزئیات کامل بریف ---`,
    params.fullSummaryText,
  ]
    .filter(Boolean)
    .join('\n');

  const encodedText = encodeURIComponent(messageBody);
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  const subject = encodeURIComponent(
    `🔔 اعلان بریف جدید پروژه: ${params.brandName} (کد رهگیری: ${params.trackingCode})`
  );
  const mailtoUrl = `mailto:${emailAddr}?subject=${subject}&body=${encodedText}`;

  return {
    whatsappUrl,
    mailtoUrl,
    messageBody,
    emailAddr,
    whatsappNumber,
  };
}
