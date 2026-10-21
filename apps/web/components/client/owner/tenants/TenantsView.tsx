'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/custom-ui/layout/AppLayout';
import { PageHeader } from '@/components/custom-ui/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import {
  Users,
  UserPlus,
  Search,
  ChevronDown,
  Check,
} from 'lucide-react';
import { TenantStats } from './TenantStats';
import { TenantDisplayItem, TenantTable } from './TenantTable';
import { TenantRightSidebar } from './TenantRightSidebar';
import { AddTenantModal } from '@/components/custom-ui/modals/AddTenantModal';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/LanguageContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useAuth } from '@/contexts/AuthContext';

/** Extract city segment from a property address string, e.g. "Jl. ..., Tebet, Jakarta Selatan" → "Tebet" */
function parseCityFromAddress(address: string): string {
  if (!address) return '';
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length >= 2) return parts[parts.length - 2] || parts[parts.length - 1];
  return parts[0] || address;
}

export const TenantsView: React.FC = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [rawTenants, setRawTenants] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [totalRoomsCount, setTotalRoomsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States (matching reference image)
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterProperty, setFilterProperty] = useState<string>('ALL');
  const [filterRoomType, setFilterRoomType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tenantEmail: '',
    roomId: '',
    rentAmount: 1500000,
    startDate: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tenantsRes, roomsRes] = await Promise.allSettled([
        api.get('/tenants'),
        api.get('/rooms'),
      ]);

      if (tenantsRes.status === 'fulfilled' && tenantsRes.value?.success) {
        setRawTenants(tenantsRes.value.data || []);
      }
      if (roomsRes.status === 'fulfilled' && roomsRes.value?.success) {
        const rooms = roomsRes.value.data || [];
        const avail = rooms.filter((r: any) => r.status === 'AVAILABLE');
        setAvailableRooms(avail);
        setTotalRoomsCount(rooms.length);
        if (avail.length > 0 && !formData.roomId) {
          setFormData((prev) => ({
            ...prev,
            roomId: avail[0].id,
            rentAmount: Number(avail[0].price || avail[0].monthlyPrice) || 1500000,
          }));
        }
      }
    } catch (err: any) {
      console.warn('Gagal memuat data penyewa:', err?.message || err);
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


  // Normalize API data to unified TenantDisplayItem
  const normalizedTenants: TenantDisplayItem[] = useMemo(() => {
    return rawTenants.map((item: any, idx: number) => {
      const profile = item.profile || {};
      const userObj = item.user || {};

      // currentRoom is set for ACTIVE, lastAssignment for ENDED tenants
      const room = item.currentRoom || item.lastAssignment || item.room || {};

      const fullName =
        profile.fullName ||
        userObj.profile?.fullName ||
        item.fullName ||
        item.name ||
        item.email?.split('@')[0] ||
        `Penyewa #${idx + 1}`;

      const email = item.email || userObj.email || '';
      const phone =
        profile.phoneNumber ||
        item.phoneNumber ||
        item.phone ||
        '-';

      const roomNumber = room.roomNumber || item.roomNumber || '';
      const roomType = room.roomType || item.roomType || '';
      const propertyName = room.propertyName || item.propertyName || '';

      // Parse city from address since DB has no separate city column
      const propertyCity = parseCityFromAddress(
        room.propertyAddress || item.propertyAddress || ''
      );

      // Determine status
      let status: 'ACTIVE' | 'PENDING' | 'ENDED' = 'ACTIVE';
      const rawStatus = (
        item.lastAssignmentStatus ||
        room.assignmentStatus ||
        item.status ||
        'ACTIVE'
      ).toUpperCase();

      if (rawStatus === 'PENDING') status = 'PENDING';
      else if (rawStatus === 'ENDED' || rawStatus === 'CHECKED_OUT' || rawStatus === 'CANCELLED')
        status = 'ENDED';
      else status = 'ACTIVE';

      const startDate = room.startDate || item.startDate || '';
      const endDate = room.endDate ?? item.endDate ?? undefined;
      const monthlyRent = Number(room.monthlyRent || item.monthlyRent || item.rentAmount || 0);
      const assignmentId = room.assignmentId || item.assignmentId || item.id;

      return {
        id: item.id || `tenant-${idx}`,
        assignmentId,
        name: fullName,
        email,
        phone,
        roomNumber,
        roomType,
        propertyName,
        propertyCity,
        status,
        startDate,
        endDate,
        monthlyRent,
        isActive: status === 'ACTIVE',
      };
    });
  }, [rawTenants]);

  // Unique properties for dropdown filter
  const availableProperties = useMemo(() => {
    const set = new Set<string>();
    normalizedTenants.forEach((t) => {
      if (t.propertyName) set.add(t.propertyName);
    });
    return Array.from(set);
  }, [normalizedTenants]);

  // Unique room types for dropdown filter
  const availableRoomTypes = useMemo(() => {
    const set = new Set<string>();
    normalizedTenants.forEach((t) => {
      if (t.roomType) set.add(t.roomType);
    });
    return Array.from(set);
  }, [normalizedTenants]);

  // Filtered tenants list
  const filteredTenants = useMemo(() => {
    return normalizedTenants.filter((t) => {
      // 1. Status Filter
      if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;

      // 2. Kost / Property Filter
      if (filterProperty !== 'ALL' && t.propertyName !== filterProperty)
        return false;

      // 3. Room Type Filter
      if (
        filterRoomType !== 'ALL' &&
        t.roomType?.toLowerCase() !== filterRoomType.toLowerCase()
      )
        return false;

      // 4. Search Query (name, phone, roomNumber, email, propertyName)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchEmail = t.email.toLowerCase().includes(q);
        const matchPhone = (t.phone || '').toLowerCase().includes(q);
        const matchRoom = (t.roomNumber || '').toLowerCase().includes(q);
        const matchKost = (t.propertyName || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchRoom && !matchKost)
          return false;
      }

      return true;
    });
  }, [
    normalizedTenants,
    filterStatus,
    filterProperty,
    filterRoomType,
    searchQuery,
  ]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await api.post('/tenants/assign', {
        email: formData.tenantEmail,
        roomId: formData.roomId,
        rentAmount: Number(formData.rentAmount),
        startDate: formData.startDate,
      });

      if (res.success) {
        setIsModalOpen(false);
        toast.success(
          t('tenants.assignSuccess', {
            email: formData.tenantEmail,
            defaultValue: `Penghuni ${formData.tenantEmail} berhasil ditetapkan ke kamar!`,
          })
        );
        setFormData({
          tenantEmail: '',
          roomId: availableRooms[0]?.id || '',
          rentAmount: 1500000,
          startDate: new Date().toISOString().split('T')[0],
        });
        await fetchData();
      }
    } catch (err: any) {
      setSubmitError(err.message || t('tenants.assignFailed'));
      toast.error(err.message || t('tenants.assignFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async (id: string, name: string) => {
    const confirmed = await confirm.danger({
      title: t('tenants.checkoutConfirmTitle', {
        defaultValue: 'Checkout Penghuni',
      }),
      description: t('tenants.checkoutConfirm', {
        name,
        defaultValue: `Selesaikan masa sewa dan checkout penyewa "${name}"? Kamar akan otomatis kembali TERSEDIA.`,
      }),
      confirmText: t('tenants.checkout', { defaultValue: 'Checkout' }),
    });
    if (!confirmed) return;
    try {
      await api.post('/tenants/' + id + '/unassign');
      toast.success(
        t('tenants.checkoutSuccess', {
          name,
          defaultValue: `Penyewa "${name}" berhasil di-checkout.`,
        })
      );
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || t('tenants.checkoutFailed'));
    }
  };

  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const activeTenants = normalizedTenants.filter((a) => a.isActive);
  const totalRevenue = activeTenants.reduce(
    (acc, curr) => acc + Number(curr.monthlyRent || 0),
    0
  );

  const resetAllFilters = () => {
    setFilterStatus('ALL');
    setFilterProperty('ALL');
    setFilterRoomType('ALL');
    setSearchQuery('');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* 1. Page Header (Maintained as requested) */}
        <PageHeader
          title={t('tenants.pageTitle', { defaultValue: 'Daftar Penghuni Kost' })}
          description={t('tenants.pageDesc', {
            defaultValue:
              'Manajemen data penghuni aktif, penempatan kamar, dan riwayat sewa.',
          })}
          actions={
            <Button
              onClick={() => {
                if (availableRooms.length === 0) {
                  toast.warning(
                    t('tenants.noAvailableRooms', {
                      defaultValue:
                        'Tidak ada kamar kosong yang tersedia saat ini.',
                    })
                  );
                  return;
                }
                setIsModalOpen(true);
              }}
              className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('tenants.addButton', { defaultValue: 'Tambah Tenant' })}</span>
            </Button>
          }
        />

        {/* 2. Summary KPI Cards Row (Dashboard consistent style) */}
        <TenantStats
          activeCount={activeTenants.length}
          totalRooms={totalRoomsCount}
          occupiedRooms={
            totalRoomsCount > 0
              ? totalRoomsCount - availableRooms.length
              : activeTenants.length
          }
          totalRevenue={totalRevenue}
          formatCurrency={formatCurrency}
        />

        {/* 3. Top Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Left: Dropdown Filters */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 px-3 rounded-xl border-slate-200 dark:border-border text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs gap-1.5"
                >
                  <span>
                    {filterStatus === 'ALL'
                      ? t('tenants.filterStatusAll', { defaultValue: 'Semua Status' })
                      : filterStatus === 'ACTIVE'
                      ? t('tenants.filterStatusActive', { defaultValue: 'Aktif' })
                      : filterStatus === 'PENDING'
                      ? t('tenants.filterStatusPending', { defaultValue: 'Pending' })
                      : t('tenants.filterStatusEnded', { defaultValue: 'Keluar' })}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 rounded-xl text-xs">
                <DropdownMenuItem
                  onClick={() => setFilterStatus('ALL')}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span>{t('tenants.filterStatusAll', { defaultValue: 'Semua Status' })}</span>
                  {filterStatus === 'ALL' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterStatus('ACTIVE')}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span>{t('tenants.filterStatusActive', { defaultValue: 'Aktif' })}</span>
                  {filterStatus === 'ACTIVE' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterStatus('PENDING')}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span>{t('tenants.filterStatusPending', { defaultValue: 'Pending' })}</span>
                  {filterStatus === 'PENDING' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterStatus('ENDED')}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span>{t('tenants.filterStatusEnded', { defaultValue: 'Keluar' })}</span>
                  {filterStatus === 'ENDED' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Kost Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 px-3 rounded-xl border-slate-200 dark:border-border text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs gap-1.5 max-w-[200px]"
                >
                  <span className="truncate">
                    {filterProperty === 'ALL'
                      ? t('tenants.filterKostAll', { defaultValue: 'Semua Kost' })
                      : filterProperty}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl text-xs">
                <DropdownMenuItem
                  onClick={() => setFilterProperty('ALL')}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span>{t('tenants.filterKostAll', { defaultValue: 'Semua Kost' })}</span>
                  {filterProperty === 'ALL' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </DropdownMenuItem>
                {availableProperties.map((prop) => (
                  <DropdownMenuItem
                    key={prop}
                    onClick={() => setFilterProperty(prop)}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <span className="truncate">{prop}</span>
                    {filterProperty === prop && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Room Type Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 px-3 rounded-xl border-slate-200 dark:border-border text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs gap-1.5"
                >
                  <span>
                    {filterRoomType === 'ALL'
                      ? t('tenants.filterRoomTypeAll', { defaultValue: 'Semua Tipe Kamar' })
                      : filterRoomType}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 rounded-xl text-xs">
                <DropdownMenuItem
                  onClick={() => setFilterRoomType('ALL')}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span>{t('tenants.filterRoomTypeAll', { defaultValue: 'Semua Tipe Kamar' })}</span>
                  {filterRoomType === 'ALL' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </DropdownMenuItem>
                {['Standard', 'Deluxe', 'Premium', ...availableRoomTypes.filter(t => !['standard', 'deluxe', 'premium'].includes(t.toLowerCase()))].map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => setFilterRoomType(type)}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <span>{type}</span>
                    {filterRoomType === type && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Search Input only */}
          <div className="flex items-center flex-1 lg:max-w-sm justify-end">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('tenants.searchPlaceholder', {
                  defaultValue: 'Cari nama, nomor HP, atau kamar...',
                })}
                className="h-9 pl-8 text-xs rounded-xl bg-white dark:bg-muted/40 border-slate-200 dark:border-border"
              />
            </div>
          </div>
        </div>

        {/* 4. Main 2-Column Section (Left: Table, Right: Donut & Recent Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tenant Table (~75% desktop) */}
          <div className="lg:col-span-8 xl:col-span-9">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-500 font-medium">
                  Memuat data penyewa...
                </p>
              </div>
            ) : normalizedTenants.length === 0 ? (
              /* Fallback Empty State (Ketika data tenant masih kosong) */
              <div className="rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card p-14 text-center shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-foreground text-lg">
                  {t('tenants.emptyTitle', { defaultValue: 'Belum Ada Penghuni' })}
                </h3>
                <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                  {t('tenants.emptyDesc', {
                    defaultValue:
                      'Sepertinya properti Anda masih belum memiliki penghuni aktif. Tetapkan penghuni baru ke kamar kosong untuk mulai mengelola kost Anda.',
                  })}
                </p>
                <Button
                  onClick={() => {
                    if (availableRooms.length === 0) {
                      toast.warning(
                        t('tenants.noAvailableRooms', {
                          defaultValue: 'Tidak ada kamar kosong yang tersedia saat ini.',
                        })
                      );
                      return;
                    }
                    setIsModalOpen(true);
                  }}
                  className="mt-6 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm cursor-pointer inline-flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('tenants.addButton', { defaultValue: 'Tetapkan Penghuni Baru' })}</span>
                </Button>
              </div>
            ) : (
              <TenantTable
                tenants={filteredTenants}
                onUnassign={handleUnassign}
                formatCurrency={formatCurrency}
                onResetFilter={resetAllFilters}
              />
            )}
          </div>

          {/* Right Column: Donut Summary, Recent Tenants & Help (~25% desktop) */}
          <div className="lg:col-span-4 xl:col-span-3">
            <TenantRightSidebar
              tenants={normalizedTenants}
              onViewAll={() => setFilterStatus('ALL')}
            />
          </div>
        </div>

        {/* Modal Tambah Tenant */}
        <AddTenantModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          availableRooms={availableRooms}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAssign}
          submitting={submitting}
          submitError={submitError}
        />
      </div>
    </AppLayout>
  );
};
