'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export const ThemeSettingsCard: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      id: 'light',
      label: 'Mode Terang',
      description: 'Tampilan bersih dan cerah di siang hari',
      icon: Sun,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      id: 'dark',
      label: 'Mode Gelap',
      description: 'Mengurangi kelelahan mata di malam hari',
      icon: Moon,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      id: 'system',
      label: 'Ikuti Sistem',
      description: 'Menyesuaikan otomatis dengan OS perangkat',
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
            Preferensi Tampilan & Tema
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Pilihan tema disimpan otomatis sehingga preferensi Anda selalu diingat.
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
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20 shadow-xs'
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
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 ml-2 shadow-xs">
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
