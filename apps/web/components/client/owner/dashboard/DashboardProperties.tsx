'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, DoorClosed, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface DashboardPropertiesProps {
  properties: any[];
}

export const DashboardProperties: React.FC<DashboardPropertiesProps> = ({ properties }) => {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground">
            {t('dashboard.propertiesTitle')}
          </CardTitle>
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <Link href="/properties">{t('dashboard.propertiesManage')}</Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {properties.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center text-center text-slate-500 dark:text-muted-foreground">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <Building2 className="w-7 h-7" />
            </div>
            <p className="font-bold text-slate-900 dark:text-foreground text-base">
              {t('dashboard.propertiesEmptyTitle')}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground mt-1.5 max-w-sm">
              {t('dashboard.propertiesEmptyDesc')}
            </p>
            <Button asChild className="mt-5 rounded-xl font-medium shadow-xs" size="sm">
              <Link href="/properties">{t('dashboard.propertiesAddFirst')}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-border/60 hover:border-rose-400/50 dark:hover:border-rose-500/50 transition-all bg-white dark:bg-card hover:shadow-md flex flex-col h-full group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-foreground text-base group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {prop.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1 line-clamp-1">
                      {prop.address}, {prop.city}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800 shrink-0">
                    {prop.type || t('dashboard.propertiesFallbackType')}
                  </span>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-border/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-muted-foreground">
                    <DoorClosed className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>{t('dashboard.propertiesRoomCount', { count: prop.rooms?.length ?? 0 })}</span>
                  </div>
                  <Link
                    href={`/rooms?propertyId=${prop.id}`}
                    className="text-rose-600 dark:text-rose-400 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    {t('dashboard.propertiesViewRooms')}<ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
