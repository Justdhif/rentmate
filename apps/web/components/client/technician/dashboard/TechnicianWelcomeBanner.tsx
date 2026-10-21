"use client";

import React from "react";
import Link from "next/link";
import { Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TechnicianWelcomeBannerProps {
  fullName: string;
}

export function TechnicianWelcomeBanner({ fullName }: TechnicianWelcomeBannerProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 p-6 sm:p-8 text-white shadow-xl shadow-orange-600/15 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-3">
          <Wrench className="w-3.5 h-3.5" />
          <span>Akun Teknisi Resmi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
          Semangat Bertugas, {fullName}! 🛠️
        </h1>
        <p className="mt-2 text-orange-100 text-xs sm:text-sm leading-relaxed">
          Cek daftar tugas perbaikan kos, perbarui status pengerjaan (In Progress / Resolved), dan unggah foto bukti perbaikan fasilitas.
        </p>
      </div>

      <div className="relative z-10 shrink-0">
        <Link href="/maintenance">
          <Button className="h-11 px-5 rounded-2xl bg-white hover:bg-slate-100 text-orange-700 font-bold text-xs shadow-md shadow-black/10 gap-2 cursor-pointer transition">
            <Wrench className="w-4 h-4" />
            <span>Buka Tiket Maintenance</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
