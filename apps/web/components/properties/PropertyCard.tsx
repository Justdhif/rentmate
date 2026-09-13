'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DoorClosed, Trash2, Camera, Building2 } from 'lucide-react';
import { ImageLightboxModal } from '@/components/common/ImageGalleryUploader';

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  province?: string;
  postalCode?: string;
  description?: string;
  type: string;
  photos?: string[];
  totalRooms?: number;
  rooms?: any[];
}

interface PropertyCardProps {
  property: Property;
  index: number;
  onDelete: (id: string, name: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, index, onDelete }) => {
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

  const getTypeColor = (type: string) => {
    if (type === 'PUTRA') return 'from-blue-500 to-blue-600';
    if (type === 'PUTRI') return 'from-pink-500 to-pink-600';
    return 'from-indigo-500 to-violet-600';
  };

  const getBadgeVariant = (type: string): any => {
    if (type === 'PUTRA') return 'info';
    if (type === 'PUTRI') return 'warning';
    return 'default';
  };

  const photos = property.photos || [];
  const coverPhoto = photos.length > 0 ? photos[0] : null;

  return (
    <>
      <Card
        className={`relative rounded-2xl border border-gray-100 dark:border-border/60 shadow-xs hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden group animate-fade-in animate-stagger-${(index % 5) + 1} bg-white dark:bg-card`}
      >
        {/* Top Gradient Stripe */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getTypeColor(property.type)} opacity-80 group-hover:opacity-100 transition-opacity z-10`}
        />

        {/* Google Maps Style Cover Image Banner */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-900 select-none">
          {coverPhoto ? (
            <div
              className="w-full h-full cursor-pointer group/img"
              onClick={() => setIsLightboxOpen(true)}
              title="Klik untuk melihat galeri foto"
            >
              <img
                src={coverPhoto}
                alt={property.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {/* Photos Counter Badge */}
              <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all">
                <Camera className="w-3.5 h-3.5" />
                <span>{photos.length} Foto</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/20 text-slate-400">
              <Building2 className="w-10 h-10 stroke-1 mb-1.5 opacity-60" />
              <span className="text-[11px] font-medium text-slate-400">Belum ada foto</span>
            </div>
          )}

          {/* Type Badge & Delete Floating on Image */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
            <Badge variant={getBadgeVariant(property.type)} className="shadow-sm backdrop-blur-xs">
              {property.type}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(property.id, property.name);
              }}
              className="h-8 w-8 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-gray-500 hover:text-rose-600 backdrop-blur-md shadow-xs cursor-pointer"
              title="Hapus Properti"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-5 flex flex-col justify-between flex-1">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-foreground text-lg mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {property.name}
            </h3>

          <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400 dark:text-gray-500" />
            <span className="line-clamp-2 leading-relaxed">
              {property.address}, {property.city}
            </span>
          </div>

          {property.description && (
            <p className="text-sm text-gray-500 dark:text-muted-foreground line-clamp-2 mb-4 bg-gray-50 dark:bg-muted/30 p-3 rounded-xl border border-gray-100 dark:border-border/50">
              {property.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-border/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 font-medium">
              <DoorClosed className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>{property.rooms?.length || 0} Kamar</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-gray-100 dark:bg-muted rounded-full overflow-hidden mb-4">
            <div className="h-full bg-indigo-500 rounded-full w-1/3 opacity-50" />
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium border-gray-200 dark:border-border cursor-pointer"
          >
            <Link href={`/rooms?propertyId=${property.id}`}>Kelola Kamar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>

    {photos.length > 0 && (
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={photos}
        title={property.name}
      />
    )}
  </>
  );
};
