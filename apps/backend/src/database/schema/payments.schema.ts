import {
  pgTable,
  uuid,
  varchar,
  numeric,
  date,
  timestamp,
  text,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { rooms } from './rooms.schema';
import { paymentInvoices } from './payment-invoices.schema';

export const paymentStatusEnum = pgEnum('payment_status', [
  'PAID',
  'PENDING',
  'OVERDUE',
  'FAILED',
  'CANCELLED',
]);

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'restrict' }),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    dueDate: date('due_date').notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    status: paymentStatusEnum('status').default('PENDING').notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }),
    transactionReference: varchar('transaction_reference', { length: 255 }),
    snapToken: text('snap_token'),
    snapRedirectUrl: text('snap_redirect_url'),
    period: varchar('period', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('payments_tenant_status_idx').on(table.tenantId, table.status),
    index('payments_room_id_idx').on(table.roomId),
    index('payments_due_date_idx').on(table.dueDate),
  ],
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  tenant: one(users, {
    fields: [payments.tenantId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [payments.roomId],
    references: [rooms.id],
  }),
  invoice: one(paymentInvoices, {
    fields: [payments.id],
    references: [paymentInvoices.paymentId],
  }),
}));

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
