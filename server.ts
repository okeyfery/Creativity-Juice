import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, 'studio-server-db.json');

export interface ServerNotificationConfig {
  enabled: boolean;
  adminEmail: string;
  adminWhatsapp: string;
  autoEmailEnabled: boolean;
  autoWhatsappEnabled: boolean;
  whatsappWebhookUrl?: string;
  emailWebhookUrl?: string;
  soundAlertEnabled: boolean;
}

export interface ServerBriefNotificationLog {
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

const DEFAULT_NOTIFICATION_CONFIG: ServerNotificationConfig = {
  enabled: true,
  adminEmail: 'youthefzadeh@gmail.com',
  adminWhatsapp: '',
  autoEmailEnabled: true,
  autoWhatsappEnabled: true,
  whatsappWebhookUrl: '',
  emailWebhookUrl: '',
  soundAlertEnabled: true,
};

function readServerDb(): Record<string, any> {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const settingsEmail = parsed.settings?.contactEmail || DEFAULT_NOTIFICATION_CONFIG.adminEmail;
        const settingsWhatsapp = parsed.settings?.adminWhatsapp || DEFAULT_NOTIFICATION_CONFIG.adminWhatsapp;
        const notifConfig: ServerNotificationConfig = {
          ...DEFAULT_NOTIFICATION_CONFIG,
          adminEmail: settingsEmail,
          adminWhatsapp: settingsWhatsapp,
          ...(parsed.notificationConfig || {}),
        };
        return {
          archivedBriefs: Array.isArray(parsed.archivedBriefs) ? parsed.archivedBriefs : [],
          clientWorkspaces: Array.isArray(parsed.clientWorkspaces) ? parsed.clientWorkspaces : [],
          projects: Array.isArray(parsed.projects) ? parsed.projects : null,
          team: Array.isArray(parsed.team) ? parsed.team : null,
          services: Array.isArray(parsed.services) ? parsed.services : null,
          manifesto: Array.isArray(parsed.manifesto) ? parsed.manifesto : null,
          media: Array.isArray(parsed.media) ? parsed.media : null,
          settings: parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : null,
          notificationConfig: notifConfig,
          notificationLogs: Array.isArray(parsed.notificationLogs) ? parsed.notificationLogs : [],
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.error('Error reading studio-server-db.json:', err);
  }
  return {
    archivedBriefs: [],
    clientWorkspaces: [],
    projects: null,
    team: null,
    services: null,
    manifesto: null,
    media: null,
    settings: null,
    notificationConfig: { ...DEFAULT_NOTIFICATION_CONFIG },
    notificationLogs: [],
    updatedAt: new Date().toISOString(),
  };
}

function writeServerDb(data: Record<string, any>): Record<string, any> {
  try {
    const nextData: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(nextData, null, 2), 'utf-8');
    return nextData;
  } catch (err) {
    console.error('Error writing studio-server-db.json:', err);
    return data;
  }
}

function mergeById(existingList: any[] = [], incomingList: any[] = [], preferIncoming = true): any[] {
  const map = new Map<string, any>();
  existingList.forEach((item: any) => {
    if (item && item.id) {
      map.set(item.id, item);
    }
  });
  incomingList.forEach((item: any) => {
    if (item && item.id) {
      if (preferIncoming || !map.has(item.id)) {
        const prev = map.get(item.id);
        if (prev && Array.isArray(prev.archivedBriefs) && Array.isArray(item.archivedBriefs)) {
          const mergedBriefs = mergeById(prev.archivedBriefs, item.archivedBriefs, true);
          const mergedFeedbacks = mergeById(prev.feedbacks || [], item.feedbacks || [], true);
          const mergedDeliverables = Array.isArray(item.deliverables) ? item.deliverables : prev.deliverables || [];
          map.set(item.id, {
            ...prev,
            ...item,
            archivedBriefs: mergedBriefs,
            feedbacks: mergedFeedbacks,
            deliverables: mergedDeliverables,
          });
        } else {
          map.set(item.id, item);
        }
      }
    }
  });
  return Array.from(map.values());
}

