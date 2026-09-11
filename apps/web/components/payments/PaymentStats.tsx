'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

interface PaymentStatsProps {
  totalPaid: number;
  totalPending: number;
  paidCount: number;
  formatCurrency: (val?: number) => string;
}

export const PaymentStats: React.FC<PaymentStatsProps> = ({
  totalPaid,
  totalPending,
  paidCount,
  formatCurrency,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
      <Card className="rounded-2xl border border-gray-100 dark:border-border shadow-xs bg-white dark:bg-card">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">
              Total Diterima
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">
              {formatCurrency(totalPaid)}
            </p>
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
              Menunggu Pembayaran
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">
              {formatCurrency(totalPending)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-gray-100 dark:border-border shadow-xs bg-white dark:bg-card">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">
              Tagihan Lunas
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">
              {paidCount} Transaksi
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
