'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Heart,
  Globe2,
  CheckCircle2,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, locale } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 relative overflow-hidden select-none">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Main Footer Links Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand & Vision (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20600/30 group-hover:scale-105 transition-transform">
                R
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white tracking-tight leading-tight">
                  RentMate
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary400">
                  Property Ecosystem
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {locale === 'en'
                ? 'Indonesia’s integrated smart property rental platform. Simplifying boarding house operations with AI analytics, automated billing, and trusted discovery.'
                : 'Platform ekosistem sewa properti dan smart kost terpadu di Indonesia. Mengotomasi pembukuan, tagihan sewa, dan pemeliharaan fasilitas dengan AI cerdas.'}
            </p>

            {/* Platform Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Listings
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-[11px] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-primary400" />
                AI Smart Assistant
              </span>
            </div>
          </div>

          {/* Col 1: Platform & Discovery */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {locale === 'en' ? 'Explore & Rent' : 'Jelajah & Sewa'}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/search" className="hover:text-primary400 transition-colors flex items-center gap-1">
                  <span>{locale === 'en' ? 'Search Kost' : 'Cari Kost Impian'}</span>
                </Link>
              </li>
              <li>
                <Link href="/#properties" className="hover:text-primary400 transition-colors">
                  {locale === 'en' ? 'Featured Properties' : 'Kos Unggulan'}
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-primary400 transition-colors">
                  {locale === 'en' ? 'Wishlist & Saved' : 'Wishlist Favorit'}
                </Link>
              </li>
              <li>
                <Link href="/user/dashboard" className="hover:text-primary400 transition-colors">
                  {locale === 'en' ? 'Renter Portal' : 'Portal Pencari Kos'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Solutions by Role */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {locale === 'en' ? 'For Owners & Partners' : 'Solusi & Mitra'}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/register?role=OWNER" className="hover:text-primary400 transition-colors flex items-center gap-1 text-primary400 font-medium">
                  <span>{locale === 'en' ? 'Register Property' : 'Daftarkan Kos Anda'}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/owner/dashboard" className="hover:text-primary400 transition-colors">
                  {locale === 'en' ? 'Owner Management Suite' : 'Suite Pengelola Kos'}
                </Link>
              </li>
              <li>
                <Link href="/tenant/dashboard" className="hover:text-primary400 transition-colors">
                  {locale === 'en' ? 'Tenant Resident Portal' : 'Portal Penghuni Kos'}
                </Link>
              </li>
              <li>
                <Link href="/technician/dashboard" className="hover:text-primary400 transition-colors">
                  {locale === 'en' ? 'Maintenance Technician' : 'Aplikasi Teknisi'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {locale === 'en' ? 'Support & Help' : 'Pusat Bantuan'}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <a href="mailto:support@rentmate.com" className="hover:text-primary400 transition-colors">
                  support@rentmate.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="hover:text-primary400 transition-colors cursor-pointer">
                  +62 (21) 5088-7200
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>Jakarta Selatan, DKI Jakarta 12730</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Language & System Status */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <p>© {currentYear} PT RentMate Inovasi Digital. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </span>
            <span className="text-slate-700">|</span>
            <Link href="/" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <span className="text-slate-700">|</span>
            <Link href="/" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
