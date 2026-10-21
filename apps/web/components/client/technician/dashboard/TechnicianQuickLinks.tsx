"use client";

import React from "react";
import Link from "next/link";
import { Clock, CheckCircle2, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";

export function TechnicianQuickLinks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <Card className="rounded-2xl border-slate-200/80 dark:border-border/80 shadow-xs p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menu Pekerjaan
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-foreground mt-1">
              Tiket Ditugaskan
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <Link
          href="/maintenance"
          className="text-xs text-orange-600 font-bold hover:underline mt-4 block"
        >
          Lihat Semua Tiket →
        </Link>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 dark:border-border/80 shadow-xs p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status Akun
            </span>
            <h3 className="text-base font-bold text-emerald-600 mt-1">
              Teknisi Terverifikasi
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Siap menerima penugasan dari Owner
        </p>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 dark:border-border/80 shadow-xs p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pengaturan
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-foreground mt-1">
              Profil Teknisi
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
        <Link
          href="/settings"
          className="text-xs text-rose-600 font-bold hover:underline mt-4 block"
        >
          Edit Nomor & Spesialisasi →
        </Link>
      </Card>
    </div>
  );
}
