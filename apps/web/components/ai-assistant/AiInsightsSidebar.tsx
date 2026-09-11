'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw, AlertCircle, Info, Sparkles } from 'lucide-react';

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

export const AiInsightsSidebar: React.FC<AiInsightsSidebarProps> = ({
  insights,
  loadingInsights,
  onRefresh,
  onSelectPrompt,
}) => {
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'HIGH':
        return <Badge variant="destructive">Prioritas Tinggi</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Sedang</Badge>;
      default:
        return <Badge variant="outline">Informasi</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-gray-100 dark:border-border shadow-xs bg-white dark:bg-card">
        <CardHeader className="p-5 pb-3 border-b border-gray-100 dark:border-border/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <CardTitle className="font-bold text-gray-900 dark:text-foreground text-sm">
              Analisis Pintar Real-time
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={loadingInsights}
            className="h-8 w-8 text-gray-400 hover:text-indigo-600 cursor-pointer"
            title="Muat ulang insight"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingInsights ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {loadingInsights ? (
            <div className="py-8 text-center text-xs text-gray-400">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Menghitung metrik properti...
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">
              Semua operasional dalam kondisi prima. Belum ada rekomendasi darurat.
            </div>
          ) : (
            insights.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50/70 dark:bg-muted/20 border border-slate-100 dark:border-border/60 hover:border-indigo-200 transition-all cursor-pointer group"
                onClick={() =>
                  onSelectPrompt(
                    `Tolong jelaskan lebih lanjut mengenai rekomendasi: "${item.title}". Apa langkah solutif yang perlu saya ambil?`
                  )
                }
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {item.category}
                  </span>
                  {getPriorityBadge(item.priority)}
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-foreground group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Suggested Prompts Card */}
      <Card className="rounded-2xl border-gray-100 dark:border-border shadow-xs bg-white dark:bg-card p-5">
        <h4 className="text-xs font-bold text-gray-900 dark:text-foreground uppercase tracking-wider mb-3">
          Pertanyaan Cepat
        </h4>
        <div className="space-y-2">
          {[
            'Bagaimana cara menaikkan tingkat okupansi kamar bulan ini?',
            'Buatkan draf pesan penagihan sewa yang sopan via WhatsApp.',
            'Berapa estimasi biaya perbaikan AC bocor dan teknisi yang disarankan?',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSelectPrompt(prompt)}
              className="w-full text-left p-2.5 rounded-xl border border-gray-100 dark:border-border/60 bg-gray-50/50 dark:bg-muted/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-200 text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};
