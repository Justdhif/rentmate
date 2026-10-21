'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Wrench, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface MaintenanceStatsProps {
  totalCount: number;
  reportedCount: number;
  resolvedCount: number;
}

export const MaintenanceStats: React.FC<MaintenanceStatsProps> = ({
  totalCount,
  reportedCount,
  resolvedCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-slide-up">
      {/* 1. Total Tiket Laporan (Indigo / Blue Theme) */}
      <Card className="rounded-2xl border border-rose-/90 dark:border-rose-/40 bg-rose-/40 dark:bg-rose-/20 shadow-2xs hover:shadow-xs transition-all p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-/10 dark:bg-rose-/20 text-rose- dark:text-rose- flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-rose- dark:text-rose- bg-rose-/70 dark:bg-rose-/40 px-2.5 py-0.5 rounded-full">
              Semua Tiket
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('maintenance.statTotal', { defaultValue: 'Total Tiket Laporan' })}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            {totalCount}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-rose-/80 dark:border-rose-/30 text-[11px] text-slate-500 dark:text-slate-400">
          Semua keluhan fasilitas tercatat
        </div>
      </Card>

      {/* 2. Menunggu Penugasan / Perbaikan (Amber Theme) */}
      <Card className="rounded-2xl border border-amber-100/90 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-2xs hover:shadow-xs transition-all p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-900/40 px-2.5 py-0.5 rounded-full">
              Perlu Tindakan
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('maintenance.statPending', { defaultValue: 'Menunggu / Proses' })}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            {reportedCount}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-amber-100/80 dark:border-amber-900/30 text-[11px] text-slate-500 dark:text-slate-400">
          Menunggu teknisi atau sedang dikerjakan
        </div>
      </Card>

      {/* 3. Selesai Ditangani (Emerald Theme) */}
      <Card className="rounded-2xl border border-emerald-100/90 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs hover:shadow-xs transition-all p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/40 px-2.5 py-0.5 rounded-full">
              Terselesaikan
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('maintenance.statResolved', { defaultValue: 'Selesai Ditangani' })}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            {resolvedCount}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-emerald-100/80 dark:border-emerald-900/30 text-[11px] text-slate-500 dark:text-slate-400">
          Fasilitas telah diperbaiki & siap pakai
        </div>
      </Card>
    </div>
  );
};
