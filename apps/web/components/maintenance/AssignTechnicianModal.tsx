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
import { MaintenanceTicket } from './MaintenanceTicketCard';

interface AssignTechnicianModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTicket: MaintenanceTicket | null;
  techEmail: string;
  setTechEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  submitError: string | null;
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  isOpen,
  onOpenChange,
  selectedTicket,
  techEmail,
  setTechEmail,
  onSubmit,
  submitting,
  submitError,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white dark:bg-card border-gray-200 dark:border-border">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-border/60 bg-gray-50/50 dark:bg-muted/10">
          <DialogTitle className="text-lg font-semibold">Tugaskan Teknisi Perbaikan</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">Tiket Keluhan:</p>
            <p className="font-semibold text-gray-900 dark:text-foreground text-sm">
              {selectedTicket?.title} (Kamar {selectedTicket?.room?.roomNumber})
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
              Email Teknisi / Tukang
            </label>
            <Input
              type="email"
              required
              value={techEmail}
              onChange={(e) => setTechEmail(e.target.value)}
              placeholder="teknisi@email.com"
              className="h-10 rounded-xl"
            />
            <p className="text-[11px] text-gray-400 dark:text-muted-foreground mt-1.5">
              Email teknisi yang terdaftar di akun RentMate dengan peran TEKNISI / OWNER.
            </p>
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
              {submitting ? 'Menugaskan...' : 'Kirim Penugasan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
