import { pgTable, uuid, varchar, text, json, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { propertyFacilities } from './property-facilities.schema';
import { rooms } from './rooms.schema';

export const properties = pgTable(
  'properties',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address').notNull(),
    description: text('description'),
    rules: text('rules'),
    contactInfo: varchar('contact_info', { length: 100 }),
    photos: json('photos').$type<string[]>().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('properties_owner_id_idx').on(table.ownerId),
  ],
);

import { favorites } from './favorites.schema';
import { reviews } from './reviews.schema';

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, {
    fields: [properties.ownerId],
    references: [users.id],
  }),
  facilities: many(propertyFacilities),
  rooms: many(rooms),
  favorites: many(favorites),
  reviews: many(reviews),
}));

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