function buildNotificationLinksServer(
  brief: Record<string, any>,
  workspace: Record<string, any> | undefined,
  config: ServerNotificationConfig
) {
  const emailAddr = (config.adminEmail || 'youthefzadeh@gmail.com').trim();
  const rawPhone = (config.adminWhatsapp || '').trim();
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '').replace(/^0/, '98');

  const trackingCode = brief.trackingCode || workspace?.trackingCode || 'CJ-NEW';
  const username = workspace?.username || workspace?.slug || trackingCode;
  const password = workspace?.password || workspace?.pinCode || '';

  const messageText = [
    `🔔 *اعلان فوری ثبت بریف جدید — استودیو Creativity Juice*`,
    `• نام برند / پروژه: ${brief.brandName || 'پروژه جدید'}`,
    `• نام کارفرما: ${brief.ownerName || 'کارفرما'}`,
    `• اطلاعات تماس: ${brief.contactInfo || '-'}`,
    `• کد رهگیری یکتا: ${trackingCode}`,
    `• نام کاربری پورتال: ${username}`,
    password ? `• رمز عبور اختصاصی: ${password}` : '',
    `• دپارتمان انتخابی: ${brief.selectedTrack || '-'}`,
    `• رده بازار: ${brief.marketTier || '-'}`,
    `• خلاصه صورت‌مسئله: ${brief.problem || '-'}`,
    ``,
    `--- متن کامل بریف آرشیوشده ---`,
    brief.fullSummaryText || brief.problem || '',
  ]
    .filter(Boolean)
    .join('\n');

  const encodedText = encodeURIComponent(messageText);
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  const subject = encodeURIComponent(
    `🔔 اعلان بریف جدید پروژه: ${brief.brandName || 'برند جدید'} (کد رهگیری: ${trackingCode})`
  );
  const mailtoUrl = `mailto:${emailAddr}?subject=${subject}&body=${encodedText}`;

  return {
    emailAddr,
    rawPhone,
    cleanPhone,
    messageText,
    whatsappUrl,
    mailtoUrl,
  };
}

