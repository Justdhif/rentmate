'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, Shield, Check, Sparkles } from 'lucide-react';
import { DEFAULT_AVATARS } from '@/constants/avatar';

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
  const currentAvatar = avatarUrl || user?.profile?.avatarUrl;
  const isCloudinary = currentAvatar?.includes('cloudinary.com');

  return (
    <Card className="rounded-2xl p-8 border border-border shadow-xs bg-card animate-slide-up animate-stagger-1">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-border">
          <div className="relative group">
            <Avatar className="w-20 h-20 rounded-2xl border-2 border-border shadow-md transition-transform group-hover:scale-105">
              {currentAvatar && (
                <AvatarImage
                  src={currentAvatar}
                  alt={fullName || 'Avatar'}
                  className="rounded-2xl object-cover"
                />
              )}
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-3xl">
                {fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1.5 -right-1.5 bg-background rounded-full p-1 border border-border">
              <span className="w-4 h-4 bg-emerald-500 rounded-full block border-2 border-background" />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-foreground text-xl tracking-tight">
              {fullName || user?.profile?.fullName || 'Pengguna'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Shield className="w-3 h-3 mr-1.5" />
                {user?.role || 'OWNER'}
              </Badge>
              {isCloudinary && (
                <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-[10px]">
                  Google Cloudinary Photo
                </Badge>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Informasi Pribadi
          </h4>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Nama Lengkap
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Alamat Email (Akun Utama)
              </label>
              <Input
                type="email"
                disabled
                value={user?.email || ''}
                className="h-11 rounded-xl bg-muted/40 cursor-not-allowed opacity-75"
              />
              <span className="text-xs text-muted-foreground mt-1 block">
                Email terdaftar tidak dapat diubah secara langsung demi keamanan akun.
              </span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Nomor WhatsApp / HP
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="081234567890"
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
            </div>

            {/* Pilihan Avatar Default DiceBear */}
            {setAvatarUrl && (
              <div className="pt-2">
                <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Pilihan Avatar Bottts (DiceBear)
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Pilih avatar robot unik dengan variasi warna latar belakang sebagai foto profil Anda:
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
                        title={`Pilih Avatar #${index + 1}`}
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
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
