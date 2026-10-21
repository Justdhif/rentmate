"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Compass, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/LanguageContext";

interface UserWelcomeBannerProps {
  fullName: string;
}

export function UserWelcomeBanner({ fullName }: UserWelcomeBannerProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-3xl bg-gradient-to-r from-rose-red via-primary to-crimson p-6 sm:p-8 text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('userDashboard.seekerBadge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
          {t('userDashboard.greeting')}, {fullName}! 👋
        </h1>
        <p className="mt-2 text-white/90 text-xs sm:text-sm leading-relaxed">
          {t('userDashboard.welcomeDesc')}
        </p>
      </div>

      <div className="relative z-10 shrink-0 flex flex-wrap gap-3">
        <Link href="/">
          <Button className="h-11 px-5 rounded-2xl bg-white hover:bg-slate-100 text-crimson font-bold text-xs shadow-md shadow-black/10 gap-2 cursor-pointer transition">
            <Compass className="w-4 h-4" />
            <span>{t('userDashboard.exploreNow')}</span>
          </Button>
        </Link>
        <Link href="/favorites">
          <Button
            variant="outline"
            className="h-11 px-4 rounded-2xl border-white/30 text-white hover:bg-white/10 text-xs font-semibold gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            <span>{t('userDashboard.viewWishlist')}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
