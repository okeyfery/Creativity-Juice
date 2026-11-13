import { desc, eq } from 'drizzle-orm';
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
  id: number,
  updates: Partial<{ status: string; is_read: boolean; description: string }>
) {
  try {
    const rows = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to update project in database:', error);
    throw new Error('Failed to update project in database.', { cause: error });
  }
}

export async function deleteDbProject(id: number) {
  try {
    const rows = await db
      .delete(projects)
      .where(eq(projects.id, id))
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

export async function deleteDbPortfolio(id: number) {
  try {
    const rows = await db
      .delete(portfolios)
      .where(eq(portfolios.id, id))
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to delete portfolio from database:', error);
    throw new Error('Failed to delete portfolio from database.', { cause: error });
  }
}
