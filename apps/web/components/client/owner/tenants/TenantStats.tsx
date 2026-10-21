'use client';

import React from 'react';
import { Users, DoorClosed, Banknote, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface TenantStatsProps {
  activeCount: number;
  totalRooms?: number;
  occupiedRooms?: number;
  totalRevenue: number;
  formatCurrency: (val?: number) => string;
}

export const TenantStats: React.FC<TenantStatsProps> = ({
  activeCount,
  totalRooms = 0,
  occupiedRooms,
  totalRevenue,
  formatCurrency,
}) => {
  const { t } = useTranslation();

  const total = totalRooms;
  const occupied = occupiedRooms !== undefined ? occupiedRooms : activeCount;
  const occupancyPercent = total > 0 ? Math.round((occupied / total) * 100) : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
      {/* 1. Penghuni Aktif (Blue Theme - matching Dashboard) */}
      <div className="rounded-2xl p-5 border border-rose-/90 dark:border-rose-/40 bg-rose-/40 dark:bg-rose-/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose- dark:bg-rose-/60 text-rose- dark:text-rose- flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('tenants.statActive', { defaultValue: 'Penghuni Aktif' })}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
            {activeCount}
          </div>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">
            {t('tenants.statActiveDesc', { defaultValue: 'Penyewa dengan kontrak aktif' })}
          </p>
        </div>
      </div>

      {/* 2. Kamar Terisi (Emerald Theme - matching Dashboard) */}
      <div className="rounded-2xl p-5 border border-emerald-100/90 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <DoorClosed className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('tenants.statOccupied', { defaultValue: 'Kamar Terisi' })}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
            {occupied}
          </div>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">
            {total > 0
              ? t('tenants.statOccupiedDesc', {
                  percent: occupancyPercent,
                  defaultValue: `${occupancyPercent}% tingkat okupansi`,
                })
              : t('tenants.statOccupiedFallback', { defaultValue: 'Unit kamar yang ditempati' })}
          </p>
        </div>
      </div>

      {/* 3. Total Sewa / Bulan (Purple Theme - matching Dashboard) */}
      <div className="rounded-2xl p-5 border border-rose-/90 dark:border-rose-/40 bg-rose-/40 dark:bg-rose-/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose- dark:bg-rose-/60 text-rose- dark:text-rose- flex items-center justify-center shrink-0 shadow-2xs">
            <Banknote className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('tenants.statRevenue', { defaultValue: 'Total Sewa/bulan' })}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-foreground tracking-tight truncate">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {t('tenants.statRevenueDesc', { defaultValue: 'Estimasi perputaran sewa' })}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

