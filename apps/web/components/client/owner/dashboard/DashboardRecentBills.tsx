'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, Check } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface DashboardRecentBillsProps {
  recentPayments?: any[];
  formatCurrency: (val?: number) => string;
}

export const DashboardRecentBills: React.FC<DashboardRecentBillsProps> = ({
  recentPayments = [],
  formatCurrency,
}) => {
  const { locale, t } = useTranslation();

  const formatDateLabel = (isPaid: boolean, date: Date | string | number) => {
    const d = new Date(date);
    const formattedDate = d.toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return isPaid
      ? t('dashboard.paidOn', { date: formattedDate })
      : t('dashboard.dueOn', { date: formattedDate });
  };

  // Exactly 5 demo bills matching reference styling and height
  const defaultBills = [
    {
      id: '1',
      name: 'Rina Pratiwi',
      kost: 'Kost Putri A1',
      amount: 800000,
      status: 'OVERDUE',
      dateLabel: formatDateLabel(false, new Date('2026-09-10')),
      initial: 'R',
      avatarBg: 'bg-rose- text-rose- dark:bg-rose- dark:text-rose-',
    },
    {
      id: '2',
      name: 'Budi Santoso',
      kost: 'Kost Putra B2',
      amount: 1200000,
      status: 'OVERDUE',
      dateLabel: formatDateLabel(false, new Date('2026-09-12')),
      initial: 'B',
      avatarBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    },
    {
      id: '3',
      name: 'Siti Nurhaliza',
      kost: 'Kost Putri A2',
      amount: 800000,
      status: 'PAID',
      dateLabel: formatDateLabel(true, new Date('2026-09-05')),
      initial: 'S',
      avatarBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    },
    {
      id: '4',
      name: 'Andi Wijaya',
      kost: 'Kost Putra C3',
      amount: 1200000,
      status: 'PAID',
      dateLabel: formatDateLabel(true, new Date('2026-09-03')),
      initial: 'A',
      avatarBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
    },
    {
      id: '5',
      name: 'Dewi Lestari',
      kost: 'Kost Putri A2',
      amount: 800000,
      status: 'PAID',
      dateLabel: formatDateLabel(true, new Date('2026-09-01')),
      initial: 'D',
      avatarBg: 'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
    },
  ];

  const sourceBills =
    recentPayments && recentPayments.length >= 3
      ? recentPayments.map((p: any, idx: number) => {
          const isPaid = p.status === 'PAID' || p.status === 'SETTLEMENT';
          const name =
            p.tenant?.fullName ||
            p.user?.profile?.fullName ||
            p.user?.email?.split('@')[0] ||
            t('dashboard.tenantFallback', { number: idx + 1 });
          const initial = name.charAt(0).toUpperCase() || 'P';
          const colors = [
            'bg-rose- text-rose- dark:bg-rose- dark:text-rose-',
            'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
            'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
            'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
            'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
          ];

          return {
            id: p.id,
            name,
            kost: p.room?.property?.name || p.orderId || t('dashboard.mainPropertyFallback'),
            amount: Number(p.amount) || 800000,
            status: isPaid ? 'PAID' : 'OVERDUE',
            dateLabel: formatDateLabel(isPaid, p.createdAt || Date.now()),
            initial,
            avatarBg: colors[idx % colors.length],
          };
        })
      : defaultBills;

  // Exactly 5 items to match Daftar Kamar
  const displayBills = sourceBills.slice(0, 5);

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-2xs bg-white dark:bg-card h-full flex flex-col justify-between">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-bold text-slate-900 dark:text-foreground text-sm sm:text-base flex items-center gap-2">
          <Receipt className="w-4 h-4 text-rose-" />
          <span>{t('dashboard.recentBillsTitle')}</span>
        </CardTitle>
        <Link
          href="/payments"
          className="text-xs font-semibold text-rose- dark:text-rose- hover:underline"
        >
          {t('common.viewAll')}
        </Link>
      </CardHeader>

      <CardContent className="p-5 pt-1 flex-1 flex flex-col justify-between">
        <div className="divide-y divide-slate-100 dark:divide-border/40">
          {displayBills.map((bill) => {
            const isPaid = bill.status === 'PAID';

            return (
              <div
                key={bill.id}
                className="py-2.5 sm:py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                {/* Left: Avatar + Name + Kost */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full ${bill.avatarBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                  >
                    {bill.initial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-foreground text-xs sm:text-sm truncate">
                      {bill.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-muted-foreground truncate">
                      {bill.kost}
                    </p>
                  </div>
                </div>

                {/* Right: Amount + Status Badge */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900 dark:text-foreground text-xs sm:text-sm">
                    {formatCurrency(bill.amount)}
                  </p>
                  <div className="mt-0.5">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>{bill.dateLabel}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 px-2 py-0.5 rounded-full">
                        {bill.dateLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
