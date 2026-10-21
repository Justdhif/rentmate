"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UserHowItWorksCard() {
  const steps = [
    {
      num: 1,
      title: "Temukan Kos di Beranda",
      desc: "Gunakan filter kota, tipe kos (putra/putri/campur), serta fasilitas yang diinginkan.",
    },
    {
      num: 2,
      title: "Hubungi Pemilik & Sepakati Kamar",
      desc: "Gunakan informasi kontak pemilik pada detail properti untuk janji temu atau survey kamar.",
    },
    {
      num: 3,
      title: "Otomatis Upgrade ke Penghuni (Tenant)",
      desc: "Saat pemilik kos mendaftarkan Anda ke unit kamar, akun Anda otomatis menjadi Tenant dan modul tagihan serta maintenance akan terbuka.",
    },
  ];

  return (
    <Card className="rounded-3xl border-slate-200/80 dark:border-border/80 p-6 space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-600" />
          <span>Bagaimana Alur Sewa Kos di RentMate?</span>
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Langkah praktis dari pencarian hingga menempati kamar kos impian Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-3 pt-2">
        {steps.map((s) => (
          <div
            key={s.num}
            className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60"
          >
            <div className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {s.num}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-foreground">
                {s.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
