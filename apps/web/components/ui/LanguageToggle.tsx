'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage, Locale } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageToggleProps {
  className?: string;
  variant?: 'ghost' | 'outline';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  variant = 'ghost',
}) => {
  const { locale, setLocale } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={`h-9 px-2.5 rounded-xl gap-1.5 cursor-pointer text-xs font-semibold ${
            variant === 'ghost'
              ? 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-accent'
              : 'border-slate-200 dark:border-border/60 bg-white dark:bg-card'
          } ${className}`}
          title="Ubah Bahasa / Switch Language"
        >
          <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="uppercase text-[11px] font-bold tracking-wider">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-xl p-1 shadow-lg border border-slate-200 dark:border-border bg-white dark:bg-card">
        <DropdownMenuItem
          onClick={() => setLocale('id')}
          className={`cursor-pointer text-xs flex items-center justify-between rounded-lg px-2.5 py-1.5 ${
            locale === 'id' ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : ''
          }`}
        >
          <span>🇮🇩 Indonesia</span>
          {locale === 'id' && <span className="text-[10px] bg-indigo-600 text-white rounded-full px-1.5 py-0.2">ID</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('en')}
          className={`cursor-pointer text-xs flex items-center justify-between rounded-lg px-2.5 py-1.5 ${
            locale === 'en' ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : ''
          }`}
        >
          <span>🇬🇧 English</span>
          {locale === 'en' && <span className="text-[10px] bg-indigo-600 text-white rounded-full px-1.5 py-0.2">EN</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
