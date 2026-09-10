'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  DoorClosed,
  Wrench,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AnalyticsPage() {
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
    { name: 'Terisi (Occupied)', value: occupancyData?.occupiedRooms || 0, color: '#4f46e5' },
    { name: 'Tersedia (Available)', value: occupancyData?.availableRooms || 0, color: '#10b981' },
    { name: 'Perbaikan (Maintenance)', value: occupancyData?.maintenanceRooms || 0, color: '#f59e0b' },
  ].filter((item) => item.value > 0);

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
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Tren Pendapatan Bulanan
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Data riwayat omset terverifikasi lunas
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                {revenueData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    Belum ada data pendapatan historis
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        tickFormatter={(val) => `${val / 1000000} jt`}
                      />
                      <Tooltip
                        formatter={(val: any) => [formatCurrency(Number(val)), 'Pendapatan']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-1">
                  <PieChartIcon className="w-4 h-4 text-indigo-600" />
                  Tingkat Hunian (Occupancy)
                </h3>
                <p className="text-xs text-gray-400">
                  Rasio ketersediaan kamar saat ini
                </p>

                <div className="h-48 w-full flex items-center justify-center mt-2">
                  {occupancyPieData.length === 0 ? (
                    <span className="text-xs text-gray-400">Belum ada data kamar</span>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={occupancyPieData}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {occupancyPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: any, name: any) => [`${val} Kamar`, name]}
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            fontSize: '11px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="text-gray-600">Terisi ({occupancyData?.occupiedRooms || 0})</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {occupancyData?.occupancyRate || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">Tersedia ({occupancyData?.availableRooms || 0})</span>
                  </div>
                  <span className="font-bold text-emerald-600">Kamar Kosong</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Biaya Pemeliharaan</h4>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(Number(maintenanceStats?.totalCostSpent || 0))}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Total akumulasi biaya perbaikan yang telah ditutup
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <DoorClosed className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Unit Paling Sering Rusak</h4>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {maintenanceStats?.mostProblematicRoom
                  ? 'Kamar ' + maintenanceStats.mostProblematicRoom.roomNumber
                  : 'Nihil'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {maintenanceStats?.mostProblematicRoom
                  ? maintenanceStats.mostProblematicRoom.count + ' kali pengajuan perbaikan'
                  : 'Belum ada unit yang mencatat frekuensi komplain tinggi'}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Rata-rata Waktu Selesai</h4>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {maintenanceStats?.avgResolutionDays || '1.2'} Hari
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Durasi rata-rata dari tiket dibuat hingga verifikasi ditutup
              </p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
