'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Receipt,
  Calendar,
  MapPin,
  DoorClosed,
  Phone,
  MoreHorizontal,
  MessageCircle,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CreditCard,
  Building2,
} from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export interface Payment {
  id: string;
  orderId?: string;
  amount: number | string;
  paymentMethod?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
  paidAt?: string | null;
  dueDate?: string;
  period?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  createdAt: string;
  room?: {
    id: string;
    roomNumber: string;
    floor?: number;
    roomType?: string;
    property?: {
      id: string;
      name: string;
      address?: string;
      city?: string;
    };
  };
  tenant?: {
    id: string;
    email: string;
    profile?: {
      fullName?: string;
      phoneNumber?: string;
      avatarUrl?: string;
    };
    fullName?: string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    dueDate?: string;
    description?: string;
  };
  // Normalized helper fields
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  roomNumber?: string;
  roomType?: string;
  propertyName?: string;
  propertyCity?: string;
}

interface PaymentTableProps {
  payments: Payment[];
  formatCurrency: (val?: number) => string;
  onMarkPaid?: (paymentId: string, tenantName: string, amount: number) => void;
  onResetFilter?: () => void;
}

const ITEMS_PER_PAGE = 8;

export const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  formatCurrency,
  onMarkPaid,
  onResetFilter,
}) => {
  const { t, locale } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination calculations
  const totalItems = payments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentItems = payments.slice(startIndex, endIndex);

  // Selection handlers
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

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString(
        locale === 'en' ? 'en-US' : 'id-ID',
        { day: 'numeric', month: 'short', year: 'numeric' }
      );
    } catch {
      return dateStr;
    }
  };

  // If table is completely empty
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card p-12 text-center shadow-2xs">
        <div className="w-14 h-14 rounded-full bg-rose- dark:bg-rose-/40 text-rose- dark:text-rose- flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-foreground text-base">
          {t('payments.noResultsTitle', { defaultValue: 'Tidak Ada Tagihan Ditemukan' })}
        </h3>
        <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1 max-w-sm mx-auto">
          {t('payments.noResultsDesc', {
            defaultValue:
              'Tidak ada data tagihan yang cocok dengan filter atau kata kunci pencarian Anda.',
          })}
        </p>
        {onResetFilter && (
          <Button
            onClick={onResetFilter}
            variant="outline"
            className="mt-5 rounded-xl text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>{t('payments.resetFilter', { defaultValue: 'Reset Filter' })}</span>
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
              <TableHead className="py-3.5 px-4 min-w-[210px]">
                {t('payments.tableHeaderTenant', { defaultValue: 'Penyewa & Invoice' })}
              </TableHead>
              <TableHead className="py-3.5 px-4 min-w-[170px]">
                {t('payments.tableHeaderRoom', { defaultValue: 'Kamar & Kost' })}
              </TableHead>
              <TableHead className="py-3.5 px-4 min-w-[180px]">
                {t('payments.tableHeaderAmount', { defaultValue: 'Nominal & Periode' })}
              </TableHead>
              <TableHead className="py-3.5 px-4 min-w-[120px]">
                {t('payments.tableHeaderMethod', { defaultValue: 'Metode' })}
              </TableHead>
              <TableHead className="py-3.5 px-4 min-w-[100px]">
                {t('payments.tableHeaderStatus', { defaultValue: 'Status' })}
              </TableHead>
              <TableHead className="py-3.5 px-4 w-12 text-center">
                {t('payments.tableHeaderAction', { defaultValue: 'Aksi' })}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100 dark:divide-border/40">
            {currentItems.map((p, idx) => {
              const isSelected = selectedIds.includes(p.id);

              const tenantName =
                p.tenantName ||
                p.tenant?.profile?.fullName ||
                p.tenant?.fullName ||
                p.tenant?.email?.split('@')[0] ||
                'Penyewa';

              const tenantEmail = p.tenantEmail || p.tenant?.email || '-';
              const tenantPhone =
                p.tenantPhone || p.tenant?.profile?.phoneNumber || '';

              const invoiceNumber =
                p.invoice?.invoiceNumber ||
                (p.orderId ? `ORD-${p.orderId.substring(0, 8)}` : `INV-${p.id.substring(0, 8).toUpperCase()}`);

              const roomNumber = p.roomNumber || p.room?.roomNumber || '-';
              const roomType = p.roomType || p.room?.roomType || 'Standard';
              const propertyName =
                p.propertyName || p.room?.property?.name || 'Kost Harmoni Residence';
              const propertyCity =
                p.propertyCity || p.room?.property?.city || 'Indonesia';

              const amountNum = Number(p.amount) || 0;
              const isPaid = p.status === 'PAID';
              const isPending = p.status === 'PENDING';

              const avatarBgColors = [
                'bg-rose- text-rose- dark:bg-rose- dark:text-rose-',
                'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
                'bg-rose- text-rose- dark:bg-rose- dark:text-rose-',
                'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
              ];
              const avatarBg = avatarBgColors[idx % avatarBgColors.length];

              // Clean phone for WhatsApp
              const cleanPhone = tenantPhone.replace(/[^0-9]/g, '');
              const waPhone = cleanPhone.startsWith('0')
                ? '62' + cleanPhone.slice(1)
                : cleanPhone;

              const reminderMsg = encodeURIComponent(
                `Halo ${tenantName}, ini pengingat tagihan sewa kamar ${roomNumber} (${propertyName}) sebesar ${formatCurrency(
                  amountNum
                )} yang jatuh tempo pada ${formatDate(p.dueDate)}. Silakan selesaikan pembayaran. Terima kasih!`
              );

              return (
                <TableRow
                  key={p.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-muted/20 transition-colors ${
                    isSelected ? 'bg-rose-/40 dark:bg-rose-/20' : ''
                  }`}
                >
                  {/* Checkbox Column */}
                  <TableCell className="py-3.5 px-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectRow(p.id)}
                      aria-label={`Select invoice ${invoiceNumber}`}
                    />
                  </TableCell>

                  {/* Penyewa & Invoice Column */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${avatarBg} font-bold flex items-center justify-center text-xs shadow-2xs shrink-0`}
                      >
                        {tenantName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-foreground text-xs leading-snug line-clamp-1">
                          {tenantName}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-muted-foreground mt-0.5 line-clamp-1">
                          {tenantEmail}
                        </p>
                        {tenantPhone && tenantPhone !== '-' && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="text-[11px] text-slate-400 dark:text-muted-foreground">
                              {tenantPhone}
                            </span>
                          </div>
                        )}
                        <div className="mt-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300">
                            {invoiceNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Kamar & Kost Column */}
                  <TableCell className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <DoorClosed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-foreground text-xs">
                          {roomNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-muted-foreground">
                          • {roomType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{propertyName}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Nominal & Periode Column */}
                  <TableCell className="py-3.5 px-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-foreground text-xs">
                        {formatCurrency(amountNum)}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-muted-foreground mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          {p.period || (p.dueDate ? `Jatuh tempo: ${formatDate(p.dueDate)}` : formatDate(p.createdAt))}
                        </span>
                      </div>
                      {isPaid && p.paidAt && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Lunas pada: {formatDate(p.paidAt)}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Metode Bayar Column */}
                  <TableCell className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-muted/60 text-slate-700 dark:text-slate-200 text-[11px] font-medium">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[100px]">
                        {p.paymentMethod || 'Midtrans Snap'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status Column */}
                  <TableCell className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                        isPaid
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60'
                          : isPending
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60'
                      }`}
                    >
                      {isPaid
                        ? t('payments.statusPaid', { defaultValue: 'Lunas' })
                        : isPending
                        ? t('payments.statusPending', { defaultValue: 'Menunggu' })
                        : t('payments.statusFailed', { defaultValue: 'Gagal' })}
                    </span>
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
                      <DropdownMenuContent align="end" className="w-52 rounded-xl text-xs">
                        {isPending && p.snapRedirectUrl && (
                          <DropdownMenuItem asChild>
                            <a
                              href={p.snapRedirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 cursor-pointer font-medium text-rose- dark:text-rose-"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>{t('payments.actionPaySnap', { defaultValue: 'Buka Link Bayar (Snap)' })}</span>
                            </a>
                          </DropdownMenuItem>
                        )}

                        {isPending && onMarkPaid && (
                          <DropdownMenuItem
                            onClick={() => onMarkPaid(p.id, tenantName, amountNum)}
                            className="flex items-center gap-2 cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/40"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t('payments.actionMarkPaid', { defaultValue: 'Tandai Lunas Manual' })}</span>
                          </DropdownMenuItem>
                        )}

                        {tenantPhone && (
                          <DropdownMenuItem asChild>
                            <a
                              href={`https://wa.me/${waPhone}?text=${reminderMsg}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <MessageCircle className="w-4 h-4 text-emerald-500" />
                              <span>{t('payments.actionWhatsappReminder', { defaultValue: 'Kirim Pengingat WA' })}</span>
                            </a>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem asChild>
                          <Link href="/rooms" className="flex items-center gap-2 cursor-pointer">
                            <DoorClosed className="w-4 h-4 text-slate-500" />
                            <span>Detail Kamar ({roomNumber})</span>
                          </Link>
                        </DropdownMenuItem>
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
          {t('payments.showingPagination', {
            start: startIndex + 1,
            end: endIndex,
            total: totalItems,
            defaultValue: `Menampilkan ${startIndex + 1}–${endIndex} dari ${totalItems} tagihan`,
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
                  ? 'bg-rose- hover:bg-rose- text-white'
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

