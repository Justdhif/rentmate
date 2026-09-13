'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, CreditCard, Sparkles } from 'lucide-react';

export const SystemIntegrationCard: React.FC = () => {
  return (
    <Card className="rounded-2xl p-6 sm:p-7 border border-border shadow-xs bg-card animate-slide-up animate-stagger-3">
      <CardContent className="p-0 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            Integrasi Layanan & API
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Status konektivitas gateway pembayaran dan kecerdasan buatan.
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-xs sm:text-sm truncate">Midtrans Payment Gateway</p>
                <p className="text-[11px] text-muted-foreground">Snap API Sandbox & QRIS</p>
              </div>
            </div>
            <Badge variant="available" size="sm">
              Aktif
            </Badge>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-xs sm:text-sm truncate">Groq AI Engine</p>
                <p className="text-[11px] text-muted-foreground">Llama 3.3 / GPT-OSS Real-Time</p>
              </div>
            </div>
            <Badge variant="available" size="sm">
              Terhubung
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
