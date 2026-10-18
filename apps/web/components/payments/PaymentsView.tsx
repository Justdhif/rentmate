'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import { Plus, Search, ChevronDown, Check, Receipt } from 'lucide-react';
import { Payment, PaymentTable } from './PaymentTable';
import { PaymentStats } from './PaymentStats';
import { PaymentRightSidebar } from './PaymentRightSidebar';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';

function parseCityFromAddress(address?: string): string {
  if (!address) return 'Indonesia';
  const parts = address.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 2] || parts[parts.length - 1];
  return parts[0] || address;
}

export const PaymentsView: React.FC = () => {
  const { t, locale } = useTranslation();
  const confirm = useConfirm();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [rawPayments, setRawPayments] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterProperty, setFilterProperty] = useState<string>('ALL');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultPeriod = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const [formData, setFormData] = useState({
    roomId: '',
    tenantId: '',
    amount: 1500000,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    period: defaultPeriod,
    description: t('payments.defaultInvoiceDesc', { defaultValue: 'Tagihan Sewa Kamar Bulanan' }),
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [paymentsRes, tenantsRes] = await Promise.allSettled([
        api.get('/payments'),
        api.get('/tenants'),
      ]);

      if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.success) {
        setRawPayments(paymentsRes.value.data || []);
      }
      if (tenantsRes.status === 'fulfilled' && tenantsRes.value?.success) {
        const rawTenants = tenantsRes.value.data || [];
        // Extract active assignments
        const activeAss = rawTenants.filter(
          (t: any) =>
            t.currentRoom?.id ||
            t.lastAssignmentStatus === 'ACTIVE' ||
            t.isActive
        );
        setAssignments(activeAss);

        if (activeAss.length > 0 && !formData.roomId) {
          const first = activeAss[0];
          const rId = first.currentRoom?.id || first.roomId || first.id;
          const tId = first.id || first.tenantId;
          const rent =
            Number(first.currentRoom?.monthlyRent || first.rentAmount || first.monthlyRent) ||
            1500000;
          setFormData((prev) => ({
            ...prev,
            roomId: rId,
            tenantId: tId,
            amount: rent,
          }));
        }
      }
    } catch (err: any) {
      console.warn('Gagal memuat data pembayaran:', err?.message || err);
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

  // Normalize payments data from DB
  const normalizedPayments = useMemo<Payment[]>(() => {
    return rawPayments.map((item) => {
      const tenantProfile = item.tenant?.profile;
      const tenantName =
        tenantProfile?.fullName ||
        item.tenant?.fullName ||
        item.tenant?.email?.split('@')[0] ||
        'Penyewa';

      const tenantEmail = item.tenant?.email || '';
      const tenantPhone = tenantProfile?.phoneNumber || '';

      const roomObj = item.room;
      const propObj = roomObj?.property;

      const roomNumber = roomObj?.roomNumber || '-';
      const roomType = roomObj?.roomType || 'Standard';
      const propertyName = propObj?.name || 'Kost Harmoni Residence';
      const propertyCity = parseCityFromAddress(propObj?.address);

      return {
        id: item.id,
        orderId: item.orderId || item.id,
        amount: Number(item.amount) || 0,
        paymentMethod: item.paymentMethod || 'Midtrans Snap',
        status: (item.status || 'PENDING').toUpperCase(),
        paidAt: item.paidAt,
        dueDate: item.dueDate,
        period: item.period,
        snapToken: item.snapToken,
        snapRedirectUrl: item.snapRedirectUrl,
        createdAt: item.createdAt || new Date().toISOString(),
        room: roomObj,
        tenant: item.tenant,
        invoice: item.invoice,
        tenantName,
        tenantEmail,
        tenantPhone,
        roomNumber,
        roomType,
        propertyName,
        propertyCity,
      };
    });
  }, [rawPayments]);

  // Unique properties for dropdown
  const availableProperties = useMemo(() => {
    const set = new Set<string>();
    normalizedPayments.forEach((p) => {
      if (p.propertyName) set.add(p.propertyName);
    });
    return Array.from(set);
  }, [normalizedPayments]);

  // Unique payment methods for dropdown
  const availableMethods = useMemo(() => {
    const set = new Set<string>();
    normalizedPayments.forEach((p) => {
      if (p.paymentMethod) set.add(p.paymentMethod);
    });
    return Array.from(set);
  }, [normalizedPayments]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return normalizedPayments.filter((p) => {
      // 1. Status Filter
      if (filterStatus !== 'ALL') {
        if (filterStatus === 'PAID' && p.status !== 'PAID') return false;
        if (filterStatus === 'PENDING' && p.status !== 'PENDING') return false;
        if (
          filterStatus === 'FAILED' &&
          !['FAILED', 'EXPIRED', 'CANCELLED', 'OVERDUE'].includes(p.status)
        )
          return false;
      }

      // 2. Property Filter
      if (filterProperty !== 'ALL' && p.propertyName !== filterProperty) {
        return false;
      }

      // 3. Method Filter
      if (filterMethod !== 'ALL' && p.paymentMethod !== filterMethod) {
        return false;
      }

      // 4. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const invoiceNum = (p.invoice?.invoiceNumber || p.orderId || '').toLowerCase();
        const tName = (p.tenantName || '').toLowerCase();
        const tPhone = (p.tenantPhone || '').toLowerCase();
        const tEmail = (p.tenantEmail || '').toLowerCase();
        const rNum = (p.roomNumber || '').toLowerCase();
        const pName = (p.propertyName || '').toLowerCase();

        return (
          invoiceNum.includes(q) ||
          tName.includes(q) ||
          tPhone.includes(q) ||
          tEmail.includes(q) ||
          rNum.includes(q) ||
          pName.includes(q)
        );
      }

      return true;
    });
  }, [normalizedPayments, filterStatus, filterProperty, filterMethod, searchQuery]);

  // Financial Metrics
  const totalPaid = useMemo(
    () =>
      normalizedPayments
        .filter((p) => p.status === 'PAID')
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0),
    [normalizedPayments]
  );

  const totalPending = useMemo(
    () =>
      normalizedPayments
        .filter((p) => p.status === 'PENDING')
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0),
    [normalizedPayments]
  );

  const paidCount = useMemo(
    () => normalizedPayments.filter((p) => p.status === 'PAID').length,
    [normalizedPayments]
  );

  const pendingCount = useMemo(
    () => normalizedPayments.filter((p) => p.status === 'PENDING').length,
    [normalizedPayments]
  );

  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  // Handlers
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      if (!formData.roomId) {
        throw new Error('Pilih kamar / penghuni kost terlebih dahulu');
      }

      const billRes = await api.post('/payments/create-bill', {
        roomId: formData.roomId,
        tenantId: formData.tenantId || undefined,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        period: formData.period || undefined,
      });

      if (billRes.success) {
        setIsModalOpen(false);
        toast.success(
          t('payments.createSuccess', {
            defaultValue: 'Tagihan sewa berhasil dibuat & pembayaran Midtrans disiapkan!',
          })
        );
        await fetchData();
      }
    } catch (err: any) {
      setSubmitError(err.message || t('payments.createFailed'));
      toast.error(err.message || t('payments.createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (
    paymentId: string,
    tenantName: string,
    amount: number
  ) => {
    const isConfirmed = await confirm.confirm({
      title: t('payments.markPaidConfirmTitle', {
        defaultValue: 'Tandai Tagihan Lunas',
      }),
      description: t('payments.markPaidConfirmDesc', {
        name: tenantName,
        amount: formatCurrency(amount),
        defaultValue: `Apakah Anda yakin ingin menandai tagihan untuk ${tenantName} sebesar ${formatCurrency(
          amount
        )} sebagai LUNAS?`,
      }),
      confirmText: t('common.yes', { defaultValue: 'Ya, Tandai Lunas' }),
      cancelText: t('common.cancel', { defaultValue: 'Batal' }),
      variant: 'default',
    });

    if (!isConfirmed) return;

    try {
      const res = await api.post(`/payments/${paymentId}/mark-paid`);
      if (res.success) {
        toast.success(
          t('payments.markPaidSuccess', {
            defaultValue: 'Tagihan berhasil ditandai sebagai LUNAS.',
          })
        );
        await fetchData();
      }
    } catch (err: any) {
      toast.error(
        err.message ||
          t('payments.markPaidFailed', {
            defaultValue: 'Gagal menandai tagihan lunas',
          })
      );
    }
  };

  const handleResetFilter = () => {
    setFilterStatus('ALL');
    setFilterProperty('ALL');
    setFilterMethod('ALL');
    setSearchQuery('');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* 1. Page Header */}
        <PageHeader
          title={t('payments.pageTitle', { defaultValue: 'Penagihan & Pembayaran' })}
          description={t('payments.pageDesc', {
            defaultValue:
              'Kelola tagihan sewa kost, pantau pembayaran Midtrans, dan buat invoice tagihan.',
          })}
          actions={
            <Button
              onClick={() => {
                if (assignments.length === 0) {
                  toast.warning(
                    t('payments.noActiveTenants', {
                      defaultValue:
                        'Belum ada penyewa aktif untuk dibuatkan tagihan.',
                    })
                  );
                  return;
                }
                setIsModalOpen(true);
              }}
              className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('payments.addButton', { defaultValue: 'Buat Tagihan Baru' })}</span>
            </Button>
          }
        />

        {/* 2. Summary KPI Cards Row (Dashboard & Tenant consistent style) */}
        <PaymentStats
          totalPaid={totalPaid}
          totalPending={totalPending}
          paidCount={paidCount}
          pendingCount={pendingCount}
          totalCount={normalizedPayments.length}
          formatCurrency={formatCurrency}
        />

        {/* 3. Top Filter Bar (Flat bare design consistent with Tenants) */}
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
                      ? t('payments.filterStatusAll', { defaultValue: 'Semua Status' })
                      : filterStatus === 'PAID'
                      ? t('payments.statusPaid', { defaultValue: 'Lunas' })
                      : filterStatus === 'PENDING'
                      ? t('payments.statusPending', { defaultValue: 'Menunggu' })
                      : t('payments.statusFailed', { defaultValue: 'Gagal / Lainnya' })}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 rounded-xl text-xs">
                <DropdownMenuItem
                  onClick={() => setFilterStatus('ALL')}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span>{t('payments.filterStatusAll', { defaultValue: 'Semua Status' })}</span>
                  {filterStatus === 'ALL' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterStatus('PAID')}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span>{t('payments.statusPaid', { defaultValue: 'Lunas' })}</span>
                  {filterStatus === 'PAID' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterStatus('PENDING')}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span>{t('payments.statusPending', { defaultValue: 'Menunggu' })}</span>
                  {filterStatus === 'PENDING' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterStatus('FAILED')}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span>{t('payments.statusFailed', { defaultValue: 'Gagal / Kedaluwarsa' })}</span>
                  {filterStatus === 'FAILED' && <Check className="w-3.5 h-3.5 text-blue-600" />}
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
                      ? t('payments.filterKostAll', { defaultValue: 'Semua Kost' })
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
                  <span>{t('payments.filterKostAll', { defaultValue: 'Semua Kost' })}</span>
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

            {/* Payment Method Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 px-3 rounded-xl border-slate-200 dark:border-border text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs gap-1.5"
                >
                  <span>
                    {filterMethod === 'ALL'
                      ? t('payments.filterMethodAll', { defaultValue: 'Semua Metode' })
                      : filterMethod}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 rounded-xl text-xs">
                <DropdownMenuItem
                  onClick={() => setFilterMethod('ALL')}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span>{t('payments.filterMethodAll', { defaultValue: 'Semua Metode' })}</span>
                  {filterMethod === 'ALL' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </DropdownMenuItem>
                {availableMethods.map((m) => (
                  <DropdownMenuItem
                    key={m}
                    onClick={() => setFilterMethod(m)}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <span>{m}</span>
                    {filterMethod === m && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Search Input */}
          <div className="flex items-center flex-1 lg:max-w-sm justify-end">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('payments.searchPlaceholder', {
                  defaultValue: 'Cari invoice, nama penyewa, kamar...',
                })}
                className="h-9 pl-8 text-xs rounded-xl bg-white dark:bg-muted/40 border-slate-200 dark:border-border"
              />
            </div>
          </div>
        </div>

        {/* 4. Main 2-Column Section (Left: Table, Right: Donut & Recent Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Payment Table (~75% on desktop) */}
          <div className="lg:col-span-8 xl:col-span-9">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-500 font-medium">
                  Memuat data pembayaran...
                </p>
              </div>
            ) : normalizedPayments.length === 0 ? (
              /* Fallback Empty State (Ketika data pembayaran masih kosong) */
              <div className="rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card p-14 text-center shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-foreground text-lg">
                  {t('payments.emptyTitle', { defaultValue: 'Belum Ada Tagihan / Pembayaran' })}
                </h3>
                <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                  {t('payments.emptyDesc', {
                    defaultValue:
                      'Buat tagihan baru untuk penyewa aktif Anda agar mereka dapat melakukan pembayaran via QRIS, GoPay, atau Transfer Bank.',
                  })}
                </p>
                <Button
                  onClick={() => {
                    if (assignments.length === 0) {
                      toast.warning(
                        t('payments.noActiveTenants', {
                          defaultValue:
                            'Belum ada penyewa aktif untuk dibuatkan tagihan.',
                        })
                      );
                      return;
                    }
                    setIsModalOpen(true);
                  }}
                  className="mt-6 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('payments.addButton', { defaultValue: 'Buat Tagihan Baru' })}</span>
                </Button>
              </div>
            ) : (
              <PaymentTable
                payments={filteredPayments}
                formatCurrency={formatCurrency}
                onMarkPaid={handleMarkPaid}
                onResetFilter={handleResetFilter}
              />
            )}
          </div>

          {/* Right Column: Payment Sidebar (~25% on desktop) */}
          <div className="lg:col-span-4 xl:col-span-3">
            <PaymentRightSidebar
              payments={normalizedPayments}
              formatCurrency={formatCurrency}
              onViewAll={handleResetFilter}
            />
          </div>
        </div>

        {/* 5. Create Invoice Modal */}
        <CreateInvoiceModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          assignments={assignments}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateInvoice}
          submitting={submitting}
          submitError={submitError}
        />
      </div>
    </AppLayout>
  );
};

