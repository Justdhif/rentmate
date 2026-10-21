'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  Droplets,
  Zap,
  Snowflake,
  AlertCircle,
  Clock,
  CheckCircle2,
  MapPin,
  User,
  Calendar,
  Image as ImageIcon,
  FileText,
  UserPlus,
  Check,
} from 'lucide-react';
import { MaintenanceTicket } from '../MaintenanceTicketCard';
import { useTranslation } from '@/contexts/LanguageContext';

interface MaintenanceDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: MaintenanceTicket | null;
  onOpenAssign: (ticket: MaintenanceTicket) => void;
  onResolve: (id: string) => void;
}

export const MaintenanceDetailModal: React.FC<MaintenanceDetailModalProps> = ({
  isOpen,
  onOpenChange,
  ticket,
  onOpenAssign,
  onResolve,
}) => {
  const { t } = useTranslation();

  if (!ticket) return null;

  const getCategoryConfig = (category: string = '') => {
    const cat = category.toUpperCase();
    if (cat.includes('AC') || cat.includes('PENDINGIN')) {
      return {
        label: 'AC Repair',
        icon: Snowflake,
        badgeClass: 'bg-secondary text-secondary-foreground border border-border',
      };
    }
    if (cat.includes('PLUMB') || cat.includes('PIPA') || cat.includes('AIR') || cat.includes('KRAN') || cat.includes('SANITASI')) {
      return {
        label: 'Plumbing',
        icon: Droplets,
        badgeClass: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border-sky-100 dark:border-sky-900/40',
      };
    }
    if (cat.includes('LISTRIK') || cat.includes('ELECTRICAL') || cat.includes('LAMPU') || cat.includes('STOPKONTAK')) {
      return {
        label: 'Electrical',
        icon: Zap,
        badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/40',
      };
    }
    return {
      label: category || 'General',
      icon: Wrench,
      badgeClass: 'bg-primary50 text-primary600 dark:bg-primary950/40 dark:text-primary400 border-border100 dark:border-border900/40',
    };
  };

  const getPriorityConfig = (priority: string = '') => {
    const prio = priority.toUpperCase();
    if (prio === 'URGENT') {
      return {
        label: 'Urgent',
        icon: AlertCircle,
        badgeClass: 'bg-primary50 text-primary600 dark:bg-primary950/40 dark:text-primary400 border-border100 dark:border-border900/40',
      };
    }
    if (prio === 'HIGH') {
      return {
        label: 'High',
        icon: AlertCircle,
        badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/40',
      };
    }
    if (prio === 'MEDIUM') {
      return {
        label: 'Medium',
        icon: Clock,
        badgeClass: 'bg-amber-50/70 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100/70 dark:border-amber-900/30',
      };
    }
    return {
      label: 'Low',
      icon: Clock,
      badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-border',
    };
  };

  const catConfig = getCategoryConfig(ticket.category);
  const prioConfig = getPriorityConfig(ticket.priority);
  const CatIcon = catConfig.icon;
  const PrioIcon = prioConfig.icon;

  const reporterName =
    ticket.tenant?.profile?.fullName ||
    ticket.reporter?.profile?.fullName ||
    ticket.tenant?.email ||
    ticket.reporter?.email ||
    'Penghuni Kost';

  const technicianName =
    ticket.technician?.profile?.fullName ||
    ticket.technician?.email ||
    null;

  const roomText = ticket.room
    ? `Room ${ticket.room.roomNumber} - ${ticket.room.property?.name || 'Kost'}`
    : 'Kost Melati';

  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  const hasTechnician = Boolean(ticket.technician || ticket.assignedTo);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white dark:bg-card border-slate-200 dark:border-border rounded-2xl shadow-xl">
        <DialogHeader className="p-5 pb-4 border-b border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-muted/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${catConfig.badgeClass}`}>
                <CatIcon className="w-3.5 h-3.5" />
                <span>{catConfig.label}</span>
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${prioConfig.badgeClass}`}>
                <PrioIcon className="w-3.5 h-3.5" />
                <span>{prioConfig.label}</span>
              </span>
            </div>
            {ticket.ticketNumber && (
              <span className="text-xs font-mono font-bold text-slate-400">
                {ticket.ticketNumber}
              </span>
            )}
          </div>
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3 text-left">
            {ticket.title || ticket.description}
          </DialogTitle>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{roomText}</span>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Full Description */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Deskripsi Lengkap Laporan</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-muted/30 p-3.5 rounded-xl border border-slate-100 dark:border-border/40">
              {ticket.description}
            </p>
          </div>

          {/* People Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Reporter */}
            <div className="p-3 bg-slate-50/70 dark:bg-muted/20 rounded-xl border border-slate-100 dark:border-border/40">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
                Pelapor (Tenant)
              </span>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs shrink-0">
                  {reporterName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {reporterName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Penghuni Kamar
                  </div>
                </div>
              </div>
            </div>

            {/* Technician */}
            <div className="p-3 bg-slate-50/70 dark:bg-muted/20 rounded-xl border border-slate-100 dark:border-border/40">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
                Teknisi Ditugaskan
              </span>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {technicianName ? `${technicianName} (Teknisi)` : 'Belum Ditugaskan'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {technicianName ? 'Sedang / Siap Menangani' : 'Klik tombol di bawah'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments if any */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                <span>Foto Kerusakan ({ticket.attachments.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ticket.attachments.map((att: any, idx: number) => (
                  <a
                    key={att.id || idx}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative rounded-xl overflow-hidden border border-slate-200 dark:border-border group aspect-video bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      src={att.fileUrl}
                      alt={`Foto kerusakan ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Date info */}
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-border/60">
            <Calendar className="w-3.5 h-3.5" />
            <span>Dilaporkan pada: {new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/50 dark:bg-muted/10 border-t border-slate-100 dark:border-border/60 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-10 text-xs font-semibold"
          >
            Tutup
          </Button>

          {!isResolved && !hasTechnician && (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onOpenAssign(ticket);
              }}
              className="rounded-xl h-10 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              Tugaskan Teknisi
            </Button>
          )}

          {!isResolved && hasTechnician && (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onResolve(ticket.id);
              }}
              className="rounded-xl h-10 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              Tandai Selesai
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
