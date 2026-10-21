"use client";

import React from "react";
import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TenantEmptyRoomCard() {
  return (
    <Card className="rounded-3xl border-slate-200/80 dark:border-border/80 p-8 text-center max-w-2xl mx-auto my-8 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto">
        <Home className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">
        Belum Ada Kamar Aktif
      </h2>
      <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
        Anda terdaftar sebagai penyewa tetapi belum ditugaskan ke nomor kamar tertentu oleh pemilik kos. Jika Anda baru pindah, hubungi pemilik kos agar memasukkan email Anda ke unit kamar kos.
      </p>
      <div className="pt-2 flex justify-center gap-3">
        <Link href="/">
          <Button className="rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Search className="w-4 h-4" />
            <span>Cari Kos di Beranda</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
}
