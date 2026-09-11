'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ProfileSettingsForm } from './ProfileSettingsForm';
import { SystemIntegrationCard } from './SystemIntegrationCard';

export const SettingsView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.profile?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.profile?.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatarUrl || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if user changes
  React.useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.fullName || '');
      setPhoneNumber(user.profile.phoneNumber || '');
      setAvatarUrl(user.profile.avatarUrl || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setIsSaving(true);

    try {
      const res = await api.patch('/users/profile', {
        fullName,
        phoneNumber,
        avatarUrl,
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
      <div className="max-w-3xl space-y-6 animate-fade-in">
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-sm flex items-center gap-3 animate-slide-up">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 text-sm flex items-center gap-3 animate-slide-up">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <ProfileSettingsForm
          user={user}
          fullName={fullName}
          setFullName={setFullName}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          onSubmit={handleUpdateProfile}
          isSaving={isSaving}
        />

        <SystemIntegrationCard />
      </div>
    </AppLayout>
  );
};
