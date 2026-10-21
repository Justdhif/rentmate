"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/LanguageContext";

export function OwnerCtaSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-gradient-to-r from-rose-red via-primary to-crimson p-8 sm:p-12 text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <span className="text-[11px] uppercase tracking-wider font-extrabold py-1 px-3 rounded-full bg-white/20 backdrop-blur-md mb-4 inline-block">
            {t('home.ownerCtaBadge')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">
            {t('home.ownerCtaTitle')}
          </h2>
          <p className="mt-3 text-white/90 text-xs sm:text-sm leading-relaxed">
            {t('home.ownerCtaDesc')}
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-3">
          <Link href="/register?role=OWNER">
            <Button className="h-12 px-6 rounded-2xl bg-white hover:bg-slate-100 text-crimson font-bold text-sm shadow-lg shadow-black/10 cursor-pointer">
              {t('home.ownerCtaButton')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
