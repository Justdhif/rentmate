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
import { AlertCircle } from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assignments: any[];
  formData: {
    roomAssignmentId: string;
    amount: number;
    dueDate: string;
    description: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  submitError: string | null;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onOpenChange,
  assignments,
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
          <DialogTitle className="text-lg font-semibold">Buat Tagihan Sewa Baru</DialogTitle>
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
                  amount: ass ? Number(ass.rentAmount) : formData.amount,
                });
              }}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.user?.profile?.fullName || a.user?.email} - Kamar {a.room?.roomNumber} (
                  {a.room?.property?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                Jumlah Tagihan (Rp)
              </label>
              <Input
                type="number"
                step="50000"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                Jatuh Tempo
              </label>
              <Input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="h-10 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
              Keterangan Tagihan
            </label>
            <Input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tagihan Sewa Kamar Bulan Ini"
              className="h-10 rounded-xl"
            />
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
              {submitting ? 'Memproses...' : 'Terbitkan & Buat Link Bayar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
