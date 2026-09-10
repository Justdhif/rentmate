'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api } from '@/lib/api';
import {
  Building2,
  DoorClosed,
  Wallet,
  Wrench,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface OverviewStats {
  propertiesCount: number;
  roomsCount: number;
  occupiedRoomsCount: number;
  occupancyRate: number;
  pendingMaintenanceCount: number;
  monthlyRevenue: number;
  totalCollected: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [recentMaintenance, setRecentMaintenance] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [overviewRes, propsRes, maintRes, payRes, insightsRes] =
          await Promise.allSettled([
            api.get('/analytics/overview'),
            api.get('/properties'),
            api.get('/maintenance'),
            api.get('/payments'),
            api.get('/ai/insights'),
          ]);

        if (overviewRes.status === 'fulfilled' && overviewRes.value.success) {
          setStats(overviewRes.value.data);
        }
        if (propsRes.status === 'fulfilled' && propsRes.value.success) {
          setProperties(propsRes.value.data || []);
        }
        if (maintRes.status === 'fulfilled' && maintRes.value.success) {
          setRecentMaintenance((maintRes.value.data || []).slice(0, 5));
        }
        if (payRes.status === 'fulfilled' && payRes.value.success) {
          setRecentPayments((payRes.value.data || []).slice(0, 5));
        }
        if (insightsRes.status === 'fulfilled' && insightsRes.value.success) {
          setAiInsights(insightsRes.value.data?.insights || []);
        }
      } catch (err) {
        console.error('Failed loading dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <AppLayout
      title="Dashboard Ringkasan"
      subtitle="Selamat datang di RentMate! Pantau seluruh kinerja properti Anda."
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Okupansi Kamar
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <DoorClosed className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {stats?.occupiedRoomsCount ?? 0}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                / {stats?.roomsCount ?? 0} Kamar
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="w-full bg-muted rounded-full h-2 mr-3 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats?.occupancyRate ?? 0, 100)}%` }}
                />
              </div>
              <span className="font-semibold text-primary shrink-0">
                {stats?.occupancyRate ?? 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Estimasi Omset / Bln
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats?.monthlyRevenue ?? 0)}
            </div>
            <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> Aktif
              </span>
              dari kamar tersewa
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Uang Masuk
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats?.totalCollected ?? 0)}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Terverifikasi lunas (Midtrans & Tunai)
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Perbaikan Aktif
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {stats?.pendingMaintenanceCount ?? 0}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                Tiket Tertunda
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Perlu ditugaskan ke teknisi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-3xl text-white shadow-lg shadow-indigo-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>RentMate AI Intelligence Insight</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            {aiInsights.length > 0
              ? aiInsights[0]?.title || 'Rekomendasi Optimalisasi Kost'
              : 'Asisten AI Siap Menganalisis Kinerja Kost Anda'}
          </h2>
          <p className="text-xs text-indigo-200/90 leading-relaxed">
            {aiInsights.length > 0
              ? aiInsights[0]?.description ||
                'Analisis pintar mengenai kamar kosong, perkiraan tagihan, dan prioritas perbaikan fasilitas.'
              : 'Gunakan AI Assistant untuk menanyakan seputar perbaikan, laporan keuangan, atau draft pesan pengingat sewa.'}
          </p>
        </div>
        <Button
          asChild
          variant="secondary"
          className="shrink-0 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs shadow-sm rounded-xl"
        >
          <Link href="/ai-assistant" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Buka AI Assistant</span>
          </Link>
        </Button>
      </div>

      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm font-bold">
                Tiket Maintenance Terbaru
              </CardTitle>
            </div>
            <Button asChild variant="link" size="sm" className="text-xs font-semibold p-0">
              <Link href="/maintenance">Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentMaintenance.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                Tidak ada perbaikan tertunda. Semua fasilitas aman!
              </div>
            ) : (
              <div className="space-y-3">
                {recentMaintenance.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between hover:bg-muted/70 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground line-clamp-1">
                          {m.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Kamar {m.room?.roomNumber || '-'} • Kategori: {m.category || 'GENERAL'}
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm font-bold">
                Riwayat Pembayaran Terbaru
              </CardTitle>
            </div>
            <Button asChild variant="link" size="sm" className="text-xs font-semibold p-0">
              <Link href="/payments">Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs">
                <Clock className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                Belum ada riwayat transaksi pembayaran.
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between hover:bg-muted/70 transition"
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {p.invoice?.invoiceNumber || p.orderId}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {p.paymentMethod || 'SNAP_MIDTRANS'} • {formatCurrency(Number(p.amount))}
                      </p>
                    </div>
                    <Badge size="sm">{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Properties Summary Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold">Properti Kost Anda</CardTitle>
          </div>
          <Button asChild variant="link" size="sm" className="text-xs font-semibold p-0">
            <Link href="/properties">Kelola Properti</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-xs">
              <p>Anda belum menambahkan unit properti kost.</p>
              <Button asChild className="mt-3">
                <Link href="/properties">+ Tambah Properti Pertama</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="p-4 rounded-2xl border border-border hover:border-primary/40 transition bg-card group hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition">
                        {prop.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {prop.address}, {prop.city}
                      </p>
                    </div>
                    <Badge variant="secondary" className="uppercase text-[10px]">
                      {prop.type || 'CAMPUR'}
                    </Badge>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>{prop.rooms?.length ?? 0} Kamar Terdaftar</span>
                    <Link
                      href={`/rooms?propertyId=${prop.id}`}
                      className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Lihat Kamar <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
