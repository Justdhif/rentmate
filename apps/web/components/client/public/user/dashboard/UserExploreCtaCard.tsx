"use client";

import React from "react";
import Link from "next/link";
import { Compass, Search, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/LanguageContext";

export function UserExploreCtaCard() {
  const { t } = useTranslation();

  return (
    <Card className="rounded-3xl border-slate-200/80 dark:border-border/80 p-6 flex flex-col justify-between bg-gradient-to-br from-white via-secondary/30 to-secondary dark:from-card dark:via-muted/20 dark:to-background">
      <div>
        <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-4 shadow-md shadow-primary/20">
          <Compass className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-foreground">
          {t('userDashboard.exploreCtaTitle')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2 leading-relaxed">
          {t('userDashboard.exploreCtaDesc')}
        </p>
      </div>

      <div className="pt-6">
        <Link href="/">
          <Button className="w-full h-11 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 shadow-md shadow-primary/20 cursor-pointer">
            <Search className="w-4 h-4" />
            <span>{t('userDashboard.openSearchPage')}</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
