'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import {
  Building2,
  Plus,
  MapPin,
  DoorClosed,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  province?: string;
  postalCode?: string;
  description?: string;
  type: string;
  totalRooms?: number;
  rooms?: any[];
}

export default function PropertiesPage() {
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

  return (
    <AppLayout
      title="Manajemen Properti"
      subtitle="Kelola gedung dan unit rumah kost yang Anda miliki."
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Daftar Gedung Kost</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Total {properties.length} properti terdaftar
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Properti Baru</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Belum Ada Properti</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Mulai dengan menambahkan properti kost pertama Anda untuk menambahkan kamar dan mengelola penghuni.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
          >
            Tambah Properti Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700">
                    {property.type}
                  </span>
                  <button
                    onClick={() => handleDelete(property.id, property.name)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="Hapus Properti"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-1">
                  {property.name}
                </h3>
                <p className="text-xs text-gray-500 flex items-start gap-1.5 line-clamp-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
                  <span>
                    {property.address}, {property.city}
                  </span>
                </p>

                {property.description && (
                  <p className="text-xs text-gray-400 mt-3 line-clamp-2 italic">
                    &quot;{property.description}&quot;
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                  <DoorClosed className="w-4 h-4 text-indigo-600" />
                  <span>{property.rooms?.length || 0} Kamar</span>
                </div>
                <Link
                  href={`/rooms?propertyId=${property.id}`}
                  className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 font-semibold transition"
                >
                  Kelola Kamar &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Unit Properti Baru"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nama Properti Kost
            </label>
            <input
              type="text"
              required
              placeholder="Kost Putri Menteng Asri"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tipe Kost
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="CAMPUR">Campur</option>
                <option value="PUTRA">Khusus Putra</option>
                <option value="PUTRI">Khusus Putri</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Kota / Kabupaten
              </label>
              <input
                type="text"
                required
                placeholder="Bandung"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Alamat Lengkap
            </label>
            <textarea
              required
              rows={2}
              placeholder="Jl. Sukajadi No. 42, RT 02/05"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Deskripsi Singkat (Opsional)
            </label>
            <input
              type="text"
              placeholder="Dekat kampus, wifi 100mbps, keamanan 24 jam"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
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
              {submitting ? 'Menyimpan...' : 'Simpan Properti'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
