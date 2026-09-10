'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.profile?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.profile?.phoneNumber || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setIsSaving(true);

    try {
      const res = await api.patch('/users/profile', {
        fullName,
        phoneNumber,
      });

      if (res.success) {
        setSuccessMsg('Profil berhasil diperbarui!');
        await refreshUser();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout
      title="Pengaturan Akun"
      subtitle="Kelola profil pemilik kost, kredensial akses, dan preferensi notifikasi."
    >
      <div className="max-w-3xl space-y-6">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-2xl flex items-center justify-center">
              {user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'O'}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {user?.profile?.fullName || 'Pemilik Kost'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                {user?.role || 'OWNER'}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Akun
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor WhatsApp / Telepon
                </label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
          <h4 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            Keamanan & Integrasi Sistem
          </h4>
          <p className="text-xs text-gray-500 mb-4">
            RentMate terhubung langsung dengan penyedia layanan eksternal
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-gray-50 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Payment Gateway Midtrans</p>
                <p className="text-gray-400 text-[11px]">Mode Sandbox (Snap & Webhook SHA-512 Aktif)</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px]">
                TERHUBUNG
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">AI Intelligence Engine</p>
                <p className="text-gray-400 text-[11px]">Groq OpenAI GPT-OSS-120b & Llama 3.3</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px]">
                TERHUBUNG
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
