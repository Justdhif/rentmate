'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Users, UserPlus } from 'lucide-react';
import { TenantStats } from './TenantStats';
import { Assignment, TenantTable } from './TenantTable';
import { AddTenantModal } from './AddTenantModal';

export const TenantsView: React.FC = () => {
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
    if (
      !confirm(
        'Selesaikan masa sewa dan checkout penyewa "' +
          name +
          '"? Kamar akan otomatis kembali TERSEDIA.'
      )
    )
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

  const activeTenants = assignments.filter((a) => a.isActive);
  const totalRevenue = activeTenants.reduce(
    (acc, curr) => acc + Number(curr.rentAmount || 0),
    0
  );

  return (
    <AppLayout
      title="Daftar Penghuni Kost"
      subtitle="Manajemen data penghuni aktif, penempatan kamar, dan riwayat sewa."
    >
      {/* Stats Bar */}
      <TenantStats
        activeCount={activeTenants.length}
        totalRevenue={totalRevenue}
        formatCurrency={formatCurrency}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-foreground">Daftar Penghuni</h2>
          <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5">
            Kelola penempatan dan checkout penghuni.
          </p>
        </div>

        <Button
          onClick={() => {
            if (availableRooms.length === 0) {
              alert('Tidak ada kamar kosong yang tersedia saat ini.');
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl shadow-sm shadow-indigo-200 dark:shadow-none cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tetapkan Penghuni Baru</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center animate-fade-in">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <Card className="rounded-3xl p-16 text-center border border-gray-100 dark:border-border animate-fade-in shadow-sm bg-white dark:bg-card">
          <CardContent className="p-0">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-indigo-500/50" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-foreground text-xl mb-2">
              Belum Ada Penghuni
            </h3>
            <p className="text-sm text-gray-500 dark:text-muted-foreground max-w-md mx-auto">
              Sepertinya properti Anda masih kosong. Daftarkan penghuni baru dan tugaskan ke kamar
              yang tersedia untuk mulai mengelola kost Anda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <TenantTable
          assignments={assignments}
          onUnassign={handleUnassign}
          formatCurrency={formatCurrency}
        />
      )}

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
    </AppLayout>
  );
};
