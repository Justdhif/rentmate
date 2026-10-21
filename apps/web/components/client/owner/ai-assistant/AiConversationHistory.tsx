'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Pencil,
  Check,
  X,
  Bot,
  Lightbulb,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/LanguageContext';
import { ChatMessage } from './AiChatWindow';
import { toast } from 'sonner';

export interface Insight {
  category: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  actionable?: boolean;
}

export interface AiConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
}

interface AiConversationHistoryProps {
  conversations: AiConversation[];
  activeId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClearAll: () => void;
  insights?: Insight[];
  loadingInsights?: boolean;
  onRefreshInsights?: () => void;
  onSelectInsight?: (promptText: string) => void;
}

export const DEFAULT_INSIGHTS: Insight[] = [
  {
    category: 'OKUPANSI',
    title: 'Optimasi Kamar Kosong',
    description: 'Terdapat 2 kamar kosong lebih dari 14 hari. Berikan diskon sewa awal 5% untuk menarik mahasiswa baru.',
    priority: 'HIGH',
  },
  {
    category: 'KEUANGAN',
    title: 'Pengingat Tagihan Jatuh Tempo',
    description: '3 tagihan penyewa jatuh tempo dalam 3 hari ke depan. Siapkan pengingat sopan via WhatsApp.',
    priority: 'MEDIUM',
  },
  {
    category: 'MAINTENANCE',
    title: 'Pemeriksaan Rutin Saluran & AC',
    description: 'Efisiensi listrik kost dapat meningkat hingga 12% dengan pembersihan filter AC terjadwal.',
    priority: 'LOW',
  },
  {
    category: 'STRATEGI',
    title: 'Evaluasi Tarif Sewa Kamar',
    description: 'Kaji perbandingan fasilitas dan tarif sewa kos sekitar untuk memaksimalkan potensi pendapatan.',
    priority: 'MEDIUM',
  },
];

