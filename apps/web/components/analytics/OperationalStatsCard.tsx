'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoorClosed, Wrench, Sparkles } from 'lucide-react';

interface OperationalStatsCardProps {
  occupancyData: any;
  maintenanceStats: any;
  formatCurrency: (val?: number) => string;
}

export const OperationalStatsCard: React.FC<OperationalStatsCardProps> = ({
  occupancyData,
  maintenanceStats,
  formatCurrency,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Okupansi Rate Card */}
      <Card className="rounded-2xl border-gray-100 dark:border-border shadow-xs bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <DoorClosed className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-base">Persentase Hunian</h4>
            <p className="text-xs text-muted-foreground">Kapasitas terisi saat ini</p>
          </div>
        </div>

        <div className="text-3xl font-extrabold text-foreground mb-3">
          {occupancyData?.occupancyRate || 0}%
        </div>

        <div className="w-full bg-slate-100 dark:bg-muted/40 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(occupancyData?.occupancyRate || 0, 100)}%` }}
          />
        </div>
      </Card>

      {/* Maintenance Cost Card */}
      <Card className="rounded-2xl border-gray-100 dark:border-border shadow-xs bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-base">Biaya Perbaikan</h4>
            <p className="text-xs text-muted-foreground">Total pengeluaran operasional</p>
          </div>
        </div>

        <div className="text-3xl font-extrabold text-foreground mb-3">
          {formatCurrency(maintenanceStats?.totalCost || 0)}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{maintenanceStats?.totalResolved || 0} perbaikan terselesaikan</span>
        </div>
      </Card>
    </div>
  );
};
