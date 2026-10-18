'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';
import { PageBreadcrumb, BreadcrumbEntry } from './PageBreadcrumb';

export type { BreadcrumbEntry };

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: BreadcrumbEntry[];
  showBreadcrumbs?: boolean;
  backHref?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  showBreadcrumbs = true,
  backHref,
  onBack,
  showBackButton,
  actions,
  children,
  className,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const hasBack = Boolean(backHref || onBack || showBackButton);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else if (showBackButton) {
      router.back();
    }
  };

  return (
    <div className={cn('mb-6 sm:mb-8 space-y-3 sm:space-y-4', className)}>
      {/* Breadcrumb diatas header perpage */}
      {showBreadcrumbs && (
        <PageBreadcrumb items={breadcrumbs} className="mb-2" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          {hasBack && (
            backHref ? (
              <Button
                variant="outline"
                size="icon"
                asChild
                className="h-9 w-9 rounded-xl border-slate-200/80 dark:border-border/60 bg-white dark:bg-card hover:bg-slate-100 dark:hover:bg-accent text-slate-600 dark:text-muted-foreground shrink-0 cursor-pointer shadow-2xs"
                title={t('common.back')}
              >
                <Link href={backHref}>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9 rounded-xl border-slate-200/80 dark:border-border/60 bg-white dark:bg-card hover:bg-slate-100 dark:hover:bg-accent text-slate-600 dark:text-muted-foreground shrink-0 cursor-pointer shadow-2xs"
                title={t('common.back')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )
          )}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-slate-500 dark:text-muted-foreground mt-1 text-sm">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
};