export const AiConversationHistory: React.FC<AiConversationHistoryProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onClearAll,
  insights = [],
  loadingInsights = false,
  onRefreshInsights,
  onSelectInsight,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [showInsights, setShowInsights] = useState(true);
  const insightsScrollRef = useRef<HTMLDivElement>(null);

  // Allow scrolling horizontally with vertical mouse wheel as a scrollbar replacement
  useEffect(() => {
    const el = insightsScrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [showInsights]);

  const displayInsights = insights && insights.length > 0 ? insights : DEFAULT_INSIGHTS;

  const getPriorityBadge = (priority: string) => {
    const p = (priority || 'INFO').toUpperCase();
    if (p === 'HIGH' || p === 'ACTION_REQUIRED') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 shrink-0">
          HIGH
        </span>
      );
    }
    if (p === 'MEDIUM' || p === 'WARNING') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 shrink-0">
          MEDIUM
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose- text-rose- dark:bg-rose-/40 dark:text-rose- border border-rose-/60 dark:border-rose-/40 shrink-0">
        INFO
      </span>
    );
  };

  // Filter conversations by search term
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Group conversations by time category (Hari Ini, 7 Hari Terakhir, Terdahulu)
  const groupedConversations = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;

    const today: AiConversation[] = [];
    const pastWeek: AiConversation[] = [];
    const older: AiConversation[] = [];

    filteredConversations.forEach((conv) => {
      const age = now - new Date(conv.updatedAt).getTime();
      if (age < oneDay) {
        today.push(conv);
      } else if (age < sevenDays) {
        pastWeek.push(conv);
      } else {
        older.push(conv);
      }
    });

    return [
      { label: 'Hari Ini', items: today },
      { label: '7 Hari Terakhir', items: pastWeek },
      { label: 'Terdahulu', items: older },
    ].filter((group) => group.items.length > 0);
  }, [filteredConversations]);

  const handleStartRename = (conv: AiConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitleInput(conv.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (editTitleInput.trim()) {
      onRenameConversation(id, editTitleInput.trim());
      toast.success('Nama percakapan berhasil diperbarui.');
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
    toast.info('Percakapan dihapus.');
  };

  return (
    <aside className="w-full lg:w-[320px] xl:w-[350px] shrink-0 h-auto lg:h-full flex flex-col bg-slate-50/80 dark:bg-card/60 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-border/60 select-none">
      {/* 1. Header with New Chat Button & Search Bar in 1 row */}
      <div className="h-16 px-3 sm:px-3.5 border-b border-slate-200/80 dark:border-border/60 flex items-center shrink-0">
        <div className="flex items-center gap-2 w-full">
          {/* New Chat Button with Plus Icon */}
          <Button
            onClick={onNewConversation}
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer"
            title="Percakapan Baru"
          >
            <Plus className="w-4 h-4" />
          </Button>

          {/* Search Filter Input */}
          <div className="relative flex-1 min-w-0 flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari percakapan..."
              className="w-full h-9 pl-8 pr-7 text-xs bg-white dark:bg-muted/20 border border-slate-200/80 dark:border-border/60 rounded-xl placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 text-slate-800 dark:text-slate-100 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Bersihkan pencarian"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Smart Insights Section (Menyamping / Horizontally Scrollable & Collapsible) */}
      <div className="px-3 sm:px-3.5 pt-3.5 pb-1 shrink-0">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-1.5 text-left group cursor-pointer select-none"
            title={showInsights ? 'Sembunyikan Smart Insights' : 'Tampilkan Smart Insights'}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              Smart Insights
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-300 ${
                showInsights ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>
        </div>

        {/* Animated Collapsible Container with smooth grid-rows transition */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            showInsights ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none mt-0'
          }`}
        >
          <div className="overflow-hidden">
            {/* Horizontal scroll container (Menyamping) with mouse-wheel scrolling & hidden scrollbar */}
            <div
              ref={insightsScrollRef}
              className="flex items-stretch gap-2.5 overflow-x-auto pb-1 px-0.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none"
            >
              {displayInsights.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    onSelectInsight &&
                    onSelectInsight(
                      `Tolong jelaskan lebih lanjut mengenai rekomendasi: "${item.title}". ${item.description} Apa langkah solutif yang perlu saya ambil?`
                    )
                  }
                  className="shrink-0 w-[215px] p-2.5 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer shadow-2xs group flex flex-col justify-between"
                  title="Klik untuk menanyakan rekomendasi ini ke AI"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 truncate">
                        {item.category}
                      </span>
                      {getPriorityBadge(item.priority)}
                    </div>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1 leading-snug">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-end text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-2 gap-1 opacity-80 group-hover:opacity-100">
                    <span>Tanya AI</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Conversations List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-4 scroll-smooth">
        {groupedConversations.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-muted/30 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {searchQuery ? 'Tidak ada percakapan ditemukan' : 'Belum ada percakapan'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {searchQuery
                ? 'Coba kata kunci pencarian yang lain.'
                : 'Mulai dengan mengetik pertanyaan ke AI.'}
            </p>
          </div>
        ) : (
          groupedConversations.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-muted-foreground">
                {group.label}
              </div>

              {group.items.map((conv) => {
                const isActive = conv.id === activeId;
                const isEditing = editingId === conv.id;

                if (isEditing) {
                  return (
                    <div
                      key={conv.id}
                      className="p-1.5 px-2 rounded-xl bg-white dark:bg-card border border-rose-400 dark:border-rose-600 shadow-xs flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(conv.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1 text-xs bg-transparent border-none outline-hidden text-slate-800 dark:text-slate-100 px-1 py-0.5"
                      />
                      <button
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        title="Simpan nama"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`group relative flex items-center justify-between p-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-50/90 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200/80 dark:border-rose-800/60 shadow-2xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-muted/20 border border-transparent'
                    }`}
                    title={conv.title}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1 flex-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate leading-snug">{conv.title}</span>
                    </div>

                    {/* Hover Actions: Rename & Delete */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(conv, e)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Ubah judul percakapan"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(conv.id, e)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Hapus percakapan"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* 4. Footer with Clear History & Groq LLM branding */}
      <div className="p-3 px-3.5 border-t border-slate-200/70 dark:border-border/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-muted-foreground shrink-0 bg-slate-50/50 dark:bg-card/40">
        <div className="flex items-center gap-1.5 truncate">
          <Bot className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="truncate font-medium">{conversations.length} Percakapan</span>
        </div>

        {conversations.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Yakin ingin menghapus semua riwayat percakapan?')) {
                onClearAll();
                toast.info('Semua riwayat percakapan telah dibersihkan.');
              }
            }}
            className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            title="Bersihkan semua percakapan"
          >
            Hapus Semua
          </button>
        )}
      </div>
    </aside>
  );
};
