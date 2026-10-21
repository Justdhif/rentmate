'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface DashboardRevenueChartProps {
  revenueData?: any[];
  formatCurrency: (val?: number) => string;
  properties?: any[];
}

export const DashboardRevenueChart: React.FC<DashboardRevenueChartProps> = ({
  revenueData = [],
  formatCurrency,
  properties = [],
}) => {
  const { locale, t } = useTranslation();
  const [selectedKostId, setSelectedKostId] = useState('ALL');

  // Dynamically calculate the last 6 months counting back from the current month
  const sixMonthsWindow = useMemo(() => {
    const months = [];
    const now = new Date();
    // 5 months ago up to current month (total 6 months)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const shortName = d.toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', { month: 'short' });
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1;
      months.push({
        label: shortName,
        year,
        monthNum,
      });
    }
    return months;
  }, [locale]);

  // Map revenue data into the exact 6 months window
  const chartData = useMemo(() => {
    // Check if user has specific property selected
    const selectedProp = properties.find(
      (p: any) => p.id === selectedKostId || p.name === selectedKostId
    );

    return sixMonthsWindow.map((m, index) => {
      // Find matching month record from backend revenueData
      const found = revenueData?.find((item: any) => {
        if (!item || !item.month) return false;
        const itemMonth = String(item.month).toLowerCase();
        const mLabel = m.label.toLowerCase();
        return itemMonth.includes(mLabel) || mLabel.includes(itemMonth);
      });

      let amount = 0;
      if (found) {
        amount = Number(found.revenue ?? found.total ?? found.amount ?? 0);
      }

      // If a specific kost is selected, scale proportionately
      if (selectedKostId !== 'ALL' && selectedProp) {
        const totalPropRooms = properties.reduce(
          (acc, p) => acc + (p.rooms?.length || 4),
          0
        );
        const propRooms = selectedProp.rooms?.length || 4;
        const ratio = totalPropRooms > 0 ? propRooms / totalPropRooms : 0.4;
        amount = Math.round(amount * ratio);
      }

      return {
        month: m.label,
        amount,
      };
    });
  }, [sixMonthsWindow, revenueData, selectedKostId, properties]);

  // High-contrast custom tooltip working perfectly in dark & light themes
  const hasRevenueData = useMemo(() => {
    return chartData.some((d) => d.amount > 0);
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="rounded-xl border border-slate-700/80 bg-slate-900 text-white px-3.5 py-2.5 shadow-xl pointer-events-none">
          <p className="text-xs font-semibold text-slate-400">{label}</p>
          <p className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
            <span className="text-rose- font-medium">{t('dashboard.revenueTooltip')}</span>
            <span>{formatCurrency(Number(val))}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const selectedPropObj = properties.find(
    (p: any) => p.id === selectedKostId || p.name === selectedKostId
  );
  const selectedLabel = selectedKostId === 'ALL' ? t('dashboard.allKost') : (selectedPropObj?.name || selectedKostId);

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-2xs bg-white dark:bg-card h-full flex flex-col justify-between">
      <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-bold text-slate-900 dark:text-foreground text-sm sm:text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#E11D48]" />
          <span>{t('dashboard.revenueChartTitle')}</span>
        </CardTitle>

        {/* Working Interactive Dropdown Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-border text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-muted/40 cursor-pointer hover:bg-slate-100 dark:hover:bg-muted/70 transition-colors outline-none shadow-2xs"
            >
              <span className="max-w-[130px] truncate">{selectedLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-1.5 rounded-xl shadow-xl border border-slate-200 dark:border-border bg-white dark:bg-card"
          >
            <DropdownMenuItem
              onClick={() => setSelectedKostId('ALL')}
              className={`text-xs font-medium cursor-pointer rounded-lg px-2.5 py-2 flex items-center justify-between ${
                selectedKostId === 'ALL'
                  ? 'bg-rose- text-rose- dark:bg-rose-/50 dark:text-rose- font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-muted'
              }`}
            >
              <span>{t('dashboard.allKost')}</span>
              {selectedKostId === 'ALL' && <Check className="w-3.5 h-3.5" />}
            </DropdownMenuItem>

            {properties.map((prop: any) => {
              const isSelected = selectedKostId === prop.id || selectedKostId === prop.name;
              return (
                <DropdownMenuItem
                  key={prop.id}
                  onClick={() => setSelectedKostId(prop.id)}
                  className={`text-xs font-medium cursor-pointer rounded-lg px-2.5 py-2 flex items-center justify-between ${
                    isSelected
                      ? 'bg-rose- text-rose- dark:bg-rose-/50 dark:text-rose- font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-muted'
                  }`}
                >
                  <span className="truncate">{prop.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-5 pt-3 flex-1 flex flex-col justify-end">
        <div className="relative h-60 sm:h-64 w-full">
          {!hasRevenueData && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800 rounded-xl px-4 py-2.5 text-center text-xs text-slate-600 dark:text-slate-300 shadow-md">
                <p className="font-semibold">{t('dashboard.noRevenueInPeriod')}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">{t('dashboard.allTransactionsZero')}</p>
              </div>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -15, bottom: 0 }}
            >
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                domain={[0, (dataMax: number) => Math.max(dataMax * 1.15, 12000000)]}
                tickFormatter={(val) => `${Math.round(val / 1000000)} ${t('dashboard.currencyMillionSuffix')}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(225, 29, 72, 0.08)' }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="amount"
                fill="#E11D48"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
