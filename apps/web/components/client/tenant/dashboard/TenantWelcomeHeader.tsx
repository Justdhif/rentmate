"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, CreditCard, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TenantWelcomeHeaderProps {
  fullName: string;
}

export function TenantWelcomeHeader({ fullName }: TenantWelcomeHeaderProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-rose-600 p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/15 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Akun Penghuni Kos (Tenant)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
          Selamat Datang, {fullName}! 👋
        </h1>
        <p className="mt-2 text-emerald-100 text-xs sm:text-sm leading-relaxed">
          Semua kebutuhan hunian Anda dalam satu kendali: cek jatuh tempo sewa, bayar tagihan digital, dan laporkan keluhan fasilitas kamar.
        </p>
      </div>

      <div className="relative z-10 shrink-0 flex flex-wrap gap-3">
        <Link href="/payments">
          <Button className="h-11 px-5 rounded-2xl bg-white hover:bg-slate-100 text-emerald-700 font-bold text-xs shadow-md shadow-black/10 gap-2 cursor-pointer transition">
            <CreditCard className="w-4 h-4" />
            <span>Bayar Tagihan Sewa</span>
          </Button>
        </Link>
        <Link href="/maintenance">
          <Button
            variant="outline"
            className="h-11 px-4 rounded-2xl border-white/30 text-white hover:bg-white/10 text-xs font-semibold gap-2 cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>Lapor Kerusakan</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
