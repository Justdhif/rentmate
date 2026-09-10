'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
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
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Okupansi Kamar
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DoorClosed className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {stats?.occupiedRoomsCount ?? 0}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              / {stats?.roomsCount ?? 0} Kamar
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="w-full bg-gray-100 rounded-full h-2 mr-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats?.occupancyRate ?? 0, 100)}%` }}
              />
            </div>
            <span className="font-semibold text-indigo-600 shrink-0">
              {stats?.occupancyRate ?? 0}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Estimasi Omset / Bln
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats?.monthlyRevenue ?? 0)}
            </span>
          </div>
          <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> Aktif
            </span>
            dari kamar tersewa
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Uang Masuk
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats?.totalCollected ?? 0)}
            </span>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Terverifikasi lunas (Midtrans & Tunai)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Perbaikan Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {stats?.pendingMaintenanceCount ?? 0}
            </span>
            <span className="text-xs text-amber-600 font-semibold">
              Tiket Tertunda
            </span>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Perlu ditugaskan ke teknisi
          </p>
        </div>
      </div>

      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-3xl text-white shadow-lg shadow-indigo-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-medium text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>RentMate AI Intelligence Insight</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight">
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
        <Link
          href="/ai-assistant"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-semibold text-xs hover:bg-indigo-50 transition shadow-sm flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Buka AI Assistant</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">
                Tiket Maintenance Terbaru
              </h3>
            </div>
            <Link
              href="/maintenance"
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          {recentMaintenance.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              Tidak ada perbaikan tertunda. Semua fasilitas aman!
            </div>
          ) : (
            <div className="space-y-3">
              {recentMaintenance.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                        {m.title}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Kamar {m.room?.roomNumber || '-'} • Kategori: {m.category || 'GENERAL'}
                      </p>
                    </div>
                  </div>
                  <Badge size="sm">{m.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">
                Riwayat Pembayaran Terbaru
              </h3>
            </div>
            <Link
              href="/payments"
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              Belum ada riwayat transaksi pembayaran.
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      {p.invoice?.invoiceNumber || p.orderId}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {p.paymentMethod || 'SNAP_MIDTRANS'} • {formatCurrency(Number(p.amount))}
                    </p>
                  </div>
                  <Badge size="sm">{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Properti Kost Anda</h3>
          </div>
          <Link
            href="/properties"
            className="text-xs text-indigo-600 font-semibold hover:underline"
          >
            Kelola Properti
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-xs">
            <p>Anda belum menambahkan unit properti kost.</p>
            <Link
              href="/properties"
              className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
            >
              + Tambah Properti Pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 transition bg-white group hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition">
                      {prop.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {prop.address}, {prop.city}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-semibold text-gray-600 uppercase">
                    {prop.type || 'CAMPUR'}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>{prop.rooms?.length ?? 0} Kamar Terdaftar</span>
                  <Link
                    href={`/rooms?propertyId=${prop.id}`}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Lihat Kamar &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
