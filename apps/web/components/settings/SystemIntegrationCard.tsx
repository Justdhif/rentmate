'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, CreditCard, Shield } from 'lucide-react';

export const SystemIntegrationCard: React.FC = () => {
  return (
    <Card className="rounded-2xl p-8 border border-border shadow-xs bg-card animate-slide-up animate-stagger-2">
      <CardContent className="p-0">
        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          Status Integrasi Sistem
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Payment Gateway</p>
                <p className="text-xs text-muted-foreground">Midtrans Snap API Sandbox</p>
              </div>
            </div>
            <Badge variant="success">Aktif</Badge>
          </div>

          <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">AI Engine</p>
                <p className="text-xs text-muted-foreground">Groq Llama 3 / GPT-OSS</p>
              </div>
            </div>
            <Badge variant="success">Terhubung</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
