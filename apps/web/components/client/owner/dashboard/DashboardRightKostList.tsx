'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, DoorClosed, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/LanguageContext';

interface DashboardRightKostListProps {
  properties?: any[];
}

export const DashboardRightKostList: React.FC<DashboardRightKostListProps> = ({
  properties = [],
}) => {
  const { t } = useTranslation();

  // Curated architectural photos matching the reference photo's modern building style
  const defaultPropertyImages = [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  ];

  // Default demo kost list if user hasn't added properties to the database yet
  const defaultKostList = [
    {
      id: 'demo-1',
      name: 'Kost Modern & Nyaman',
      type: 'CAMPUR',
      address: 'Jl. Kaliurang KM 5, Sleman',
      city: 'Yogyakarta',
      description: 'Lokasi strategis, fasilitas lengkap, harga bersahabat.',
      roomsCount: 12,
      occupiedRooms: 10,
      minPrice: 800000,
      photo: defaultPropertyImages[0],
    },
    {
      id: 'demo-2',
      name: 'Kost Putri Asri Menteng',
      type: 'PUTRI',
      address: 'Jl. Menteng Raya No. 18',
      city: 'Jakarta Pusat',
      description: 'Lingkungan tenang, dekat stasiun dan pusat perkantoran.',
      roomsCount: 8,
      occupiedRooms: 7,
      minPrice: 1200000,
      photo: defaultPropertyImages[1],
    },
    {
      id: 'demo-3',
      name: 'Kost Putra Harvard Square',
      type: 'PUTRA',
      address: 'Jl. Ganesha No. 10',
      city: 'Bandung',
      description: 'Khusus mahasiswa & pekerja, keamanan 24 jam dan wifi super cepat.',
      roomsCount: 10,
      occupiedRooms: 9,
      minPrice: 950000,
      photo: defaultPropertyImages[2],
    },
  ];

  const sourceProperties =
    properties && properties.length > 0
      ? properties.slice(0, 3).map((p: any, idx: number) => ({
          id: p.id,
          name: p.name || `Kost #${idx + 1}`,
          type: p.type || 'CAMPUR',
          address: p.address || 'Alamat properti',
          city: p.city || 'Indonesia',
          description:
            p.description || 'Lokasi strategis, fasilitas lengkap, harga bersahabat.',
          roomsCount: p.rooms?.length ?? 12,
          occupiedRooms:
            p.rooms?.filter((r: any) => r.status === 'OCCUPIED')?.length ?? 10,
          minPrice:
            p.rooms?.length > 0
              ? Math.min(...p.rooms.map((r: any) => Number(r.price) || 800000))
              : 800000,
          photo: p.photos?.[0] || defaultPropertyImages[idx % defaultPropertyImages.length],
        }))
      : defaultKostList;

  return (
    <div className="h-full flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 dark:text-foreground text-sm sm:text-base">
            {t('dashboard.kostListTitle')}
          </h3>
          <span className="text-[11px] font-semibold bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
            {sourceProperties.length}
          </span>
        </div>
        <Link
          href="/properties"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t('common.viewAll')}
        </Link>
      </div>

      {/* Vertical List of Kost Cards extending downwards and filling available height */}
      <div className="flex-1 flex flex-col justify-between gap-3 my-3">
        {sourceProperties.map((kost) => {
          return (
            <div
              key={kost.id}
              className="flex-1 min-h-0 rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col group"
            >
              {/* Photo Banner with Flex Height to Perfectly Reach Bottom */}
              <div className="relative h-32 sm:h-36 lg:h-auto lg:flex-1 min-h-[110px] w-full overflow-hidden bg-slate-100 dark:bg-muted">
                <img
                  src={kost.photo}
                  alt={kost.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                {/* Type Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-xs shadow-xs">
                    {kost.type}
                  </span>
                </div>

                {/* Property Name on bottom of image */}
                <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                  <h4 className="font-bold text-xs sm:text-sm leading-snug drop-shadow-xs line-clamp-1">
                    {kost.name}
                  </h4>
                  <p className="text-[10px] text-white/80 line-clamp-1 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span>
                      {kost.address}, {kost.city}
                    </span>
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 space-y-2 shrink-0 flex flex-col justify-between">
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground line-clamp-1 leading-snug">
                  {kost.description}
                </p>

                {/* Rooms Occupancy & Status Info */}
                <div className="pt-2 border-t border-slate-100 dark:border-border/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                    <DoorClosed className="w-3.5 h-3.5 text-blue-500" />
                    <span>
                      {t('dashboard.roomsOccupiedSummary', {
                        rooms: kost.roomsCount,
                        occupied: kost.occupiedRooms,
                      })}
                    </span>
                  </div>

                  <Link
                    href={`/rooms?propertyId=${kost.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>{t('dashboard.viewDetails')}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Kost Quick Link - Aligned precisely with bottom border of Tagihan Terbaru card */}
      <div className="shrink-0 mt-auto">
        <Button
          asChild
          variant="outline"
          className="w-full h-9 rounded-xl border-dashed border-slate-300 dark:border-border text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 text-xs font-medium cursor-pointer shadow-none"
        >
          <Link href="/properties">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>{t('dashboard.addNewKost')}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};
