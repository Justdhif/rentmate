import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { rooms } from './rooms.schema';
import { maintenanceAttachments } from './maintenance-attachments.schema';

export const maintenancePriorityEnum = pgEnum('maintenance_priority', [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
]);

export const maintenanceStatusEnum = pgEnum('maintenance_status', [
  'REPORTED',
  'REVIEWING',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
]);

export const maintenanceRequests = pgTable('maintenance_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketNumber: varchar('ticket_number', { length: 50 }).notNull().unique(),
  roomId: uuid('room_id')
    .notNull()
    .references(() => rooms.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  assignedTo: uuid('assigned_to').references(() => users.id, {
    onDelete: 'set null',
  }),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description').notNull(),
  priority: maintenancePriorityEnum('priority').default('MEDIUM').notNull(),
  status: maintenanceStatusEnum('status').default('REPORTED').notNull(),
  aiSummary: text('ai_summary'),
  aiRecommendation: text('ai_recommendation'),
  estimatedCost: numeric('estimated_cost', { precision: 12, scale: 2 }),
  actualCost: numeric('actual_cost', { precision: 12, scale: 2 }),
  workSummary: text('work_summary'),
  materialsUsed: text('materials_used'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
});

export const maintenanceRequestsRelations = relations(
  maintenanceRequests,
  ({ one, many }) => ({
    room: one(rooms, {
      fields: [maintenanceRequests.roomId],
      references: [rooms.id],
    }),
    tenant: one(users, {
      fields: [maintenanceRequests.tenantId],
      references: [users.id],
      relationName: 'tenant_requests',
    }),
    technician: one(users, {
      fields: [maintenanceRequests.assignedTo],
      references: [users.id],
      relationName: 'technician_tasks',
    }),
    attachments: many(maintenanceAttachments),
  }),
);

export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type NewMaintenanceRequest = typeof maintenanceRequests.$inferInsert;
