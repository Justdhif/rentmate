'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Plus,
  Building2,
  Check,
  X,
} from 'lucide-react';
import { Property, PropertyCard } from './PropertyCard';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchFilterCard } from '@/components/common/SearchFilterCard';
import { toast } from 'sonner';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';

// Helper to reliably detect property type (PUTRI, PUTRA, CAMPUR)
const detectPropertyType = (name: string, description?: string, explicitType?: string) => {
  if (explicitType && ['PUTRI', 'PUTRA', 'CAMPUR'].includes(explicitType.toUpperCase())) {
    return explicitType.toUpperCase();
  }
  const combined = `${name} ${description || ''}`.toLowerCase();
  if (combined.includes('putri')) return 'PUTRI';
  if (combined.includes('putra') || combined.includes('pria')) return 'PUTRA';
  return 'CAMPUR';
};

// Helper to extract city from address string if city is not stored directly
const extractCityFromAddress = (address: string, city?: string) => {
  if (city && city.trim() && city !== 'Indonesia') return city;
  const lower = address.toLowerCase();
  if (lower.includes('jakarta selatan')) return 'Jakarta Selatan';
  if (lower.includes('jakarta barat')) return 'Jakarta Barat';
  if (lower.includes('jakarta pusat')) return 'Jakarta Pusat';
  if (lower.includes('jakarta timur')) return 'Jakarta Timur';
  if (lower.includes('jakarta utara')) return 'Jakarta Utara';
  if (lower.includes('depok')) return 'Depok';
  if (lower.includes('bandung')) return 'Bandung';
  if (lower.includes('yogyakarta') || lower.includes('jogja') || lower.includes('sleman'))
    return 'Yogyakarta';
  if (lower.includes('bogor')) return 'Bogor';
  if (lower.includes('tangerang')) return 'Tangerang';
  if (lower.includes('bekasi')) return 'Bekasi';
  return 'Jakarta';
};

