'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from 'recharts';

interface OccupancyPieCardProps {
  occupancyData: any;
  occupancyPieData: Array<{ name: string; value: number; color: string }>;
  totalRooms: number;
}

export const OccupancyPieCard: React.FC<OccupancyPieCardProps> = ({
  occupancyData,
  occupancyPieData,
  totalRooms,
}) => {
  return (
    <Card className="rounded-2xl overflow-hidden border-gray-100 dark:border-border shadow-xs flex flex-col relative bg-card">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
      <CardHeader className="p-6 pb-2">
        <CardTitle className="font-bold text-foreground text-base flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-emerald-500" />
          Komposisi Hunian
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          {totalRooms} Kamar Terdaftar
        </p>
      </CardHeader>
      <CardContent className="p-6 pt-4 flex-1 flex flex-col justify-center">
        {totalRooms === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            Belum ada unit kamar.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
