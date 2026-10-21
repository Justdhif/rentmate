"use client";

import React from "react";
import Link from "next/link";
import { Heart, Clock, Home, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface UserStatsCardsProps {
  favoriteCount: number;
  userEmail?: string;
}

export function UserStatsCards({ favoriteCount, userEmail }: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {/* Card 1: Wishlist */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-border/80 shadow-xs p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider">
            Kos Tersimpan
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-foreground mt-1">
            {favoriteCount}{" "}
            <span className="text-xs font-normal text-slate-400">properti</span>
          </div>
          <Link
            href="/favorites"
            className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline mt-1 inline-block"
          >
            Kelola Favorit →
          </Link>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
          <Heart className="w-6 h-6 fill-rose-500/20" />
        </div>
      </Card>

      {/* Card 2: Status Penghuni */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-border/80 shadow-xs p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider">
            Status Kamar Kos
          </span>
          <div className="text-base font-bold text-slate-800 dark:text-foreground mt-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Belum Ada Kamar Aktif</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Akun akan otomatis menjadi Tenant saat penempatan kamar
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
          <Home className="w-6 h-6" />
        </div>
      </Card>

      {/* Card 3: Verifikasi Akun */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-border/80 shadow-xs p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider">
            Status Akun
          </span>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Aktif & Terverifikasi</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {userEmail || "Terdaftar"}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </Card>
    </div>
  );
}
