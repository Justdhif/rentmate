import {
  pgTable,
  uuid,
  varchar,
  integer,
  numeric,
  text,
  json,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { properties } from './properties.schema';

export const roomStatusEnum = pgEnum('room_status', [
  'AVAILABLE',
  'OCCUPIED',
  'MAINTENANCE',
]);

export const rooms = pgTable('rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  roomNumber: varchar('room_number', { length: 50 }).notNull(),
  floor: integer('floor').default(1).notNull(),
  roomType: varchar('room_type', { length: 50 }),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  status: roomStatusEnum('status').default('AVAILABLE').notNull(),
  description: text('description'),
  facilities: json('facilities').$type<string[]>().default([]),
  photos: json('photos').$type<string[]>().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

import { roomAssignments } from './room-assignments.schema';

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  property: one(properties, {
    fields: [rooms.propertyId],
    references: [properties.id],
  }),
  assignments: many(roomAssignments),
}));

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
