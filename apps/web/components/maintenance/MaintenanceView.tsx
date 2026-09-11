'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Wrench, CheckCircle2 } from 'lucide-react';
import { MaintenanceTicket, MaintenanceTicketCard } from './MaintenanceTicketCard';
import { MaintenanceStats } from './MaintenanceStats';
import { AssignTechnicianModal } from './AssignTechnicianModal';

export const MaintenanceView: React.FC = () => {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [techEmail, setTechEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/maintenance');
      if (res.success) {
        setTickets(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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
        setTechEmail('');
        await fetchTickets();
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal menugaskan teknisi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveTicket = async (id: string) => {
    if (!confirm('Tandai perbaikan ini sebagai selesai?')) return;
    try {
      await api.post('/maintenance/' + id + '/resolve', {
        actualCost: 0,
      });
      await fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Gagal menyelesaikan tiket');
    }
  };

  const reportedCount = tickets.filter((t) => t.status === 'REPORTED').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <AppLayout
      title="Tiket & Maintenance"
      subtitle="Pantau laporan kerusakan dari penghuni kost dan koordinasikan perbaikan teknisi."
    >
      {/* Metric Cards */}
      <MaintenanceStats
        totalCount={tickets.length}
        reportedCount={reportedCount}
        resolvedCount={resolvedCount}
      />

      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-foreground">Daftar Tiket Perbaikan</h2>
        <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5">
          Keluhan fasilitas yang dilaporkan oleh penghuni kamar.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center animate-fade-in">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <Card className="rounded-3xl p-16 text-center border border-gray-100 dark:border-border animate-fade-in shadow-sm bg-white dark:bg-card">
          <CardContent className="p-0">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/50" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-foreground text-xl mb-2">
              Semua Fasilitas Terawat Baik!
            </h3>
            <p className="text-sm text-gray-500 dark:text-muted-foreground max-w-md mx-auto">
              Tidak ada tiket laporan kerusakan yang aktif saat ini. Keluhan yang diajukan oleh penghuni
              akan otomatis muncul di sini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map((t) => (
            <MaintenanceTicketCard
              key={t.id}
              ticket={t}
              onOpenAssign={(ticket) => {
                setSelectedTicket(ticket);
                setIsAssignModalOpen(true);
              }}
              onResolve={handleResolveTicket}
            />
          ))}
        </div>
      )}

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
    </AppLayout>
  );
};
