'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { ImageGalleryUploader } from '@/components/common/ImageGalleryUploader';

interface AddRoomModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  properties: any[];
  formData: {
    propertyId: string;
    roomNumber: string;
    floor: number;
    type: string;
    monthlyPrice: number;
    dailyPrice: number;
    status: string;
    photos?: string[];
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  submitError: string | null;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onOpenChange,
  properties,
  formData,
  setFormData,
  onSubmit,
  submitting,
  submitError,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-card border-gray-200 dark:border-border">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-border/60 bg-gray-50/50 dark:bg-muted/10 sticky top-0 z-20">
          <DialogTitle className="text-lg font-semibold">Tambah Kamar Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {submitError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                Pilih Gedung Kost / Properti
              </label>
              <Select
                value={formData.propertyId}
                onValueChange={(val) => setFormData({ ...formData, propertyId: val })}
              >
                <SelectTrigger className="w-full h-10 rounded-xl">
                  <SelectValue placeholder="Pilih gedung kost" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.city})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                  Nomor Kamar
                </label>
                <Input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="cth. 101 atau A-01"
                  className="h-10 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                  Lantai
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                  Tipe Kamar
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData({ ...formData, type: val })}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl">
                    <SelectValue placeholder="Pilih tipe kamar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="DELUXE">Deluxe</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                  Harga Sewa / Bulan (Rp)
                </label>
                <Input
                  type="number"
                  step="50000"
                  required
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2">
              <ImageGalleryUploader
                images={formData.photos || []}
                onChange={(photos) => setFormData({ ...formData, photos })}
                type="room"
                title="Foto & Pratinjau Kamar"
                description="Tambahkan foto suasana kamar tidur, kasur, atau kamar mandi. Foto pertama menjadi cover utama."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-xl shadow-xs"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Kamar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
