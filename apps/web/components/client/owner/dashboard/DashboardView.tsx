'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/custom-ui/layout/AppLayout';
import { api } from '@/lib/api';
import { Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { OverviewStats } from './DashboardStats';
import { DashboardKpiCards } from './DashboardKpiCards';
import { DashboardRevenueChart } from './DashboardRevenueChart';
import { DashboardRoomStatusDonut } from './DashboardRoomStatusDonut';
import { DashboardRoomsTable } from './DashboardRoomsTable';
import { DashboardRecentBills } from './DashboardRecentBills';
import { DashboardRightKostList } from './DashboardRightKostList';
import { PageBreadcrumb } from '@/components/custom-ui/layout/PageBreadcrumb';

export const DashboardView: React.FC = () => {
  const { locale, t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [overviewRes, revenueRes, propsRes, roomsRes, payRes] =
          await Promise.allSettled([
            api.get('/analytics/overview'),
            api.get('/analytics/revenue?months=6'),
            api.get('/properties'),
            api.get('/rooms'),
            api.get('/payments'),
          ]);

        if (overviewRes.status === 'fulfilled' && overviewRes.value?.success) {
          const raw = overviewRes.value.data || {};
          const mappedStats: OverviewStats = {
            propertiesCount: raw.propertiesCount ?? raw.totalProperties ?? 0,
            roomsCount: raw.roomsCount ?? raw.rooms?.total ?? 0,
            occupiedRoomsCount: raw.occupiedRoomsCount ?? raw.rooms?.occupied ?? 0,
            occupancyRate:
              typeof raw.occupancyRate === 'number'
                ? raw.occupancyRate
                : parseFloat(raw.rooms?.occupancyRate || '0') || 0,
            pendingMaintenanceCount:
              raw.pendingMaintenanceCount ??
              ((raw.maintenance?.openCount || 0) + (raw.maintenance?.inProgressCount || 0)),
            monthlyRevenue: raw.monthlyRevenue ?? raw.revenue?.monthlyRevenue ?? 0,
            totalCollected:
              raw.totalCollected ?? raw.revenue?.totalCollected ?? raw.revenue?.monthlyRevenue ?? 0,
          };
          (mappedStats as any).outstanding = raw.revenue?.outstanding || 0;
          (mappedStats as any).pendingCount = raw.revenue?.pendingCount || 0;
          setStats(mappedStats);
        }

        if (revenueRes.status === 'fulfilled' && revenueRes.value?.success) {
          const revList =
            revenueRes.value.data?.monthlyRevenue ||
            revenueRes.value.data?.monthlyTrend ||
            [];
          setRevenueData(revList);
        }

        if (propsRes.status === 'fulfilled' && propsRes.value?.success) {
          setProperties(propsRes.value.data || []);
        }

        if (roomsRes.status === 'fulfilled' && roomsRes.value?.success) {
          setRooms(roomsRes.value.data || []);
        }

        if (payRes.status === 'fulfilled' && payRes.value?.success) {
          setRecentPayments(payRes.value.data || []);
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
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const todayFormatted = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const displayName =
    user?.profile?.fullName?.split(' ')[0] ||
    user?.profile?.username ||
    user?.email?.split('@')[0] ||
    'Pemilik Kos';

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        {/* Breadcrumb diatas header perpage */}
        <PageBreadcrumb className="mb-1" />

        {/* Top Header matching reference image */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight flex items-center gap-2">
              <span>{t('dashboard.welcomeGreeting', { name: displayName })}</span>
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-slate-500 dark:text-muted-foreground mt-1 text-sm">
              {t('dashboard.welcomeSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-border text-xs font-medium text-slate-600 dark:text-muted-foreground shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{todayFormatted}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Layout - items-stretch ensures right column matches left column total height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Main Column: KPIs, Charts, and Symmetrical Bottom Cards (~75% on desktop) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6 flex flex-col justify-between">
            {/* Top 4 KPI Cards */}
            <DashboardKpiCards stats={stats} formatCurrency={formatCurrency} />

            {/* Middle Row: Revenue Bar Chart & Room Status Donut Chart */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              <div className="md:col-span-7">
                <DashboardRevenueChart
                  revenueData={revenueData}
                  formatCurrency={formatCurrency}
                  properties={properties}
                />
              </div>
              <div className="md:col-span-5">
                <DashboardRoomStatusDonut
                  totalRooms={stats?.roomsCount || 12}
                  occupiedRooms={stats?.occupiedRoomsCount || 10}
                  availableRooms={Math.max(0, (stats?.roomsCount || 12) - (stats?.occupiedRoomsCount || 10))}
                />
              </div>
            </div>

            {/* Bottom Row: Symmetrical 50-50 Cards (Daftar Kamar List & Tagihan Terbaru List) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              <DashboardRoomsTable rooms={rooms} formatCurrency={formatCurrency} />
              <DashboardRecentBills
                recentPayments={recentPayments}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>

          {/* Right Column: HANYA List Kost Memanjang ke Bawah (Tanpa Activity Log) */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col h-full">
            <DashboardRightKostList properties={properties} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
