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
import { LogOut } from 'lucide-react';

export interface Assignment {
  id: string;
  userId: string;
  roomId: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  rentAmount: number;
  user?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      phoneNumber?: string;
    };
  };
  room?: {
    id: string;
    roomNumber: string;
    property?: {
      name: string;
    };
  };
}

interface TenantTableProps {
  assignments: Assignment[];
  onUnassign: (id: string, name: string) => void;
  formatCurrency: (val?: number) => string;
}

export const TenantTable: React.FC<TenantTableProps> = ({
  assignments,
  onUnassign,
  formatCurrency,
}) => {
  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <Table className="w-full text-left text-sm">
          <TableHeader className="bg-muted/50 dark:bg-muted/20 border-b border-gray-100 dark:border-border text-gray-500 dark:text-muted-foreground font-semibold uppercase tracking-wider text-xs">
            <TableRow>
              <TableHead className="py-4 px-6">Nama Penghuni</TableHead>
              <TableHead className="py-4 px-6">Properti & Kamar</TableHead>
              <TableHead className="py-4 px-6">Tanggal Mulai</TableHead>
              <TableHead className="py-4 px-6">Tarif Sewa</TableHead>
              <TableHead className="py-4 px-6">Status</TableHead>
              <TableHead className="py-4 px-6 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-border/60">
            {assignments.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-muted/30 dark:hover:bg-muted/10 even:bg-muted/10 dark:even:bg-muted/5 transition-colors"
              >
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                      {item.user?.profile?.fullName?.charAt(0).toUpperCase() ||
                        item.user?.email?.charAt(0).toUpperCase() ||
                        'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-foreground">
                        {item.user?.profile?.fullName || 'Penghuni Kost'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-muted-foreground">
                        {item.user?.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4 px-6">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-foreground">
                      Kamar {item.room?.roomNumber || '-'}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">
                      {item.room?.property?.name || 'Gedung'}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="py-4 px-6 text-gray-600 dark:text-muted-foreground font-medium">
                  {new Date(item.startDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>

                <TableCell className="py-4 px-6 font-semibold text-gray-900 dark:text-foreground">
                  {formatCurrency(Number(item.rentAmount))}
                </TableCell>

                <TableCell className="py-4 px-6">
                  {item.isActive ? (
                    <Badge variant="success">Aktif</Badge>
                  ) : (
                    <Badge variant="outline">Selesai</Badge>
                  )}
                </TableCell>

                <TableCell className="py-4 px-6 text-right">
                  {item.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onUnassign(
                          item.id,
                          item.user?.profile?.fullName || item.user?.email || 'Penghuni'
                        )
                      }
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium rounded-xl inline-flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Checkout</span>
                    </Button>
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
