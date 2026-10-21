"use client";

import React from "react";
import Link from "next/link";
import { Compass, Search, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function UserExploreCtaCard() {
  return (
    <Card className="rounded-3xl border-slate-200/80 dark:border-border/80 p-6 flex flex-col justify-between bg-gradient-to-br from-white via-rose-50/30 to-rose-/30 dark:from-card dark:via-muted/20 dark:to-background">
      <div>
        <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-4 shadow-md shadow-rose-600/20">
          <Compass className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-foreground">
          Cari Kos Pilihan Anda Sekarang
        </h3>
        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2 leading-relaxed">
          Jelajahi ratusan listing kos aktif dengan foto asli dan rincian fasilitas terpercaya. Dapatkan kenyamanan hunian tanpa biaya perantara tersembunyi.
        </p>
      </div>

      <div className="pt-6">
        <Link href="/">
          <Button className="w-full h-11 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-2 shadow-md shadow-rose-600/20 cursor-pointer">
            <Search className="w-4 h-4" />
            <span>Buka Halaman Pencarian Kos</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
