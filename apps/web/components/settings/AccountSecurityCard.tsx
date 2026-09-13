'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface AccountSecurityCardProps {
  user: any;
}

export const AccountSecurityCard: React.FC<AccountSecurityCardProps> = ({ user }) => {
  return (
    <Card className="rounded-2xl p-6 sm:p-7 border border-border shadow-xs bg-card animate-slide-up animate-stagger-2">
      <CardContent className="p-0 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Keamanan & Sesi Akun
          </h4>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Aktif
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Akun Anda dilindungi dengan enkripsi berlapis dan rotasi token otomatis demi menjaga keamanan data properti Anda.
        </p>

        <div className="space-y-2.5 pt-1">
          <div className="p-3 rounded-xl border border-border bg-background flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">Enkripsi Akses</p>
                <p className="text-[11px] text-muted-foreground">JWT 256-bit + TLS 1.3</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300">
              Terenkripsi
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border bg-background flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">Rotasi Token Sesi</p>
                <p className="text-[11px] text-muted-foreground">Otomatis tiap 15 menit</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              Auto-Cycle
            </span>
          </div>
        </div>

        {/* Tips / AI Assistant shortcut */}
        <div className="p-3.5 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-purple-500/5 rounded-xl border border-indigo-500/15 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-950 dark:text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            Butuh Bantuan Operasional?
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            Gunakan AI Assistant untuk menanyakan seputar performa kamar, draf pesan penagihan, atau estimasi biaya sewa.
          </p>
          <Link
            href="/ai-assistant"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
          >
            Buka AI Assistant &rarr;
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
