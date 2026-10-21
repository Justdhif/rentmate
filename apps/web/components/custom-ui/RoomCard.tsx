'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DoorClosed,
  Trash2,
  Building2,
  Camera,
  Heart,
  MoreVertical,
  ArrowRight,
  Wind,
  Bath,
  Wifi,
  BedDouble,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ImageLightboxModal } from '@/components/custom-ui/ImageGalleryUploader';
import { useTranslation } from '@/contexts/LanguageContext';
import { useFavorites } from '@/contexts/FavoritesContext';

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  type: string;
  monthlyPrice: number;
  dailyPrice?: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  photos?: string[];
  dimension?: string;
  facilities?: string[];
  description?: string;
  isFavorite?: boolean;
  property?: {
    id: string;
    name: string;
    city?: string;
    address?: string;
  };
}

interface RoomCardProps {
  room: Room;
  index: number;
  onDelete: (id: string, roomNumber: string) => void;
  formatCurrency: (val: number) => string;
}

// Map facility keywords to Lucide icons
const getRoomFacilityIcon = (facilityName: string) => {
  const lower = facilityName.toLowerCase();
  if (lower.includes('ac') || lower.includes('air conditioner')) return Wind;
  if (lower.includes('mandi') || lower.includes('bath') || lower.includes('shower')) return Bath;
  if (lower.includes('wifi') || lower.includes('internet')) return Wifi;
  if (lower.includes('kasur') || lower.includes('bed') || lower.includes('springbed')) return BedDouble;
  return Sparkles;
};

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  index,
  onDelete,
  formatCurrency,
}) => {
  const { t, locale } = useTranslation();
  const { isRoomFavorite, toggleRoomFavorite } = useFavorites();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const isFavorite = isRoomFavorite(room.id);

  const photos = room.photos || [];
  const coverPhoto = photos.length > 0 ? photos[0] : null;
  const photoCount = photos.length;

  const roomTypeName = room.type || 'Standard';
  const dimensionsText =
    room.dimension ||
    (roomTypeName.toUpperCase().includes('DELUXE')
      ? '4 x 3.5 m (±14 m²)'
      : roomTypeName.toUpperCase().includes('VIP')
      ? '5 x 4 m (±20 m²)'
      : '3.5 x 3 m (±10.5 m²)');

  // Status badge styling matching PropertyCard
  let statusBadgeClasses =
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60';
  let statusBadgeLabel = t('rooms.statusAvailable');

  if (room.status === 'OCCUPIED') {
    statusBadgeClasses =
      'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60';
    statusBadgeLabel = t('rooms.statusOccupied');
  } else if (room.status === 'MAINTENANCE') {
    statusBadgeClasses =
      'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60';
    statusBadgeLabel = t('rooms.statusMaintenance');
  }

  // Amenities list
  const facilities = room.facilities || [];

  return (
    <>
      <div
        className="rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-2xs hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
      >
        {/* Top Photo Stage (16:10 aspect ratio matching PropertyCard) */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 select-none">
          {coverPhoto ? (
            <>
              <img
                src={coverPhoto}
                alt={t('rooms.roomNumber', { number: room.roomNumber })}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20 text-slate-400">
              <BedDouble className="w-10 h-10 stroke-[1.5] text-slate-300 dark:text-slate-600 mb-1" />
              <span className="text-[11px] font-medium text-slate-400">
                {t('rooms.noPhoto')}
              </span>
            </div>
          )}

          {/* Status Badge (Top Left) */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-md shadow-2xs ${statusBadgeClasses}`}
            >
              {statusBadgeLabel}
            </span>
          </div>

          {/* Quick Actions (Top Right: Favorite & More Options Menu) */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleRoomFavorite(room.id, room.roomNumber);
              }}
              className="w-8 h-8 rounded-full bg-white/85 dark:bg-slate-900/85 hover:bg-white dark:hover:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-rose-500 backdrop-blur-md shadow-xs transition-all cursor-pointer"
              title={isFavorite ? t('properties.removeFromFavorite') : t('properties.addToFavorite')}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-slate-600 dark:text-slate-300 hover:text-rose-500'
                }`}
              />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-white/85 dark:bg-slate-900/85 hover:bg-white dark:hover:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-xs transition-all cursor-pointer"
                  title={t('rooms.quickManage')}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem
                  onClick={() => setIsDetailOpen(true)}
                  className="gap-2 cursor-pointer"
                >
                  <DoorClosed className="w-4 h-4 text-blue-500" />
                  <span>{t('rooms.viewDetail')}</span>
                </DropdownMenuItem>
                {room.propertyId && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/properties/${room.propertyId}`}
                      className="gap-2 cursor-pointer flex items-center"
                    >
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span>{t('rooms.viewOnProperty')}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(room.id, room.roomNumber)}
                  className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('rooms.deleteButton')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Photos Count Badge (Bottom Right) */}
          {photoCount > 0 && (
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/65 hover:bg-black/80 text-white text-[11px] font-medium backdrop-blur-md border border-white/20 transition-all cursor-pointer"
              title={t('rooms.galleryTooltip')}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t('rooms.photoBadge', { count: photoCount })}</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Room Number Title */}
            <div className="flex items-baseline justify-between gap-2">
              <h3
                onClick={() => setIsDetailOpen(true)}
                className="font-bold text-slate-900 dark:text-foreground text-base line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
              >
                {t('rooms.roomNumber', { number: room.roomNumber })}
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-muted-foreground font-medium shrink-0 flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                {t('rooms.floor', { number: room.floor })}
              </span>
            </div>

            {/* Property Name */}
            <p className="text-xs text-slate-500 dark:text-muted-foreground flex items-center gap-1.5 line-clamp-1 mt-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {room.property?.name || t('rooms.propertyFallback')}
                {room.property?.city ? ` • ${room.property.city}` : ''}
              </span>
            </p>

            {/* Room Type & Dimensions */}
            <p className="text-xs text-slate-500 dark:text-muted-foreground line-clamp-1 mt-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {roomTypeName}
              </span>
              {' • '}
              <span>{dimensionsText}</span>
            </p>

            {/* Price */}
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                {formatCurrency(Number(room.monthlyPrice))}
              </span>
              <span className="text-xs font-normal text-slate-500 dark:text-muted-foreground">
                {t('rooms.pricePerMonth')}
              </span>
            </div>

            {/* Amenities Row Icons */}
            {facilities.length > 0 && (
              <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300 pt-2.5 mt-2.5 border-t border-slate-100 dark:border-border/60 overflow-hidden">
                {facilities.slice(0, 3).map((fName, fIdx) => {
                  const FacIcon = getRoomFacilityIcon(fName);
                  return (
                    <div key={fIdx} className="flex items-center gap-1 shrink-0" title={fName}>
                      <FacIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate max-w-[85px]">{fName}</span>
                    </div>
                  );
                })}
                {facilities.length > 3 && (
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    +{facilities.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Card Actions Footer */}
          <div className="pt-4 mt-3 border-t border-slate-100 dark:border-border/60 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDetailOpen(true)}
              className="flex-1 h-8 rounded-xl border-slate-200 dark:border-border text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              {t('rooms.viewDetail')}
            </Button>
            {room.propertyId ? (
              <Button
                asChild
                size="sm"
                className="flex-1 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer gap-1.5"
              >
                <Link href={`/properties/${room.propertyId}`}>
                  <span>{t('rooms.propertyFallback')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsDetailOpen(true)}
                className="flex-1 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                {t('rooms.quickManage')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Room Photos */}
      {photos.length > 0 && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={photos}
          title={`${t('rooms.roomNumber', { number: room.roomNumber })} - ${room.property?.name || t('rooms.propertyFallback')}`}
        />
      )}

      {/* Room Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {t('rooms.roomNumber', { number: room.roomNumber })}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {room.property?.name || t('rooms.propertyFallback')} • {t('rooms.floor', { number: room.floor })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Room Photo */}
            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
              {coverPhoto ? (
                <img
                  src={coverPhoto}
                  alt={room.roomNumber}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <BedDouble className="w-10 h-10 stroke-[1.5] text-slate-300 dark:text-slate-600 mb-1" />
                  <span className="text-[11px] font-medium">{t('rooms.noPhoto')}</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClasses}`}>
                  {statusBadgeLabel}
                </span>
              </div>
            </div>

            {/* Room Specs */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">{t('rooms.typeLabel')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{roomTypeName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Ukuran / Dimensi</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{dimensionsText}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{t('rooms.modalPriceLabel')}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(Number(room.monthlyPrice))} /bln
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{t('rooms.propertyLabel')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {room.property?.name || '-'}
                </span>
              </div>
            </div>

            {/* Facilities in Modal */}
            {facilities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t('rooms.facilitiesFilter')}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 rounded-lg text-xs"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons in Modal */}
            <div className="pt-2 flex items-center gap-2">
              {room.propertyId && (
                <Button
                  asChild
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  <Link href={`/properties/${room.propertyId}`}>
                    <Building2 className="w-3.5 h-3.5 mr-1.5" />
                    <span>{t('rooms.viewOnProperty')}</span>
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailOpen(false);
                  onDelete(room.id, room.roomNumber);
                }}
                className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                <span>{t('rooms.deleteButton')}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
