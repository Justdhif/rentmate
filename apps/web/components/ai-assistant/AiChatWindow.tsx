'use client';

import React from 'react';
import { Bot, User, Sparkles } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiChatWindowProps {
  messages: ChatMessage[];
  isSending: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const AiChatWindow: React.FC<AiChatWindowProps> = ({
  messages,
  isSending,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex gap-3.5 max-w-2xl ${
            msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
              msg.role === 'user'
                ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white'
                : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40'
            }`}
          >
            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>

          <div
            className={`rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-slate-50 dark:bg-muted/30 border border-slate-100 dark:border-border/60 text-slate-800 dark:text-foreground rounded-tl-none'
            }`}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
            <span
              className={`text-[10px] mt-2 block ${
                msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400 dark:text-muted-foreground'
              }`}
            >
              {msg.timestamp}
            </span>
          </div>
        </div>
      ))}

      {isSending && (
        <div className="flex gap-3.5 max-w-md">
          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-slate-50 dark:bg-muted/30 border border-slate-100 dark:border-border/60 rounded-2xl rounded-tl-none p-4 text-xs text-slate-500 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            <span>Sedang menganalisis data properti...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
