import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, 'studio-server-db.json');

function readServerDb() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          archivedBriefs: Array.isArray(parsed.archivedBriefs) ? parsed.archivedBriefs : [],
          clientWorkspaces: Array.isArray(parsed.clientWorkspaces) ? parsed.clientWorkspaces : [],
          projects: Array.isArray(parsed.projects) ? parsed.projects : null,
          team: Array.isArray(parsed.team) ? parsed.team : null,
          services: Array.isArray(parsed.services) ? parsed.services : null,
          manifesto: Array.isArray(parsed.manifesto) ? parsed.manifesto : null,
          media: Array.isArray(parsed.media) ? parsed.media : null,
          settings: parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : null,
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
    updatedAt: new Date().toISOString(),
  };
}

function writeServerDb(data: Record<string, any>) {
  try {
    const nextData = {
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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  // 1. GET full shared studio & client portal state
  app.get('/api/studio-state', (_req, res) => {
    const db = readServerDb();
    res.json({ ok: true, state: db });
  });

  // 2. POST atomic brief submission from any visitor/client device
  app.post('/api/studio-state/brief', (req, res) => {
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
          const mergedWsBriefs = mergeById(prevWs.archivedBriefs || [], workspace.archivedBriefs || (brief ? [brief] : []), true);
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

      const saved = writeServerDb(db);
      res.json({ ok: true, state: saved });
    } catch (err) {
      console.error('Error in POST /api/studio-state/brief:', err);
      res.status(500).json({ ok: false, error: 'Failed to save brief on server' });
    }
  });

  // 3. POST sync state (Admin or Client updates)
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
