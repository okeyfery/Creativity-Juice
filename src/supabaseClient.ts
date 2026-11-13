/**
 * Creativity Juice — Supabase & PostgreSQL Database Client
 * Connects the application to:
 * 1. Supabase (@supabase/supabase-js) using VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
 * 2. Cloud SQL PostgreSQL (/api/db/projects & /api/db/portfolios)
 * Tables:
 * - 'projects' (columns: id, client_name, contact_info, project_title, description, budget)
 * - 'portfolios' (columns: id, title, category, image_url, project_link, description)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { smartCollectionFetch } from './briefSyncService';
import { getInMemoryAuthToken } from './context/AuthContext';

const env = (import.meta as any).env || {};
export const SUPABASE_URL: string =
  env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY: string =
  env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('your-project-id') &&
    SUPABASE_URL.startsWith('http')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface SupabaseProjectRow {
  id?: number | string;
  client_name: string;
  contact_info: string;
  project_title: string;
  description: string;
  budget: string;
  tracking_code?: string | null;
  status?: string | null;
  is_read?: boolean | null;
  full_summary_text?: string | null;
  created_at?: string | null;
}

export interface SupabasePortfolioRow {
  id?: number | string;
  title: string;
  category: string;
  image_url: string;
  project_link: string;
  description: string;
  title_en?: string | null;
  client?: string | null;
  year?: string | null;
  extra_json?: string | null;
  created_at?: string | null;
}

function getAuthHeaders(): Record<string, string> {
  const token = getInMemoryAuthToken();
  return token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : {
        'Content-Type': 'application/json',
      };
}

// ============================================================================
// 1. CLIENT PROJECTS TABLE ('projects')
// Columns: client_name, contact_info, project_title, description, budget
// ============================================================================

export async function fetchProjectsFromDatabase(): Promise<SupabaseProjectRow[]> {
  let supabaseRows: SupabaseProjectRow[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false });
      if (!error && Array.isArray(data)) {
        supabaseRows = data as SupabaseProjectRow[];
      }
    } catch (err) {
      console.warn('Supabase projects select fallback:', err);
    }
  }

  try {
    const res = await smartCollectionFetch('/api/db/projects', {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (res.ok && Array.isArray(res.data?.projects)) {
      const pgRows = res.data.projects as SupabaseProjectRow[];
      if (supabaseRows.length === 0) return pgRows;
      // Merge unique rows if both Supabase and PostgreSQL backend are active
      const map = new Map<string, SupabaseProjectRow>();
      [...supabaseRows, ...pgRows].forEach((r) => {
        const key = `${r.client_name}::${r.project_title}::${r.id || ''}`;
        if (!map.has(key)) map.set(key, r);
      });
      return Array.from(map.values());
    }
  } catch (err) {
    console.warn('PostgreSQL /api/db/projects fetch error:', err);
  }

  return supabaseRows;
}

export async function insertProjectToDatabase(
  row: Omit<SupabaseProjectRow, 'id' | 'created_at'>
): Promise<SupabaseProjectRow | null> {
  const cleanPayload = {
    client_name: row.client_name || 'کارفرما',
    contact_info: row.contact_info || '-',
    project_title: row.project_title || 'پروژه جدید',
    description: row.description || '-',
    budget: row.budget || 'استاندارد استودیو',
  };

  let insertedRow: SupabaseProjectRow | null = null;

  // 1. Insert into Supabase 'projects' table (strictly using the 5 required columns)
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([cleanPayload])
        .select()
        .single();
      if (!error && data) {
        insertedRow = data as SupabaseProjectRow;
      }
    } catch (err) {
      console.warn('Supabase insert into projects error:', err);
    }
  }

  // 2. Insert into Cloud SQL PostgreSQL 'projects' table
  try {
    const res = await smartCollectionFetch('/api/db/projects', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...cleanPayload,
        tracking_code: row.tracking_code,
        status: row.status || 'new',
        is_read: row.is_read ?? false,
        full_summary_text: row.full_summary_text,
      }),
    });
    if (res.ok && res.data?.project) {
      insertedRow = res.data.project as SupabaseProjectRow;
    }
  } catch (err) {
    console.warn('PostgreSQL insert into projects error:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('CJ_DATABASE_PROJECTS_CHANGED'));
  }

  return insertedRow;
}

export async function deleteProjectFromDatabase(id: number | string): Promise<boolean> {
  let deleted = false;

  if (supabase) {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (!error) deleted = true;
    } catch (err) {
      console.warn('Supabase delete project error:', err);
    }
  }

  try {
    const res = await smartCollectionFetch(`/api/db/projects/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) deleted = true;
  } catch (err) {
    console.warn('PostgreSQL delete project error:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('CJ_DATABASE_PROJECTS_CHANGED'));
  }

  return deleted;
}

// ============================================================================
// 2. PORTFOLIOS TABLE ('portfolios')
// Columns: title, category, image_url, project_link, description
// ============================================================================

export async function fetchPortfoliosFromDatabase(): Promise<SupabasePortfolioRow[]> {
  let supabaseRows: SupabasePortfolioRow[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .order('id', { ascending: false });
      if (!error && Array.isArray(data)) {
        supabaseRows = data as SupabasePortfolioRow[];
      }
    } catch (err) {
      console.warn('Supabase portfolios select fallback:', err);
    }
  }

  try {
    const res = await smartCollectionFetch('/api/db/portfolios', {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (res.ok && Array.isArray(res.data?.portfolios)) {
      const pgRows = res.data.portfolios as SupabasePortfolioRow[];
      if (supabaseRows.length === 0) return pgRows;
      const map = new Map<string, SupabasePortfolioRow>();
      [...supabaseRows, ...pgRows].forEach((r) => {
        const key = `${r.title}::${r.id || ''}`;
        if (!map.has(key)) map.set(key, r);
      });
      return Array.from(map.values());
    }
  } catch (err) {
    console.warn('PostgreSQL /api/db/portfolios fetch error:', err);
  }

  return supabaseRows;
}

export async function insertPortfolioToDatabase(
  row: Omit<SupabasePortfolioRow, 'id' | 'created_at'>
): Promise<SupabasePortfolioRow | null> {
  const cleanPayload = {
    title: row.title,
    category: row.category || 'branding',
    image_url:
      row.image_url ||
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    project_link: row.project_link || '#',
    description: row.description || '',
  };

  let insertedRow: SupabasePortfolioRow | null = null;

  // 1. Insert into Supabase 'portfolios' table (strictly using the 5 required columns)
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .insert([cleanPayload])
        .select()
        .single();
      if (!error && data) {
        insertedRow = data as SupabasePortfolioRow;
      }
    } catch (err) {
      console.warn('Supabase insert into portfolios error:', err);
    }
  }

  // 2. Insert into Cloud SQL PostgreSQL 'portfolios' table
  try {
    const res = await smartCollectionFetch('/api/db/portfolios', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...cleanPayload,
        title_en: row.title_en,
        client: row.client,
        year: row.year,
        extra_json: row.extra_json,
      }),
    });
    if (res.ok && res.data?.portfolio) {
      insertedRow = res.data.portfolio as SupabasePortfolioRow;
    }
  } catch (err) {
    console.warn('PostgreSQL insert into portfolios error:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('CJ_DATABASE_PORTFOLIOS_CHANGED'));
    window.dispatchEvent(new CustomEvent('CJ_STUDIO_DATA_CHANGED', { detail: { type: 'projects' } }));
  }

  return insertedRow;
}

export async function deletePortfolioFromDatabase(id: number | string): Promise<boolean> {
  let deleted = false;

  if (supabase) {
    try {
      const { error } = await supabase.from('portfolios').delete().eq('id', id);
      if (!error) deleted = true;
    } catch (err) {
      console.warn('Supabase delete portfolio error:', err);
    }
  }

  try {
    const res = await smartCollectionFetch(`/api/db/portfolios/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) deleted = true;
  } catch (err) {
    console.warn('PostgreSQL delete portfolio error:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('CJ_DATABASE_PORTFOLIOS_CHANGED'));
    window.dispatchEvent(new CustomEvent('CJ_STUDIO_DATA_CHANGED', { detail: { type: 'projects' } }));
  }

  return deleted;
}
