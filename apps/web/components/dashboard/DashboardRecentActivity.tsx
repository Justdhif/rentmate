'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Wallet, CheckCircle2, Clock } from 'lucide-react';

interface DashboardRecentActivityProps {
  recentMaintenance: any[];
  recentPayments: any[];
  formatCurrency: (val?: number) => string;
}

export const DashboardRecentActivity: React.FC<DashboardRecentActivityProps> = ({
  recentMaintenance,
  recentPayments,
  formatCurrency,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Maintenance Tickets */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground">
              Tiket Maintenance
            </CardTitle>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
          >
            <Link href="/maintenance">Lihat Semua</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {recentMaintenance.length === 0 ? (
            <div className="py-10 text-center text-slate-500 dark:text-muted-foreground text-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              Tidak ada perbaikan tertunda. Semua fasilitas aman!
            </div>
          ) : (
            <div className="space-y-3">
              {recentMaintenance.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-muted/20 border border-slate-100 dark:border-border/40 flex items-center justify-between hover:bg-slate-100/70 dark:hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 shrink-0 ring-4 ring-amber-500/20" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground line-clamp-1">
                        {m.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
                        Kamar {m.room?.roomNumber || '-'}  Kategori: {m.category || 'GENERAL'}
                      </p>
                    </div>
                  </div>
                  <Badge size="sm">{m.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground">
              Riwayat Pembayaran
            </CardTitle>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
          >
            <Link href="/payments">Lihat Semua</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {recentPayments.length === 0 ? (
            <div className="py-10 text-center text-slate-500 dark:text-muted-foreground text-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-muted/40 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-slate-400" />
              </div>
              Belum ada riwayat transaksi pembayaran.
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-muted/20 border border-slate-100 dark:border-border/40 flex items-center justify-between hover:bg-slate-100/70 dark:hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 ring-4 ring-emerald-500/20" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-foreground">
                        {p.invoice?.invoiceNumber || p.orderId}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
                        {p.paymentMethod || 'SNAP_MIDTRANS'}  {formatCurrency(Number(p.amount))}
                      </p>
                    </div>
                  </div>
                  <Badge size="sm">{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
