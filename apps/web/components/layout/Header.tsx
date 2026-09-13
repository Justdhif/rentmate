'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbEntry[];
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  properties: 'Properti',
  create: 'Tambah Properti',
  rooms: 'Kamar',
  tenants: 'Penghuni',
  payments: 'Keuangan',
  maintenance: 'Maintenance',
  analytics: 'Analitik',
  'ai-assistant': 'AI Assistant',
  settings: 'Pengaturan',
};

export const Header: React.FC<HeaderProps> = ({
  title,
  breadcrumbs: customBreadcrumbs,
}) => {
  const pathname = usePathname();

  const breadcrumbItems = React.useMemo((): BreadcrumbEntry[] => {
    if (customBreadcrumbs && customBreadcrumbs.length > 0) {
      return customBreadcrumbs;
    }

    const segments = (pathname || '').split('/').filter(Boolean);
    if (segments.length === 0) {
      return [{ label: title || 'Dashboard' }];
    }

    const items: BreadcrumbEntry[] = [];
    let accumulatedPath = '';

    segments.forEach((seg, index) => {
      accumulatedPath += `/${seg}`;
      const isLast = index === segments.length - 1;
      const label =
        ROUTE_LABELS[seg] ||
        seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');

      items.push({
        label,
        href: isLast ? undefined : accumulatedPath,
      });
    });

    return items;
  }, [pathname, customBreadcrumbs, title]);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-slate-200/80 dark:border-border/60 px-4 lg:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4 hidden sm:block" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {breadcrumbItems.map((item, idx) => {
              const isLast = idx === breadcrumbItems.length - 1;
              return (
                <React.Fragment key={idx}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold text-slate-900 dark:text-foreground truncate max-w-48 sm:max-w-none text-sm">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={item.href || '#'}
                          className="truncate max-w-32 sm:max-w-none text-sm text-slate-500 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground transition-colors"
                        >
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        {/* Mobile current page label */}
        <span className="sm:hidden font-semibold text-sm text-slate-900 dark:text-foreground truncate max-w-40">
          {breadcrumbItems[breadcrumbItems.length - 1]?.label || 'Dashboard'}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
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

        {/* Theme Toggle Button */}
        <ThemeToggle />

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
