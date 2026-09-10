'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import {
  Plus,
  Receipt,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  paidAt?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  createdAt: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    dueDate: string;
    description?: string;
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    roomAssignmentId: '',
    amount: 1500000,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Tagihan Sewa Kamar Bulanan',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [paymentsRes, tenantsRes] = await Promise.allSettled([
        api.get('/payments'),
        api.get('/tenants'),
      ]);

      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.success) {
        setPayments(paymentsRes.value.data || []);
      }
      if (tenantsRes.status === 'fulfilled' && tenantsRes.value.success) {
        const activeAss = (tenantsRes.value.data || []).filter((a: any) => a.isActive);
        setAssignments(activeAss);
        if (activeAss.length > 0 && !formData.roomAssignmentId) {
          setFormData((prev) => ({
            ...prev,
            roomAssignmentId: activeAss[0].id,
            amount: Number(activeAss[0].rentAmount) || 1500000,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const invoiceRes = await api.post('/payments/invoices', {
        roomAssignmentId: formData.roomAssignmentId,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        description: formData.description,
      });

      if (invoiceRes.success && invoiceRes.data) {
        await api.post('/payments/snap', {
          invoiceId: invoiceRes.data.id,
        });

        setIsModalOpen(false);
        await fetchData();
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal menerbitkan tagihan Midtrans');
    } finally {
      setSubmitting(false);
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
      title="Manajemen Keuangan & Tagihan"
      subtitle="Pantau pembayaran sewa kamar melalui otomatisasi Midtrans Snap & konfirmasi manual."
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Riwayat Pembayaran & Invoice</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Integrasi langsung dengan Midtrans Payment Gateway
          </p>
        </div>

        <button
          onClick={() => {
            if (assignments.length === 0) {
              alert('Belum ada penghuni aktif untuk ditagih. Tetapkan penghuni terlebih dahulu!');
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tagihan Baru</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-900 text-sm">Belum Ada Transaksi</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Terbitkan invoice pertama untuk menghasilkan tautan pembayaran otomatis Midtrans Snap untuk penyewa.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">No. Invoice / Order ID</th>
                  <th className="py-3.5 px-6">Tanggal Dibuat</th>
                  <th className="py-3.5 px-6">Nominal</th>
                  <th className="py-3.5 px-6">Metode</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900">
                        {p.invoice?.invoiceNumber || p.orderId}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {p.invoice?.description || 'Tagihan Sewa'}
                      </p>
                    </td>

                    <td className="py-4 px-6 text-gray-600">
                      {new Date(p.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900">
                      {formatCurrency(Number(p.amount))}
                    </td>

                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {p.paymentMethod || 'Midtrans Snap'}
                    </td>

                    <td className="py-4 px-6">
                      <Badge size="sm">{p.status}</Badge>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {p.snapRedirectUrl && p.status === 'PENDING' ? (
                        <a
                          href={p.snapRedirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold transition"
                        >
                          <span>Bayar Snap</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : p.status === 'PAID' ? (
                        <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Lunas
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Terbitkan Tagihan Sewa Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pilih Penghuni Kost
              </label>
              <select
                required
                value={formData.roomAssignmentId}
                onChange={(e) => {
                  const ass = assignments.find((a) => a.id === e.target.value);
                  setFormData({
                    ...formData,
                    roomAssignmentId: e.target.value,
                    amount: ass?.rentAmount || formData.amount,
                  });
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.user?.profile?.fullName || a.user?.email} - Kamar {a.room?.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nominal Tagihan (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Jatuh Tempo Pembayaran
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Keterangan Tagihan
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-indigo-50/70 rounded-xl text-[11px] text-indigo-800 leading-relaxed">
              Invoice ini akan langsung di-generate ke Midtrans Sandbox dan menghasilkan tautan QRIS, Virtual Account, & GoPay.
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Menerbitkan...' : 'Terbitkan Tagihan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
