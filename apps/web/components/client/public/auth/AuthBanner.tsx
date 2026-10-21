'use client';

import React from 'react';
import { Building2, CreditCard, Wrench } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface AuthBannerProps {
  title?: string;
  subtitle?: string;
}

export const AuthBanner: React.FC<AuthBannerProps> = ({
  title,
  subtitle,
}) => {
  const { t } = useTranslation();
  const bannerTitle = title || t('auth.bannerDefaultTitle');
  const bannerSubtitle = subtitle || t('auth.bannerDefaultSubtitle');

  return (
    <div className="hidden lg:flex w-[55%] bg-gradient-to-br from-rose-600 via-rose-700 to-slate-900 dark:from-slate-950 dark:via-rose-950/40 dark:to-slate-950 dark:border-l dark:border-slate-800/80 p-12 items-center justify-center relative overflow-hidden transition-colors">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-25 dark:opacity-40 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-white/40 dark:bg-rose-600/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[20%] w-[60%] h-[60%] rounded-full bg-rose-300/40 dark:bg-rose-500/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-20 dark:opacity-10 mix-blend-overlay bg-dot-pattern" />
      </div>

      <div className="relative z-10 w-full max-w-xl text-white">
        <div className="animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-rose-200">
            {bannerTitle}
          </h2>
          <p className="text-lg md:text-xl text-rose-100 dark:text-slate-400 mb-12 leading-relaxed">
            {bannerSubtitle}
          </p>
        </div>

        <div className="space-y-8 animate-stagger-1">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/10 dark:bg-rose-500/10 flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-rose-500/20 text-white dark:text-rose-400 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1 text-white dark:text-slate-100">{t('auth.bannerFeature1Title')}</h3>
              <p className="text-rose-100/80 dark:text-slate-400 text-sm leading-relaxed">
                {t('auth.bannerFeature1Desc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/10 dark:bg-rose-500/10 flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-rose-500/20 text-white dark:text-rose-400 shadow-sm">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1 text-white dark:text-slate-100">{t('auth.bannerFeature2Title')}</h3>
              <p className="text-rose-100/80 dark:text-slate-400 text-sm leading-relaxed">
                {t('auth.bannerFeature2Desc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/10 dark:bg-rose-500/10 flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-rose-500/20 text-white dark:text-rose-400 shadow-sm">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1 text-white dark:text-slate-100">{t('auth.bannerFeature3Title')}</h3>
              <p className="text-rose-100/80 dark:text-slate-400 text-sm leading-relaxed">
                {t('auth.bannerFeature3Desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
