'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Snowflake,
  Droplets,
  Zap,
  Wrench,
  AlertCircle,
  Clock,
  MapPin,
  ChevronRight,
  User,
  UserPlus,
  Check,
  CheckCircle2,
  MoreHorizontal,
  Eye,
} from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export interface MaintenanceTicket {
  id: string;
  ticketNumber?: string;
  title?: string;
  description: string;
  category: string;
  priority: string;
  status: 'REPORTED' | 'REVIEWING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  actualCost?: number;
  room?: {
    id: string;
    roomNumber: string;
    property?: {
      id?: string;
      name: string;
    };
  };
  tenant?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
    };
  };
  reporter?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
    };
  };
  technician?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
    };
  };
  attachments?: any[];
  assignedTo?: string;
}

interface MaintenanceTicketCardProps {
  ticket: MaintenanceTicket;
  onOpenAssign: (ticket: MaintenanceTicket) => void;
  onResolve: (id: string) => void;
  onViewDetail?: (ticket: MaintenanceTicket) => void;
}

export const MaintenanceTicketCard: React.FC<MaintenanceTicketCardProps> = ({
  ticket,
  onOpenAssign,
  onResolve,
  onViewDetail,
}) => {
  const { t, locale } = useTranslation();

  // Category badge config (matching the photo)
  const getCategoryConfig = (category: string = '') => {
    const cat = category.toUpperCase();
    if (cat.includes('AC') || cat.includes('PENDINGIN')) {
      return {
        label: 'AC Repair',
        icon: Snowflake,
        badgeClass: 'bg-rose- text-rose- dark:bg-rose-/40 dark:text-rose- border-rose- dark:border-rose-/30',
      };
    }
    if (
      cat.includes('PLUMB') ||
      cat.includes('PIPA') ||
      cat.includes('AIR') ||
      cat.includes('KRAN') ||
      cat.includes('SANITASI') ||
      cat.includes('TOILET')
    ) {
      return {
        label: 'Plumbing',
        icon: Droplets,
        badgeClass: 'bg-rose- text-rose- dark:bg-rose-/40 dark:text-rose- border-rose- dark:border-rose-/30',
      };
    }
    if (
      cat.includes('LISTRIK') ||
      cat.includes('ELECTRICAL') ||
      cat.includes('LAMPU') ||
      cat.includes('STOPKONTAK')
    ) {
      return {
        label: 'Electrical',
        icon: Zap,
        badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
      };
    }
    return {
      label: category || 'General',
      icon: Wrench,
      badgeClass: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900/30',
    };
  };

  // Priority badge config (matching the photo)
  const getPriorityConfig = (priority: string = '') => {
    const prio = priority.toUpperCase();
    if (prio === 'URGENT') {
      return {
        label: 'Urgent',
        icon: AlertCircle,
        badgeClass: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-100 dark:border-red-900/30',
      };
    }
    if (prio === 'HIGH') {
      return {
        label: 'High',
        icon: AlertCircle,
        badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
      };
    }
    if (prio === 'MEDIUM') {
      return {
        label: 'Medium',
        icon: Wrench,
        badgeClass: 'bg-amber-50/70 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100/70 dark:border-amber-900/20',
      };
    }
    return {
      label: 'Low',
      icon: Clock,
      badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-border',
    };
  };

  // Calculate relative time (e.g. "2h ago")
  const getRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      if (diffMins < 60) {
        return locale === 'id' ? `${diffMins}m lalu` : `${diffMins}m ago`;
      }
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return locale === 'id' ? `${diffHours}h lalu` : `${diffHours}h ago`;
      }
      const diffDays = Math.floor(diffHours / 24);
      return locale === 'id' ? `${diffDays}d lalu` : `${diffDays}d ago`;
    } catch {
      return '1d ago';
    }
  };

  const catConfig = getCategoryConfig(ticket.category);
  const prioConfig = getPriorityConfig(ticket.priority);
  const CatIcon = catConfig.icon;
  const PrioIcon = prioConfig.icon;

  // Title extraction (short & punchy)
  const displayTitle =
    ticket.title ||
    (ticket.description ? ticket.description.split('.')[0] : 'Laporan Fasilitas');

  // Room & Property
  const roomNumber = ticket.room?.roomNumber || '-';
  const propertyName = ticket.room?.property?.name || 'Kost Melati';
  const locationText = `Room ${roomNumber} - ${propertyName}`;

  // Reporter (Tenant)
  const reporterName =
    ticket.tenant?.profile?.fullName ||
    ticket.reporter?.profile?.fullName ||
    ticket.tenant?.email?.split('@')[0] ||
    ticket.reporter?.email?.split('@')[0] ||
    'Siti Nurhaliza';

  // Technician
  const technicianName =
    ticket.technician?.profile?.fullName ||
    (ticket.technician?.email ? ticket.technician.email.split('@')[0] : null);

  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  const isAssignedOrInProgress = ticket.status === 'ASSIGNED' || ticket.status === 'IN_PROGRESS' || Boolean(technicianName);

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all p-4.5 sm:p-5 flex flex-col justify-between group">
      <div>
        {/* Top Header: Category Badge (Left) & Priority Badge (Right) */}
        <div className="flex items-center justify-between gap-2">
          {/* Category Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${catConfig.badgeClass}`}
          >
            <CatIcon className="w-3.5 h-3.5" />
            <span>{catConfig.label}</span>
          </span>

          {/* Priority Pill */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${prioConfig.badgeClass}`}
          >
            <PrioIcon className="w-3.5 h-3.5" />
            <span>{prioConfig.label}</span>
          </span>
        </div>

        {/* Title & Location */}
        <div className="mt-3.5">
          <h3
            onClick={() => onViewDetail && onViewDetail(ticket)}
            className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-1 cursor-pointer hover:text-rose- dark:hover:text-rose- transition-colors"
            title={displayTitle}
          >
            {displayTitle}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        </div>

        {/* Reporter (Tenant) Row */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100/80 dark:border-border/40">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar circle */}
            <div className="w-8 h-8 rounded-full bg-rose- dark:bg-rose- text-rose- dark:text-rose- font-bold text-xs flex items-center justify-center shrink-0 border border-rose-/60 dark:border-rose-/40">
              {reporterName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium leading-none">
                Reported by
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                {reporterName} <span className="font-normal text-slate-400 text-[11px]">(Tenant)</span>
              </div>
            </div>
          </div>

          {/* Relative Time */}
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap ml-2">
            {getRelativeTime(ticket.createdAt)}
          </span>
        </div>

        {/* Assigned Technician Row */}
        <div
          onClick={() => onOpenAssign(ticket)}
          className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl p-2.5 flex items-center justify-between border border-slate-100 dark:border-border/40 mt-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-colors group/tech"
          title="Klik untuk menugaskan atau mengubah teknisi"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-300 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium leading-none">
                Assigned to
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                {technicianName ? (
                  <span>
                    {technicianName} <span className="font-normal text-slate-400 text-[11px]">(Technician)</span>
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal">-</span>
                )}
              </div>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover/tech:text-slate-700 dark:group-hover/tech:text-slate-200 transition-colors shrink-0" />
        </div>
      </div>

      {/* Bottom Action Row: Main Action Button + More '...' Button */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-border/60">
        {/* Main Action Button */}
        {isResolved ? (
          <div className="flex-1 h-9.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center gap-1.5 text-xs font-bold select-none">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai</span>
          </div>
        ) : isAssignedOrInProgress ? (
          <Button
            size="sm"
            onClick={() => onResolve(ticket.id)}
            className="flex-1 h-9.5 rounded-xl bg-rose- hover:bg-rose- text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark as Resolved</span>
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onOpenAssign(ticket)}
            className="flex-1 h-9.5 rounded-xl bg-rose- hover:bg-rose- text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Assign Technician</span>
          </Button>
        )}

        {/* Options Button (...) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9.5 w-9.5 rounded-xl border-slate-200 dark:border-border text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 shrink-0 cursor-pointer shadow-2xs"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
            <DropdownMenuItem
              onClick={() => onOpenAssign(ticket)}
              className="gap-2 cursor-pointer text-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-rose-" />
              <span>{technicianName ? 'Ganti Teknisi' : 'Tugaskan Teknisi'}</span>
            </DropdownMenuItem>

            {!isResolved && (
              <DropdownMenuItem
                onClick={() => onResolve(ticket.id)}
                className="gap-2 cursor-pointer text-xs"
              >
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tandai Selesai</span>
              </DropdownMenuItem>
            )}

            {onViewDetail && (
              <DropdownMenuItem
                onClick={() => onViewDetail(ticket)}
                className="gap-2 cursor-pointer text-xs"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Lihat Detail Tiket</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
