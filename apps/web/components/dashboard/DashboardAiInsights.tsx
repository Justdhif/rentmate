'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface DashboardAiInsightsProps {
  insights: any[];
}

export const DashboardAiInsights: React.FC<DashboardAiInsightsProps> = ({ insights }) => {
  const { t } = useTranslation();
  const hasInsights = insights.length > 0;
  const title = hasInsights
    ? insights[0]?.title || t('dashboard.aiDefaultTitle')
    : t('dashboard.aiNoInsightsTitle');
  const description = hasInsights
    ? insights[0]?.description || t('dashboard.aiDefaultDesc')
    : t('dashboard.aiNoInsightsDesc');

  return (
    <div className="p-6 md:p-7 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-2.5 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-semibold text-white">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{t('dashboard.aiBadge')}</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">{title}</h2>
        <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-xl">
          {description}
        </p>
      </div>
      <Button
        asChild
        variant="secondary"
        className="shrink-0 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs shadow-sm rounded-xl px-5 py-2.5"
      >
        <Link href="/ai-assistant" className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>{t('dashboard.aiOpenButton')}</span>
        </Link>
      </Button>
    </div>
  );
};
