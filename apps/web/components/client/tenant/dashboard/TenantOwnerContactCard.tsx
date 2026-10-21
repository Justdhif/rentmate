"use client";

import React from "react";
import Link from "next/link";
import { Building2, MessageCircle, Wrench } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/LanguageContext";

interface TenantOwnerContactCardProps {
  owner?: {
    name?: string;
    phone?: string;
  };
}

export function TenantOwnerContactCard({ owner }: TenantOwnerContactCardProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Contact Card */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-border/80 shadow-sm p-6 space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span>{t('tenantDashboard.ownerContact')}</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {t('tenantDashboard.ownerContactDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('tenantDashboard.ownerName')}
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-foreground mt-0.5">
              {owner?.name || t('nav.userFallbackName')}
            </p>
          </div>

          {owner?.phone && (
            <a
              href={`https://wa.me/${owner.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('tenantDashboard.chatWhatsapp')}</span>
            </a>
          )}
        </CardContent>
      </Card>

      {/* Maintenance CTA */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-border/80 shadow-sm p-6 space-y-3 bg-gradient-to-br from-secondary/50 to-secondary dark:from-muted/20 dark:to-card">
        <h3 className="font-bold text-sm text-slate-900 dark:text-foreground flex items-center gap-2">
          <Wrench className="w-4 h-4 text-primary" />
          <span>{t('tenantDashboard.maintenanceCtaTitle')}</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {t('tenantDashboard.maintenanceCtaDesc')}
        </p>
        <Link href="/tenant/maintenance" className="block pt-1">
          <Button
            size="sm"
            className="w-full rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{t('tenantDashboard.reportIssue')}</span>
          </Button>
        </Link>
      </Card>
    </div>
  );
}
