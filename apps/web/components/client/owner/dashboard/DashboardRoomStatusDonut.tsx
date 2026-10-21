'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useTranslation } from '@/contexts/LanguageContext';

interface DashboardRoomStatusDonutProps {
  totalRooms?: number;
  occupiedRooms?: number;
  availableRooms?: number;
}

export const DashboardRoomStatusDonut: React.FC<DashboardRoomStatusDonutProps> = ({
  totalRooms = 12,
  occupiedRooms = 10,
  availableRooms = 2,
}) => {
  const { t } = useTranslation();
  const total = totalRooms || 12;
  const occupied = occupiedRooms || 10;
  const vacant = Math.max(0, total - occupied);
  const occupiedPct = total > 0 ? Math.round((occupied / total) * 100) : 83;
  const vacantPct = 100 - occupiedPct;

  const pieData = [
    { name: t('dashboard.statusOccupied'), value: occupied, color: '#10B981' },
    { name: t('dashboard.statusVacant'), value: vacant, color: '#E2E8F0' },
  ];

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-2xs bg-white dark:bg-card h-full flex flex-col justify-between">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="font-bold text-slate-900 dark:text-foreground text-sm sm:text-base">
          {t('dashboard.roomStatusTitle')}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
        {/* Donut Chart with Center Text */}
        <div className="relative h-44 sm:h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any, name: any) => [`${val} ${t('dashboard.roomsUnit')}`, name]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label in Donut hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-foreground leading-none">
              {total}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
              {t('dashboard.roomsUnit')}
            </span>
          </div>
        </div>

        {/* Legend matching reference image */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-border/60 space-y-2.5">
          {/* Terisi */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {t('dashboard.statusOccupied')}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="font-bold text-slate-900 dark:text-foreground">
                {occupied}
              </span>
              <span className="text-slate-500 dark:text-muted-foreground w-8 text-right font-medium">
                {occupiedPct}%
              </span>
            </div>
          </div>

          {/* Kosong */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {t('dashboard.statusVacant')}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="font-bold text-slate-900 dark:text-foreground">
                {vacant}
              </span>
              <span className="text-slate-500 dark:text-muted-foreground w-8 text-right font-medium">
                {vacantPct}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
