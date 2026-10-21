'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/custom-ui/layout/AppLayout';
import { PageHeader } from '@/components/custom-ui/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Wallet,
  CalendarCheck,
  Users,
  AlertCircle,
  Calendar,
  Layers,
  Building2,
  ShieldCheck,
  Clock,
  Download,
  TrendingUp,
  TrendingDown,
  Receipt,
  UserPlus,
  Wrench,
  DoorOpen,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

// Mini Sparkline Component using Recharts AreaChart
const MiniSparkline: React.FC<{
  data: number[];
  color: string;
  gradientId: string;
}> = ({ data, color, gradientId }) => {
  if (!data || data.length === 0) return null;
  const chartData = data.map((val, idx) => ({ index: idx, value: val }));

  return (
    <div className="w-full h-9 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AnalyticsView: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComprehensiveData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/analytics/comprehensive');
      if (res?.success && res.data) {
        setData(res.data);
      } else {
        // Fallback to overview if comprehensive isn't returned
        const overviewRes = await api.get('/analytics/overview');
        if (overviewRes?.success && overviewRes.data) {
          setData(overviewRes.data);
        }
      }
    } catch (err: any) {
      console.warn('Gagal memuat data analitik komprehensif:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchComprehensiveData();
    } else if (!isAuthLoading && !user) {
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  // Number formatting helpers
  const formatCurrency = (val: number = 0) =>
    `Rp ${Math.round(val).toLocaleString('id-ID')}`;

  const formatShortCurrency = (val: number = 0) => {
    if (val >= 1000000) {
      const millions = val / 1000000;
      return `Rp ${millions % 1 === 0 ? millions : millions.toFixed(1)}jt`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  // Safe data access using real backend values with zero fallbacks
  const summary = data?.summaryCards || {
    totalRevenue: {
      value: 0,
      changePercent: 0,
      isPositive: true,
      sparkline: [],
    },
    totalPayments: {
      paidCount: 0,
      totalCount: 0,
      changePercent: 0,
      isPositive: true,
      sparkline: [],
    },
    activeTenants: {
      count: 0,
      changePercent: 0,
      isPositive: true,
      sparkline: [],
    },
    vacantRooms: {
      count: 0,
      changePercent: 0,
      isPositive: false,
      sparkline: [],
    },
  };

  const revenueTrendData = data?.revenueTrend || [];

  const categoryData = data?.revenueByCategory?.categories || [];

  const totalCategoryRevenue =
    data?.revenueByCategory?.total ||
    categoryData.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) ||
    0;

  const cashFlowData = data?.cashFlowComparison || [];

  const paymentStatus = data?.paymentStatus || {
    totalPayments: 0,
    paidCount: 0,
    paidPercent: 0,
    pendingCount: 0,
    pendingPercent: 0,
    overdueCount: 0,
    overduePercent: 0,
  };

  const paymentPieData = [
    { name: 'Lunas', value: paymentStatus.paidCount, color: '#10B981' },
    { name: 'Pending', value: paymentStatus.pendingCount, color: '#F59E0B' },
    { name: 'Terlambat', value: paymentStatus.overdueCount || 0, color: '#EF4444' },
  ].filter((p) => p.value > 0);

  const activities = data?.recentActivities || [];

  // Export report to CSV
  const handleDownloadReport = () => {
    try {
      const csvRows = [
        ['Laporan Analitik RentMate'],
        ['Tanggal Unduh', new Date().toLocaleDateString('id-ID')],
        [],
        ['Ringkasan Metrik'],
        ['Total Pendapatan', formatCurrency(summary.totalRevenue.value)],
        ['Total Pembayaran Lunas', `${summary.totalPayments.paidCount} dari ${summary.totalPayments.totalCount}`],
        ['Jumlah Tenant Aktif', summary.activeTenants.count],
        ['Kamar Kosong', summary.vacantRooms.count],
        [],
        ['Distribusi Pendapatan per Kategori'],
        ['Kategori', 'Persentase', 'Nominal'],
        ...categoryData.map((c: any) => [c.name, `${c.percentage}%`, formatCurrency(c.amount)]),
        [],
        ['Aktivitas Terbaru'],
        ['Waktu', 'Aktivitas', 'Detail', 'Status'],
        ...activities.map((a: any) => [a.time, a.title, a.detail, a.status]),
      ];

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        csvRows.map((e) => e.join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Laporan_Analitik_RentMate_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Laporan analitik berhasil diunduh dalam format CSV!');
    } catch (err: any) {
      toast.error('Gagal mengunduh laporan: ' + err?.message);
    }
  };

  // Activity icon helper
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
        );
      case 'TENANT':
        return (
          <div className="w-8 h-8 rounded-lg bg-rose- dark:bg-rose-/40 text-rose- dark:text-rose- flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
        );
      case 'MAINTENANCE':
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
        );
      case 'ROOM':
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <DoorOpen className="w-4 h-4" />
          </div>
        );
    }
  };

  const getStatusBadge = (status: string, statusType: string) => {
    if (statusType === 'success' || status === 'Lunas' || status === 'Selesai') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
          {status}
        </span>
      );
    }
    if (statusType === 'info' || status === 'Aktif') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose- text-rose- dark:bg-rose-/40 dark:text-rose- border border-rose-/60 dark:border-rose-/40">
          {status}
        </span>
      );
    }
    if (statusType === 'warning' || status === 'Tersedia' || status === 'Pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {status}
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        <PageHeader
          title={t('analytics.pageTitle', { defaultValue: 'Statistik & Analisis Bisnis' })}
          description={t('analytics.pageDesc', {
            defaultValue: 'Visualisasi data performa omset, tren tingkat hunian, dan evaluasi operasional kost.',
          })}
          actions={
            <Button
              onClick={handleDownloadReport}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 dark:border-border text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Laporan
            </Button>
          }
        />

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-3 border-rose- border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground animate-pulse">Memuat analitik properti...</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* TOP 4 METRIC CARDS WITH SPARKLINES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: Total Pendapatan */}
              <Card className="rounded-2xl border-slate-100 dark:border-border shadow-xs bg-card hover:shadow-md transition-shadow overflow-hidden p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-/10 text-rose- dark:bg-rose-/20 dark:text-rose- flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Total Pendapatan
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {formatCurrency(summary.totalRevenue.value)}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{Math.abs(summary.totalRevenue.changePercent)}% dari bulan lalu</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2 -mx-2 -mb-2">
                  <MiniSparkline
                    data={summary.totalRevenue.sparkline}
                    color="#3B82F6"
                    gradientId="sparkline-revenue"
                  />
                </div>
              </Card>

              {/* Card 2: Total Pembayaran */}
              <Card className="rounded-2xl border-slate-100 dark:border-border shadow-xs bg-card hover:shadow-md transition-shadow overflow-hidden p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Total Pembayaran
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {summary.totalPayments.paidCount} dari {summary.totalPayments.totalCount}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{Math.abs(summary.totalPayments.changePercent)}% dari bulan lalu</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2 -mx-2 -mb-2">
                  <MiniSparkline
                    data={summary.totalPayments.sparkline}
                    color="#10B981"
                    gradientId="sparkline-payments"
                  />
                </div>
              </Card>

              {/* Card 3: Jumlah Tenant Aktif */}
              <Card className="rounded-2xl border-slate-100 dark:border-border shadow-xs bg-card hover:shadow-md transition-shadow overflow-hidden p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-/10 text-rose- dark:bg-rose-/20 dark:text-rose- flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Jumlah Tenant Aktif
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {summary.activeTenants.count}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{Math.abs(summary.activeTenants.changePercent)}% dari bulan lalu</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2 -mx-2 -mb-2">
                  <MiniSparkline
                    data={summary.activeTenants.sparkline}
                    color="#8B5CF6"
                    gradientId="sparkline-tenants"
                  />
                </div>
              </Card>

              {/* Card 4: Kamar Kosong */}
              <Card className="rounded-2xl border-slate-100 dark:border-border shadow-xs bg-card hover:shadow-md transition-shadow overflow-hidden p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Kamar Kosong
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {summary.vacantRooms.count}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>{Math.abs(summary.vacantRooms.changePercent)}% dari bulan lalu</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2 -mx-2 -mb-2">
                  <MiniSparkline
                    data={summary.vacantRooms.sparkline}
                    color="#F59E0B"
                    gradientId="sparkline-vacant"
                  />
                </div>
              </Card>
            </div>

            {/* MAIN ANALYTICS CONTENT (FULL WIDTH) */}
            <div className="space-y-6">
                {/* ROW 1: TREN PENDAPATAN & PENDAPATAN PER KATEGORI */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tren Pendapatan Chart */}
                  <Card className="rounded-2xl border-slate-100 dark:border-border shadow-xs bg-card flex flex-col p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                        Tren Pendapatan
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Grafik pendapatan per minggu dalam 1 bulan terakhir.
                    </p>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={revenueTrendData}
                          margin={{ top: 15, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="revenueTrendGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatShortCurrency}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const pData = payload[0].payload;
                                return (
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-border rounded-xl shadow-lg px-3 py-2 text-center text-xs">
                                    <div className="text-slate-400 font-medium">
                                      {pData.date || pData.label}
                                    </div>
                                    <div className="text-rose- dark:text-rose- font-bold text-sm mt-0.5">
                                      {formatCurrency(Number(pData.revenue))}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3B82F6"
                            strokeWidth={2.5}
                            fill="url(#revenueTrendGrad)"
                            dot={{
                              r: 4,
                              fill: '#3B82F6',
                              stroke: '#ffffff',
                              strokeWidth: 2,
                            }}
                            activeDot={{
                              r: 6,
                              fill: '#3B82F6',
                              stroke: '#ffffff',
                              strokeWidth: 2.5,
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Pendapatan per Kategori (Donut Chart) */}
                  <Card className="rounded-2xl border-slate-100 dark:border-border shadow-xs bg-card flex flex-col p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                        Pendapatan per Kategori
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      Distribusi pendapatan berdasarkan jenis kamar.
                    </p>

                    <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      {/* Donut with center text */}
                      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              dataKey="amount"
                              nameKey="name"
                              innerRadius={52}
                              outerRadius={75}
                              paddingAngle={3}
                              stroke="none"
                            >
                              {categoryData.map((entry: any, index: number) => (
                                <Cell key={`cat-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: any) => [formatCurrency(Number(value)), 'Pendapatan']}
                              contentStyle={{
                                backgroundColor: 'var(--card)',
                                borderColor: 'var(--border)',
                                borderRadius: '12px',
                                fontSize: '12px',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                          <span className="text-[11px] text-slate-400 font-medium">Total</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                            {formatCurrency(totalCategoryRevenue)}
                          </span>
                        </div>
                      </div>

                      {/* Legend and category breakdown list */}
                      <div className="flex-1 w-full space-y-2.5">
                        {categoryData.map((cat: any, index: number) => (
                          <div
                            key={`legend-${index}`}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-[80px]">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="text-slate-600 dark:text-slate-300 font-medium">
                                {cat.name}
                              </span>
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              {cat.percentage}%
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 font-medium text-right min-w-[85px]">
                              {formatCurrency(cat.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* ROW 2: PEMASUKAN VS PENGELUARAN & STATUS PEMBAYARAN */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pemasukan vs Pengeluaran Chart */}
                  <Card className="rounded-2xl border-slate-100 dark:border-border shadow-xs bg-card flex flex-col p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                            Pemasukan vs Pengeluaran
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400">
                          Perbandingan pemasukan dan pengeluaran dalam 1 bulan terakhir.
                        </p>
                      </div>

                      {/* Chart Legend Top Right */}
                      <div className="flex items-center gap-3 shrink-0 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-" />
                          <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                            Pemasukan
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-" />
                          <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                            Pengeluaran
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-64 w-full mt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={cashFlowData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                          barGap={4}
                        >
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatShortCurrency}
                          />
                          <Tooltip
                            formatter={(val: any, name: any) => [
                              formatCurrency(Number(val)),
                              name === 'income' ? 'Pemasukan' : 'Pengeluaran',
                            ]}
                            contentStyle={{
                              backgroundColor: 'var(--card)',
                              borderColor: 'var(--border)',
                              borderRadius: '12px',
                              fontSize: '12px',
                            }}
                          />
                          <Bar
                            dataKey="income"
                            fill="#3B82F6"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={16}
                          />
                          <Bar
                            dataKey="expense"
                            fill="#A78BFA"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={16}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Status Pembayaran Gauge Chart */}
                  <Card className="rounded-2xl border-slate-100 dark:border-border shadow-xs bg-card flex flex-col p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                        Status Pembayaran
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      Persentase status pembayaran tenant.
                    </p>

                    <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      {/* Donut Gauge */}
                      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={paymentPieData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={52}
                              outerRadius={75}
                              paddingAngle={4}
                              stroke="none"
                            >
                              {paymentPieData.map((entry: any, index: number) => (
                                <Cell key={`pay-cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: any) => [`${value} Transaksi`, 'Jumlah']}
                              contentStyle={{
                                backgroundColor: 'var(--card)',
                                borderColor: 'var(--border)',
                                borderRadius: '12px',
                                fontSize: '12px',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                          <span className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                            {paymentStatus.paidCount} / {paymentStatus.totalPayments}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Pembayaran</span>
                        </div>
                      </div>

                      {/* Status breakdown list */}
                      <div className="flex-1 w-full space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              Lunas
                            </span>
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {paymentStatus.paidCount}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white min-w-[35px] text-right">
                            {paymentStatus.paidPercent}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              Pending
                            </span>
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {paymentStatus.pendingCount}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white min-w-[35px] text-right">
                            {paymentStatus.pendingPercent}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              Terlambat
                            </span>
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {paymentStatus.overdueCount}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white min-w-[35px] text-right">
                            {paymentStatus.overduePercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* ROW 3: AKTIVITAS TERBARU (RECENT ACTIVITIES TABLE) */}
                <Card className="rounded-2xl border-slate-100 dark:border-border shadow-xs bg-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                        Aktivitas Terbaru
                      </h3>
                    </div>
                    <Link
                      href="/payments"
                      className="text-xs font-semibold text-rose- dark:text-rose- hover:underline inline-flex items-center gap-1"
                    >
                      Lihat Semua
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-border/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3 font-semibold pl-2">Waktu</th>
                          <th className="pb-3 font-semibold">Aktivitas</th>
                          <th className="pb-3 font-semibold">Detail</th>
                          <th className="pb-3 font-semibold text-right pr-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/80 dark:divide-border/40 text-xs">
                        {activities.map((item: any, idx: number) => (
                          <tr
                            key={`act-${idx}`}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors"
                          >
                            <td className="py-3.5 pl-2 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                              {item.time}
                            </td>
                            <td className="py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                {getActivityIcon(item.type)}
                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                  {item.title}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 text-slate-600 dark:text-slate-300">
                              {item.detail}
                            </td>
                            <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                              {getStatusBadge(item.status, item.statusType)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
