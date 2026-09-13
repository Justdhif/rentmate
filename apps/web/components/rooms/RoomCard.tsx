'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DoorClosed, Trash2, Building2, Camera, BedDouble } from 'lucide-react';
import { ImageLightboxModal } from '@/components/common/ImageGalleryUploader';

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  type: string;
  monthlyPrice: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  photos?: string[];
  property?: {
    id: string;
    name: string;
  };
}

interface RoomCardProps {
  room: Room;
  index: number;
  onDelete: (id: string, roomNumber: string) => void;
  formatCurrency: (val: number) => string;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, index, onDelete, formatCurrency }) => {
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'from-emerald-500 to-teal-600';
      case 'OCCUPIED':
        return 'from-indigo-500 to-violet-600';
      case 'MAINTENANCE':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge variant="success" className="shadow-xs backdrop-blur-xs">Kosong</Badge>;
      case 'OCCUPIED':
        return <Badge variant="default" className="shadow-xs backdrop-blur-xs">Terisi</Badge>;
      case 'MAINTENANCE':
        return <Badge variant="warning" className="shadow-xs backdrop-blur-xs">Perbaikan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const photos = room.photos || [];
  const coverPhoto = photos.length > 0 ? photos[0] : null;

  return (
    <>
      <Card
        className={`relative rounded-2xl border border-gray-100 dark:border-border/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group bg-white dark:bg-card animate-fade-in animate-stagger-${(index % 5) + 1}`}
      >
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getStatusColor(room.status)} opacity-80 group-hover:opacity-100 transition-opacity z-10`}
        />

        {/* Google Maps Style Room Cover Banner */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900 select-none">
          {coverPhoto ? (
            <div
              className="w-full h-full cursor-pointer group/img"
              onClick={() => setIsLightboxOpen(true)}
              title="Klik untuk melihat foto kamar"
            >
              <img
                src={coverPhoto}
                alt={`Kamar ${room.roomNumber}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {/* Photos Counter Badge */}
              <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[11px] font-semibold backdrop-blur-md border border-white/15 transition-all">
                <Camera className="w-3 h-3" />
                <span>{photos.length} Foto</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/20 text-slate-400">
              <BedDouble className="w-9 h-9 stroke-1 mb-1 opacity-60" />
              <span className="text-[10px] font-medium text-slate-400">Belum ada foto kamar</span>
            </div>
          )}

          {/* Status Badge & Delete floating on banner */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
            {getStatusBadge(room.status)}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(room.id, room.roomNumber);
              }}
              className="h-7 w-7 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-gray-500 hover:text-rose-600 backdrop-blur-md shadow-xs cursor-pointer"
              title="Hapus Kamar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4 flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="font-bold text-gray-900 dark:text-foreground text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Kamar {room.roomNumber}
              </h3>
              <span className="text-xs text-gray-400 dark:text-muted-foreground font-medium">
                Lantai {room.floor}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground mb-3">
              <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{room.property?.name || 'Properti'}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-border/60 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase font-bold tracking-wider">
                {room.type}
              </p>
              <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                {formatCurrency(Number(room.monthlyPrice))}
                <span className="text-[10px] text-gray-400 font-normal"> /bln</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-muted/30 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-400 transition-colors">
              <DoorClosed className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {photos.length > 0 && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={photos}
          title={`Kamar ${room.roomNumber} - ${room.property?.name || 'Properti'}`}
        />
      )}
    </>
  );
};
