'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import {
  Users,
  UserPlus,
  DoorClosed,
  Calendar,
  AlertCircle,
  LogOut,
  Mail,
} from 'lucide-react';

interface Assignment {
  id: string;
  userId: string;
  roomId: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  rentAmount: number;
  user?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      phoneNumber?: string;
    };
  };
  room?: {
    id: string;
    roomNumber: string;
    property?: {
      name: string;
    };
  };
}

export default function TenantsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      if (tenantsRes.status === 'fulfilled' && tenantsRes.value.success) {
        setAssignments(tenantsRes.value.data || []);
      }
      if (roomsRes.status === 'fulfilled' && roomsRes.value.success) {
        const rooms = roomsRes.value.data || [];
        const avail = rooms.filter((r: any) => r.status === 'AVAILABLE');
        setAvailableRooms(avail);
        if (avail.length > 0 && !formData.roomId) {
          setFormData((prev) => ({
            ...prev,
            roomId: avail[0].id,
            rentAmount: Number(avail[0].monthlyPrice) || 1500000,
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
        setFormData({
          tenantEmail: '',
          roomId: availableRooms[0]?.id || '',
          rentAmount: 1500000,
          startDate: new Date().toISOString().split('T')[0],
        });
        await fetchData();
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal menetapkan kamar ke penyewa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async (id: string, name: string) => {
    if (!confirm('Selesaikan masa sewa dan checkout penyewa "' + name + '"? Kamar akan otomatis kembali TERSEDIA.'))
      return;
    try {
      await api.post('/tenants/' + id + '/unassign');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal unassign penyewa');
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
      title="Daftar Penghuni Kost"
      subtitle="Manajemen data penghuni aktif, penempatan kamar, dan riwayat sewa."
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Penghuni Aktif</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Total {assignments.filter((a) => a.isActive).length} kamar sedang tersewa
          </p>
        </div>

        <button
          onClick={() => {
            if (availableRooms.length === 0) {
              alert('Tidak ada kamar kosong yang tersedia saat ini.');
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tetapkan Penghuni Baru</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-900 text-sm">Belum Ada Penghuni</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Gunakan tombol di atas untuk mendaftarkan penghuni dan menugaskan kamar kost.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Nama Penghuni</th>
                  <th className="py-3.5 px-6">Properti & Kamar</th>
                  <th className="py-3.5 px-6">Tanggal Mulai</th>
                  <th className="py-3.5 px-6">Tarif Sewa</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {item.user?.profile?.fullName?.charAt(0) ||
                            item.user?.email?.charAt(0) ||
                            'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.user?.profile?.fullName || 'Penghuni'}
                          </p>
                          <p className="text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {item.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-medium text-gray-800">
                        <DoorClosed className="w-4 h-4 text-indigo-600" />
                        <span>Kamar {item.room?.roomNumber || '-'}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {item.room?.property?.name || 'Gedung'}
                      </p>
                    </td>

                    <td className="py-4 px-6 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {new Date(item.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-gray-900">
                      {formatCurrency(Number(item.rentAmount))}
                    </td>

                    <td className="py-4 px-6">
                      <Badge size="sm">
                        {item.isActive ? 'OCCUPIED' : 'RESOLVED'}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {item.isActive ? (
                        <button
                          onClick={() =>
                            handleUnassign(
                              item.id,
                              item.user?.profile?.fullName || item.user?.email || 'Penghuni',
                            )
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold transition cursor-pointer"
                          title="Checkout Penghuni"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Checkout</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 italic">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tetapkan Penghuni ke Kamar"
      >
        <form onSubmit={handleAssign} className="space-y-4">
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Penghuni (Akun Terdaftar)
            </label>
            <input
              type="email"
              required
              placeholder="penghuni@gmail.com"
              value={formData.tenantEmail}
              onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Jika penghuni belum memiliki akun, sistem akan membuatkan akses secara otomatis.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Pilih Kamar Tersedia
            </label>
            <select
              required
              value={formData.roomId}
              onChange={(e) => {
                const room = availableRooms.find((r) => r.id === e.target.value);
                setFormData({
                  ...formData,
                  roomId: e.target.value,
                  rentAmount: room?.monthlyPrice || formData.rentAmount,
                });
              }}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Kamar {r.roomNumber} ({r.property?.name || 'Gedung'}) - {formatCurrency(Number(r.monthlyPrice))}/bln
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tarif Kesepakatan (Rp)
              </label>
              <input
                type="number"
                required
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tanggal Masuk
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Memproses...' : 'Tetapkan Kamar'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
