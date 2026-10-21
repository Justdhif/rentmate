"use client";

import React from "react";
import { Search, CreditCard, Wrench, Sparkles } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Search,
      iconBg: "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400",
      title: "Ketersediaan Kamar Riil",
      description:
        "Status kamar kosong dan terisi selalu sinkron secara real-time langsung dengan sistem pemilik kos.",
    },
    {
      icon: CreditCard,
      iconBg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
      title: "Pembayaran Digital Otomatis",
      description:
        "Bayar sewa bulanan praktis via QRIS, Virtual Account, dan e-Wallet dengan konfirmasi instan.",
    },
    {
      icon: Wrench,
      iconBg: "bg-rose- dark:bg-rose-/60 text-rose- dark:text-rose-",
      title: "Layanan Maintenance Terpadu",
      description:
        "Lampu mati atau AC rusak? Penghuni cukup buat laporan tiket di web dan teknisi segera menangani.",
    },
    {
      icon: Sparkles,
      iconBg: "bg-rose- dark:bg-rose-/60 text-rose- dark:text-rose-",
      title: "RentMate AI Assistant",
      description:
        "Rekomendasi kos pintar sesuai kebutuhan dan analitik okupansi otomatis untuk pemilik properti.",
    },
  ];

  return (
    <section
      id="features"
      className="py-20 bg-white dark:bg-card/40 border-y border-slate-200/80 dark:border-border/60 scroll-mt-20 sm:scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
            Kenapa Memilih RentMate?
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-foreground mt-2 tracking-tight">
            Solusi Terpadu Pencari & Pemilik Kos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground mt-2">
            Kami mendigitalkan seluruh siklus sewa kos mulai dari pencarian, tagihan digital, hingga perbaikan fasilitas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-card border border-slate-200/70 dark:border-border/60"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${feat.iconBg}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-foreground mb-1.5">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
