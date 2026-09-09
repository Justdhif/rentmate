import {
  pgTable,
  uuid,
  date,
  numeric,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { rooms } from './rooms.schema';
import { users } from './users.schema';

export const assignmentStatusEnum = pgEnum('assignment_status', [
  'ACTIVE',
  'ENDED',
  'CANCELLED',
]);

export const roomAssignments = pgTable('room_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id')
    .notNull()
    .references(() => rooms.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  monthlyRent: numeric('monthly_rent', { precision: 12, scale: 2 }),
  status: assignmentStatusEnum('status').default('ACTIVE').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const roomAssignmentsRelations = relations(
  roomAssignments,
  ({ one }) => ({
    room: one(rooms, {
      fields: [roomAssignments.roomId],
      references: [rooms.id],
    }),
    tenant: one(users, {
      fields: [roomAssignments.tenantId],
      references: [users.id],
    }),
  }),
);

export type RoomAssignment = typeof roomAssignments.$inferSelect;
export type NewRoomAssignment = typeof roomAssignments.$inferInsert;
