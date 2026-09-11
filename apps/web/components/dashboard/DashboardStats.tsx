'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoorClosed, TrendingUp, Wallet, Wrench, ArrowUpRight, Activity, Clock } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Okupansi */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs hover:shadow-md transition-all bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
            Okupansi Kamar
          </CardTitle>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/40 flex items-center justify-center">
            <DoorClosed className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {stats?.occupiedRoomsCount ?? 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-muted-foreground font-medium">
              / {stats?.roomsCount ?? 0} Kamar
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="w-full bg-slate-100 dark:bg-muted/40 rounded-full h-2 mr-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(stats?.occupancyRate ?? 0, 100)}%` }}
              />
            </div>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
              {stats?.occupancyRate ?? 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Estimasi Omset */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs hover:shadow-md transition-all bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
            Estimasi Omset / Bln
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
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Aktif
            </span>
            <span>dari kamar tersewa</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Total Uang Masuk */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs hover:shadow-md transition-all bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
            Total Uang Masuk
          </CardTitle>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-blue-900/40 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
            {formatCurrency(stats?.totalCollected ?? 0)}
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-muted-foreground">
            <span className="inline-flex items-center text-blue-700 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 px-2 py-0.5 rounded-full text-[11px]">
              <Activity className="w-3.5 h-3.5 mr-0.5" /> Real-time
            </span>
            <span>Midtrans & Tunai</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Perbaikan Aktif */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs hover:shadow-md transition-all bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
            Perbaikan Aktif
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
              Tiket
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-muted-foreground">
            <span className="inline-flex items-center text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-full text-[11px]">
              <Clock className="w-3.5 h-3.5 mr-0.5" /> Pending
            </span>
            <span>Perlu ditugaskan</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
