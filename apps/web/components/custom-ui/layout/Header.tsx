'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Search, Compass } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTranslation } from '@/contexts/LanguageContext';
import { BreadcrumbEntry } from './PageBreadcrumb';

export type { BreadcrumbEntry };

interface HeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbEntry[];
}

export const Header: React.FC<HeaderProps> = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-slate-200/80 dark:border-border/60 px-4 lg:px-8 flex items-center justify-between shrink-0">
      {/* Left: Sidebar Toggle */}
      <div className="flex items-center shrink-0">
        <SidebarTrigger />
      </div>

      {/* Center: Full-width Search Bar */}
      <div className="flex-1 min-w-0 mx-3 sm:mx-6">
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2.5 text-slate-500 dark:text-muted-foreground font-normal h-9 px-3.5 rounded-xl border-slate-200/80 dark:border-border/60 bg-slate-50/90 dark:bg-muted/30 hover:bg-slate-100 dark:hover:bg-muted/50 justify-start transition-all cursor-pointer shadow-2xs"
        >
          <Search className="w-4 h-4 shrink-0 text-slate-400" />
          <span className="text-xs sm:text-sm truncate">{t('nav.searchPlaceholder')}</span>
          <kbd className="ml-auto hidden sm:inline-flex text-[10px] bg-white dark:bg-background border border-slate-200 dark:border-border rounded px-1.5 py-0.5 font-mono text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </Button>
      </div>

      {/* Right: Actions (Marketplace, Language, Theme & Notifications) */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-9 px-3 rounded-xl border-slate-200/80 dark:border-border/60 hover:border-[#FECDD3] dark:hover:border-[#BE123C] hover:text-[#E11D48] dark:hover:text-[#FECDD3] font-medium text-xs gap-1.5 shadow-2xs cursor-pointer"
        >
          <Link href="/">
            <Compass className="w-4 h-4 text-[#E11D48] shrink-0" />
            <span className="hidden md:inline">Jelajahi Marketplace</span>
          </Link>
        </Button>

        <LanguageToggle />
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-[#FFF1F2] dark:hover:bg-[#27272A] rounded-xl h-9 w-9"
          title={t('nav.notifications')}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#E11D48] rounded-full ring-2 ring-white dark:ring-card" />
        </Button>
      </div>
    </header>
  );
};

