import { boolean, date, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  client: varchar('client', { length: 160 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  isFavorite: boolean('is_favorite').notNull().default(false),
  coverUrl: text('cover_url'),
  coverPathname: text('cover_pathname'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export type ProjectRow = typeof projects.$inferSelect
export type ProjectInsert = typeof projects.$inferInsert
