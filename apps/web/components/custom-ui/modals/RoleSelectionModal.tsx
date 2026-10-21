'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Building2, Home, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTranslation } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'OWNER' | 'TENANT' | 'USER') => Promise<void>;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  email,
  fullName,
  avatarUrl,
}) => {
  const { t, locale } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<'OWNER' | 'TENANT' | 'USER' | null>('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setError(null);
    setLoading(true);

    try {
      await onSelectRole(selectedRole);
    } catch (err: any) {
      const msg = err.message || t('auth.roleSaveError');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="max-w-lg p-6 sm:p-8 bg-white dark:bg-card border-slate-100 dark:border-border shadow-2xl rounded-3xl">
        <DialogHeader className="text-center sm:text-center pb-2">
          {avatarUrl ? (
            <div className="mx-auto relative mb-3">
              <Avatar className="w-16 h-16 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900 shadow-md">
                <AvatarImage src={avatarUrl} alt={fullName || 'Avatar'} className="object-cover" />
                <AvatarFallback className="bg-indigo-600 text-white font-bold text-lg">
                  {fullName?.charAt(0) || email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
          )}
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-foreground tracking-tight">
            {t('auth.roleSelectionTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-muted-foreground mt-1 max-w-sm mx-auto">
            {t('auth.roleSelectionDesc', { name: fullName || email || (locale === 'id' ? 'Pengguna' : 'User') })}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl text-xs text-rose-700 dark:text-rose-400 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
          {/* Card User (Pencari Kos) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedRole('USER')}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedRole('USER')}
            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col text-left ${
              selectedRole === 'USER'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md shadow-indigo-600/10'
                : 'border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-accent/40 bg-white dark:bg-card'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedRole === 'USER'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                <Home className="w-5 h-5" />
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedRole === 'USER'
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {selectedRole === 'USER' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-foreground mb-1">
              {t('auth.roleUserTitle') || 'Pencari Kos'}
            </h3>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
              {t('auth.roleUserBadge') || 'Pencari Kos'}
            </span>
            <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
              {t('auth.roleUserDesc') || 'Jelajahi berbagai properti kos, simpan ke favorit/wishlist, dan ajukan permohonan sewa kamar.'}
            </p>
          </div>

          {/* Card Owner */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedRole('OWNER')}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedRole('OWNER')}
            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col text-left ${
              selectedRole === 'OWNER'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md shadow-indigo-600/10'
                : 'border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-accent/40 bg-white dark:bg-card'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedRole === 'OWNER'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedRole === 'OWNER'
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {selectedRole === 'OWNER' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-foreground mb-1">
              {t('auth.roleOwnerTitle') || 'Pemilik Kos'}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
              {t('auth.roleOwnerBadge') || 'Owner'}
            </span>
            <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
              {t('auth.roleOwnerDesc') || 'Kelola properti kos, unit kamar, pantau penyewa, kelola tagihan, dan pantau tiket perbaikan.'}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={!selectedRole || loading}
            onClick={handleConfirm}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{t('auth.roleContinue')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
