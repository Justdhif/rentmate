'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw, Zap, ArrowUpRight, MessageSquarePlus } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export interface Insight {
  category: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  actionable: boolean;
}

interface AiInsightsSidebarProps {
  insights: Insight[];
  loadingInsights: boolean;
  onRefresh: () => void;
  onSelectPrompt: (text: string) => void;
}

const DEFAULT_INSIGHTS: Insight[] = [
  {
    category: 'OKUPANSI',
    title: 'Optimasi Kamar Kosong',
    description: 'Terdapat 2 kamar kosong lebih dari 14 hari. Berikan diskon sewa awal 5% untuk menarik mahasiswa baru.',
    priority: 'HIGH',
    actionable: true,
  },
  {
    category: 'KEUANGAN',
    title: 'Pengingat Tagihan Jatuh Tempo',
    description: '3 tagihan penyewa jatuh tempo dalam 3 hari ke depan. Siapkan pengingat sopan via WhatsApp.',
    priority: 'MEDIUM',
    actionable: true,
  },
  {
    category: 'MAINTENANCE',
    title: 'Pemeriksaan Rutin Saluran & AC',
    description: 'Efisiensi listrik kost dapat meningkat hingga 12% dengan pembersihan filter AC terjadwal.',
    priority: 'LOW',
    actionable: true,
  },
];

const PRESET_PROMPTS = [
  'Berapa proyeksi omset dan tingkat okupansi bulan depan?',
  'Kamar mana yang paling sering komplain kerusakan?',
  'Berikan saran penyesuaian harga sewa berdasarkan pasar sekitar.',
  'Bagaimana strategi meningkatkan okupansi kamar kosong saat libur semester?',
];

export const AiInsightsSidebar: React.FC<AiInsightsSidebarProps> = ({
  insights,
  loadingInsights,
  onRefresh,
  onSelectPrompt,
}) => {
  const { t } = useTranslation();

  const displayInsights = insights && insights.length > 0 ? insights : DEFAULT_INSIGHTS;

  const getPriorityBadge = (priority: string) => {
    const p = priority.toUpperCase();
    if (p === 'HIGH') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
          HIGH
        </span>
      );
    }
    if (p === 'MEDIUM') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
          MEDIUM
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose- text-rose- dark:bg-rose-/40 dark:text-rose- border border-rose-/60 dark:border-rose-/40">
        INFO
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Top Card: Smart Insights */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-2xs bg-white dark:bg-card overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-border/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="font-bold text-slate-900 dark:text-white text-sm">
                Smart Insights
              </CardTitle>
              <p className="text-[11px] text-slate-400">Rekomendasi performa kost</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={loadingInsights}
            className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer"
            title="Muat ulang insight"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingInsights ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-3">
          {loadingInsights ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Menghitung metrik properti...</span>
            </div>
          ) : (
            displayInsights.map((item, idx) => (
              <div
                key={idx}
                onClick={() =>
                  onSelectPrompt(
                    `Tolong jelaskan lebih lanjut mengenai rekomendasi: "${item.title}". ${item.description} Apa langkah solutif yang perlu saya ambil?`
                  )
                }
                className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-muted/20 border border-slate-200/70 dark:border-border/50 hover:border-rose-300 dark:hover:border-rose-700/60 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-all cursor-pointer group shadow-2xs"
                title="Klik untuk menanyakan rekomendasi ini ke AI"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    {item.category}
                  </span>
                  {getPriorityBadge(item.priority)}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 2. Bottom Card: Prompt Cepat */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-2xs bg-white dark:bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Prompt Cepat
            </h4>
            <p className="text-[10px] text-slate-400">Pertanyaan umum seputar kost</p>
          </div>
        </div>

        <div className="space-y-2">
          {PRESET_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="w-full text-left p-3 rounded-xl border border-slate-100 dark:border-border/60 bg-slate-50/60 dark:bg-muted/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-800 text-xs text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer flex items-start gap-2 group shadow-2xs"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{prompt}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};
