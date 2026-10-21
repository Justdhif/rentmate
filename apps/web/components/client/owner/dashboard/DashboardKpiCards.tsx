'use client';

import React from 'react';
import { Home, Users, Banknote, CalendarCheck, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { OverviewStats } from './DashboardStats';

interface DashboardKpiCardsProps {
  stats: OverviewStats | null;
  formatCurrency: (val?: number) => string;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({ stats, formatCurrency }) => {
  const { t } = useTranslation();
  const totalRooms = stats?.roomsCount ?? 0;
  const occupiedRooms = stats?.occupiedRoomsCount ?? 0;
  const vacantRooms = Math.max(0, totalRooms - occupiedRooms);
  const occupancyPercent = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const monthlyRevenue = stats?.monthlyRevenue || 0;
  const pendingAmount = (stats as any)?.outstanding || 0;
  const pendingCount = (stats as any)?.pendingCount || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Total Kamar */}
      <div className="rounded-2xl p-5 border border-rose-/90 dark:border-rose-/40 bg-rose-/40 dark:bg-rose-/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose- dark:bg-rose-/60 text-rose- dark:text-rose- flex items-center justify-center shrink-0 shadow-2xs">
            <Home className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('dashboard.totalRooms')}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
            {totalRooms}
          </div>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">
            {t('dashboard.occupiedVacantSummary', { occupied: occupiedRooms, vacant: vacantRooms })}
          </p>
        </div>
      </div>

      {/* 2. Penyewa Aktif */}
      <div className="rounded-2xl p-5 border border-emerald-100/90 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('dashboard.activeTenants')}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
            {occupiedRooms}
          </div>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">
            {t('dashboard.occupancySummary', { percent: occupancyPercent })}
          </p>
        </div>
      </div>

      {/* 3. Pendapatan Bulan Ini */}
      <div className="rounded-2xl p-5 border border-rose-/90 dark:border-rose-/40 bg-rose-/40 dark:bg-rose-/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose- dark:bg-rose-/60 text-rose- dark:text-rose- flex items-center justify-center shrink-0 shadow-2xs">
            <Banknote className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('dashboard.thisMonthRevenue')}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-foreground tracking-tight truncate">
            {formatCurrency(monthlyRevenue)}
          </div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('dashboard.fromLastMonth', { percent: 12 })}</span>
          </p>
        </div>
      </div>

      {/* 4. Tagihan Pending */}
      <div className="rounded-2xl p-5 border border-amber-100/90 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('dashboard.pendingBills')}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-foreground tracking-tight truncate">
            {formatCurrency(pendingAmount)}
          </div>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">
            {t('dashboard.pendingTenants', { count: pendingCount })}
          </p>
        </div>
      </div>
    </div>
  );
};
