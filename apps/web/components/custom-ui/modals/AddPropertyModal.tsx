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
import { ImageGalleryUploader } from '@/components/custom-ui/ImageGalleryUploader';
import { useTranslation } from '@/contexts/LanguageContext';

interface AddPropertyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    name: string;
    address: string;
    city: string;
    province?: string;
    postalCode?: string;
    description: string;
    type: string;
    photos?: string[];
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      address: string;
      city: string;
      province?: string;
      postalCode?: string;
      description: string;
      type: string;
      photos?: string[];
    }>
  >;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  submitError: string | null;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  submitting,
  submitError,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-card border-gray-200 dark:border-border">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-border/60 bg-gray-50/50 dark:bg-muted/10 sticky top-0 z-20">
          <DialogTitle className="text-lg font-semibold">{t('properties.modalTitle')}</DialogTitle>
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
                {t('properties.modalNameLabel')}
              </label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('properties.modalNamePlaceholder')}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                  {t('properties.typeLabel')}
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData({ ...formData, type: val })}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl">
                    <SelectValue placeholder={t('properties.modalTypePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAMPUR">{t('properties.modalTypeMixed')}</SelectItem>
                    <SelectItem value="PUTRA">{t('properties.modalTypeMale')}</SelectItem>
                    <SelectItem value="PUTRI">{t('properties.modalTypeFemale')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                  {t('properties.modalCityLabel')}
                </label>
                <Input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder={t('properties.modalCityPlaceholder')}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                {t('properties.modalAddressLabel')}
              </label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={t('properties.modalAddressPlaceholder')}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-foreground uppercase tracking-wider mb-2">
                {t('properties.modalDescLabel')}
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('properties.modalDescPlaceholder')}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="pt-2">
              <ImageGalleryUploader
                images={formData.photos || []}
                onChange={(photos) => setFormData({ ...formData, photos })}
                type="property"
                title={t('properties.photoSectionTitle')}
                description={t('properties.photoSectionDesc')}
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
              {submitting ? t('properties.modalSubmitSaving') : t('properties.modalSubmitButton')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
