'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  DoorClosed,
  Plus,
  Trash2,
  AlertCircle,
  Building2,
  Tag,
} from 'lucide-react';

interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  type: string;
  monthlyPrice: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  property?: {
    id: string;
    name: string;
  };
}

function RoomsContent() {
  const searchParams = useSearchParams();
  const initialPropertyId = searchParams.get('propertyId') || 'ALL';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>(initialPropertyId);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    propertyId: '',
    roomNumber: '',
    floor: 1,
    type: 'DELUXE',
    monthlyPrice: 1500000,
    dailyPrice: 0,
    status: 'AVAILABLE',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [roomsRes, propsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/properties'),
      ]);

      if (roomsRes.success) setRooms(roomsRes.data || []);
      if (propsRes.success) {
        const props = propsRes.data || [];
        setProperties(props);
        if (props.length > 0 && !formData.propertyId) {
          setFormData((prev) => ({ ...prev, propertyId: props[0].id }));
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

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await api.post('/rooms', {
        ...formData,
        floor: Number(formData.floor),
        monthlyPrice: Number(formData.monthlyPrice),
      });

      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          propertyId: properties[0]?.id || '',
          roomNumber: '',
          floor: 1,
          type: 'DELUXE',
          monthlyPrice: 1500000,
          dailyPrice: 0,
          status: 'AVAILABLE',
        });
        await fetchData();
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal menambahkan kamar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (id: string, roomNum: string) => {
    if (!confirm('Hapus kamar nomor ' + roomNum + '?')) return;
    try {
      await api.delete('/rooms/' + id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus kamar');
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchProperty =
        selectedProperty === 'ALL' || r.propertyId === selectedProperty;
      const matchStatus =
        statusFilter === 'ALL' || r.status === statusFilter;
      return matchProperty && matchStatus;
    });
  }, [rooms, selectedProperty, statusFilter]);

  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <AppLayout
      title="Manajemen Kamar"
      subtitle="Kelola status ketersediaan, tipe, dan tarif kamar kost Anda."
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">Semua Properti</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-medium">
            {['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-indigo-600 font-bold shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            if (properties.length === 0) {
              alert('Harap buat properti terlebih dahulu di menu Properti!');
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kamar</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <DoorClosed className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-900 text-sm">Tidak Ada Kamar</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Tidak ditemukan kamar dengan kriteria filter yang Anda pilih.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Lt. {room.floor}
                    </span>
                    <h4 className="font-bold text-gray-900 text-lg">
                      No. {room.roomNumber}
                    </h4>
                  </div>
                  <Badge size="sm">{room.status}</Badge>
                </div>

                <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span className="line-clamp-1">{room.property?.name || 'Properti'}</span>
                </p>

                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span>Tipe {room.type}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase">Tarif</span>
                  <p className="text-xs font-bold text-indigo-600">
                    {formatCurrency(Number(room.monthlyPrice))}/bln
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  title="Hapus Kamar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Unit Kamar Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRoom} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Gedung / Properti
              </label>
              <select
                required
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor Kamar
                </label>
                <input
                  type="text"
                  required
                  placeholder="101"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lantai
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tipe Kamar
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="DELUXE">Deluxe</option>
                  <option value="VIP">VIP</option>
                  <option value="SUITE">Suite</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tarif Bulanan (Rp)
                </label>
                <input
                  type="number"
                  required
                  step={50000}
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
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
                {submitting ? 'Menyimpan...' : 'Simpan Kamar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Memuat kamar...</div>}>
      <RoomsContent />
    </Suspense>
  );
}
