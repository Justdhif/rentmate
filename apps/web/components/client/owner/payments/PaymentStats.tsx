'use client';

import React from 'react';
import { TrendingUp, Clock, Receipt } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface PaymentStatsProps {
  totalPaid: number;
  totalPending: number;
  paidCount: number;
  pendingCount?: number;
  totalCount?: number;
  formatCurrency: (val?: number) => string;
}

export const PaymentStats: React.FC<PaymentStatsProps> = ({
  totalPaid,
  totalPending,
  paidCount,
  pendingCount = 0,
  totalCount = 0,
  formatCurrency,
}) => {
  const { t } = useTranslation();

  const totalAmount = totalPaid + totalPending;
  const paidPct = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
      {/* 1. Total Diterima / Lunas (Emerald Theme) */}
      <div className="rounded-2xl p-5 border border-emerald-100/90 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('payments.statReceived', { defaultValue: 'Total Diterima' })}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight truncate">
            {formatCurrency(totalPaid)}
          </div>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1 flex items-center gap-1.5">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {paidPct}%
            </span>
            <span>•</span>
            <span>{t('payments.statPaidCount', { count: paidCount, defaultValue: `${paidCount} Transaksi Lunas` })}</span>
          </p>
        </div>
      </div>

      {/* 2. Menunggu Pembayaran / Pending (Amber Theme) */}
      <div className="rounded-2xl p-5 border border-amber-100/90 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('payments.statPending', { defaultValue: 'Menunggu Pembayaran' })}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight truncate">
            {formatCurrency(totalPending)}
          </div>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">
            {pendingCount > 0
              ? `${pendingCount} tagihan aktif belum diselesaikan`
              : t('payments.statPendingSubtitle', { defaultValue: 'Tagihan aktif belum lunas' })}
          </p>
        </div>
      </div>

      {/* 3. Total Tagihan / Akumulasi (Purple Theme) */}
      <div className="rounded-2xl p-5 border border-purple-100/90 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('payments.statTotalBills', { defaultValue: 'Total Tagihan' })}
          </span>
        </div>
        <div className="mt-4">
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-foreground tracking-tight truncate">
            {formatCurrency(totalAmount)}
          </div>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1">
            {totalCount > 0
              ? `${totalCount} total invoice diterbitkan`
              : t('payments.statTotalBillsSubtitle', { defaultValue: 'Akumulasi tagihan terbit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

