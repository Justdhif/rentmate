'use client';

import React from 'react';
import { Building2, CreditCard, Wrench } from 'lucide-react';

interface AuthBannerProps {
  title?: string;
  subtitle?: string;
}

export const AuthBanner: React.FC<AuthBannerProps> = ({
  title = 'Kelola Kost Anda Lebih Cerdas',
  subtitle = 'Platform modern untuk memudahkan manajemen properti, penagihan, dan komunikasi dengan penghuni dalam satu aplikasi.',
}) => {
  return (
    <div className="hidden lg:flex w-[55%] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 items-center justify-center relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-white blur-[120px]" />
        <div className="absolute top-[60%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-300 blur-[100px]" />
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-dot-pattern" />
      </div>

      <div className="relative z-10 w-full max-w-xl text-white">
        <div className="animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-indigo-100 mb-12 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="space-y-8 animate-stagger-1">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Manajemen Properti Mudah</h3>
              <p className="text-indigo-100/80 text-sm">
                Kelola banyak properti dan kamar dengan tampilan visual yang intuitif.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Penagihan Otomatis</h3>
              <p className="text-indigo-100/80 text-sm">
                Sistem tagihan terintegrasi untuk pembayaran yang lebih lancar dan tepat waktu.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Laporan Kerusakan</h3>
              <p className="text-indigo-100/80 text-sm">
                Penghuni dapat melaporkan perbaikan langsung dari aplikasi ke pengelola.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
