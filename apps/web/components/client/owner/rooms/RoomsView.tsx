'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/custom-ui/layout/AppLayout';
import { PageHeader } from '@/components/custom-ui/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import {
  DoorClosed,
  Plus,
  Search,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Building2,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { Room, RoomCard } from '@/components/custom-ui/RoomCard';
import { EmptyState } from '@/components/custom-ui/EmptyState';
import { SearchFilterCard } from '@/components/custom-ui/SearchFilterCard';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/LanguageContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useAuth } from '@/contexts/AuthContext';

function RoomsContent() {
  const { t, locale } = useTranslation();
  const confirm = useConfirm();
  const { user, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const initialPropertyId = searchParams.get('propertyId') || 'ALL';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string>(initialPropertyId);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'number-asc' | 'price-asc' | 'price-desc' | 'floor-asc' | 'newest'>(
    'number-asc'
  );

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [roomsRes, propsRes] = await Promise.allSettled([
        api.get<Room[]>('/rooms'),
        api.get<any[]>('/properties'),
      ]);

      if (roomsRes.status === 'fulfilled' && roomsRes.value?.success) {
        setRooms(roomsRes.value.data || []);
      }
      if (propsRes.status === 'fulfilled' && propsRes.value?.success) {
        setProperties(propsRes.value.data || []);
      }
    } catch (err: any) {
      console.warn('Gagal memuat data kamar:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchData();
    } else if (!isAuthLoading && !user) {
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  // Sync with initial URL search params
  useEffect(() => {
    if (initialPropertyId && initialPropertyId !== 'ALL') {
      setSelectedProperty(initialPropertyId);
    }
  }, [initialPropertyId]);

  const handleDeleteRoom = async (id: string, roomNumber: string) => {
    const confirmed = await confirm.danger({
      title: t('common.confirmDeleteTitle'),
      description: t('rooms.deleteConfirm', { roomNumber }),
      confirmText: t('common.delete'),
    });
    if (!confirmed) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success(t('rooms.deleteSuccess', { roomNumber }));
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || t('rooms.deleteFailed'));
    }
  };

  // Compute room statistics
  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter((r) => r.status === 'AVAILABLE').length;
    const occupied = rooms.filter((r) => r.status === 'OCCUPIED').length;
    const maintenance = rooms.filter((r) => r.status === 'MAINTENANCE').length;
    return { total, available, occupied, maintenance };
  }, [rooms]);

  // Available room types from data or defaults
  const availableTypes = ['STANDARD', 'DELUXE', 'VIP'];

  // Common room amenities options
  const commonFacilities = [
    'AC',
    'Kamar Mandi Dalam',
    'WiFi',
    'Kasur Springbed',
    'Meja Kerja',
    'Lemari Pakaian',
  ];

  const handleFacilityToggle = (fac: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(fac) ? prev.filter((f) => f !== fac) : [...prev, fac]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedProperty('ALL');
    setStatusFilter('ALL');
    setSelectedType('ALL');
    setMaxPrice(5000000);
    setSelectedFacilities([]);
    setSortBy('number-asc');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedProperty !== 'ALL' ||
    statusFilter !== 'ALL' ||
    selectedType !== 'ALL' ||
    maxPrice < 5000000 ||
    selectedFacilities.length > 0;

  // Filtered & Sorted Rooms
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((r) => {
        // Search text (room number or property name)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchNumber = r.roomNumber?.toLowerCase().includes(query);
          const matchProp = r.property?.name?.toLowerCase().includes(query);
          if (!matchNumber && !matchProp) return false;
        }

        // Property match
        if (selectedProperty !== 'ALL' && r.propertyId !== selectedProperty) {
          return false;
        }

        // Status match
        if (statusFilter !== 'ALL' && r.status !== statusFilter) {
          return false;
        }

        // Type match
        if (selectedType !== 'ALL') {
          const rType = (r.type || '').toUpperCase();
          if (!rType.includes(selectedType)) return false;
        }

        // Max price match
        const price = Number(r.monthlyPrice) || 0;
        if (price > maxPrice) {
          return false;
        }

        // Amenities match
        if (selectedFacilities.length > 0) {
          const rFacs = (r.facilities || []).map((f: string) => f.toLowerCase());
          const matchAll = selectedFacilities.every((sf) =>
            rFacs.some((rf: string) => rf.includes(sf.toLowerCase()))
          );
          if (!matchAll) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'number-asc') {
          return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
        }
        if (sortBy === 'price-asc') {
          return Number(a.monthlyPrice) - Number(b.monthlyPrice);
        }
        if (sortBy === 'price-desc') {
          return Number(b.monthlyPrice) - Number(a.monthlyPrice);
        }
        if (sortBy === 'floor-asc') {
          return Number(a.floor) - Number(b.floor);
        }
        if (sortBy === 'newest') {
          return b.id.localeCompare(a.id);
        }
        return 0;
      });
  }, [
    rooms,
    searchQuery,
    selectedProperty,
    statusFilter,
    selectedType,
    maxPrice,
    selectedFacilities,
    sortBy,
  ]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const sortLabelMap: Record<string, string> = {
    'number-asc': t('rooms.sortNumberAsc'),
    'price-asc': t('rooms.sortPriceAsc'),
    'price-desc': t('rooms.sortPriceDesc'),
    'floor-asc': t('rooms.sortFloor'),
    newest: t('rooms.sortNewest'),
  };

  const selectedPropertyName =
    selectedProperty === 'ALL'
      ? t('rooms.allProperties')
      : properties.find((p) => p.id === selectedProperty)?.name || selectedProperty;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header matching PropertiesView */}
        <PageHeader
          title={t('rooms.pageTitle')}
          description={t('rooms.pageDesc')}
          actions={
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="bg-primary text-primary dark:bg-primary/10 dark:text-primary border-border dark:border-border text-xs font-semibold px-2.5 py-1 rounded-lg"
                >
                  {t('rooms.totalRoomsBadge', { count: stats.total })}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold px-2.5 py-1 rounded-lg"
                >
                  {t('rooms.availableBadge', { count: stats.available })}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 text-xs font-semibold px-2.5 py-1 rounded-lg"
                >
                  {t('rooms.occupiedBadge', { count: stats.occupied })}
                </Badge>
              </div>

              <Button
                asChild
                className="h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs cursor-pointer gap-2"
              >
                <Link
                  href={
                    selectedProperty !== 'ALL'
                      ? `/rooms/create?propertyId=${selectedProperty}`
                      : '/rooms/create'
                  }
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('rooms.addButton')}</span>
                </Link>
              </Button>
            </div>
          }
        />

        {/* 2-Column Main Section: Left = Room Cards Grid, Right = Consolidated Sticky Filter Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Room Cards Grid (~75% desktop) */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Clean Result Count & Active Filter Chips Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('rooms.showingCount', { count: filteredRooms.length })}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  ({t('rooms.countBadge', { count: rooms.length })})
                </span>
              </div>

              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div className="flex items-center flex-wrap gap-1.5">
                  {searchQuery.trim() && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-border">
                      <span>"{searchQuery}"</span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="hover:text-red-500 cursor-pointer"
                        title="Hapus filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedProperty !== 'ALL' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-border">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{selectedPropertyName}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedProperty('ALL')}
                        className="hover:text-red-500 cursor-pointer"
                        title="Hapus filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'ALL' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-secondary text-secondary-foreground border border-border dark:border-border">
                      <span>
                        {statusFilter === 'AVAILABLE'
                          ? t('rooms.statusAvailable')
                          : statusFilter === 'OCCUPIED'
                          ? t('rooms.statusOccupied')
                          : t('rooms.statusMaintenance')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStatusFilter('ALL')}
                        className="hover:text-red-500 cursor-pointer"
                        title="Hapus filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedType !== 'ALL' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-border">
                      <span>{selectedType}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedType('ALL')}
                        className="hover:text-red-500 cursor-pointer"
                        title="Hapus filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {maxPrice < 5000000 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-border">
                      <span>≤ Rp {maxPrice.toLocaleString(locale === 'en' ? 'en-US' : 'id-ID')}</span>
                      <button
                        type="button"
                        onClick={() => setMaxPrice(5000000)}
                        className="hover:text-red-500 cursor-pointer"
                        title="Hapus filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedFacilities.map((fac) => (
                    <span
                      key={fac}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-border"
                    >
                      <span>{fac}</span>
                      <button
                        type="button"
                        onClick={() => handleFacilityToggle(fac)}
                        className="hover:text-red-500 cursor-pointer"
                        title="Hapus filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer ml-1"
                  >
                    {t('rooms.resetFilters')}
                  </button>
                </div>
              )}
            </div>

            {/* Room Cards Grid or Empty State */}
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-500 font-medium">
                  {t('properties.loadingDatabase')}
                </p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <EmptyState
                icon={DoorClosed}
                iconColor="rose"
                title={
                  rooms.length === 0
                    ? t('rooms.emptyTitle')
                    : t('rooms.emptyDescNoMatch')
                }
                description={
                  rooms.length === 0
                    ? properties.length === 0
                      ? t('rooms.emptyDescNoProperty')
                      : t('rooms.emptyDescNoMatch')
                    : t('rooms.emptyDescNoMatch')
                }
                action={
                  rooms.length === 0
                    ? properties.length === 0
                      ? {
                          label: t('rooms.emptyActionProperty'),
                          href: '/properties/create',
                          icon: Plus,
                        }
                      : {
                          label: t('rooms.emptyActionRoom'),
                          href:
                            selectedProperty !== 'ALL'
                              ? `/rooms/create?propertyId=${selectedProperty}`
                              : '/rooms/create',
                          icon: Plus,
                        }
                    : {
                        label: t('rooms.resetFilters'),
                        onClick: handleResetFilters,
                        icon: RotateCcw,
                        variant: 'outline',
                      }
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredRooms.map((room, idx) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    index={idx}
                    onDelete={handleDeleteRoom}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Consolidated Sticky Filter Sidebar using unified SearchFilterCard */}
          <SearchFilterCard
            className="lg:col-span-4 xl:col-span-3"
            title={t('rooms.searchFilters')}
            hasActiveFilters={hasActiveFilters}
            onReset={handleResetFilters}
            resetLabel={t('rooms.reset')}
            sort={{
              label: t('rooms.sortBy'),
              value: sortBy,
              onChange: (val) => setSortBy(val as any),
              options: [
                { value: 'number-asc', label: t('rooms.sortNumberAsc') },
                { value: 'price-asc', label: t('rooms.sortPriceAsc') },
                { value: 'price-desc', label: t('rooms.sortPriceDesc') },
                { value: 'floor-asc', label: t('rooms.sortFloor') },
                { value: 'newest', label: t('rooms.sortNewest') },
              ],
            }}
            search={{
              label: t('rooms.searchLabel'),
              value: searchQuery,
              onChange: setSearchQuery,
              placeholder: t('rooms.searchPlaceholder'),
            }}
            selects={
              properties.length > 0
                ? [
                    {
                      id: 'property',
                      label: t('rooms.propertyLabel'),
                      value: selectedProperty,
                      onChange: setSelectedProperty,
                      placeholder: t('rooms.allProperties'),
                      icon: Building2,
                      options: [
                        { value: 'ALL', label: t('rooms.allProperties') },
                        ...properties.map((p) => ({ value: p.id, label: p.name })),
                      ],
                    },
                  ]
                : undefined
            }
            pillGroups={[
              {
                id: 'status',
                label: t('rooms.statusLabel'),
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'ALL', label: t('properties.filterAll') },
                  { value: 'AVAILABLE', label: t('rooms.statusAvailable') },
                  { value: 'OCCUPIED', label: t('rooms.statusOccupied') },
                  { value: 'MAINTENANCE', label: t('rooms.statusMaintenance') },
                ],
              },
              {
                id: 'type',
                label: t('rooms.typeLabel'),
                value: selectedType,
                onChange: setSelectedType,
                options: [
                  { value: 'ALL', label: t('rooms.roomTypeAll') },
                  { value: 'STANDARD', label: t('rooms.roomTypeStandard') },
                  { value: 'DELUXE', label: t('rooms.roomTypeDeluxe') },
                  { value: 'VIP', label: t('rooms.roomTypeVip') },
                ],
              },
            ]}
            priceRange={{
              label: t('rooms.priceRange'),
              min: 500000,
              max: 5000000,
              step: 100000,
              value: maxPrice,
              onChange: setMaxPrice,
              formatValue: (val) =>
                `≤ Rp ${val.toLocaleString(locale === 'en' ? 'en-US' : 'id-ID')}`,
              minLabel: 'Rp 500rb',
              maxLabel: 'Rp 5jt',
            }}
            checkboxGroups={[
              {
                id: 'facilities',
                label: t('rooms.facilitiesFilter'),
                layout: 'list',
                selected: selectedFacilities,
                onToggle: handleFacilityToggle,
                options: commonFacilities.map((fac) => ({ id: fac, label: fac })),
              },
            ]}
            bottomResetButton={{
              label: t('rooms.resetFilters'),
              onClick: handleResetFilters,
            }}
          />
        </div>
      </div>

    </AppLayout>
  );
}

export const RoomsView: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RoomsContent />
    </Suspense>
  );
};
