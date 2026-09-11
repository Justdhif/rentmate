'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, Clock, CheckCircle2 } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
      <Card className="rounded-2xl border border-gray-100 dark:border-border shadow-xs bg-white dark:bg-card">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">
              Total Tiket Laporan
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{totalCount}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-gray-100 dark:border-border shadow-xs bg-white dark:bg-card">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">
              Menunggu Penugasan
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{reportedCount}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-gray-100 dark:border-border shadow-xs bg-white dark:bg-card">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">
              Selesai Ditangani
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{resolvedCount}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
