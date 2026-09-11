'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { DoorClosed, Plus } from 'lucide-react';
import { Room, RoomCard } from './RoomCard';
import { AddRoomModal } from './AddRoomModal';
import { RoomFilterBar } from './RoomFilterBar';

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

  const handleDeleteRoom = async (id: string, roomNumber: string) => {
    if (!confirm(`Hapus kamar ${roomNumber}? Data riwayat kamar ini akan dihapus.`)) return;
    try {
      await api.delete(`/rooms/${id}`);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus kamar');
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchProp = selectedProperty === 'ALL' || r.propertyId === selectedProperty;
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchProp && matchStatus;
    });
  }, [rooms, selectedProperty, statusFilter]);

  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter((r) => r.status === 'AVAILABLE').length;
    const occupied = rooms.filter((r) => r.status === 'OCCUPIED').length;
    const maintenance = rooms.filter((r) => r.status === 'MAINTENANCE').length;
    return { total, available, occupied, maintenance };
  }, [rooms]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <AppLayout
      title="Manajemen Kamar"
      subtitle="Kelola ketersediaan, tipe, dan tarif kamar pada setiap properti kost."
    >
      <RoomFilterBar
        properties={properties}
        selectedProperty={selectedProperty}
        setSelectedProperty={setSelectedProperty}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onOpenAddModal={() => setIsModalOpen(true)}
        stats={stats}
      />

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredRooms.length === 0 ? (
        <Card className="rounded-2xl p-12 text-center border-gray-100 dark:border-border/60 shadow-sm bg-white dark:bg-card">
          <CardContent className="p-0">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5">
              <DoorClosed className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-foreground text-lg">
              Tidak Ada Kamar
            </h3>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mt-2 max-w-sm mx-auto">
              {properties.length === 0
                ? 'Tambahkan properti terlebih dahulu sebelum dapat mendaftarkan unit kamar.'
                : 'Belum ada unit kamar yang sesuai dengan filter yang dipilih.'}
            </p>
            {properties.length > 0 && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 rounded-xl shadow-xs cursor-pointer"
              >
                + Tambah Kamar Sekarang
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

      <AddRoomModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        properties={properties}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateRoom}
        submitting={submitting}
        submitError={submitError}
      />
    </AppLayout>
  );
}

export const RoomsView: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RoomsContent />
    </Suspense>
  );
};
