'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Heart,
  Building2,
  DoorClosed,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import { AppLayout } from '@/components/custom-ui/layout/AppLayout';
import { PageHeader } from '@/components/custom-ui/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/custom-ui/PropertyCard';
import { RoomCard } from '@/components/custom-ui/RoomCard';
import { EmptyState } from '@/components/custom-ui/EmptyState';
import { api } from '@/lib/api';
import { useTranslation } from '@/contexts/LanguageContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { toast } from 'sonner';

export const FavoritesView: React.FC = () => {
  const { t, locale } = useTranslation();
  const { favoritePropertyIds, favoriteRoomIds } = useFavorites();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState<'properties' | 'rooms'>('properties');
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/favorites');
      if (res?.success && res.data) {
        setProperties(res.data.properties || []);
        setRooms(res.data.rooms || []);
      }
    } catch (err: any) {
      toast.error('Gagal memuat daftar favorit');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Filter properties and rooms dynamically based on context state
  const visibleProperties = properties.filter((prop) =>
    favoritePropertyIds.has(prop.id)
  );

  const visibleRooms = rooms.filter((room) =>
    favoriteRoomIds.has(room.id)
  );

  const handleDeleteProperty = async (id: string, name: string) => {
    const confirmed = await confirm.danger({
      title: t('properties.deleteDialogTitle'),
      description: t('properties.deleteDialogDesc', { name }),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    });
    if (!confirmed) return;

    try {
      await api.delete(`/properties/${id}`);
      toast.success(t('properties.deleteSuccess', { name }));
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error(t('properties.deleteFailed'));
    }
  };

  const handleDeleteRoom = async (id: string, roomNumber: string) => {
    const confirmed = await confirm.danger({
      title: t('common.confirmDeleteTitle'),
      description: t('rooms.deleteConfirm', { roomNumber }),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    });
    if (!confirmed) return;

    try {
      await api.delete(`/rooms/${id}`);
      toast.success(t('rooms.deleteSuccess', { roomNumber }));
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error(t('rooms.deleteFailed'));
    }
  };

  const formatCurrency = (amount: number) => {
    return 'Rp ' + amount.toLocaleString(locale === 'en' ? 'en-US' : 'id-ID');
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <PageHeader
          title={t('favorites.pageTitle')}
          description={t('favorites.pageDesc')}
        />

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-border/60 pb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('properties')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'properties'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t('favorites.tabProperties')}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                  activeTab === 'properties'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {visibleProperties.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'rooms'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <DoorClosed className="w-4 h-4" />
              <span>{t('favorites.tabRooms')}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                  activeTab === 'rooms'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {visibleRooms.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {t('favorites.showingSaved', {
                count:
                  activeTab === 'properties'
                    ? visibleProperties.length
                    : visibleRooms.length,
              })}
            </span>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200/60 dark:border-border/40"
              />
            ))}
          </div>
        ) : activeTab === 'properties' ? (
          visibleProperties.length === 0 ? (
            <EmptyState
              icon={Heart}
              iconColor="rose"
              variant="dashed"
              className="w-full my-6 py-16"
              title={t('favorites.emptyPropertiesTitle')}
              description={t('favorites.emptyPropertiesDesc')}
              action={{
                label: t('favorites.exploreProperties'),
                href: '/properties',
                icon: ArrowRight,
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProperties.map((prop, idx) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  index={idx}
                  onDelete={handleDeleteProperty}
                />
              ))}
            </div>
          )
        ) : visibleRooms.length === 0 ? (
          <EmptyState
            icon={DoorClosed}
            iconColor="rose"
            variant="dashed"
            className="w-full my-6 py-16"
            title={t('favorites.emptyRoomsTitle')}
            description={t('favorites.emptyRoomsDesc')}
            action={{
              label: t('favorites.exploreRooms'),
              href: '/rooms',
              icon: ArrowRight,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleRooms.map((rm, idx) => (
              <RoomCard
                key={rm.id}
                room={rm}
                index={idx}
                onDelete={handleDeleteRoom}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
