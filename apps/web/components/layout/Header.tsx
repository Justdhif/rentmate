'use client';

import React from 'react';
import { Bell, Search } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Dashboard',
  subtitle,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-slate-200/80 dark:border-border/60 px-4 lg:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger />
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-foreground tracking-tight leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-muted-foreground hidden sm:block mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search Trigger */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex items-center gap-2 text-slate-500 dark:text-muted-foreground font-normal h-9 px-3 rounded-xl border-slate-200 dark:border-border/60 bg-slate-50 dark:bg-muted/30 hover:bg-slate-100 dark:hover:bg-muted/50 w-60 justify-start"
        >
          <Search className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="text-xs truncate">Cari kamar, penghuni...</span>
          <kbd className="ml-auto text-[10px] bg-white dark:bg-background border border-slate-200 dark:border-border rounded px-1.5 py-0.5 font-mono text-slate-400">
            ⌘K
          </kbd>
        </Button>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-accent rounded-xl h-9 w-9"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-card" />
        </Button>
      </div>
    </header>
  );
};
