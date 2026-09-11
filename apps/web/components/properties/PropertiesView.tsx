'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Building2, Plus } from 'lucide-react';
import { Property, PropertyCard } from './PropertyCard';
import { AddPropertyModal } from './AddPropertyModal';

export const PropertiesView: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: 'Jawa Barat',
    postalCode: '',
    description: '',
    type: 'CAMPUR',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<Property[]>('/properties');
      if (res.success) {
        setProperties(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await api.post('/properties', formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          address: '',
          city: '',
          province: 'Jawa Barat',
          postalCode: '',
          description: '',
          type: 'CAMPUR',
        });
        await fetchProperties();
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal menambahkan properti');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm('Hapus properti "' + name + '" beserta kamar di dalamnya?')) return;
    try {
      await api.delete('/properties/' + id);
      await fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus properti');
    }
  };

  const totalRooms = properties.reduce((acc, curr) => acc + (curr.rooms?.length || 0), 0);

  return (
    <AppLayout
      title="Manajemen Properti"
      subtitle="Kelola gedung dan unit rumah kost yang Anda miliki."
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-foreground">
              Daftar Gedung Kost
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20">
                {properties.length} Properti
              </Badge>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20">
                {totalRooms} Kamar Total
              </Badge>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Properti</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <Card className="rounded-2xl p-12 text-center border-gray-100 dark:border-border/60 shadow-sm bg-white dark:bg-card">
          <CardContent className="p-0">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-foreground text-lg">Belum Ada Properti</h3>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mt-2 max-w-sm mx-auto">
              Mulai kelola bisnis kost Anda dengan menambahkan properti pertama. Anda dapat menambahkan kamar dan memantau penghuni setelahnya.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 rounded-xl shadow-xs cursor-pointer"
            >
              Tambah Properti Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, idx) => (
            <PropertyCard
              key={property.id}
              property={property}
              index={idx}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddPropertyModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreate}
        submitting={submitting}
        submitError={submitError}
      />
    </AppLayout>
  );
};
