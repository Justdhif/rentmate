'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage, AiChatWindow } from './AiChatWindow';
import { AiChatInput } from './AiChatInput';
import {
  AiConversation,
  AiConversationHistory,
  Insight,
  DEFAULT_INSIGHTS,
} from './AiConversationHistory';
import { toast } from 'sonner';

export const AiAssistantView: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();

  const createWelcomeMessage = useCallback((): ChatMessage => ({
    role: 'assistant',
    content: `Halo ${user?.profile?.fullName || user?.email?.split('@')[0] || 'Owner'}! 👋\n\nSaya **RentMate AI Assistant**, co-pilot cerdas bisnis kost Anda yang didukung oleh **Groq LLM Engine**.\n\nSaya siap membantu Anda dalam:\n- 📊 **Analisis Finansial**: Proyeksi omset bulanan, arus kas, dan margin sewa.\n- 📈 **Strategi Okupansi**: Trik mengisi kamar kosong dan penyesuaian tarif kamar.\n- 🛠️ **Evaluasi Kerusakan**: Analisis riwayat perbaikan dan efisiensi vendor.\n- 💬 **Komunikasi Tenant**: Draf pesan WhatsApp tagihan, pengumuman tata tertib, dsb.\n\nApa yang ingin Anda konsultasikan hari ini?`,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }), [user]);

  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations from Backend API
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const res = await api.get<AiConversation[]>('/ai/conversations');

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setConversations(res.data);
        setActiveId((prev) =>
          res.data.some((c) => c.id === prev) ? prev : res.data[0].id
        );
      } else {
        // No conversations exist on backend yet -> create initial one
        const initRes = await api.post<AiConversation>('/ai/conversations', {
          title: 'Percakapan Baru',
          messages: [createWelcomeMessage()],
        });

        if (initRes.success && initRes.data) {
          setConversations([initRes.data]);
          setActiveId(initRes.data.id);
        }
      }
    } catch (err: any) {
      console.warn('Gagal memuat riwayat percakapan dari backend:', err?.message || err);
      toast.error('Gagal memuat percakapan dari server.');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [createWelcomeMessage]);

  const fetchInsights = useCallback(async () => {
    try {
      setLoadingInsights(true);
      const res = await api.get<{ insights?: Insight[] } | Insight[]>('/ai/insights');
      if (res.success && res.data) {
        const rawList = Array.isArray(res.data) ? res.data : (res.data as any).insights || [];
        const normalized: Insight[] = rawList.map((item: any) => ({
          category: item.category || (item.type === 'ACTION_REQUIRED' ? 'OKUPANSI' : item.type === 'WARNING' ? 'KEUANGAN' : 'OPERASIONAL'),
          title: item.title,
          description: item.description,
          priority: (item.priority || (item.type === 'ACTION_REQUIRED' ? 'HIGH' : item.type === 'WARNING' ? 'MEDIUM' : 'LOW')) as 'HIGH' | 'MEDIUM' | 'LOW',
          actionable: true,
        }));

        if (normalized.length >= 3) {
          setInsights(normalized);
        } else if (normalized.length > 0) {
          const merged = [
            ...normalized,
            ...DEFAULT_INSIGHTS.filter(
              (d) => !normalized.some((n) => n.title.toLowerCase().includes(d.title.toLowerCase()))
            ),
          ];
          setInsights(merged.slice(0, 4));
        } else {
          setInsights(DEFAULT_INSIGHTS);
        }
      } else {
        setInsights(DEFAULT_INSIGHTS);
      }
    } catch (err: any) {
      console.warn('Gagal memuat insight AI:', err?.message || err);
      setInsights(DEFAULT_INSIGHTS);
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchConversations();
      fetchInsights();
    }
  }, [user, isAuthLoading, fetchConversations, fetchInsights]);

  // Current active conversation
  const currentConversation = conversations.find((c) => c.id === activeId) || null;
  const currentMessages = currentConversation ? currentConversation.messages : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Create a brand new conversation in Backend
  const handleNewConversation = async () => {
    try {
      const res = await api.post<AiConversation>('/ai/conversations', {
        title: 'Percakapan Baru',
        messages: [createWelcomeMessage()],
      });

      if (res.success && res.data) {
        setConversations((prev) => [res.data, ...prev]);
        setActiveId(res.data.id);
        setInputMessage('');
        toast.success('Percakapan baru telah dimulai.');
      }
    } catch (err: any) {
      toast.error('Gagal membuat percakapan baru di server.');
    }
  };

  // Select an existing conversation from history
  const handleSelectConversation = (id: string) => {
    setActiveId(id);
  };

  // Rename conversation title in Backend
  const handleRenameConversation = async (id: string, newTitle: string) => {
    // Optimistic update
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: new Date() } : c))
    );

    try {
      await api.patch('/ai/conversations/' + id, { title: newTitle });
    } catch (err) {
      toast.error('Gagal memperbarui judul di server.');
      fetchConversations();
    }
  };

  // Delete conversation in Backend
  const handleDeleteConversation = async (id: string) => {
    // Optimistic update
    setConversations((prev) => {
      const nextList = prev.filter((c) => c.id !== id);
      if (activeId === id) {
        if (nextList.length > 0) {
          setActiveId(nextList[0].id);
        }
      }
      return nextList;
    });

    try {
      await api.delete('/ai/conversations/' + id);

      // If all were deleted, create a fresh one on backend
      if (conversations.length <= 1) {
        handleNewConversation();
      }
    } catch (err) {
      toast.error('Gagal menghapus percakapan dari server.');
      fetchConversations();
    }
  };

  // Clear all conversations in Backend
  const handleClearAll = async () => {
    try {
      await api.delete('/ai/conversations');
      const res = await api.post<AiConversation>('/ai/conversations', {
        title: 'Percakapan Baru',
        messages: [createWelcomeMessage()],
      });

      if (res.success && res.data) {
        setConversations([res.data]);
        setActiveId(res.data.id);
      }
    } catch (err) {
      toast.error('Gagal membersihkan riwayat di server.');
      fetchConversations();
    }
  };

  // Reset active chat messages in Backend
  const handleResetActiveChat = async () => {
    if (!activeId) return;
    const freshMessages = [createWelcomeMessage()];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: freshMessages,
              updatedAt: new Date(),
            }
          : c
      )
    );
    setInputMessage('');

    try {
      await api.patch('/ai/conversations/' + activeId, {
        messages: freshMessages,
      });
      toast.info('Percakapan telah diatur ulang.');
    } catch (err) {
      toast.error('Gagal mengatur ulang di server.');
    }
  };

  // Send message to Backend AI Assistant & sync to DB
  const handleSendMessage = async (
    e?: React.FormEvent,
    customText?: string,
    audioData?: { url?: string; duration?: number; waveform?: number[] }
  ) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputMessage;
    if ((!textToSend.trim() && !audioData) || isSending) return;

    let targetConvId = activeId;

    // If no active conversation exists, create one first in backend
    if (!targetConvId || !conversations.some((c) => c.id === targetConvId)) {
      try {
        const initRes = await api.post<AiConversation>('/ai/conversations', {
          title: textToSend.slice(0, 32) + (textToSend.length > 32 ? '...' : ''),
          messages: [createWelcomeMessage()],
        });
        if (initRes.success && initRes.data) {
          targetConvId = initRes.data.id;
          setConversations((prev) => [initRes.data, ...prev]);
          setActiveId(targetConvId);
        }
      } catch {
        toast.error('Gagal menginisialisasi sesi di server.');
        return;
      }
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ...(audioData ? { audio: audioData } : {}),
    };

    // Optimistic UI update
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === targetConvId) {
          const autoTitle =
            c.title === 'Percakapan Baru'
              ? textToSend.slice(0, 32) + (textToSend.length > 32 ? '...' : '')
              : c.title;
          return {
            ...c,
            title: autoTitle,
            updatedAt: new Date(),
            messages: [...c.messages, userMsg],
          };
        }
        return c;
      })
    );

    if (!customText) setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.post<{ reply: string; conversation: AiConversation }>(
        '/ai/assistant',
        {
          message: textToSend,
          conversationId: targetConvId,
          ...(audioData ? { audio: audioData } : {}),
        }
      );

      if (res.success && res.data) {
        if (res.data.conversation) {
          // Sync full updated conversation from backend
          const updatedConv = res.data.conversation;
          setConversations((prev) =>
            prev.map((c) => (c.id === updatedConv.id ? updatedConv : c))
          );
        } else if (res.data.reply) {
          const assistantMsg: ChatMessage = {
            role: 'assistant',
            content: res.data.reply,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
          setConversations((prev) =>
            prev.map((c) =>
              c.id === targetConvId
                ? {
                    ...c,
                    updatedAt: new Date(),
                    messages: [...c.messages, assistantMsg],
                  }
                : c
            )
          );
        }
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content:
          'Maaf, terjadi kendala saat menghubungi AI Assistant. Silakan periksa koneksi jaringan atau coba beberapa saat lagi.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                updatedAt: new Date(),
                messages: [...c.messages, errorMsg],
              }
            : c
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppLayout noPadding>
      <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 w-full overflow-y-auto lg:overflow-hidden animate-fade-in">
        {/* Left Column: Backend-Powered Conversation History Sidebar with Horizontal Smart Insights */}
        <AiConversationHistory
          conversations={conversations}
          activeId={activeId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onClearAll={handleClearAll}
          insights={insights}
          loadingInsights={loadingInsights}
          onRefreshInsights={fetchInsights}
          onSelectInsight={(prompt) => {
            setInputMessage(prompt);
            toast.info('Rekomendasi disalin ke kotak pesan.');
          }}
        />

        {/* Right Column: Full-Height Chat Interface */}
        <div className="flex-1 min-w-0 min-h-[550px] lg:min-h-0 flex flex-col h-full bg-white dark:bg-card">
          {/* Chat Window Header */}
          <div className="h-16 px-5 sm:px-6 border-b border-slate-200/80 dark:border-border/60 flex items-center justify-between bg-slate-50/50 dark:bg-muted/10 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                  {currentConversation?.title || 'RentMate AI Co-Pilot'}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-[11px] text-slate-400 dark:text-muted-foreground font-medium truncate">
                    Asisten Cerdas Bisnis Kost • Siap Membantu
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Reset Chat Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetActiveChat}
                className="rounded-xl text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 gap-1.5 h-8.5 px-3"
                title="Atur ulang percakapan ini"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </div>

          {/* Chat Messages Window */}
          <AiChatWindow
            messages={currentMessages}
            isSending={isSending}
            messagesEndRef={messagesEndRef}
          />

          {/* Chat Input */}
          <AiChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSend={(text, audio) => handleSendMessage(undefined, text, audio)}
            isSending={isSending}
          />
        </div>
      </div>
    </AppLayout>
  );
};
