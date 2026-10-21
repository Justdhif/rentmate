'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/custom-ui/layout/AppLayout';
import { PageHeader } from '@/components/custom-ui/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import {
  Wrench,
  CheckCircle2,
  Search,
  FilterX,
  Plus,
} from 'lucide-react';
import { MaintenanceTicket, MaintenanceTicketCard } from '@/components/custom-ui/MaintenanceTicketCard';
import { MaintenanceStats } from './MaintenanceStats';
import { AssignTechnicianModal } from '@/components/custom-ui/modals/AssignTechnicianModal';
import { MaintenanceDetailModal } from '@/components/custom-ui/modals/MaintenanceDetailModal';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface MaintenanceViewProps {
  initialTaskId?: string;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ initialTaskId }) => {
  const { t } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [propertyFilter, setPropertyFilter] = useState('ALL');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDetailTicket, setSelectedDetailTicket] = useState<MaintenanceTicket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form State
  const [techEmail, setTechEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/maintenance');
      if (res.success) {
        const data = res.data || [];
        setTickets(data);
        if (initialTaskId) {
          const match = data.find((tk: MaintenanceTicket) => tk.id === initialTaskId);
          if (match) {
            setSelectedDetailTicket(match);
            setIsDetailModalOpen(true);
          }
        }
      }
    } catch (err: any) {
      console.warn('Gagal memuat tiket pemeliharaan:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchTickets();
    } else if (!isAuthLoading && !user) {
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  // Extract unique properties for filter
  const propertiesList = useMemo(() => {
    const map = new Map<string, string>();
    tickets.forEach((t) => {
      if (t.room?.property?.name) {
        map.set(t.room.property.name, t.room.property.name);
      }
    });
    return Array.from(map.values());
  }, [tickets]);

  // Filter logic
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (t.title || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const room = (t.room?.roomNumber || '').toLowerCase();
        const prop = (t.room?.property?.name || '').toLowerCase();
        const reporter = (t.tenant?.profile?.fullName || t.reporter?.profile?.fullName || t.tenant?.email || '').toLowerCase();
        const tech = (t.technician?.profile?.fullName || t.technician?.email || '').toLowerCase();
        const ticketNo = (t.ticketNumber || '').toLowerCase();

        const matches =
          title.includes(q) ||
          desc.includes(q) ||
          room.includes(q) ||
          prop.includes(q) ||
          reporter.includes(q) ||
          tech.includes(q) ||
          ticketNo.includes(q);

        if (!matches) return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL') {
        const cat = (t.category || '').toUpperCase();
        if (categoryFilter === 'AC' && !cat.includes('AC') && !cat.includes('PENDINGIN')) return false;
        if (categoryFilter === 'PLUMBING' && !cat.includes('PLUMB') && !cat.includes('PIPA') && !cat.includes('AIR') && !cat.includes('KRAN') && !cat.includes('SANITASI')) return false;
        if (categoryFilter === 'ELECTRICAL' && !cat.includes('LISTRIK') && !cat.includes('ELECTRICAL') && !cat.includes('LAMPU') && !cat.includes('STOPKONTAK')) return false;
        if (categoryFilter === 'OTHER' && (cat.includes('AC') || cat.includes('PENDINGIN') || cat.includes('PLUMB') || cat.includes('PIPA') || cat.includes('AIR') || cat.includes('KRAN') || cat.includes('SANITASI') || cat.includes('LISTRIK') || cat.includes('ELECTRICAL'))) return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL') {
        if ((t.priority || '').toUpperCase() !== priorityFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'REPORTED' && t.status !== 'REPORTED' && t.status !== 'REVIEWING') return false;
        if (statusFilter === 'IN_PROGRESS' && t.status !== 'ASSIGNED' && t.status !== 'IN_PROGRESS') return false;
        if (statusFilter === 'RESOLVED' && t.status !== 'RESOLVED' && t.status !== 'CLOSED') return false;
      }

      // Property filter
      if (propertyFilter !== 'ALL') {
        if (t.room?.property?.name !== propertyFilter) return false;
      }

      return true;
    });
  }, [tickets, searchQuery, categoryFilter, priorityFilter, statusFilter, propertyFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    propertyFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
    setStatusFilter('ALL');
    setPropertyFilter('ALL');
  };

  const handleAssignTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await api.post('/maintenance/' + selectedTicket.id + '/assign', {
        technicianEmail: techEmail,
      });

      if (res.success) {
        setIsAssignModalOpen(false);
        toast.success(t('maintenance.assignSuccess', { email: techEmail }));
        setTechEmail('');
        await fetchTickets();
      }
    } catch (err: any) {
      setSubmitError(err.message || t('maintenance.assignFailed'));
      toast.error(err.message || t('maintenance.assignFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveTicket = async (id: string) => {
    if (!confirm(t('maintenance.resolveConfirm', { defaultValue: 'Tandai perbaikan ini sebagai selesai?' }))) return;
    try {
      await api.post('/maintenance/' + id + '/resolve', {
        actualCost: 0,
      });
      toast.success(t('maintenance.resolveSuccess', { defaultValue: 'Tiket perbaikan berhasil ditandai selesai!' }));
      await fetchTickets();
    } catch (err: any) {
      toast.error(err.message || t('maintenance.resolveFailed', { defaultValue: 'Gagal menyelesaikan tiket' }));
    }
  };

  const reportedCount = tickets.filter(
    (t) => t.status === 'REPORTED' || t.status === 'REVIEWING' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS'
  ).length;
  const resolvedCount = tickets.filter(
    (t) => t.status === 'RESOLVED' || t.status === 'CLOSED'
  ).length;

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        <PageHeader
          title={t('maintenance.pageTitle', { defaultValue: 'Tiket & Maintenance' })}
          description={t('maintenance.pageDesc', {
            defaultValue: 'Pantau laporan kerusakan dari penghuni kost dan koordinasikan perbaikan teknisi.',
          })}
        />

        {/* 1. Summary Metric Cards */}
        <MaintenanceStats
          totalCount={tickets.length}
          reportedCount={reportedCount}
          resolvedCount={resolvedCount}
        />

        {/* 2. Flat Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          {/* Left Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-10 w-[140px] rounded-xl border-slate-200 dark:border-border text-xs bg-card shadow-2xs">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">Semua Kategori</SelectItem>
                <SelectItem value="AC">AC Repair</SelectItem>
                <SelectItem value="PLUMBING">Plumbing</SelectItem>
                <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                <SelectItem value="OTHER">Lainnya</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-10 w-[140px] rounded-xl border-slate-200 dark:border-border text-xs bg-card shadow-2xs">
                <SelectValue placeholder="Semua Prioritas" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">Semua Prioritas</SelectItem>
                <SelectItem value="URGENT">Urgent (Mendesak)</SelectItem>
                <SelectItem value="HIGH">High (Tinggi)</SelectItem>
                <SelectItem value="MEDIUM">Medium (Sedang)</SelectItem>
                <SelectItem value="LOW">Low (Rendah)</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-[140px] rounded-xl border-slate-200 dark:border-border text-xs bg-card shadow-2xs">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="REPORTED">Menunggu Tindakan</SelectItem>
                <SelectItem value="IN_PROGRESS">Dalam Pengerjaan</SelectItem>
                <SelectItem value="RESOLVED">Selesai</SelectItem>
              </SelectContent>
            </Select>

            {/* Property Filter (if multiple) */}
            {propertiesList.length > 1 && (
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="h-10 w-[160px] rounded-xl border-slate-200 dark:border-border text-xs bg-card shadow-2xs">
                  <SelectValue placeholder="Semua Kost" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">Semua Kost</SelectItem>
                  {propertiesList.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-10 px-3 rounded-xl text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>

          {/* Right Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tiket, kamar, tenant, teknisi..."
              className="h-10 pl-9 pr-3 rounded-xl border-slate-200 dark:border-border text-xs bg-card shadow-2xs"
            />
          </div>
        </div>

        {/* 3. Ticket Grid / Content */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground animate-pulse">Memuat data tiket perbaikan...</p>
          </div>
        ) : tickets.length === 0 ? (
          <Card className="rounded-3xl p-16 text-center border border-slate-100 dark:border-border animate-fade-in shadow-xs bg-card">
            <CardContent className="p-0">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/60" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1.5">
                {t('maintenance.emptyTitle', { defaultValue: 'Semua Fasilitas Terawat Baik!' })}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {t('maintenance.emptyDesc', {
                  defaultValue:
                    'Tidak ada tiket laporan kerusakan yang aktif saat ini. Keluhan yang diajukan oleh penghuni akan otomatis muncul di sini.',
                })}
              </p>
            </CardContent>
          </Card>
        ) : filteredTickets.length === 0 ? (
          <Card className="rounded-2xl p-12 text-center border border-slate-100 dark:border-border shadow-xs bg-card">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tidak ada tiket yang cocok
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Coba sesuaikan kata kunci pencarian atau ubah filter yang dipilih.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="rounded-xl text-xs gap-1.5"
            >
              <FilterX className="w-3.5 h-3.5" />
              Reset Filter
            </Button>
          </Card>
        ) : (
          /* Multi-column Grid (4 Columns on Desktop, exactly matching the photo) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 animate-fade-in">
            {filteredTickets.map((t) => (
              <MaintenanceTicketCard
                key={t.id}
                ticket={t}
                onOpenAssign={(ticket: any) => {
                  setSelectedTicket(ticket);
                  setIsAssignModalOpen(true);
                }}
                onResolve={handleResolveTicket}
                onViewDetail={(ticket: any) => {
                  setSelectedDetailTicket(ticket);
                  setIsDetailModalOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Modal 1: Assign Technician */}
        <AssignTechnicianModal
          isOpen={isAssignModalOpen}
          onOpenChange={setIsAssignModalOpen}
          selectedTicket={selectedTicket}
          techEmail={techEmail}
          setTechEmail={setTechEmail}
          onSubmit={handleAssignTechnician}
          submitting={submitting}
          submitError={submitError}
        />

        {/* Modal 2: View Full Ticket Details */}
        <MaintenanceDetailModal
          isOpen={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          ticket={selectedDetailTicket}
          onOpenAssign={(ticket: any) => {
            setSelectedTicket(ticket);
            setIsAssignModalOpen(true);
          }}
          onResolve={handleResolveTicket}
        />
      </div>
    </AppLayout>
  );
};
