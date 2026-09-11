'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface AiChatInputProps {
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  onSend: (e: React.FormEvent) => void;
  isSending: boolean;
}

export const AiChatInput: React.FC<AiChatInputProps> = ({
  inputMessage,
  setInputMessage,
  onSend,
  isSending,
}) => {
  return (
    <form onSubmit={onSend} className="p-4 border-t border-gray-100 dark:border-border flex gap-3">
      <Input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder="Tanyakan analisis keuangan, strategi harga sewa, dsb..."
        disabled={isSending}
        className="flex-1 rounded-xl h-11 text-sm bg-gray-50/50 dark:bg-muted/20 border-gray-200 dark:border-border"
      />
      <Button
        type="submit"
        disabled={!inputMessage.trim() || isSending}
        className="h-11 px-5 rounded-xl shadow-sm cursor-pointer"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};
