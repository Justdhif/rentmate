"use client";

import React from "react";
import Link from "next/link";
import { Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminWelcomeBannerProps {
  fullName: string;
}

export function AdminWelcomeBanner({ fullName }: AdminWelcomeBannerProps) {
  return (
    <div className="rounded-3xl bg-linear-to-r from-slate-900 via-rose-950 to-rose- p-6 sm:p-8 text-white shadow-xl shadow-black/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-rose-900/50">
      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/30 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-3 text-rose-300 border border-rose-500/30">
          <Shield className="w-3.5 h-3.5" />
          <span>Super Administrator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
          Selamat Bertugas, {fullName}! 🛡️
        </h1>
        <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
          Anda memiliki akses penuh untuk memantau data properti, seluruh penyewa kos, analitik platform, dan penanganan laporan kendala.
        </p>
      </div>

      <div className="relative z-10 shrink-0 flex flex-wrap gap-3">
        <Link href="/dashboard">
          <Button className="h-11 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 gap-2 cursor-pointer transition">
            <BarChart3 className="w-4 h-4" />
            <span>Statistik Keseluruhan</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
