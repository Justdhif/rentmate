'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api';
import { RevenueChartCard } from './RevenueChartCard';
import { OccupancyPieCard } from './OccupancyPieCard';
import { OperationalStatsCard } from './OperationalStatsCard';

export const AnalyticsView: React.FC = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [occupancyData, setOccupancyData] = useState<any>(null);
  const [maintenanceStats, setMaintenanceStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const [revRes, occRes, maintRes] = await Promise.allSettled([
          api.get('/analytics/revenue?months=6'),
          api.get('/analytics/occupancy'),
          api.get('/analytics/maintenance'),
        ]);

        if (revRes.status === 'fulfilled' && revRes.value.success) {
          setRevenueData(revRes.value.data?.monthlyRevenue || []);
        }
        if (occRes.status === 'fulfilled' && occRes.value.success) {
          setOccupancyData(occRes.value.data);
        }
        if (maintRes.status === 'fulfilled' && maintRes.value.success) {
          setMaintenanceStats(maintRes.value.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const occupancyPieData = [
    { name: 'Terisi (Occupied)', value: occupancyData?.occupiedRooms || 0, color: '#6366f1' },
    { name: 'Tersedia (Available)', value: occupancyData?.availableRooms || 0, color: '#10b981' },
    {
      name: 'Perbaikan (Maintenance)',
      value: occupancyData?.maintenanceRooms || 0,
      color: '#f59e0b',
    },
  ].filter((item) => item.value > 0);

  const totalRooms =
    (occupancyData?.occupiedRooms || 0) +
    (occupancyData?.availableRooms || 0) +
    (occupancyData?.maintenanceRooms || 0);

  return (
    <AppLayout
      title="Statistik & Analisis Bisnis"
      subtitle="Visualisasi data performa omset, tren tingkat hunian, dan evaluasi operasional kost."
    >
      {isLoading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChartCard revenueData={revenueData} formatCurrency={formatCurrency} />
            <OccupancyPieCard
              occupancyData={occupancyData}
              occupancyPieData={occupancyPieData}
              totalRooms={totalRooms}
            />
          </div>

          <OperationalStatsCard
            occupancyData={occupancyData}
            maintenanceStats={maintenanceStats}
            formatCurrency={formatCurrency}
          />
        </div>
      )}
    </AppLayout>
  );
};
