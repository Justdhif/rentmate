'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/custom-ui/layout/AppLayout';
import { PageHeader } from '@/components/custom-ui/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ProfileSettingsForm } from './ProfileSettingsForm';
import { ThemeSettingsCard } from './ThemeSettingsCard';
import { LanguageSwitcherCard } from './LanguageSwitcherCard';
import { toast } from 'sonner';

export const SettingsView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
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
        setSuccessMsg(t('settings.profileUpdateSuccess'));
        toast.success(t('settings.profileUpdateSuccess'));
        await refreshUser();
      }
    } catch (err: any) {
      const msg = err.message || t('settings.profileUpdateFailed');
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="w-full space-y-6 sm:space-y-8 animate-fade-in">
        <PageHeader
          title={t('settings.pageTitle')}
          description={t('settings.pageDesc')}
        />

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

        {/* 2-Column Responsive Layout for Balanced Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Left Column: Profile Form */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
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
          </div>

          {/* Supporting Right Column: Theme & Language */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <ThemeSettingsCard />
            <LanguageSwitcherCard />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
