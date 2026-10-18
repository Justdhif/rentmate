'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
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

interface PageBreadcrumbProps {
  items?: BreadcrumbEntry[];
  className?: string;
}

export const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  items: customItems,
  className,
}) => {
  const pathname = usePathname();
  const { t } = useTranslation();

  const routeLabels: Record<string, string> = React.useMemo(
    () => ({
      dashboard: t('nav.dashboard'),
      properties: t('nav.properties'),
      create: t('nav.addProperty'),
      rooms: t('nav.rooms'),
      tenants: t('nav.tenants'),
      payments: t('nav.payments'),
      maintenance: t('nav.maintenance'),
      analytics: t('nav.analytics'),
      'ai-assistant': t('nav.aiAssistant'),
      settings: t('nav.settings'),
    }),
    [t]
  );

  const breadcrumbs = React.useMemo((): BreadcrumbEntry[] => {
    if (customItems && customItems.length > 0) {
      return customItems;
    }

    const segments = (pathname || '').split('/').filter(Boolean);

    // Root is always Dashboard
    const list: BreadcrumbEntry[] = [
      {
        label: t('nav.dashboard'),
        href: segments.length > 0 && segments[0] !== 'dashboard' ? '/dashboard' : undefined,
      },
    ];

    if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
      return list;
    }

    let currentPath = '';
    segments.forEach((seg, index) => {
      if (seg === 'dashboard') return;
      currentPath += `/${seg}`;
      const isLast = index === segments.length - 1;
      const label =
        routeLabels[seg] ||
        seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');

      list.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return list;
  }, [pathname, customItems, routeLabels, t]);

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="text-xs sm:text-xs">
        {breadcrumbs.map((item, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === breadcrumbs.length - 1;

          return (
            <React.Fragment key={idx}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {isFirst && <Home className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{item.label}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href || '#'}
                      className="text-slate-500 hover:text-blue-600 dark:text-muted-foreground dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                    >
                      {isFirst && <Home className="w-3.5 h-3.5" />}
                      <span>{item.label}</span>
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="text-slate-300 dark:text-slate-600" />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