export const PropertiesView: React.FC = () => {
  const { t, locale } = useTranslation();
  const confirm = useConfirm();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'PUTRI',
    'PUTRA',
    'CAMPUR',
  ]);
  const [activeQuickType, setActiveQuickType] = useState<string>('ALL');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>(
    'newest'
  );

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<Property[]>('/properties');
      if (res.success && res.data) {
        setProperties(res.data);
      }
    } catch (err: any) {
      console.warn('Gagal memuat daftar properti:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchProperties();
    } else if (!isAuthLoading && !user) {
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm.danger({
      title: t('properties.deleteDialogTitle'),
      description: t('properties.deleteDialogDesc', { name }),
      confirmText: t('properties.deleteButton'),
    });
    if (!confirmed) return;
    try {
      await api.delete('/properties/' + id);
      toast.success(t('properties.deleteSuccess', { name }));
      await fetchProperties();
    } catch (err: any) {
      toast.error(err.message || t('properties.deleteFailed'));
    }
  };

  // Pure database properties enriched with pricing, rooms, and detected types
  const dbProperties = useMemo(() => {
    return properties.map((p) => {
      const minRoomPrice =
        p.rooms && p.rooms.length > 0
          ? Math.min(...p.rooms.map((r: any) => Number(r.price) || 1500000))
          : 1500000;

      const detectedType = detectPropertyType(p.name, p.description, p.type);
      const detectedCity = extractCityFromAddress(p.address, p.city);

      return {
        ...p,
        price: p.price || minRoomPrice,
        type: detectedType,
        city: detectedCity,
      };
    });
  }, [properties]);

  // Compute total rooms across all user properties
  const totalRooms = useMemo(() => {
    return properties.reduce((acc, curr) => acc + (curr.rooms?.length || 0), 0);
  }, [properties]);

  // Extract unique cities from user database properties
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    dbProperties.forEach((p) => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set);
  }, [dbProperties]);

  // Handle Quick Type pill clicks
  const handleQuickTypeChange = (type: string) => {
    setActiveQuickType(type);
    if (type === 'ALL') {
      setSelectedTypes(['PUTRI', 'PUTRA', 'CAMPUR']);
    } else {
      setSelectedTypes([type]);
    }
  };

  // Handle Type Checkbox toggle
  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      const next = selectedTypes.filter((t) => t !== type);
      setSelectedTypes(next);
      if (next.length === 1) {
        setActiveQuickType(next[0]);
      } else if (next.length === 3) {
        setActiveQuickType('ALL');
      } else {
        setActiveQuickType('CUSTOM');
      }
    } else {
      const next = [...selectedTypes, type];
      setSelectedTypes(next);
      if (next.length === 3) {
        setActiveQuickType('ALL');
      } else if (next.length === 1) {
        setActiveQuickType(next[0]);
      } else {
        setActiveQuickType('CUSTOM');
      }
    }
  };

  // Handle Facility Checkbox toggle
  const handleFacilityToggle = (facility: string) => {
    if (selectedFacilities.includes(facility)) {
      setSelectedFacilities(selectedFacilities.filter((f) => f !== facility));
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchLocation('');
    setSelectedCity('ALL');
    setMaxPrice(5000000);
    setSelectedTypes(['PUTRI', 'PUTRA', 'CAMPUR']);
    setActiveQuickType('ALL');
    setSelectedFacilities([]);
    setSortBy('newest');
  };

  // Filter and sort user database properties
  const filteredProperties = useMemo(() => {
    return dbProperties
      .filter((prop) => {
        // 1. Search query (name, address, city)
        if (searchLocation.trim()) {
          const q = searchLocation.toLowerCase();
          const matchName = prop.name.toLowerCase().includes(q);
          const matchAddress = prop.address.toLowerCase().includes(q);
          const matchCity = (prop.city || '').toLowerCase().includes(q);
          if (!matchName && !matchAddress && !matchCity) return false;
        }

        // 2. City dropdown
        if (selectedCity !== 'ALL') {
          if (prop.city !== selectedCity) return false;
        }

        // 3. Price slider
        const propPrice = prop.price || 1000000;
        if (propPrice > maxPrice) return false;

        // 4. Type filter
        const propType = (prop.type || 'CAMPUR').toUpperCase();
        if (selectedTypes.length > 0 && !selectedTypes.includes(propType)) {
          return false;
        }

        // 5. Facilities filter
        if (selectedFacilities.length > 0) {
          const propFacNames =
            prop.facilities?.map((f: any) =>
              (typeof f === 'string' ? f : f.name || '').toLowerCase()
            ) || [];

          for (const requiredFac of selectedFacilities) {
            const reqLower = requiredFac.toLowerCase();
            const hasIt = propFacNames.some((f) => f.includes(reqLower));
            if (!hasIt) {
              if (reqLower.includes('wifi') && propFacNames.some((f) => f.includes('wi-fi') || f.includes('wifi') || f.includes('internet'))) continue;
              if (reqLower.includes('parkir') && propFacNames.some((f) => f.includes('parkir'))) continue;
              if (reqLower.includes('dapur') && propFacNames.some((f) => f.includes('dapur'))) continue;
              return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          return (a.price || 0) - (b.price || 0);
        }
        if (sortBy === 'price-desc') {
          return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === 'rating') {
          return (b.rating || 4.8) - (a.rating || 4.8);
        }
        return 0; // Default newest
      });
  }, [
    dbProperties,
    searchLocation,
    selectedCity,
    maxPrice,
    selectedTypes,
    selectedFacilities,
    sortBy,
  ]);

  const sortLabelMap: Record<string, string> = {
    newest: t('properties.sortNewest'),
    'price-asc': t('properties.sortPriceAsc'),
    'price-desc': t('properties.sortPriceDesc'),
    rating: t('properties.sortRating'),
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchLocation.trim() ||
      selectedCity !== 'ALL' ||
      maxPrice < 5000000 ||
      activeQuickType !== 'ALL' ||
      selectedFacilities.length > 0
    );
  }, [searchLocation, selectedCity, maxPrice, activeQuickType, selectedFacilities]);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* 1. Page Header: Tetap Ada & Selaras dengan Halaman Lain */}
        <PageHeader
          title={t('properties.pageTitle')}
          description={t('properties.pageDesc')}
          actions={
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 text-xs font-semibold px-2.5 py-1 rounded-lg"
                >
                  {t('properties.countBadge', { count: properties.length })}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold px-2.5 py-1 rounded-lg"
                >
                  {t('properties.roomCountBadge', { count: totalRooms })}
                </Badge>
              </div>
              <Button
                asChild
                className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer gap-2"
              >
                <Link href="/properties/create">
                  <Plus className="w-4 h-4" />
                  <span>{t('properties.addButton')}</span>
                </Link>
              </Button>
            </div>
          }
        />

        {/* 2-Column Main Section: Left = Property Cards Grid, Right = Consolidated Sticky Filter Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Property Cards Grid (~75% desktop) */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Clean Result Count & Active Filter Chips Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('properties.showingCount', { count: filteredProperties.length })}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  ({t('properties.countBadge', { count: properties.length })})
                </span>
              </div>

              {/* Active Filter Chips with X buttons */}
              {hasActiveFilters && (
                <div className="flex items-center flex-wrap gap-1.5">
                  {searchLocation.trim() && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-border">
                      <span>"{searchLocation}"</span>
                      <button
                        type="button"
                        onClick={() => setSearchLocation('')}
                        className="hover:text-red-500 cursor-pointer"
                        title="Hapus filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedCity !== 'ALL' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-border">
                      <span>{selectedCity}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCity('ALL')}
                        className="hover:text-red-500 cursor-pointer"
                        title="Hapus filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {activeQuickType !== 'ALL' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                      <span>
                        {activeQuickType === 'PUTRI'
                          ? t('properties.filterFemaleKost')
                          : activeQuickType === 'PUTRA'
                          ? t('properties.filterMaleKost')
                          : t('properties.filterMixedKost')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuickTypeChange('ALL')}
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
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1"
                  >
                    {t('properties.resetFilters')}
                  </button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-500 font-medium">
                  {t('properties.loadingDatabase')}
                </p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <EmptyState
                icon={Building2}
                iconColor="blue"
                title={
                  properties.length === 0
                    ? t('properties.emptyTitle')
                    : t('properties.emptyFilteredTitle')
                }
                description={
                  properties.length === 0
                    ? t('properties.emptyDesc')
                    : t('properties.emptyFilteredDesc')
                }
                action={
                  properties.length === 0
                    ? {
                        label: t('properties.emptyAction'),
                        href: '/properties/create',
                        icon: Plus,
                      }
                    : {
                        label: t('properties.resetFilters'),
                        onClick: handleResetFilters,
                        icon: RotateCcw,
                        variant: 'outline',
                      }
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProperties.map((property, idx) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={idx}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Consolidated Sticky Filter Sidebar using unified SearchFilterCard */}
          <SearchFilterCard
            className="lg:col-span-4 xl:col-span-3"
            title={t('properties.searchFilters')}
            hasActiveFilters={hasActiveFilters}
            onReset={handleResetFilters}
            resetLabel={t('properties.reset')}
            sort={{
              label: t('properties.sortBy', { label: '' }).replace(':', '').trim(),
              value: sortBy,
              onChange: (val) => setSortBy(val as any),
              options: [
                { value: 'newest', label: t('properties.sortNewest') },
                { value: 'price-asc', label: t('properties.sortPriceAsc') },
                { value: 'price-desc', label: t('properties.sortPriceDesc') },
                { value: 'rating', label: t('properties.sortRating') },
              ],
            }}
            search={{
              label: t('properties.locationLabel'),
              value: searchLocation,
              onChange: setSearchLocation,
              placeholder: t('properties.searchLocationPlaceholder'),
            }}
            selects={[
              {
                id: 'city',
                value: selectedCity,
                onChange: setSelectedCity,
                placeholder: t('properties.allCities'),
                options: [
                  { value: 'ALL', label: t('properties.allCities') },
                  ...availableCities.map((city) => ({ value: city, label: city })),
                ],
              },
            ]}
            pillGroups={[
              {
                id: 'type',
                label: t('properties.typeLabel'),
                value: activeQuickType,
                onChange: handleQuickTypeChange,
                options: [
                  { value: 'ALL', label: t('properties.filterAll') },
                  { value: 'PUTRI', label: t('properties.filterFemale') },
                  { value: 'PUTRA', label: t('properties.filterMale') },
                  { value: 'CAMPUR', label: t('properties.filterMixed') },
                ],
              },
            ]}
            priceRange={{
              label: t('properties.priceLabel'),
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
                label: t('properties.facilitiesFilter'),
                layout: 'grid',
                selected: selectedFacilities,
                onToggle: handleFacilityToggle,
                options: [
                  { id: 'WiFi', label: t('properties.facilityWifi') },
                  { id: 'AC', label: t('properties.facilityAC') },
                  {
                    id: 'Kamar Mandi Dalam',
                    label: t('properties.facilityPrivateBathroom'),
                  },
                  { id: 'Parkir', label: t('properties.facilityParking') },
                  { id: 'Dapur', label: t('properties.facilityKitchen') },
                  { id: 'Security', label: t('properties.facilitySecurity') },
                ],
              },
            ]}
            applyButton={{
              label: t('properties.applyFilters'),
              onClick: () => {
                toast.success(
                  t('properties.filtersActiveNotice', {
                    filtered: filteredProperties.length,
                    total: properties.length,
                  })
                );
              },
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
};
