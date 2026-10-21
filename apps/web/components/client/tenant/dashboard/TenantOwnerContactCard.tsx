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

interface TenantOwnerContactCardProps {
  owner?: {
    name?: string;
    phone?: string;
  };
}

export function TenantOwnerContactCard({ owner }: TenantOwnerContactCardProps) {
  return (
    <div className="space-y-6">
      {/* Contact Card */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-border/80 shadow-sm p-6 space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Kontak Pemilik Kos</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Hubungi bapak/ibu kos jika ada hal mendesak
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Nama Pemilik
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-foreground mt-0.5">
              {owner?.name || "Pemilik Kos"}
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
              <span>Chat WhatsApp Pemilik</span>
            </a>
          )}
        </CardContent>
      </Card>

      {/* Maintenance CTA */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-border/80 shadow-sm p-6 space-y-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-muted/20 dark:to-card">
        <h3 className="font-bold text-sm text-slate-900 dark:text-foreground flex items-center gap-2">
          <Wrench className="w-4 h-4 text-indigo-600" />
          <span>Ada Kerusakan Fasilitas?</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Laporkan lampu mati, AC tidak dingin, atau kebocoran air. Teknisi resmi kos akan segera dijadwalkan.
        </p>
        <Link href="/maintenance" className="block pt-1">
          <Button
            size="sm"
            className="w-full rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Buat Laporan Tiket</span>
          </Button>
        </Link>
      </Card>
    </div>
  );
}
