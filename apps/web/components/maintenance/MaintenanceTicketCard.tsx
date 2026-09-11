'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Thermometer,
  Droplets,
  Zap,
  Wrench,
  DoorClosed,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  actualCost?: number;
  room?: {
    id: string;
    roomNumber: string;
    property?: {
      name: string;
    };
  };
  reporter?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
    };
  };
  technician?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
    };
  };
}

interface MaintenanceTicketCardProps {
  ticket: MaintenanceTicket;
  onOpenAssign: (ticket: MaintenanceTicket) => void;
  onResolve: (id: string) => void;
}

export const MaintenanceTicketCard: React.FC<MaintenanceTicketCardProps> = ({
  ticket,
  onOpenAssign,
  onResolve,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AC':
        return <Thermometer className="w-4 h-4 text-sky-500" />;
      case 'PLUMBING':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'ELECTRICAL':
        return <Zap className="w-4 h-4 text-amber-500" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Mendesak</Badge>;
      case 'HIGH':
        return <Badge variant="destructive">Tinggi</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Sedang</Badge>;
      default:
        return <Badge variant="outline">Rendah</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REPORTED':
        return <Badge variant="warning">Menunggu Teknisi</Badge>;
      case 'ASSIGNED':
        return <Badge variant="info">Ditugaskan</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="default">Sedang Dikerjakan</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">Selesai</Badge>;
      case 'CLOSED':
        return <Badge variant="outline">Ditutup</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="rounded-2xl border border-gray-100 dark:border-border shadow-xs hover:shadow-md transition-all bg-white dark:bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-muted/40 border border-gray-100 dark:border-border/60">
              {getCategoryIcon(ticket.category)}
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                {ticket.category}
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-foreground">
                {ticket.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getPriorityBadge(ticket.priority)}
            {getStatusBadge(ticket.status)}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 bg-gray-50/50 dark:bg-muted/20 p-3.5 rounded-xl border border-gray-100 dark:border-border/40 leading-relaxed">
          {ticket.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-border/60 text-xs text-gray-500 dark:text-muted-foreground">
          <div className="flex items-center gap-2">
            <DoorClosed className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              Kamar {ticket.room?.roomNumber} ({ticket.room?.property?.name || 'Gedung'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Pelapor: {ticket.reporter?.profile?.fullName || ticket.reporter?.email || '-'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Teknisi: {ticket.technician?.profile?.fullName || ticket.technician?.email || 'Belum ada'}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-100 dark:border-border/60">
          {ticket.status === 'REPORTED' && (
            <Button
              size="sm"
              onClick={() => onOpenAssign(ticket)}
              className="text-xs rounded-xl shadow-xs"
            >
              Tugaskan Teknisi
            </Button>
          )}

          {(ticket.status === 'ASSIGNED' || ticket.status === 'IN_PROGRESS') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve(ticket.id)}
              className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tandai Selesai</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
