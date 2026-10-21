'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Headphones, MessageCircle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useTranslation } from '@/contexts/LanguageContext';
import { Payment } from './PaymentTable';

interface PaymentRightSidebarProps {
  payments: Payment[];
  formatCurrency: (val?: number) => string;
  onViewAll?: () => void;
}

export const PaymentRightSidebar: React.FC<PaymentRightSidebarProps> = ({
  payments,
  formatCurrency,
  onViewAll,
}) => {
  const { t, locale } = useTranslation();

  const total = payments.length;
  const paidCount = payments.filter((p) => p.status === 'PAID').length;
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
  const otherCount = total - paidCount - pendingCount; // OVERDUE, FAILED, EXPIRED, CANCELLED

  // Recharts chart data
  const chartData = [
    { name: t('payments.statusPaid', { defaultValue: 'Lunas' }), value: paidCount, color: '#10B981' },
    { name: t('payments.statusPending', { defaultValue: 'Menunggu' }), value: pendingCount, color: '#FBBF24' },
    { name: t('payments.statusOther', { defaultValue: 'Lainnya / Gagal' }), value: otherCount, color: '#BE123C' },
  ].filter((item) => item.value > 0);

  const hasData = chartData.length > 0;
  const fallbackData = [{ name: 'Empty', value: 1, color: '#E2E8F0' }];

  // Recent payments (top 4 latest)
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Card 1: Ringkasan Pembayaran (Recharts Donut Chart) */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-2xs overflow-hidden">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="font-bold text-slate-900 dark:text-foreground text-sm sm:text-base flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <span>{t('payments.summaryTitle', { defaultValue: 'Ringkasan Pembayaran' })}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 pt-2">
          <div className="flex flex-col items-center">
            {/* Donut Chart (Recharts) */}
            <div className="relative w-36 h-36 flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hasData ? chartData : fallbackData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={56}
                    paddingAngle={hasData && chartData.length > 1 ? 3 : 0}
                    dataKey="value"
                    stroke="none"
                  >
                    {(hasData ? chartData : fallbackData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {hasData && (
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} transaksi`, name]}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '10px',
                        fontSize: '11px',
                        padding: '4px 8px',
                      }}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                  {total}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-muted-foreground font-semibold mt-1">
                  {t('payments.totalTransactions', { defaultValue: 'Total Transaksi' })}
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className="w-full space-y-2.5 pt-3 border-t border-slate-100 dark:border-border/60 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {t('payments.statusPaid', { defaultValue: 'Lunas' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 dark:text-foreground">
                    {paidCount}
                  </span>
                  <span className="text-slate-400 dark:text-muted-foreground text-[11px] font-medium w-8 text-right">
                    {total > 0 ? Math.round((paidCount / total) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {t('payments.statusPending', { defaultValue: 'Menunggu' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 dark:text-foreground">
                    {pendingCount}
                  </span>
                  <span className="text-slate-400 dark:text-muted-foreground text-[11px] font-medium w-8 text-right">
                    {total > 0 ? Math.round((pendingCount / total) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {t('payments.statusFailed', { defaultValue: 'Gagal / Lainnya' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 dark:text-foreground">
                    {otherCount}
                  </span>
                  <span className="text-slate-400 dark:text-muted-foreground text-[11px] font-medium w-8 text-right">
                    {total > 0 ? Math.round((otherCount / total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Pembayaran Terbaru (Styled like Dashboard Recent Bills) */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-2xs overflow-hidden">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="font-bold text-slate-900 dark:text-foreground text-sm sm:text-base flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <span>{t('payments.recentPaymentsTitle', { defaultValue: 'Pembayaran Terbaru' })}</span>
          </CardTitle>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              {t('payments.viewAll', { defaultValue: 'Lihat Semua' })}
            </button>
          )}
        </CardHeader>

        <CardContent className="p-5 pt-0">
          {recentPayments.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              {t('payments.emptyTitle', { defaultValue: 'Belum Ada Tagihan / Pembayaran' })}
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-border/40">
              {recentPayments.map((p, idx) => {
                const formattedDate = new Date(p.createdAt).toLocaleDateString(
                  locale === 'en' ? 'en-US' : 'id-ID',
                  {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }
                );

                const avatarBgColors = [
                  'bg-secondary text-secondary-foreground',
                  'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
                  'bg-secondary text-secondary-foreground',
                  'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
                ];
                const avatarBg = avatarBgColors[idx % avatarBgColors.length];

                const tenantName =
                  p.tenant?.profile?.fullName ||
                  p.tenant?.fullName ||
                  p.tenant?.email?.split('@')[0] ||
                  p.tenantName ||
                  'Penyewa';

                const isPaid = p.status === 'PAID';

                return (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 first:pt-1 last:pb-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-full ${avatarBg} font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs`}>
                        {tenantName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-foreground line-clamp-1">
                          {tenantName}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-muted-foreground mt-0.5">
                          {formattedDate} • {formatCurrency(Number(p.amount))}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                        isPaid
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                          : p.status === 'PENDING'
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                          : 'bg-primary50 dark:bg-primary950/50 text-primary600 dark:text-primary400'
                      }`}
                    >
                      {isPaid
                        ? t('payments.statusPaid', { defaultValue: 'Lunas' })
                        : p.status === 'PENDING'
                        ? t('payments.statusPending', { defaultValue: 'Menunggu' })
                        : t('payments.statusFailed', { defaultValue: 'Gagal' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 3: Butuh bantuan pembayaran? (Consistent with Dashboard Blue KPI Tint) */}
      <div className="rounded-2xl p-5 border border-border bg-secondary/50 dark:bg-secondary/20 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0 shadow-2xs">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-foreground text-xs sm:text-sm">
              {t('payments.helpTitle', { defaultValue: 'Butuh bantuan pembayaran?' })}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-1 leading-relaxed">
              {t('payments.helpSubtitle', {
                defaultValue: 'Integrasi otomatis Midtrans Snap 24/7',
              })}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Button
            asChild
            variant="outline"
            className="w-full h-9 rounded-xl bg-white dark:bg-card border-border dark:border-border text-primary hover:bg-primary/90 hover:text-primary text-xs font-semibold shadow-2xs cursor-pointer gap-2"
          >
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20RentMate,%20saya%20butuh%20bantuan%20terkait%20sistem%20pembayaran%20sewa."
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{t('payments.contactSupport', { defaultValue: 'Hubungi Support' })}</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
