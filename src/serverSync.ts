/**
 * Creativity Juice — Central Server Synchronization & Direct Forwarding Helper
 * Synchronizes Briefs, Client Workspaces, Projects, and Team Credits across all devices via /api/studio-state
 * and generates direct WhatsApp / Email forwarding links for submitted briefs.
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

export const SERVER_SYNC_STATUS_EVENT = 'CJ_SERVER_SYNC_STATUS';

let isSyncInitialized = false;
let isApplyingServerState = false;
let lastServerSyncAt: string | null = null;
let serverConnected = true;

export function getServerSyncStatus() {
  return {
    connected: serverConnected,
    lastSyncAt: lastServerSyncAt,
  };
}

function mergeArrayById<T extends { id?: string }>(localArr: T[], serverArr: T[]): T[] {
  const map = new Map<string, T>();
  // Put local items first, then overwrite/enrich with server items while keeping any new local items
  localArr.forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  serverArr.forEach((item) => {
    if (item && item.id) {
      const existing = map.get(item.id) as any;
      if (existing && Array.isArray(existing.archivedBriefs) && Array.isArray((item as any).archivedBriefs)) {
        const mergedBriefs = mergeArrayById(existing.archivedBriefs, (item as any).archivedBriefs);
        const mergedFeedbacks = mergeArrayById(existing.feedbacks || [], (item as any).feedbacks || []);
        map.set(item.id, {
          ...existing,
          ...item,
          archivedBriefs: mergedBriefs,
          feedbacks: mergedFeedbacks,
        });
      } else {
        map.set(item.id, item);
      }
    }
  });
  // Sort so server's newest items stay at top
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

    // 1. Merge Archived Briefs
    if (Array.isArray(st.archivedBriefs) && st.archivedBriefs.length > 0) {
      const rawLocalBriefs = localStorage.getItem(STORAGE_KEY_ARCHIVED_BRIEFS);
      const localBriefs: ProjectBriefSubmission[] = rawLocalBriefs ? JSON.parse(rawLocalBriefs) : [];
      const mergedBriefs = mergeArrayById(localBriefs, st.archivedBriefs);
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

    // 3. Sync Projects & Credits
    if (Array.isArray(st.projects) && st.projects.length > 0) {
      const rawLocalProj = localStorage.getItem(STORAGE_KEY_PROJECTS);
      const serverProjJson = JSON.stringify(st.projects);
      if (serverProjJson !== rawLocalProj) {
        localStorage.setItem(STORAGE_KEY_PROJECTS, serverProjJson);
        localStorage.setItem('creativity_juice_projects_v2', serverProjJson);
        studioChanged = true;
      }
    }

    // 4. Sync Team Members
    if (Array.isArray(st.team) && st.team.length > 0) {
      const rawLocalTeam = localStorage.getItem(STORAGE_KEY_TEAM);
      const serverTeamJson = JSON.stringify(st.team);
      if (serverTeamJson !== rawLocalTeam) {
        localStorage.setItem(STORAGE_KEY_TEAM, serverTeamJson);
        studioChanged = true;
      }
    }

    // 5. Sync Services, Manifesto, Media, Settings
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
): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/studio-state/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief, workspace }),
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
  } catch (err) {
    console.error('Failed pushing brief to server:', err);
  }
  return false;
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

  // Initial pull from central server, and if server is empty, seed it with local state
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

  // Periodic background sync every 4 seconds so Admin Panel receives new briefs automatically
  window.setInterval(() => {
    pullStateFromServer(false);
  }, 4000);

  window.addEventListener('focus', () => {
    pullStateFromServer(false);
  });
}

/**
 * Generates direct WhatsApp and Email URLs so a client or admin can forward a copy of the brief
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
  let whatsappNumber = '';
  let emailAddr = 'youthefzadeh@gmail.com';

  try {
    const rawSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      if (parsed.adminWhatsapp) whatsappNumber = parsed.adminWhatsapp;
      if (parsed.contactEmail) emailAddr = parsed.contactEmail;
    }
  } catch {
    // ignore
  }

  if (params.whatsappPhone) whatsappNumber = params.whatsappPhone;
  if (params.adminEmail) emailAddr = params.adminEmail;

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '').replace(/^0/, '98');

  const messageBody = [
    `📋 *بریف جدید پروژه — استودیو Creativity Juice*`,
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

  const subject = encodeURIComponent(`بریف جدید پروژه: ${params.brandName} (کد رهگیری: ${params.trackingCode})`);
  const mailtoUrl = `mailto:${emailAddr}?subject=${subject}&body=${encodedText}`;

  return {
    whatsappUrl,
    mailtoUrl,
    messageBody,
  };
}
