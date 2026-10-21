"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Compass, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserWelcomeBannerProps {
  fullName: string;
}

export function UserWelcomeBanner({ fullName }: UserWelcomeBannerProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-rose-700 via-rose-600 to-rose- p-6 sm:p-8 text-white shadow-xl shadow-rose-600/15 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Akun Pencari Kos (Member)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
          Halo, {fullName}! 👋
        </h1>
        <p className="mt-2 text-rose-100 text-xs sm:text-sm leading-relaxed">
          Sedang mencari hunian baru? Cari kos dengan fasilitas lengkap, harga terjangkau, dan verifikasi legalitas pemilik kos langsung di RentMate.
        </p>
      </div>

      <div className="relative z-10 shrink-0 flex flex-wrap gap-3">
        <Link href="/">
          <Button className="h-11 px-5 rounded-2xl bg-white hover:bg-slate-100 text-rose-700 font-bold text-xs shadow-md shadow-black/10 gap-2 cursor-pointer transition">
            <Compass className="w-4 h-4" />
            <span>Jelajahi Kos Sekarang</span>
          </Button>
        </Link>
        <Link href="/favorites">
          <Button
            variant="outline"
            className="h-11 px-4 rounded-2xl border-white/30 text-white hover:bg-white/10 text-xs font-semibold gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            <span>Lihat Wishlist</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
