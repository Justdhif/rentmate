import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { payments } from './payments.schema';

export const paymentInvoices = pgTable('payment_invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  paymentId: uuid('payment_id')
    .notNull()
    .references(() => payments.id, { onDelete: 'cascade' })
    .unique(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  invoiceUrl: text('invoice_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const paymentInvoicesRelations = relations(paymentInvoices, ({ one }) => ({
  payment: one(payments, {
    fields: [paymentInvoices.paymentId],
    references: [payments.id],
  }),
}));

export type PaymentInvoice = typeof paymentInvoices.$inferSelect;
export type NewPaymentInvoice = typeof paymentInvoices.$inferInsert;