async function dispatchInstantBriefNotifications(
  brief: Record<string, any>,
  workspace: Record<string, any> | undefined,
  config: ServerNotificationConfig,
  isTest = false
): Promise<ServerBriefNotificationLog> {
  const { emailAddr, rawPhone, messageText, whatsappUrl, mailtoUrl } = buildNotificationLinksServer(
    brief,
    workspace,
    config
  );

  let emailStatus: ServerBriefNotificationLog['emailStatus'] = 'manual-ready';
  let whatsappStatus: ServerBriefNotificationLog['whatsappStatus'] = 'ready-to-send';

  // 1. Dispatch automated Email notification if enabled
  if (config.enabled && config.autoEmailEnabled && emailAddr) {
    try {
      if (config.emailWebhookUrl?.trim()) {
        const resp = await fetch(config.emailWebhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: emailAddr,
            subject: `اعلان فوری بریف جدید: ${brief.brandName} (${brief.trackingCode})`,
            text: messageText,
            brief,
            isTest,
          }),
        });
        emailStatus = resp.ok ? 'sent' : 'queued';
      } else {
        // Use FormSubmit AJAX relay for zero-config email notification delivery
        const resp = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(emailAddr)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: `🔔 بریف جدید استودیو: ${brief.brandName || 'پروژه جدید'} (${brief.trackingCode || 'CJ'})`,
            _template: 'table',
            کد_رهگیری: brief.trackingCode || '-',
            نام_برند: brief.brandName || '-',
            نام_کارفرما: brief.ownerName || '-',
            اطلاعات_تماس: brief.contactInfo || '-',
            دپارتمان: brief.selectedTrack || '-',
            رده_بازار: brief.marketTier || '-',
            صورت_مسئله: brief.problem || '-',
            متن_کامل_بریف: brief.fullSummaryText || brief.problem || '-',
          }),
        });
        emailStatus = resp.ok ? 'sent' : 'queued';
      }
    } catch {
      emailStatus = 'queued';
    }
  }

  // 2. Dispatch automated WhatsApp webhook if configured
  if (config.enabled && config.autoWhatsappEnabled && config.whatsappWebhookUrl?.trim()) {
    try {
      const whUrl = config.whatsappWebhookUrl.trim();
      const resp = await fetch(whUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: rawPhone,
          message: messageText,
          brief,
          trackingCode: brief.trackingCode,
          isTest,
        }),
      });
      if (resp.ok) {
        whatsappStatus = 'sent';
      }
    } catch {
      whatsappStatus = 'ready-to-send';
    }
  }

  const nowFa = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());

  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    briefId: brief.id || `brief-${Date.now()}`,
    trackingCode: brief.trackingCode || workspace?.trackingCode || 'CJ-NEW',
    brandName: brief.brandName || 'پروژه جدید',
    ownerName: brief.ownerName || 'کارفرما',
    contactInfo: brief.contactInfo || '-',
    selectedTrack: brief.selectedTrack || 'دپارتمان برندینگ',
    marketTier: brief.marketTier || 'استاندارد استودیو',
    problemSummary: (brief.problem || '').slice(0, 180),
    createdAt: nowFa,
    emailTarget: emailAddr,
    whatsappTarget: rawPhone || 'ثبت‌نشده (ارسال با انتخاب مخاطب)',
    emailStatus,
    whatsappStatus,
    readByAdmin: false,
    whatsappUrl,
    mailtoUrl,
    isTest,
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  // 1. GET full shared studio & client portal state + notification logs
  app.get('/api/studio-state', (_req, res) => {
    const db = readServerDb();
    res.json({ ok: true, state: db });
  });

  // 2. POST atomic brief submission from any visitor/client device + instant notification dispatch
  app.post('/api/studio-state/brief', async (req, res) => {
    try {
      const { brief, workspace } = req.body || {};
      const db = readServerDb();

      if (brief && brief.id) {
        const filteredBriefs = (db.archivedBriefs || []).filter((b: any) => b.id !== brief.id);
        db.archivedBriefs = [brief, ...filteredBriefs];
      }

      if (workspace && workspace.id) {
        const existingIdx = (db.clientWorkspaces || []).findIndex((w: any) => w.id === workspace.id);
        if (existingIdx >= 0) {
          const prevWs = db.clientWorkspaces[existingIdx];
          const mergedWsBriefs = mergeById(
            prevWs.archivedBriefs || [],
            workspace.archivedBriefs || (brief ? [brief] : []),
            true
          );
          const mergedWsFeedbacks = mergeById(prevWs.feedbacks || [], workspace.feedbacks || [], true);
          db.clientWorkspaces[existingIdx] = {
            ...prevWs,
            ...workspace,
            archivedBriefs: mergedWsBriefs,
            feedbacks: mergedWsFeedbacks,
          };
        } else {
          db.clientWorkspaces = [workspace, ...(db.clientWorkspaces || [])];
        }
      }

      // Trigger instant notification for Admin (Email + WhatsApp + Live Notification Log)
      let notificationLog: ServerBriefNotificationLog | null = null;
      if (brief) {
        notificationLog = await dispatchInstantBriefNotifications(
          brief,
          workspace,
          db.notificationConfig || DEFAULT_NOTIFICATION_CONFIG,
          false
        );
        db.notificationLogs = [notificationLog, ...(db.notificationLogs || [])].slice(0, 100);
      }

      const saved = writeServerDb(db);
      res.json({ ok: true, state: saved, notification: notificationLog });
    } catch (err) {
      console.error('Error in POST /api/studio-state/brief:', err);
      res.status(500).json({ ok: false, error: 'Failed to save brief on server' });
    }
  });

  // 3. POST update notification config
  app.post('/api/studio-state/notifications/config', (req, res) => {
    try {
      const incomingConfig = req.body || {};
      const db = readServerDb();
      db.notificationConfig = {
        ...(db.notificationConfig || DEFAULT_NOTIFICATION_CONFIG),
        ...incomingConfig,
      };
      if (db.settings && typeof db.settings === 'object') {
        if (incomingConfig.adminEmail) db.settings.contactEmail = incomingConfig.adminEmail;
        if (incomingConfig.adminWhatsapp !== undefined) db.settings.adminWhatsapp = incomingConfig.adminWhatsapp;
      }
      const saved = writeServerDb(db);
      res.json({ ok: true, notificationConfig: saved.notificationConfig, state: saved });
    } catch (err) {
      console.error('Error updating notification config:', err);
      res.status(500).json({ ok: false });
    }
  });

  // 4. POST mark notifications as read by Admin
  app.post('/api/studio-state/notifications/mark-read', (req, res) => {
    try {
      const { id } = req.body || {};
      const db = readServerDb();
      db.notificationLogs = (db.notificationLogs || []).map((log: ServerBriefNotificationLog) => {
        if (!id || log.id === id) {
          return { ...log, readByAdmin: true };
        }
        return log;
      });
      const saved = writeServerDb(db);
      res.json({ ok: true, notificationLogs: saved.notificationLogs });
    } catch (err) {
      console.error('Error marking notifications read:', err);
      res.status(500).json({ ok: false });
    }
  });

  // 5. POST trigger test notification for Admin Email & WhatsApp
  app.post('/api/studio-state/notifications/test', async (req, res) => {
    try {
      const customConfig = req.body?.config || {};
      const db = readServerDb();
      const mergedConfig: ServerNotificationConfig = {
        ...(db.notificationConfig || DEFAULT_NOTIFICATION_CONFIG),
        ...customConfig,
      };
      db.notificationConfig = mergedConfig;

      const testBrief = {
        id: `brief-test-${Date.now()}`,
        trackingCode: `CJ-TEST`,
        brandName: 'پروژه آزمایشی (تست اعلان فوری)',
        ownerName: 'مدیریت استودیو Creativity Juice',
        contactInfo: mergedConfig.adminWhatsapp || mergedConfig.adminEmail,
        selectedTrack: 'دپارتمان برندینگ و مارکتینگ',
        marketTier: 'لوکس و پرمیوم',
        problem: 'این یک پیام آزمایشی جهت اطمینان از صحت عملکرد سیستم اعلان فوری ایمیل و واتساپ هنگام ثبت بریف جدید است.',
        fullSummaryText:
          '=== تست سیستم اعلان فوری ایمیل و واتساپ استودیو ===\nاین اعلان به صورت آزمایشی از پنل مدیریت ارسال شده است.',
      };

      const notificationLog = await dispatchInstantBriefNotifications(
        testBrief,
        undefined,
        mergedConfig,
        true
      );
      db.notificationLogs = [notificationLog, ...(db.notificationLogs || [])].slice(0, 100);
      const saved = writeServerDb(db);

      res.json({ ok: true, notification: notificationLog, state: saved });
    } catch (err) {
      console.error('Error in test notification:', err);
      res.status(500).json({ ok: false });
    }
  });

  // 6. POST sync state (Admin or Client updates)
  app.post('/api/studio-state/sync', (req, res) => {
    try {
      const payload = req.body || {};
      const db = readServerDb();

      if (Array.isArray(payload.archivedBriefs)) {
        if (payload.replaceBriefs) {
          db.archivedBriefs = payload.archivedBriefs;
        } else {
          db.archivedBriefs = mergeById(db.archivedBriefs || [], payload.archivedBriefs, true);
        }
      }

      if (Array.isArray(payload.clientWorkspaces)) {
        if (payload.replaceWorkspaces) {
          db.clientWorkspaces = payload.clientWorkspaces;
        } else {
          db.clientWorkspaces = mergeById(db.clientWorkspaces || [], payload.clientWorkspaces, true);
        }
      }

      if (Array.isArray(payload.projects)) {
        db.projects = payload.projects;
      }
      if (Array.isArray(payload.team)) {
        db.team = payload.team;
      }
      if (Array.isArray(payload.services)) {
        db.services = payload.services;
      }
      if (Array.isArray(payload.manifesto)) {
        db.manifesto = payload.manifesto;
      }
      if (Array.isArray(payload.media)) {
        db.media = payload.media;
      }
      if (payload.settings && typeof payload.settings === 'object') {
        db.settings = { ...(db.settings || {}), ...payload.settings };
        if (payload.settings.contactEmail) {
          db.notificationConfig = {
            ...(db.notificationConfig || DEFAULT_NOTIFICATION_CONFIG),
            adminEmail: payload.settings.contactEmail,
          };
        }
        if (payload.settings.adminWhatsapp !== undefined) {
          db.notificationConfig = {
            ...(db.notificationConfig || DEFAULT_NOTIFICATION_CONFIG),
            adminWhatsapp: payload.settings.adminWhatsapp,
          };
        }
      }
      if (payload.notificationConfig && typeof payload.notificationConfig === 'object') {
        db.notificationConfig = {
          ...(db.notificationConfig || DEFAULT_NOTIFICATION_CONFIG),
          ...payload.notificationConfig,
        };
      }

      const saved = writeServerDb(db);
      res.json({ ok: true, state: saved });
    } catch (err) {
      console.error('Error in POST /api/studio-state/sync:', err);
      res.status(500).json({ ok: false, error: 'Failed to sync studio state' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Creativity Juice Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
