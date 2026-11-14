import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  listDbProjects,
  insertDbProject,
  updateDbProject,
  deleteDbProject,
  listDbPortfolios,
  insertDbPortfolio,
  deleteDbPortfolio,
} from './src/db/queries.ts';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, 'studio-server-db.json');

const ENV_SUPABASE_URL = (
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).trim();

const ENV_SUPABASE_ANON_KEY = (
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ''
).trim();

const isServerSupabaseConfigured = Boolean(
  ENV_SUPABASE_URL &&
    ENV_SUPABASE_ANON_KEY &&
    !ENV_SUPABASE_URL.includes('your-project-id') &&
    !ENV_SUPABASE_ANON_KEY.includes('your-anon-key') &&
    ENV_SUPABASE_URL.startsWith('http')
);

const serverSupabase: SupabaseClient | null = isServerSupabaseConfigured
  ? createClient(ENV_SUPABASE_URL, ENV_SUPABASE_ANON_KEY)
  : null;

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

function extractBriefTimestamp(item: any): number {
  if (!item) return 0;
  if (typeof item.createdAtMs === 'number') return item.createdAtMs;
  const idStr = String(item.id || '');
  if (idStr.startsWith('brief-init-')) return 1000;
  const match = idStr.match(/(\d{10,15})/);
  if (match) return Number(match[1]);
  return 5000;
}

