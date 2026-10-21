"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface TenantActiveRoomCardProps {
  data: any;
}

export function TenantActiveRoomCard({ data }: TenantActiveRoomCardProps) {
  return (
    <Card className="rounded-3xl border-slate-200/80 dark:border-border/80 shadow-sm p-6 lg:col-span-2 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-none font-bold text-[10px] uppercase tracking-wider">
              Sewa Aktif
            </Badge>
            <span className="text-xs text-slate-400">
              Tipe: {data.room?.roomType || "Standard"}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-foreground">
            Kamar {data.room?.roomNumber} - {data.property?.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
            {data.property?.address}
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Biaya Sewa
          </span>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            Rp {Number(data.assignment?.monthlyRent || 0).toLocaleString("id-ID")}
            <span className="text-xs font-normal text-slate-400">/bln</span>
          </div>
        </div>
      </div>

      {/* Room Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Nomor Kamar
          </span>
          <p className="text-base font-extrabold text-slate-900 dark:text-foreground mt-0.5">
            {data.room?.roomNumber}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Lantai
          </span>
          <p className="text-base font-extrabold text-slate-900 dark:text-foreground mt-0.5">
            Lantai {data.room?.floor || 1}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Mulai Sewa
          </span>
          <p className="text-xs font-bold text-slate-900 dark:text-foreground mt-1">
            {data.assignment?.startDate || "-"}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Akhir Sewa
          </span>
          <p className="text-xs font-bold text-slate-900 dark:text-foreground mt-1">
            {data.assignment?.endDate || "Bulanan (Auto)"}
          </p>
        </div>
      </div>

      {/* Facilities */}
      {data.property?.facilities && data.property.facilities.length > 0 && (
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-foreground block mb-2">
            Fasilitas Tersedia:
          </span>
          <div className="flex flex-wrap gap-2">
            {data.property.facilities.map((fac: string, idx: number) => (
              <span
                key={idx}
                className="text-xs font-medium px-3 py-1 rounded-xl bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300"
              >
                {fac}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rules */}
      {data.property?.rules && (
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Tata Tertib & Peraturan Kos:</span>
          </span>
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            {data.property.rules}
          </p>
        </div>
      )}
    </Card>
  );
}
