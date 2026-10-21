'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Shield,
  Check,
  Sparkles,
  Camera,
  UploadCloud,
  Trash2,
  Loader2,
} from 'lucide-react';
import { DEFAULT_AVATARS } from '@/constants/avatar';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useConfirm } from '@/contexts/ConfirmContext';

interface ProfileSettingsFormProps {
  user: any;
  fullName: string;
  setFullName: (name: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  avatarUrl?: string;
  setAvatarUrl?: (url: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSaving: boolean;
}

export const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({
  user,
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
  avatarUrl,
  setAvatarUrl,
  onSubmit,
  isSaving,
}) => {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const currentAvatar = avatarUrl || user?.profile?.avatarUrl;
  const isCloudinary = currentAvatar?.includes('cloudinary.com');
  const isPresetAvatar = DEFAULT_AVATARS.includes(currentAvatar);
  const hasCustomPhoto = currentAvatar && !isPresetAvatar;

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('settings.photoTooLarge'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.photoInvalidType'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setIsUploadingPhoto(true);

    try {
      const res = await api.upload<any>('/users/profile/photo', formData);

      if (res.success && res.data?.avatarUrl) {
        if (setAvatarUrl) {
          setAvatarUrl(res.data.avatarUrl);
        }
        await refreshUser();
        toast.success(t('settings.uploadPhotoSuccess'));
      }
    } catch (err: any) {
      toast.error(err.message || t('settings.uploadPhotoFailed'));
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetPhoto = async () => {
    const isConfirmed = await confirm.danger({
      title: t('common.confirmDeleteTitle'),
      description: t('settings.resetPhotoConfirm'),
      confirmText: t('common.delete'),
    });
    if (!isConfirmed) {
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const res = await api.patch('/users/profile', { avatarUrl: '' });
      if (res.success) {
        if (setAvatarUrl) {
          setAvatarUrl('');
        }
        await refreshUser();
        toast.success(t('settings.resetPhotoSuccess'));
      }
    } catch (err: any) {
      toast.error(err.message || t('settings.profileUpdateFailed'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <Card className="rounded-2xl p-8 border border-border shadow-xs bg-card animate-slide-up animate-stagger-1">
      <CardContent className="p-0">
        {/* Hidden File Input for Image Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          aria-label={t('settings.uploadPhoto')}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-border">
          {/* Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <div
              onClick={handleTriggerFileSelect}
              className="relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer shadow-md border-2 border-border transition-all hover:border-primary/80 group-hover:scale-105"
              title={t('settings.changePhoto')}
            >
              <Avatar className="w-full h-full rounded-2xl">
                {currentAvatar && (
                  <AvatarImage
                    src={currentAvatar}
                    alt={fullName || 'Avatar'}
                    className="rounded-2xl object-cover w-full h-full"
                  />
                )}
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-3xl">
                  {fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* Hover / Uploading Overlay */}
              <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center transition-opacity ${
                  isUploadingPhoto ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] font-semibold text-white tracking-wider uppercase">
                      {t('settings.changePhoto')}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Camera Action Badge */}
            <button
              type="button"
              onClick={handleTriggerFileSelect}
              disabled={isUploadingPhoto}
              className="absolute -bottom-1 -right-1 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition-transform active:scale-95 cursor-pointer"
              title={t('settings.uploadPhoto')}
            >
              {isUploadingPhoto ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* User Info & Photo Action Buttons */}
          <div className="flex-1 space-y-2.5 min-w-0">
            <div>
              <h3 className="font-bold text-foreground text-xl tracking-tight truncate">
                {fullName || user?.profile?.fullName || t('settings.userFallback')}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Shield className="w-3 h-3 mr-1.5" />
                {user?.role || t('settings.roleFallback')}
              </Badge>
              {isCloudinary && (
                <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-[10px]">
                  {t('settings.cloudinaryBadge')}
                </Badge>
              )}
            </div>

            {/* Photo Action Controls */}
            <div className="pt-1 flex items-center gap-2.5 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTriggerFileSelect}
                disabled={isUploadingPhoto}
                className="h-8 rounded-xl text-xs gap-1.5 font-medium cursor-pointer shadow-2xs hover:bg-accent"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5" />
                )}
                <span>{isUploadingPhoto ? t('settings.uploadingPhoto') : t('settings.uploadPhoto')}</span>
              </Button>

              {hasCustomPhoto && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetPhoto}
                  disabled={isUploadingPhoto}
                  className="h-8 rounded-xl text-xs gap-1 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  title={t('settings.resetPhoto')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('settings.removeCustomPhoto')}</span>
                </Button>
              )}

              <span className="text-[11px] text-muted-foreground block w-full sm:w-auto">
                {t('settings.photoHelp')}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            {t('settings.personalInfoTitle')}
          </h4>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t('settings.fullNameLabel')}
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('settings.fullNamePlaceholder')}
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t('settings.emailLabel')}
              </label>
              <Input
                type="email"
                disabled
                value={user?.email || ''}
                className="h-11 rounded-xl bg-muted/40 cursor-not-allowed opacity-75"
              />
              <span className="text-xs text-muted-foreground mt-1 block">
                {t('settings.emailNote')}
              </span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                {t('settings.phoneLabel')}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t('settings.phonePlaceholder')}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Pilihan Avatar Default DiceBear */}
            {setAvatarUrl && (
              <div className="pt-2">
                <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  {t('settings.avatarLabel')}
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('settings.avatarDesc')}
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
                  {DEFAULT_AVATARS.map((url, index) => {
                    const isSelected = currentAvatar === url;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setAvatarUrl(url)}
                        className={`relative aspect-square rounded-xl p-1 border-2 transition-all cursor-pointer hover:scale-105 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 shadow-sm ring-2 ring-indigo-500/20'
                            : 'border-border hover:border-slate-300 dark:hover:border-slate-700 bg-card'
                        }`}
                        title={t('settings.avatarSelect', { index: index + 1 })}
                      >
                        <img
                          src={url}
                          alt={`Avatar option ${index + 1}`}
                          className="w-full h-full object-contain rounded-lg"
                        />
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white rounded-full p-0.5 shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="px-6 h-11 rounded-xl font-semibold shadow-sm cursor-pointer"
            >
              {isSaving ? t('settings.submitSaving') : t('settings.submitButton')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