function sortBriefsNewestFirst(list: any[] = []): any[] {
  return [...list].sort((a, b) => {
    const aIsSeed = String(a?.id || '').startsWith('brief-init-');
    const bIsSeed = String(b?.id || '').startsWith('brief-init-');
    if (aIsSeed !== bIsSeed) return aIsSeed ? 1 : -1;
    return extractBriefTimestamp(b) - extractBriefTimestamp(a);
  });
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
          const mergedBriefs = sortBriefsNewestFirst(mergeById(prev.archivedBriefs, item.archivedBriefs, true));
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
          map.set(item.id, prev ? { ...prev, ...item } : item);
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

  // Enable CORS so Vercel deployments (*.vercel.app) and all deployed versions share the same 'briefs' collection
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.use(express.json({ limit: '25mb' }));

  // Active Server-Sent Events (SSE) clients for real-time Admin Panel updates
  const sseClients = new Set<express.Response>();
  let serverRevision = Date.now();

  function broadcastRealtimeEvent(eventType: string, payload: Record<string, any>) {
    serverRevision = Date.now();
    const message = JSON.stringify({
      type: eventType,
      collection: 'briefs',
      revision: serverRevision,
      timestamp: new Date().toISOString(),
      ...payload,
    });
    sseClients.forEach((clientRes) => {
      try {
        clientRes.write(`data: ${message}\n\n`);
      } catch {
        sseClients.delete(clientRes);
      }
    });
  }

  function pgRowToBriefSubmission(row: any) {
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

    const tracking = row.tracking_code || `CJ-DB-${row.id}`;
    return {
      id: `db-proj-${row.id}`,
      dbId: row.id,
      trackingCode: tracking,
      clientId: `client-db-${row.id}`,
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
        `نام کارفرما: ${row.client_name}\nاطلاعات تماس: ${row.contact_info}\nعنوان پروژه: ${row.project_title}\nبودجه / مقیاس: ${row.budget}\nتوضیحات پروژه:\n${row.description}`,
      status: (row.status as 'new' | 'reviewed' | 'in-production') || 'new',
      isRead: Boolean(row.is_read),
      createdAtMs,
    };
  }

  app.get('/api/supabase-config', (_req, res) => {
    res.json({
      ok: true,
      supabaseUrl: isServerSupabaseConfigured ? ENV_SUPABASE_URL : '',
      supabaseAnonKey: isServerSupabaseConfigured ? ENV_SUPABASE_ANON_KEY : '',
      isSupabaseConfigured: isServerSupabaseConfigured,
      isPostgresConnected: true,
    });
  });

  async function getAuthoritativeBriefsFromPostgres() {
    try {
      let rows = await listDbProjects();
      if (serverSupabase) {
        try {
          const { data } = await serverSupabase
            .from('projects')
            .select('*')
            .order('id', { ascending: false });
          if (Array.isArray(data) && data.length > 0) {
            const existingTitles = new Set(rows.map((r: any) => `${r.client_name}::${r.project_title}`));
            for (const sbRow of data) {
              const key = `${sbRow.client_name}::${sbRow.project_title}`;
              if (!existingTitles.has(key)) {
                rows.unshift(sbRow as any);
                existingTitles.add(key);
              }
            }
          }
        } catch {
          // Ignore Supabase fallback error
        }
      }
      return rows.map(pgRowToBriefSubmission);
    } catch (err) {
      console.error('Fallback to local JSON for briefs:', err);
      const db = readServerDb();
      return sortBriefsNewestFirst(db.archivedBriefs || []);
    }
  }

  let isPortfoliosSeeded = false;
  async function getAuthoritativePortfoliosFromPostgres() {
    let rows = await listDbPortfolios();
    if (rows.length === 0 && !isPortfoliosSeeded) {
      isPortfoliosSeeded = true;
      const db = readServerDb();
      const seedItems = Array.isArray(db.projects) ? db.projects.slice(0, 12) : [];
      for (const item of seedItems) {
        try {
          await insertDbPortfolio({
            title: item.title || 'نمونه‌کار استودیو',
            category: item.categoryLabel || item.category || 'branding',
            image_url:
              item.coverImage ||
              item.image_url ||
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
            project_link: item.project_link || item.highResImage || item.coverImage || '#',
            description:
              item.description ||
              item.challenge ||
              item.subtitle ||
              'پروژه منتخب استودیو Creativity Juice',
            title_en: item.titleEn || item.title,
            client: item.client || item.title,
            year: item.year || '۱۴۰۴',
            extra_json: JSON.stringify(item),
          });
        } catch {
          // ignore individual seed error
        }
      }
      rows = await listDbPortfolios();
    }
    if (serverSupabase) {
      try {
        const { data } = await serverSupabase
          .from('portfolios')
          .select('*')
          .order('id', { ascending: false });
        if (Array.isArray(data) && data.length > 0) {
          const existingTitles = new Set(rows.map((r: any) => r.title));
          for (const sbRow of data) {
            if (sbRow.title && !existingTitles.has(sbRow.title)) {
              rows.unshift(sbRow as any);
              existingTitles.add(sbRow.title);
            }
          }
        }
      } catch {
        // Ignore Supabase fallback error
      }
    }
    return rows;
  }

  // 0. GET Real-Time Stream (SSE) for instant Admin Panel brief synchronization (/api/studio-state/stream & /api/briefs/stream)
  const handleRealtimeStream = async (req: express.Request, res: express.Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const db = readServerDb();
    const pgBriefs = await getAuthoritativeBriefsFromPostgres();
    const initPayload = JSON.stringify({
      type: 'stream:init',
      collection: 'briefs',
      revision: serverRevision,
      timestamp: new Date().toISOString(),
      docs: pgBriefs,
      archivedBriefs: pgBriefs,
      clientWorkspaces: db.clientWorkspaces || [],
      notificationLogs: db.notificationLogs || [],
    });
    res.write(`data: ${initPayload}\n\n`);

    sseClients.add(res);

    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`);
      } catch {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  };

  app.get('/api/studio-state/stream', handleRealtimeStream);
  app.get('/api/briefs/stream', handleRealtimeStream);

  // Dedicated 'briefs' Collection Endpoints backed by PostgreSQL & Supabase `projects` table
  app.get('/api/briefs', async (_req, res) => {
    const docs = await getAuthoritativeBriefsFromPostgres();
    res.json({
      ok: true,
      collection: 'briefs',
      revision: serverRevision,
      count: docs.length,
      docs,
    });
  });

  app.post('/api/briefs', async (req, res) => {
    try {
      const incoming = req.body?.brief || req.body || {};
      const workspace = req.body?.workspace;
      const db = readServerDb();

      const clientName = incoming.ownerName || incoming.client_name || incoming.brandName || 'کارفرما';
      const contactInfo = incoming.contactInfo || incoming.contact_info || '-';
      const projectTitle = incoming.brandName || incoming.project_title || 'پروژه جدید';
      const description = incoming.problem || incoming.description || '-';
      const budget = incoming.productionScale
        ? `${incoming.marketTier || ''} • ${incoming.productionScale}`.trim()
        : incoming.marketTier || incoming.budget || 'استاندارد استودیو';

      if (serverSupabase) {
        try {
          await serverSupabase.from('projects').insert([
            {
              client_name: clientName,
              contact_info: contactInfo,
              project_title: projectTitle,
              description,
              budget,
            },
          ]);
        } catch {
          // ignore serverSupabase error
        }
      }

      const insertedPg = await insertDbProject({
        client_name: clientName,
        contact_info: contactInfo,
        project_title: projectTitle,
        description,
        budget,
        tracking_code:
          incoming.trackingCode ||
          incoming.tracking_code ||
          `CJ-${Math.floor(1000 + Math.random() * 9000)}`,
        status: incoming.status || 'new',
        is_read: incoming.isRead ?? false,
        full_summary_text: incoming.fullSummaryText || incoming.full_summary_text || incoming.problem || '-',
      });

      const enrichedBrief = pgRowToBriefSubmission(insertedPg);
      const pgBriefs = await getAuthoritativeBriefsFromPostgres();
      db.archivedBriefs = pgBriefs;

      if (workspace && workspace.id) {
        const existingIdx = (db.clientWorkspaces || []).findIndex((w: any) => w.id === workspace.id);
        if (existingIdx >= 0) {
          const prevWs = db.clientWorkspaces[existingIdx];
          db.clientWorkspaces[existingIdx] = {
            ...prevWs,
            ...workspace,
            archivedBriefs: sortBriefsNewestFirst(
              mergeById(prevWs.archivedBriefs || [], [enrichedBrief], true)
            ),
          };
        } else {
          db.clientWorkspaces = [workspace, ...(db.clientWorkspaces || [])];
        }
      }

      const notificationLog = await dispatchInstantBriefNotifications(
        enrichedBrief,
        workspace,
        db.notificationConfig || DEFAULT_NOTIFICATION_CONFIG,
        false
      );
      db.notificationLogs = [notificationLog, ...(db.notificationLogs || [])].slice(0, 100);

      const saved = writeServerDb(db);
      broadcastRealtimeEvent('brief:created', {
        doc: enrichedBrief,
        brief: enrichedBrief,
        workspace,
        notification: notificationLog,
        docs: pgBriefs,
        archivedBriefs: pgBriefs,
        clientWorkspaces: saved.clientWorkspaces,
        notificationLogs: saved.notificationLogs,
      });

      res.json({
        ok: true,
        collection: 'briefs',
        revision: serverRevision,
        doc: enrichedBrief,
        docs: pgBriefs,
        notification: notificationLog,
      });
    } catch (err) {
      console.error('Error in POST /api/briefs:', err);
      res.status(500).json({ ok: false, error: 'Failed to write to briefs collection' });
    }
  });

  app.patch('/api/briefs/:id', async (req, res) => {
    try {
      const targetId = req.params.id;
      const updates = req.body || {};
      await updateDbProject(targetId, {
        ...(updates.status !== undefined ? { status: updates.status } : {}),
        ...(updates.isRead !== undefined ? { is_read: Boolean(updates.isRead) } : {}),
        ...(updates.is_read !== undefined ? { is_read: Boolean(updates.is_read) } : {}),
      });

      const pgBriefs = await getAuthoritativeBriefsFromPostgres();
      const updatedDoc = pgBriefs.find(
        (b: any) => b.id === targetId || b.trackingCode === targetId || String(b.dbId) === targetId
      );

      const db = readServerDb();
      db.archivedBriefs = pgBriefs;
      const saved = writeServerDb(db);

      broadcastRealtimeEvent('brief:updated', {
        doc: updatedDoc,
        docs: pgBriefs,
        archivedBriefs: pgBriefs,
        clientWorkspaces: saved.clientWorkspaces,
      });

      res.json({
        ok: true,
        collection: 'briefs',
        revision: serverRevision,
        doc: updatedDoc,
        docs: pgBriefs,
      });
    } catch (err) {
      console.error('Error in PATCH /api/briefs/:id:', err);
      res.status(500).json({ ok: false });
    }
  });

  // ============================================================================
  // SQL RELATIONAL DATABASE ENDPOINTS (Cloud SQL PostgreSQL + Supabase Schema)
  // Tables:
  //   1. 'projects' (client_name, contact_info, project_title, description, budget)
  //   2. 'portfolios' (title, category, image_url, project_link, description)
  // ============================================================================

  app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
    res.json({ ok: true, user: req.user });
  });

  app.get('/api/db/projects', async (_req, res) => {
    try {
      let rows = await listDbProjects();
      if (serverSupabase) {
        try {
          const { data } = await serverSupabase
            .from('projects')
            .select('*')
            .order('id', { ascending: false });
          if (Array.isArray(data) && data.length > 0) {
            const existingTitles = new Set(rows.map((r: any) => `${r.client_name}::${r.project_title}`));
            for (const sbRow of data) {
              const key = `${sbRow.client_name}::${sbRow.project_title}`;
              if (!existingTitles.has(key)) {
                rows.unshift(sbRow as any);
                existingTitles.add(key);
              }
            }
          }
        } catch {
          // ignore
        }
      }
      res.json({ ok: true, projects: rows });
    } catch (error: any) {
      console.error('Error in GET /api/db/projects:', error);
      res.status(500).json({ ok: false, error: error.message || 'Failed to fetch projects' });
    }
  });

  app.post('/api/db/projects', async (req, res) => {
    try {
      const body = req.body || {};
      const client_name = body.client_name || body.ownerName || 'کارفرما';
      const contact_info = body.contact_info || body.contactInfo || '-';
      const project_title = body.project_title || body.brandName || 'پروژه جدید';
      const description = body.description || body.problem || '-';
      const budget = body.budget || body.marketTier || 'استاندارد استودیو';

      if (serverSupabase) {
        try {
          await serverSupabase.from('projects').insert([
            {
              client_name,
              contact_info,
              project_title,
              description,
              budget,
            },
          ]);
        } catch {
          // ignore
        }
      }

      const inserted = await insertDbProject({
        client_name,
        contact_info,
        project_title,
        description,
        budget,
        tracking_code: body.tracking_code || body.trackingCode || `CJ-${Math.floor(1000 + Math.random() * 9000)}`,
        status: body.status || 'new',
        is_read: body.is_read ?? false,
        full_summary_text: body.full_summary_text || body.fullSummaryText || body.description || '-',
      });

      const pgBriefs = await getAuthoritativeBriefsFromPostgres();
      broadcastRealtimeEvent('db:project:created', {
        project: inserted,
        docs: pgBriefs,
        archivedBriefs: pgBriefs,
      });
      res.json({ ok: true, project: inserted, docs: pgBriefs });
    } catch (error: any) {
      console.error('Error in POST /api/db/projects:', error);
      res.status(500).json({ ok: false, error: error.message || 'Failed to insert project' });
    }
  });

  app.patch('/api/db/projects/:id', async (req, res) => {
    try {
      const updated = await updateDbProject(req.params.id, req.body || {});
      const pgBriefs = await getAuthoritativeBriefsFromPostgres();
      broadcastRealtimeEvent('db:project:updated', {
        project: updated,
        docs: pgBriefs,
        archivedBriefs: pgBriefs,
      });
      res.json({ ok: true, project: updated, docs: pgBriefs });
    } catch (error: any) {
      console.error('Error in PATCH /api/db/projects/:id:', error);
      res.status(500).json({ ok: false, error: error.message || 'Failed to update project' });
    }
  });

  app.delete('/api/db/projects/:id', async (req, res) => {
    try {
      if (serverSupabase) {
        try {
          await serverSupabase.from('projects').delete().eq('id', req.params.id);
        } catch {
          // ignore
        }
      }
      await deleteDbProject(req.params.id);
      const pgBriefs = await getAuthoritativeBriefsFromPostgres();
      const db = readServerDb();
      db.archivedBriefs = pgBriefs;
      writeServerDb(db);
      broadcastRealtimeEvent('db:project:deleted', {
        id: req.params.id,
        docs: pgBriefs,
        archivedBriefs: pgBriefs,
      });
      res.json({ ok: true, deletedId: req.params.id, docs: pgBriefs });
    } catch (error: any) {
      console.error('Error in DELETE /api/db/projects/:id:', error);
      res.status(500).json({ ok: false, error: error.message || 'Failed to delete project' });
    }
  });

  app.get('/api/db/portfolios', async (_req, res) => {
    try {
      const rows = await getAuthoritativePortfoliosFromPostgres();
      res.json({ ok: true, portfolios: rows });
    } catch (error: any) {
      console.error('Error in GET /api/db/portfolios:', error);
      res.status(500).json({ ok: false, error: error.message || 'Failed to fetch portfolios' });
    }
  });

  app.post('/api/db/portfolios', async (req, res) => {
    try {
      const body = req.body || {};
      const title = body.title || 'نمونه‌کار جدید';
      const category = body.category || 'branding';
      const image_url =
        body.image_url ||
        body.coverImage ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85';
      const project_link = body.project_link || '#';
      const description = body.description || '';

      if (serverSupabase) {
        try {
          await serverSupabase.from('portfolios').insert([
            {
              title,
              category,
              image_url,
              project_link,
              description,
            },
          ]);
        } catch {
          // ignore
        }
      }

      const inserted = await insertDbPortfolio({
        title,
        category,
        image_url,
        project_link,
        description,
        title_en: body.title_en || body.titleEn || body.title,
        client: body.client || body.title,
        year: body.year || '۱۴۰۵',
        extra_json: body.extra_json || null,
      });

      broadcastRealtimeEvent('db:portfolio:created', { portfolio: inserted });
      res.json({ ok: true, portfolio: inserted });
    } catch (error: any) {
      console.error('Error in POST /api/db/portfolios:', error);
      res.status(500).json({ ok: false, error: error.message || 'Failed to insert portfolio' });
    }
  });

  app.delete('/api/db/portfolios/:id', async (req, res) => {
    try {
      if (serverSupabase) {
        try {
          await serverSupabase.from('portfolios').delete().eq('id', req.params.id);
        } catch {
          // ignore
        }
      }
      await deleteDbPortfolio(req.params.id);
      broadcastRealtimeEvent('db:portfolio:deleted', { id: req.params.id });
      res.json({ ok: true, deletedId: req.params.id });
    } catch (error: any) {
      console.error('Error in DELETE /api/db/portfolios/:id:', error);
      res.status(500).json({ ok: false, error: error.message || 'Failed to delete portfolio' });
    }
  });

  // 1. GET full shared studio & client portal state + notification logs (backed by PostgreSQL)
  app.get('/api/studio-state', async (_req, res) => {
    const db = readServerDb();
    const pgBriefs = await getAuthoritativeBriefsFromPostgres();
    db.archivedBriefs = pgBriefs;
    res.json({ ok: true, revision: serverRevision, state: db });
  });

  // 2. POST atomic brief submission from any visitor/client device + instant notification dispatch
  app.post('/api/studio-state/brief', async (req, res) => {
    try {
      const { brief, workspace } = req.body || {};
      const db = readServerDb();

      let enrichedBrief = brief;
      if (brief) {
        const insertedPg = await insertDbProject({
          client_name: brief.ownerName || brief.client_name || brief.brandName || 'کارفرما',
          contact_info: brief.contactInfo || brief.contact_info || '-',
          project_title: brief.brandName || brief.project_title || 'پروژه جدید',
          description: brief.problem || brief.description || '-',
          budget:
            brief.productionScale
              ? `${brief.marketTier || ''} • ${brief.productionScale}`.trim()
              : brief.marketTier || brief.budget || 'استاندارد استودیو',
          tracking_code:
            brief.trackingCode ||
            brief.tracking_code ||
            `CJ-${Math.floor(1000 + Math.random() * 9000)}`,
          status: brief.status || 'new',
          is_read: brief.isRead ?? false,
          full_summary_text: brief.fullSummaryText || brief.full_summary_text || brief.problem || '-',
        });
        enrichedBrief = pgRowToBriefSubmission(insertedPg);
      }

      const pgBriefs = await getAuthoritativeBriefsFromPostgres();
      db.archivedBriefs = pgBriefs;

      if (workspace && workspace.id) {
        const existingIdx = (db.clientWorkspaces || []).findIndex((w: any) => w.id === workspace.id);
        if (existingIdx >= 0) {
          const prevWs = db.clientWorkspaces[existingIdx];
          const mergedWsBriefs = sortBriefsNewestFirst(
            mergeById(
              prevWs.archivedBriefs || [],
              workspace.archivedBriefs || (enrichedBrief ? [enrichedBrief] : []),
              true
            )
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

      let notificationLog: ServerBriefNotificationLog | null = null;
      if (enrichedBrief) {
        notificationLog = await dispatchInstantBriefNotifications(
          enrichedBrief,
          workspace,
          db.notificationConfig || DEFAULT_NOTIFICATION_CONFIG,
          false
        );
        db.notificationLogs = [notificationLog, ...(db.notificationLogs || [])].slice(0, 100);
      }

      const saved = writeServerDb(db);

      broadcastRealtimeEvent('brief:created', {
        brief: enrichedBrief,
        workspace,
        notification: notificationLog,
        docs: pgBriefs,
        archivedBriefs: pgBriefs,
        clientWorkspaces: saved.clientWorkspaces,
        notificationLogs: saved.notificationLogs,
      });

      res.json({ ok: true, revision: serverRevision, state: saved, notification: notificationLog });
    } catch (err) {
      console.error('Error in POST /api/studio-state/brief:', err);
      res.status(500).json({ ok: false, error: 'Failed to save brief on server' });
    }
  });

  // 2b. POST bidirectional client-to-server brief reconciliation (backed by PostgreSQL)
  app.post('/api/studio-state/briefs/reconcile', async (req, res) => {
    try {
      const { clientBriefs = [], clientWorkspaces = [] } = req.body || {};
      const db = readServerDb();
      const currentPgBriefs = await getAuthoritativeBriefsFromPostgres();
      const existingCodes = new Set(currentPgBriefs.map((b: any) => b?.trackingCode).filter(Boolean));

      const newlyDiscoveredBriefs: any[] = [];
      if (Array.isArray(clientBriefs)) {
        for (const cb of clientBriefs) {
          if (
            cb &&
            cb.trackingCode &&
            !existingCodes.has(cb.trackingCode) &&
            !String(cb.id || '').startsWith('brief-init-') &&
            !String(cb.id || '').startsWith('db-proj-')
          ) {
            const insertedPg = await insertDbProject({
              client_name: cb.ownerName || cb.brandName || 'کارفرما',
              contact_info: cb.contactInfo || '-',
              project_title: cb.brandName || 'پروژه جدید',
              description: cb.problem || '-',
              budget: cb.marketTier || 'استاندارد استودیو',
              tracking_code: cb.trackingCode,
              status: cb.status || 'new',
              is_read: cb.isRead ?? false,
              full_summary_text: cb.fullSummaryText || cb.problem || '-',
            });
            newlyDiscoveredBriefs.push(pgRowToBriefSubmission(insertedPg));
          }
        }
      }

      const pgBriefs = await getAuthoritativeBriefsFromPostgres();
      db.archivedBriefs = pgBriefs;

      if (Array.isArray(clientWorkspaces) && clientWorkspaces.length > 0) {
        db.clientWorkspaces = mergeById(db.clientWorkspaces || [], clientWorkspaces, true);
      }

      const newNotifications: ServerBriefNotificationLog[] = [];
      for (const newBrief of newlyDiscoveredBriefs) {
        const notif = await dispatchInstantBriefNotifications(
          newBrief,
          undefined,
          db.notificationConfig || DEFAULT_NOTIFICATION_CONFIG,
          false
        );
        newNotifications.push(notif);
      }

      if (newNotifications.length > 0) {
        db.notificationLogs = [...newNotifications, ...(db.notificationLogs || [])].slice(0, 100);
      }

      const saved = writeServerDb(db);

      res.json({
        ok: true,
        revision: serverRevision,
        syncedCount: pgBriefs.length,
        newlyAddedCount: newlyDiscoveredBriefs.length,
        archivedBriefs: pgBriefs,
        clientWorkspaces: saved.clientWorkspaces,
        notificationLogs: saved.notificationLogs,
      });
    } catch (err) {
      console.error('Error in POST /api/studio-state/briefs/reconcile:', err);
      res.status(500).json({ ok: false, error: 'Failed to reconcile briefs' });
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
          db.archivedBriefs = sortBriefsNewestFirst(payload.archivedBriefs);
        } else {
          db.archivedBriefs = sortBriefsNewestFirst(
            mergeById(db.archivedBriefs || [], payload.archivedBriefs, true)
          );
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
      broadcastRealtimeEvent('state:synced', {
        archivedBriefs: saved.archivedBriefs,
        clientWorkspaces: saved.clientWorkspaces,
        notificationLogs: saved.notificationLogs,
      });
      res.json({ ok: true, revision: serverRevision, state: saved });
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
