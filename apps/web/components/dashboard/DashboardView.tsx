'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api';
import { Calendar } from 'lucide-react';
import { DashboardStats, OverviewStats } from './DashboardStats';
import { DashboardAiInsights } from './DashboardAiInsights';
import { DashboardRecentActivity } from './DashboardRecentActivity';
import { DashboardProperties } from './DashboardProperties';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [recentMaintenance, setRecentMaintenance] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('Pagi');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Pagi');
    else if (hour < 15) setGreeting('Siang');
    else if (hour < 18) setGreeting('Sore');
    else setGreeting('Malam');

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

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const displayName = user?.profile?.username || user?.profile?.fullName;

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-7">
        <PageHeader
          title={`Selamat ${greeting}${displayName ? `, ${displayName}` : ''}!`}
          description="Berikut ringkasan kinerja dan operasional properti kost Anda hari ini."
          actions={
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-card border border-slate-200/80 dark:border-border text-xs font-medium text-slate-600 dark:text-muted-foreground shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{todayFormatted}</span>
            </div>
          }
        />

        {/* Metric Cards */}
        <DashboardStats stats={stats} formatCurrency={formatCurrency} />

        {/* AI Assistant Banner */}
        <DashboardAiInsights insights={aiInsights} />

        {/* Recent Activities */}
        <DashboardRecentActivity
          recentMaintenance={recentMaintenance}
          recentPayments={recentPayments}
          formatCurrency={formatCurrency}
        />

        {/* Properties Summary */}
        <DashboardProperties properties={properties} />
      </div>
    </AppLayout>
  );
};
