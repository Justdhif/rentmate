'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, CreditCard } from 'lucide-react';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  paidAt?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  createdAt: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    dueDate: string;
    description?: string;
  };
}

interface PaymentTableProps {
  payments: Payment[];
  formatCurrency: (val?: number) => string;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({ payments, formatCurrency }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">Lunas</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Menunggu</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Gagal</Badge>;
      case 'EXPIRED':
        return <Badge variant="outline">Kedaluwarsa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <Table className="w-full text-left text-sm">
          <TableHeader className="bg-muted/50 dark:bg-muted/20 border-b border-gray-100 dark:border-border text-gray-500 dark:text-muted-foreground font-semibold uppercase tracking-wider text-xs">
            <TableRow>
              <TableHead className="py-4 px-6">ID Invoice / Order</TableHead>
              <TableHead className="py-4 px-6">Metode Bayar</TableHead>
              <TableHead className="py-4 px-6">Tanggal Terbit</TableHead>
              <TableHead className="py-4 px-6">Nominal</TableHead>
              <TableHead className="py-4 px-6">Status</TableHead>
              <TableHead className="py-4 px-6 text-right">Aksi Bayar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-border/60">
            {payments.map((p) => (
              <TableRow
                key={p.id}
                className="hover:bg-muted/30 dark:hover:bg-muted/10 even:bg-muted/10 dark:even:bg-muted/5 transition-colors"
              >
                <TableCell className="py-4 px-6">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-foreground">
                      {p.invoice?.invoiceNumber || p.orderId}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground line-clamp-1 mt-0.5">
                      {p.invoice?.description || 'Tagihan Sewa Kamar'}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="py-4 px-6">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-muted text-gray-700 dark:text-gray-300">
                    {p.paymentMethod || 'SNAP_MIDTRANS'}
                  </span>
                </TableCell>

                <TableCell className="py-4 px-6 text-gray-600 dark:text-muted-foreground font-medium">
                  {new Date(p.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>

                <TableCell className="py-4 px-6 font-semibold text-gray-900 dark:text-foreground">
                  {formatCurrency(Number(p.amount))}
                </TableCell>

                <TableCell className="py-4 px-6">{getStatusBadge(p.status)}</TableCell>

                <TableCell className="py-4 px-6 text-right">
                  {p.status === 'PENDING' && p.snapRedirectUrl ? (
                    <Button
                      asChild
                      size="sm"
                      className="text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <a href={p.snapRedirectUrl} target="_blank" rel="noopener noreferrer">
                        <span>Bayar Sekarang</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  ) : p.status === 'PAID' ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Sudah Terbayar
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
