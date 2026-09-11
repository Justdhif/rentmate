'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface RevenueChartCardProps {
  revenueData: any[];
  formatCurrency: (val?: number) => string;
}

export const RevenueChartCard: React.FC<RevenueChartCardProps> = ({
  revenueData,
  formatCurrency,
}) => {
  return (
    <Card className="lg:col-span-2 rounded-2xl overflow-hidden border-gray-100 dark:border-border shadow-xs flex flex-col relative bg-card">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-bold text-foreground text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Tren Pendapatan Bulanan
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Data riwayat omset terverifikasi lunas
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4 flex-1">
        {revenueData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            Belum ada data pendapatan historis.
          </div>
        ) : (
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#888888' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#888888' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `Rp${val / 1000000}M`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Pendapatan']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
