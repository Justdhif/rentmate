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

interface AddTenantModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableRooms: any[];
  formData: {
    tenantEmail: string;
    roomId: string;
    rentAmount: number;
    startDate: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  submitError: string | null;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({
  isOpen,
  onOpenChange,
  availableRooms,
  formData,
  setFormData,
  onSubmit,
  submitting,
  submitError,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white dark:bg-card border-gray-200 dark:border-border">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-border/60 bg-gray-50/50 dark:bg-muted/10">
          <DialogTitle className="text-lg font-semibold">Tetapkan Penghuni Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
              Email Akun Penyewa
            </label>
            <Input
              type="email"
              required
              value={formData.tenantEmail}
              onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
              placeholder="penyewa@email.com"
              className="h-10 rounded-xl"
            />
            <p className="text-[11px] text-gray-400 dark:text-muted-foreground mt-1.5">
              Penyewa harus terdaftar di RentMate dengan email ini.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
              Pilih Kamar Tersedia
            </label>
            <Select
              value={formData.roomId}
              onValueChange={(val) => {
                const room = availableRooms.find((r) => r.id === val);
                setFormData({
                  ...formData,
                  roomId: val,
                  rentAmount: room ? Number(room.monthlyPrice) : formData.rentAmount,
                });
              }}
            >
              <SelectTrigger className="w-full h-10 rounded-xl">
                <SelectValue placeholder="Pilih kamar yang tersedia" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.property?.name || 'Kost'} - Kamar {r.roomNumber} ({r.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                Tarif Sewa/bln (Rp)
              </label>
              <Input
                type="number"
                step="50000"
                required
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: Number(e.target.value) })}
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                Tanggal Masuk
              </label>
              <Input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="h-10 rounded-xl"
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
              {submitting ? 'Menyimpan...' : 'Tetapkan Kamar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
