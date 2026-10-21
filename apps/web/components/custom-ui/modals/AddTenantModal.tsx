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
import { AlertCircle } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

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
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white dark:bg-card border-gray-200 dark:border-border">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-border/60 bg-gray-50/50 dark:bg-muted/10">
          <DialogTitle className="text-lg font-semibold">{t('tenants.modalTitle')}</DialogTitle>
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
              {t('tenants.modalEmailLabel')}
            </label>
            <Input
              type="email"
              required
              value={formData.tenantEmail}
              onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
              placeholder={t('tenants.modalEmailPlaceholder')}
              className="h-10 rounded-xl"
            />
            <p className="text-[11px] text-gray-400 dark:text-muted-foreground mt-1.5">
              {t('tenants.modalEmailNote')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
              {t('tenants.modalRoomLabel')}
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
                <SelectValue placeholder={t('tenants.modalRoomPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {t('tenants.modalRoomOption', {
                      property: r.property?.name || t('tenants.propertyFallback'),
                      roomNumber: r.roomNumber,
                      type: r.type,
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                {t('tenants.modalRateLabel')}
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
                {t('tenants.modalDateLabel')}
              </label>
              <DatePicker
                value={formData.startDate}
                onChange={(val) => setFormData({ ...formData, startDate: val })}
                placeholder={t('tenants.modalDateLabel')}
                clearLabel={t('common.clear', { defaultValue: 'Clear' })}
                todayLabel={t('common.today', { defaultValue: 'Today' })}
                required
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
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-xl shadow-xs"
            >
              {submitting ? t('tenants.modalSubmitSaving') : t('tenants.modalSubmitButton')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
