'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export const ThemeSettingsCard: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themeOptions = [
    {
      id: 'light',
      label: t('settings.themeLight'),
      description: t('settings.themeLightDesc'),
      icon: Sun,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      id: 'dark',
      label: t('settings.themeDark'),
      description: t('settings.themeDarkDesc'),
      icon: Moon,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
    {
      id: 'system',
      label: t('settings.themeSystem'),
      description: t('settings.themeSystemDesc'),
      icon: Laptop,
      iconColor: 'text-slate-500 dark:text-slate-400',
      bgColor: 'bg-slate-500/10',
    },
  ] as const;

  return (
    <Card className="rounded-2xl p-6 sm:p-7 border border-border shadow-xs bg-card animate-slide-up animate-stagger-1">
      <CardContent className="p-0 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" />
            {t('settings.themeTitle')}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {t('settings.themeDesc')}
          </p>
        </div>

        <div className="space-y-2.5">
          {themeOptions.map((opt) => {
            const isSelected = theme === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={`w-full p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-rose-600 bg-rose-50/60 dark:bg-rose-500/10 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-border bg-background hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-muted/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${opt.bgColor} ${opt.iconColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
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
