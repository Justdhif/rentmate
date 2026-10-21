'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoorClosed } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface DashboardRoomsTableProps {
  rooms?: any[];
  formatCurrency: (val?: number) => string;
}

export const DashboardRoomsTable: React.FC<DashboardRoomsTableProps> = ({
  rooms = [],
  formatCurrency,
}) => {
  const { t } = useTranslation();

  // 5 demo room items with direct card list information (no table, no filter tabs)
  const defaultRooms = [
    {
      id: '1',
      roomNumber: 'A1',
      roomType: t('dashboard.typeStandard'),
      price: 800000,
      status: 'OCCUPIED',
      tenantName: 'Rina Pratiwi',
    },
    {
      id: '2',
      roomNumber: 'A2',
      roomType: t('dashboard.typeStandard'),
      price: 800000,
      status: 'OCCUPIED',
      tenantName: 'Dewi Lestari',
    },
    {
      id: '3',
      roomNumber: 'A3',
      roomType: t('dashboard.typeStandard'),
      price: 800000,
      status: 'AVAILABLE',
      tenantName: t('dashboard.unoccupied'),
    },
    {
      id: '4',
      roomNumber: 'B1',
      roomType: t('dashboard.typeDeluxe'),
      price: 1200000,
      status: 'OCCUPIED',
      tenantName: 'Budi Santoso',
    },
    {
      id: '5',
      roomNumber: 'B2',
      roomType: t('dashboard.typeDeluxe'),
      price: 1200000,
      status: 'OCCUPIED',
      tenantName: 'Siti Nurhaliza',
    },
  ];

  const sourceRooms =
    rooms && rooms.length >= 3
      ? rooms.map((r: any) => ({
          id: r.id,
          roomNumber: r.roomNumber || `Unit ${r.id}`,
          roomType: r.roomType === 'DELUXE' ? t('dashboard.typeDeluxe') : t('dashboard.typeStandard'),
          price: Number(r.price) || 800000,
          status: r.status || 'AVAILABLE',
          tenantName: r.tenant?.fullName || r.currentTenant || t('dashboard.unoccupied'),
        }))
      : defaultRooms;

  // Exactly 5 items to align height with Tagihan Terbaru and right-side Kost list
  const displayRooms = sourceRooms.slice(0, 5);

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-2xs bg-white dark:bg-card h-full flex flex-col justify-between">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-bold text-slate-900 dark:text-foreground text-sm sm:text-base flex items-center gap-2">
          <DoorClosed className="w-4 h-4 text-primary" />
          <span>{t('dashboard.roomsListTitle')}</span>
        </CardTitle>
        <Link
          href="/rooms"
          className="text-xs font-semibold text-primary hover:underline"
        >
          {t('common.viewAll')}
        </Link>
      </CardHeader>

      <CardContent className="p-5 pt-1 flex-1 flex flex-col justify-between">
        <div className="divide-y divide-slate-100 dark:divide-border/40">
          {displayRooms.map((room) => {
            const isOccupied = room.status === 'OCCUPIED';

            return (
              <div
                key={room.id}
                className="py-2.5 sm:py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                {/* Left: Room Badge + Type & Tenant Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {room.roomNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-foreground text-xs sm:text-sm truncate">
                      {room.roomType}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-muted-foreground truncate">
                      {isOccupied ? room.tenantName : t('dashboard.vacantRoom')}
                    </p>
                  </div>
                </div>

                {/* Right: Price + Status Badge */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900 dark:text-foreground text-xs sm:text-sm">
                    {formatCurrency(room.price)}
                  </p>
                  <div className="mt-0.5">
                    {isOccupied ? (
                      <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                        {t('dashboard.statusOccupied')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-semibold text-primary bg-primary dark:bg-secondary/50 border border-border px-2 py-0.5 rounded-full">
                        {t('dashboard.statusVacant')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
