'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DoorClosed,
  MapPin,
  Calendar,
  Phone,
  MoreHorizontal,
  MessageCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export interface TenantDisplayItem {
  id: string;
  assignmentId?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roomNumber: string;
  roomType?: string;
  propertyName: string;
  propertyCity?: string;
  status: 'ACTIVE' | 'PENDING' | 'ENDED';
  startDate: string;
  endDate?: string;
  durationMonths?: number;
  monthlyRent: number;
  isActive: boolean;
}

// Backward compatibility alias
export type Assignment = TenantDisplayItem;

interface TenantTableProps {
  tenants: TenantDisplayItem[];
  onUnassign: (id: string, name: string) => void;
  formatCurrency: (val?: number) => string;
  onResetFilter?: () => void;
}

const ITEMS_PER_PAGE = 8;

export const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  onUnassign,
  formatCurrency,
  onResetFilter,
}) => {
  const { t, locale } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Calculate pagination
  const totalItems = tenants.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentItems = tenants.slice(startIndex, endIndex);

  // Select all on current page
  const isAllSelected =
    currentItems.length > 0 &&
    currentItems.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const currentIds = currentItems.map((item) => item.id);
      setSelectedIds(selectedIds.filter((id) => !currentIds.includes(id)));
    } else {
      const currentIds = currentItems.map((item) => item.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...currentIds])));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Helper for date range
  const formatDateRange = (start: string, end?: string) => {
    try {
      const startDate = new Date(start);
      const startStr = startDate.toLocaleDateString(
        locale === 'en' ? 'en-US' : 'id-ID',
        { day: 'numeric', month: 'short', year: 'numeric' }
      );

      if (!end) {
        return { rangeStr: startStr, durationStr: '' };
      }

      const endDate = new Date(end);
      const endStr = endDate.toLocaleDateString(
        locale === 'en' ? 'en-US' : 'id-ID',
        { day: 'numeric', month: 'short', year: 'numeric' }
      );

      const diffMonths = Math.max(
        1,
        Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4)
        )
      );

      const durationSuffix = t('tenants.monthSuffix', { defaultValue: 'bulan' });
      return {
        rangeStr: `${startStr} – ${endStr}`,
        durationStr: `(${diffMonths} ${durationSuffix})`,
      };
    } catch {
      return { rangeStr: start, durationStr: '' };
    }
  };

  // If table is completely empty
  if (tenants.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card p-12 text-center shadow-2xs">
        <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
          <Users className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-foreground text-base">
          {t('tenants.noResultsTitle', { defaultValue: 'Tidak Ada Tenant Ditemukan' })}
        </h3>
        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1 max-w-sm mx-auto">
          {t('tenants.noResultsDesc', {
            defaultValue:
              'Tidak ada data tenant yang cocok dengan filter atau kata kunci pencarian Anda.',
          })}
        </p>
        {onResetFilter && (
          <Button
            onClick={onResetFilter}
            variant="outline"
            className="mt-5 rounded-xl text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>{t('tenants.resetFilter', { defaultValue: 'Reset Filter' })}</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-slate-50/80 dark:bg-muted/30 border-b border-slate-100 dark:border-border/60 text-slate-500 dark:text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
            <TableRow>
              <TableHead className="py-3.5 px-4 w-10">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="py-3.5 px-4 min-w-[200px]">
                {t('tenants.tableHeaderTenant', { defaultValue: 'Nama Tenant' })}
              </TableHead>
              <TableHead className="py-3.5 px-4 min-w-[120px]">
                {t('tenants.tableHeaderRoom', { defaultValue: 'Kamar' })}
              </TableHead>
              <TableHead className="py-3.5 px-4 min-w-[180px]">
                {t('tenants.tableHeaderKost', { defaultValue: 'Kost' })}
              </TableHead>
              <TableHead className="py-3.5 px-4 min-w-[90px]">
                {t('tenants.tableHeaderStatus', { defaultValue: 'Status' })}
              </TableHead>
              <TableHead className="py-3.5 px-4 min-w-[190px]">
                {t('tenants.tableHeaderContract', { defaultValue: 'Masa Kontrak' })}
              </TableHead>
              <TableHead className="py-3.5 px-4 w-12 text-center">
                {t('tenants.tableHeaderAction', { defaultValue: 'Aksi' })}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100 dark:divide-border/40">
            {currentItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const { rangeStr, durationStr } = formatDateRange(
                item.startDate,
                item.endDate
              );

              return (
                <TableRow
                  key={item.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-muted/20 transition-colors ${
                    isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
                >
                  {/* Checkbox Column */}
                  <TableCell className="py-3.5 px-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectRow(item.id)}
                      aria-label={`Select ${item.name}`}
                    />
                  </TableCell>

                  {/* Nama Tenant Column */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-foreground text-xs leading-snug line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-muted-foreground mt-0.5 line-clamp-1">
                          {item.email}
                        </p>
                        {item.phone && item.phone !== '-' && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="text-[11px] text-slate-400 dark:text-muted-foreground">
                              {item.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Kamar Column */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <DoorClosed className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-foreground text-xs block">
                          {item.roomNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-muted-foreground block">
                          {item.roomType || 'Standard'}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Kost Column */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs line-clamp-1">
                          {item.propertyName}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-muted-foreground mt-0.5 line-clamp-1">
                          {item.propertyCity || 'Indonesia'}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status Column */}
                  <TableCell className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60'
                          : item.status === 'PENDING'
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60'
                      }`}
                    >
                      {item.status === 'ACTIVE'
                        ? t('tenants.filterStatusActive', { defaultValue: 'Aktif' })
                        : item.status === 'PENDING'
                        ? t('tenants.filterStatusPending', { defaultValue: 'Pending' })
                        : t('tenants.filterStatusEnded', { defaultValue: 'Keluar' })}
                    </span>
                  </TableCell>

                  {/* Masa Kontrak Column */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-xs block">
                          {rangeStr}
                        </span>
                        {durationStr && (
                          <span className="text-[10px] text-slate-400 dark:text-muted-foreground block mt-0.5">
                            {durationStr}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Aksi Column */}
                  <TableCell className="py-3.5 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-muted cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl text-xs">
                        {item.phone && (
                          <DropdownMenuItem asChild>
                            <a
                              href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <MessageCircle className="w-4 h-4 text-emerald-500" />
                              <span>
                                {t('tenants.actionWhatsapp', {
                                  defaultValue: 'Hubungi WhatsApp',
                                })}
                              </span>
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link
                            href="/rooms"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <DoorClosed className="w-4 h-4 text-blue-500" />
                            <span>
                              {t('tenants.actionRoomDetail', {
                                defaultValue: 'Kelola Kamar',
                              })}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                        {item.isActive && (
                          <DropdownMenuItem
                            onClick={() => onUnassign(item.assignmentId || item.id, item.name)}
                            className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>
                              {t('tenants.actionCheckout', {
                                defaultValue: 'Akhiri Sewa / Checkout',
                              })}
                            </span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 border-t border-slate-100 dark:border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <p className="text-slate-500 dark:text-muted-foreground font-medium">
          {t('tenants.showingPagination', {
            start: startIndex + 1,
            end: endIndex,
            total: totalItems,
          })}
        </p>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage === 1}
            className="h-8 w-8 rounded-lg border-slate-200 dark:border-border text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === validPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={`h-8 w-8 p-0 rounded-lg text-xs font-semibold cursor-pointer ${
                page === validPage
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border-slate-200 dark:border-border text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage === totalPages}
            className="h-8 w-8 rounded-lg border-slate-200 dark:border-border text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
