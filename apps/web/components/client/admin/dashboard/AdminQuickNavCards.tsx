"use client";

import React from "react";
import Link from "next/link";
import { Building2, Users, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function AdminQuickNavCards() {
  const cards = [
    {
      label: "Properti & Kamar",
      title: "Kelola Properti",
      href: "/properties",
      linkText: "Lihat Semua Properti Kos →",
      icon: Building2,
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
      linkColor: "text-indigo-600",
    },
    {
      label: "Pengguna Platform",
      title: "Penyewa & Owner",
      href: "/tenants",
      linkText: "Daftar Seluruh User →",
      icon: Users,
      iconBg: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400",
      linkColor: "text-purple-600",
    },
    {
      label: "Platform Intelligence",
      title: "Analitik & AI",
      href: "/analytics",
      linkText: "Buka Analitik Sistem →",
      icon: BarChart3,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
      linkColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <Card
            key={idx}
            className="rounded-2xl border-slate-200/80 dark:border-border/80 shadow-xs p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {c.label}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-foreground mt-1">
                  {c.title}
                </h3>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <Link
              href={c.href}
              className={`text-xs font-bold hover:underline mt-4 block ${c.linkColor}`}
            >
              {c.linkText}
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
