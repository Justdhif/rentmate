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
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Receipt } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assignments: any[];
  formData: {
    roomId: string;
    tenantId?: string;
    amount: number;
    dueDate: string;
    period: string;
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
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white dark:bg-card border-slate-200 dark:border-border rounded-2xl shadow-xl">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-border/60 bg-slate-50/60 dark:bg-muted/20 flex flex-row items-center gap-3 space-y-0">
          <div className="w-9 h-9 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-foreground">
              {t('payments.modalTitle', { defaultValue: 'Buat Tagihan Sewa Baru' })}
            </DialogTitle>
            <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
              {t('payments.pageDesc', { defaultValue: 'Terbitkan invoice pembayaran untuk penyewa aktif.' })}
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          {submitError && (
            <div className="p-3 bg-primary50 dark:bg-primary950/40 border border-border200 dark:border-border800 rounded-xl text-xs text-primary700 dark:text-primary400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Tenant & Room Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {t('payments.modalTenantLabel', { defaultValue: 'Pilih Penghuni Kost *' })}
            </label>
            <Select
              value={formData.roomId}
              onValueChange={(val) => {
                const ass = assignments.find(
                  (a) => a.currentRoom?.id === val || a.roomId === val || a.id === val
                );
                const rId = ass?.currentRoom?.id || ass?.roomId || val;
                const tId = ass?.id || ass?.tenantId || ass?.user?.id;
                const rent = Number(ass?.currentRoom?.monthlyRent || ass?.rentAmount || ass?.monthlyRent) || formData.amount;
                setFormData((prev: any) => ({
                  ...prev,
                  roomId: rId,
                  tenantId: tId,
                  amount: rent,
                }));
              }}
            >
              <SelectTrigger className="w-full h-10 rounded-xl text-xs border-slate-200 dark:border-border">
                <SelectValue placeholder={t('payments.modalTenantPlaceholder', { defaultValue: 'Pilih penghuni kost...' })} />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                {assignments.map((a) => {
                  const rId = a.currentRoom?.id || a.roomId || a.id;
                  const tenantName =
                    a.profile?.fullName ||
                    a.user?.profile?.fullName ||
                    a.name ||
                    a.fullName ||
                    a.email?.split('@')[0] ||
                    'Penyewa';
                  const roomNum = a.currentRoom?.roomNumber || a.roomNumber || a.room?.roomNumber || 'Kamar';
                  const propName = a.currentRoom?.propertyName || a.propertyName || a.room?.property?.name || 'Kost';

                  return (
                    <SelectItem key={a.id || rId} value={rId}>
                      {tenantName} — Kamar {roomNum} ({propName})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Amount & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {t('payments.modalAmountLabel', { defaultValue: 'Jumlah Tagihan (Rp) *' })}
              </label>
              <Input
                type="number"
                step="50000"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="h-10 rounded-xl text-xs border-slate-200 dark:border-border font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {t('payments.modalDueDateLabel', { defaultValue: 'Jatuh Tempo *' })}
              </label>
              <DatePicker
                value={formData.dueDate}
                onChange={(val) => setFormData({ ...formData, dueDate: val })}
                placeholder={t('payments.modalDueDatePlaceholder', { defaultValue: 'Pilih jatuh tempo' })}
                clearLabel={t('common.clear', { defaultValue: 'Clear' })}
                todayLabel={t('common.today', { defaultValue: 'Today' })}
                required
              />
            </div>
          </div>

          {/* Period */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {t('payments.modalPeriodLabel', { defaultValue: 'Periode Tagihan' })}
            </label>
            <Input
              type="text"
              required
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              placeholder={t('payments.modalPeriodPlaceholder', { defaultValue: 'cth. September 2026' })}
              className="h-10 rounded-xl text-xs border-slate-200 dark:border-border"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {t('payments.modalDescLabel', { defaultValue: 'Keterangan Tagihan' })}
            </label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('payments.modalDescPlaceholder', { defaultValue: 'Tagihan Sewa Kamar Bulanan' })}
              className="h-10 rounded-xl text-xs border-slate-200 dark:border-border"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 rounded-xl text-xs font-semibold border-slate-200 dark:border-border cursor-pointer"
            >
              {t('common.cancel', { defaultValue: 'Batal' })}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs cursor-pointer"
            >
              {submitting
                ? t('payments.modalSubmitSaving', { defaultValue: 'Menyimpan...' })
                : t('payments.modalSubmitButton', { defaultValue: 'Terbitkan Tagihan' })}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

