'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage, Locale } from '@/contexts/LanguageContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Languages, Check } from 'lucide-react';

export const LanguageSwitcherCard: React.FC = () => {
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();

  const languageOptions: {
    id: Locale;
    label: string;
    description: string;
    flag: string;
  }[] = [
    {
      id: 'id',
      label: t('settings.languageId'),
      description: t('settings.languageIdDesc'),
      flag: '🇮🇩',
    },
    {
      id: 'en',
      label: t('settings.languageEn'),
      description: t('settings.languageEnDesc'),
      flag: '🇬🇧',
    },
  ];

  return (
    <Card className="rounded-2xl p-6 sm:p-7 border border-border shadow-xs bg-card animate-slide-up animate-stagger-2">
      <CardContent className="p-0 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Languages className="w-4 h-4 text-primary" />
            {t('settings.languageTitle')}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {t('settings.languageDesc')}
          </p>
        </div>

        <div className="space-y-2.5">
          {languageOptions.map((opt) => {
            const isSelected = locale === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLocale(opt.id)}
                className={`w-full p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-rose-600 bg-rose-50/60 dark:bg-rose-500/10 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-border bg-background hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-muted/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center shrink-0 text-lg">
                    {opt.flag}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-xs sm:text-sm truncate">{opt.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug truncate">{opt.description}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 ml-2 shadow-xs">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
