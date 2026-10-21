'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoorClosed, TrendingUp, Wallet, Wrench, ArrowUpRight, Activity, Clock } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export interface OverviewStats {
  propertiesCount: number;
  roomsCount: number;
  occupiedRoomsCount: number;
  occupancyRate: number;
  pendingMaintenanceCount: number;
  monthlyRevenue: number;
  totalCollected: number;
}

interface DashboardStatsProps {
  stats: OverviewStats | null;
  formatCurrency: (val?: number) => string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, formatCurrency }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Okupansi */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs hover:shadow-md transition-all bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
            {t('dashboard.occupancyTitle')}
          </CardTitle>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100/80 dark:border-rose-900/40 flex items-center justify-center">
            <DoorClosed className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {stats?.occupiedRoomsCount ?? 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-muted-foreground font-medium">
              {t('dashboard.occupancyRooms', { count: stats?.roomsCount ?? 0 })}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="w-full bg-slate-100 dark:bg-muted/40 rounded-full h-2 mr-3 overflow-hidden">
              <div
                className="bg-rose-600 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(stats?.occupancyRate ?? 0, 100)}%` }}
              />
            </div>
            <span className="font-bold text-rose-600 dark:text-rose-400 shrink-0">
              {stats?.occupancyRate ?? 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Estimasi Omset */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs hover:shadow-md transition-all bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
            {t('dashboard.revenueEstTitle')}
          </CardTitle>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-900/40 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
            {formatCurrency(stats?.monthlyRevenue ?? 0)}
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-muted-foreground">
            <span className="inline-flex items-center text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full text-[11px]">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> {t('dashboard.revenueEstBadge')}
            </span>
            <span>{t('dashboard.revenueEstSub')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Total Uang Masuk */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs hover:shadow-md transition-all bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
            {t('dashboard.totalIncomeTitle')}
          </CardTitle>
          <div className="w-10 h-10 rounded-xl bg-rose- dark:bg-rose-/40 text-rose- dark:text-rose- border border-rose-/80 dark:border-rose-/40 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
            {formatCurrency(stats?.totalCollected ?? 0)}
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-muted-foreground">
            <span className="inline-flex items-center text-rose- dark:text-rose- font-semibold bg-rose- dark:bg-rose-/50 border border-rose-/60 dark:border-rose-/60 px-2 py-0.5 rounded-full text-[11px]">
              <Activity className="w-3.5 h-3.5 mr-0.5" /> {t('dashboard.totalIncomeBadge')}
            </span>
            <span>{t('dashboard.totalIncomeSub')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Perbaikan Aktif */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs hover:shadow-md transition-all bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
            {t('dashboard.maintenanceTitle')}
          </CardTitle>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100/80 dark:border-amber-900/40 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {stats?.pendingMaintenanceCount ?? 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-muted-foreground font-medium">
              {t('dashboard.maintenanceCount')}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-muted-foreground">
            <span className="inline-flex items-center text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-full text-[11px]">
              <Clock className="w-3.5 h-3.5 mr-0.5" /> {t('dashboard.maintenanceBadge')}
            </span>
            <span>{t('dashboard.maintenanceSub')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
