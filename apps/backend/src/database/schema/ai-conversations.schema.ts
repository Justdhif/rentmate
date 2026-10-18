import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

export interface ChatMessageRecord {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  audio?: {
    url?: string;
    duration?: number;
    waveform?: number[];
  };
}

export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Percakapan Baru'),
  messages: jsonb('messages').$type<ChatMessageRecord[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id],
  }),
}));

export type AiConversationEntity = typeof aiConversations.$inferSelect;
export type NewAiConversationEntity = typeof aiConversations.$inferInsert;
