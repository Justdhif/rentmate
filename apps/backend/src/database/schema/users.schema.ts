import { pgTable, uuid, varchar, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles.schema';

export const userRoleEnum = pgEnum('user_role', [
  'ADMIN',
  'OWNER',
  'TENANT',
  'TECHNICIAN',
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('TENANT').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  provider: varchar('provider', { length: 50 }).default('local').notNull(),
  providerId: varchar('provider_id', { length: 255 }),
  refreshTokenHash: varchar('refresh_token_hash', { length: 255 }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

import { properties } from './properties.schema';

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  properties: many(properties),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
