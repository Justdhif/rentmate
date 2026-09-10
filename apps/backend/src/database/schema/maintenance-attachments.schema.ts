import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { maintenanceRequests } from './maintenance-requests.schema';

export const maintenanceAttachments = pgTable('maintenance_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  maintenanceRequestId: uuid('maintenance_request_id')
    .notNull()
    .references(() => maintenanceRequests.id, { onDelete: 'cascade' }),
  fileUrl: text('file_url').notNull(),
  fileType: varchar('file_type', { length: 50 }).default('BEFORE').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const maintenanceAttachmentsRelations = relations(
  maintenanceAttachments,
  ({ one }) => ({
    request: one(maintenanceRequests, {
      fields: [maintenanceAttachments.maintenanceRequestId],
      references: [maintenanceRequests.id],
    }),
  }),
);

export type MaintenanceAttachment = typeof maintenanceAttachments.$inferSelect;
export type NewMaintenanceAttachment = typeof maintenanceAttachments.$inferInsert;
