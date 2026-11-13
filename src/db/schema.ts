import { relations } from 'drizzle-orm';
import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users table linked with Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Client-submitted Projects / Briefs table ('projects')
// Required columns: client_name, contact_info, project_title, description, budget
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  client_name: text('client_name').notNull(),
  contact_info: text('contact_info').notNull(),
  project_title: text('project_title').notNull(),
  description: text('description').notNull(),
  budget: text('budget').notNull(),
  tracking_code: text('tracking_code'),
  status: text('status').default('new'),
  is_read: boolean('is_read').default(false),
  full_summary_text: text('full_summary_text'),
  user_uid: text('user_uid'),
  created_at: timestamp('created_at').defaultNow(),
});

// 3. Studio Portfolios table ('portfolios')
// Required columns: title, category, image_url, project_link, description
export const portfolios = pgTable('portfolios', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  image_url: text('image_url').notNull(),
  project_link: text('project_link').notNull(),
  description: text('description').notNull(),
  title_en: text('title_en'),
  client: text('client'),
  year: text('year'),
  extra_json: text('extra_json'),
  created_at: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  submittedProjects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.user_uid],
    references: [users.uid],
  }),
}));
