import { desc, eq, or } from 'drizzle-orm';
import { db } from './index.ts';
import { projects, portfolios } from './schema.ts';

export interface DbProjectInsert {
  client_name: string;
  contact_info: string;
  project_title: string;
  description: string;
  budget: string;
  tracking_code?: string;
  status?: string;
  is_read?: boolean;
  full_summary_text?: string;
  user_uid?: string;
}

export interface DbPortfolioInsert {
  title: string;
  category: string;
  image_url: string;
  project_link: string;
  description: string;
  title_en?: string;
  client?: string;
  year?: string;
  extra_json?: string;
}

export async function listDbProjects() {
  try {
    return await db.select().from(projects).orderBy(desc(projects.id));
  } catch (error) {
    console.error('Failed to query projects table:', error);
    throw new Error('Failed to fetch client projects from database.', { cause: error });
  }
}

export async function insertDbProject(input: DbProjectInsert) {
  try {
    // Prevent duplicate rows if the same tracking_code was already inserted within the same submission flow
    if (input.tracking_code) {
      const existing = await db
        .select()
        .from(projects)
        .where(eq(projects.tracking_code, input.tracking_code));
      if (existing.length > 0) {
        return existing[0];
      }
    }

    const rows = await db
      .insert(projects)
      .values({
        client_name: input.client_name,
        contact_info: input.contact_info,
        project_title: input.project_title,
        description: input.description,
        budget: input.budget,
        tracking_code: input.tracking_code || null,
        status: input.status || 'new',
        is_read: input.is_read ?? false,
        full_summary_text: input.full_summary_text || null,
        user_uid: input.user_uid || null,
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to insert into projects table:', error);
    throw new Error('Failed to save project in database.', { cause: error });
  }
}

export async function updateDbProject(
  idOrCode: number | string,
  updates: Partial<{ status: string; is_read: boolean; description: string }>
) {
  try {
    const cleanStr = String(idOrCode).replace(/^db-proj-/, '');
    const numericId = Number(cleanStr);
    const condition = Number.isFinite(numericId)
      ? or(eq(projects.id, numericId), eq(projects.tracking_code, String(idOrCode)))
      : eq(projects.tracking_code, String(idOrCode));

    const rows = await db
      .update(projects)
      .set(updates)
      .where(condition)
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to update project in database:', error);
    throw new Error('Failed to update project in database.', { cause: error });
  }
}

export async function deleteDbProject(idOrCode: number | string) {
  try {
    const cleanStr = String(idOrCode).replace(/^db-proj-/, '');
    const numericId = Number(cleanStr);
    const condition = Number.isFinite(numericId)
      ? or(eq(projects.id, numericId), eq(projects.tracking_code, String(idOrCode)))
      : or(eq(projects.tracking_code, String(idOrCode)), eq(projects.project_title, String(idOrCode)));

    const rows = await db
      .delete(projects)
      .where(condition)
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to delete project from database:', error);
    throw new Error('Failed to delete project from database.', { cause: error });
  }
}

export async function listDbPortfolios() {
  try {
    return await db.select().from(portfolios).orderBy(desc(portfolios.id));
  } catch (error) {
    console.error('Failed to query portfolios table:', error);
    throw new Error('Failed to fetch portfolios from database.', { cause: error });
  }
}

export async function insertDbPortfolio(input: DbPortfolioInsert) {
  try {
    const rows = await db
      .insert(portfolios)
      .values({
        title: input.title,
        category: input.category,
        image_url: input.image_url,
        project_link: input.project_link,
        description: input.description,
        title_en: input.title_en || null,
        client: input.client || null,
        year: input.year || null,
        extra_json: input.extra_json || null,
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to insert into portfolios table:', error);
    throw new Error('Failed to save portfolio in database.', { cause: error });
  }
}

export async function deleteDbPortfolio(idOrSlug: number | string) {
  try {
    const cleanStr = String(idOrSlug).replace(/^portfolio-db-/, '');
    const numericId = Number(cleanStr);
    if (Number.isFinite(numericId)) {
      const rows = await db
        .delete(portfolios)
        .where(eq(portfolios.id, numericId))
        .returning();
      if (rows.length > 0) return rows[0];
    }

    // If deleting by string slug/id stored in extra_json or title
    const all = await listDbPortfolios();
    const match = all.find((row) => {
      if (row.title === idOrSlug) return true;
      if (row.extra_json) {
        try {
          const parsed = JSON.parse(row.extra_json);
          if (parsed && String(parsed.id) === String(idOrSlug)) return true;
        } catch {
          // ignore
        }
      }
      return false;
    });

    if (match) {
      const rows = await db
        .delete(portfolios)
        .where(eq(portfolios.id, match.id))
        .returning();
      return rows[0];
    }
    return null;
  } catch (error) {
    console.error('Failed to delete portfolio from database:', error);
    throw new Error('Failed to delete portfolio from database.', { cause: error });
  }
}
