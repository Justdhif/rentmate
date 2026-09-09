import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { properties } from './properties.schema';

export const propertyFacilities = pgTable('properties_facilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const propertyFacilitiesRelations = relations(
  propertyFacilities,
  ({ one }) => ({
    property: one(properties, {
      fields: [propertyFacilities.propertyId],
      references: [properties.id],
    }),
  }),
);

export type PropertyFacility = typeof propertyFacilities.$inferSelect;
export type NewPropertyFacility = typeof propertyFacilities.$inferInsert;
