'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import {
  Clock,
  CheckCircle2,
  UserCheck,
  DoorClosed,
  AlertCircle,
} from 'lucide-react';

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  actualCost?: number;
  room?: {
    id: string;
    roomNumber: string;
    property?: {
      name: string;
    };
  };
  reporter?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
    };
  };
  technician?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
    };
  };
}

export default function MaintenancePage() {
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

  const handleCloseTicket = async (ticketId: string) => {
    if (!confirm('Verifikasi hasil perbaikan dan tutup tiket komplain ini?')) return;
    try {
      await api.post('/maintenance/' + ticketId + '/close');
      await fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Gagal menutup tiket');
    }
  };

  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <AppLayout
      title="Manajemen Perbaikan (Maintenance)"
      subtitle="Pantau laporan kerusakan penghuni, assign teknisi, dan approval biaya perbaikan."
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tiket Perbaikan Fasilitas</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Total {tickets.length} laporan kerusakan tercatat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
            {tickets.filter((t) => t.status === 'REPORTED').length} Butuh Teknisi
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            {tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length} Sedang Dikerjakan
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
          <h3 className="font-bold text-gray-900 text-sm">Tidak Ada Kerusakan</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Semua fasilitas kost Anda dalam kondisi prima tanpa ada laporan masalah dari penghuni.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge size="sm">{t.status}</Badge>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      t.priority === 'CRITICAL' || t.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {t.priority || 'MEDIUM'}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-sm mt-2 line-clamp-1">
                  {t.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <DoorClosed className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>
                      Kamar {t.room?.roomNumber || '-'} ({t.room?.property?.name || 'Gedung'})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>
                      {new Date(t.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {t.technician && (
                    <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Teknisi: {t.technician.profile?.fullName || t.technician.email}</span>
                    </div>
                  )}
                  {t.actualCost && Number(t.actualCost) > 0 && (
                    <div className="flex items-center justify-between pt-1 font-semibold text-gray-900">
                      <span>Biaya Aktual:</span>
                      <span className="text-indigo-600">{formatCurrency(Number(t.actualCost))}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                {t.status === 'REPORTED' && (
                  <button
                    onClick={() => {
                      setSelectedTicket(t);
                      setIsAssignModalOpen(true);
                    }}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Tugaskan Teknisi</span>
                  </button>
                )}

                {t.status === 'RESOLVED' && (
                  <button
                    onClick={() => handleCloseTicket(t.id)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Setujui & Tutup Tiket</span>
                  </button>
                )}

                {t.status === 'CLOSED' && (
                  <span className="text-xs text-gray-400 font-medium py-1">
                    Tiket Selesai & Ditutup
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Tugaskan Teknisi Perbaikan"
      >
        <form onSubmit={handleAssignTechnician} className="space-y-4">
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-2">
              Tiket: <strong>{selectedTicket?.title}</strong> (Kamar {selectedTicket?.room?.roomNumber})
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Akun Teknisi
            </label>
            <input
              type="email"
              required
              placeholder="teknisi@rentmate.id"
              value={techEmail}
              onChange={(e) => setTechEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Teknisi akan menerima notifikasi pengerjaan dan dapat mengisi rincian biaya & bukti foto perbaikan.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Menugaskan...' : 'Tugaskan Sekarang'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
