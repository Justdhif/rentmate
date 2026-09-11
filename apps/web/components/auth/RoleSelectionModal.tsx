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

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'OWNER' | 'TENANT') => Promise<void>;
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
  const [selectedRole, setSelectedRole] = useState<'OWNER' | 'TENANT' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setError(null);
    setLoading(true);

    try {
      await onSelectRole(selectedRole);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pilihan peran. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="max-w-lg p-6 sm:p-8 bg-white border-slate-100 shadow-2xl rounded-3xl">
        <DialogHeader className="text-center sm:text-center pb-2">
          {avatarUrl ? (
            <div className="mx-auto relative mb-3">
              <Avatar className="w-16 h-16 rounded-2xl border-2 border-indigo-100 shadow-md">
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
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
          )}
          <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            Pilih Peran Akun Anda
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Selamat datang, <strong className="text-slate-800">{fullName || email || 'Pengguna'}</strong>! Tentukan bagaimana Anda ingin menggunakan RentMate:
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
          {/* Card Owner */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedRole('OWNER')}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedRole('OWNER')}
            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col text-left ${
              selectedRole === 'OWNER'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedRole === 'OWNER'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedRole === 'OWNER'
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300'
                }`}
              >
                {selectedRole === 'OWNER' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            <h3 className="font-bold text-base text-slate-900 mb-1">
              Pemilik Kost
            </h3>
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider mb-2">
              Owner
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kelola properti, data kamar, tagihan otomatis ke penyewa, dan terima laporan perbaikan.
            </p>
          </div>

          {/* Card Tenant */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedRole('TENANT')}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedRole('TENANT')}
            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col text-left ${
              selectedRole === 'TENANT'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedRole === 'TENANT'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <Home className="w-5 h-5" />
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedRole === 'TENANT'
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300'
                }`}
              >
                {selectedRole === 'TENANT' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            <h3 className="font-bold text-base text-slate-900 mb-1">
              Penyewa Kost
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">
              Tenant
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lihat status sewa kamar, bayar sewa digital via payment gateway, dan laporkan kerusakan fasilitas.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={!selectedRole || loading}
            onClick={handleConfirm}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-100 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Lanjutkan ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
