'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Plus, Receipt } from 'lucide-react';
import { Payment, PaymentTable } from './PaymentTable';
import { PaymentStats } from './PaymentStats';
import { CreateInvoiceModal } from './CreateInvoiceModal';

export const PaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    roomAssignmentId: '',
    amount: 1500000,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Tagihan Sewa Kamar Bulanan',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [paymentsRes, tenantsRes] = await Promise.allSettled([
        api.get('/payments'),
        api.get('/tenants'),
      ]);

      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.success) {
        setPayments(paymentsRes.value.data || []);
      }
      if (tenantsRes.status === 'fulfilled' && tenantsRes.value.success) {
        const activeAss = (tenantsRes.value.data || []).filter((a: any) => a.isActive);
        setAssignments(activeAss);
        if (activeAss.length > 0 && !formData.roomAssignmentId) {
          setFormData((prev) => ({
            ...prev,
            roomAssignmentId: activeAss[0].id,
            amount: Number(activeAss[0].rentAmount) || 1500000,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const invoiceRes = await api.post('/payments/invoices', {
        roomAssignmentId: formData.roomAssignmentId,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        description: formData.description,
      });

      if (invoiceRes.success && invoiceRes.data?.id) {
        await api.post('/payments/charge-snap', {
          invoiceId: invoiceRes.data.id,
        });

        setIsModalOpen(false);
        setFormData({
          roomAssignmentId: assignments[0]?.id || '',
          amount: 1500000,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Tagihan Sewa Kamar Bulanan',
        });
        await fetchData();
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal membuat tagihan sewa');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const paidCount = payments.filter((p) => p.status === 'PAID').length;

  return (
    <AppLayout
      title="Penagihan & Pembayaran"
      subtitle="Kelola tagihan sewa kost, pantau pembayaran Midtrans, dan buat invoice tagihan."
    >
      {/* Metric Cards */}
      <PaymentStats
        totalPaid={totalPaid}
        totalPending={totalPending}
        paidCount={paidCount}
        formatCurrency={formatCurrency}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-foreground">Riwayat Pembayaran</h2>
          <p className="text-sm text-gray-500 dark:text-muted-foreground mt-0.5">
            Daftar transaksi pembayaran sewa melalui Midtrans Payment Gateway.
          </p>
        </div>

        <Button
          onClick={() => {
            if (assignments.length === 0) {
              alert('Belum ada penyewa aktif untuk dibuatkan tagihan.');
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl shadow-sm shadow-indigo-200 dark:shadow-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tagihan Baru</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center animate-fade-in">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <Card className="rounded-3xl p-16 text-center border border-gray-100 dark:border-border animate-fade-in shadow-sm bg-white dark:bg-card">
          <CardContent className="p-0">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-12 h-12 text-indigo-500/50" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-foreground text-xl mb-2">
              Belum Ada Tagihan / Pembayaran
            </h3>
            <p className="text-sm text-gray-500 dark:text-muted-foreground max-w-md mx-auto">
              Buat tagihan baru untuk penyewa aktif Anda agar mereka dapat melakukan pembayaran via
              QRIS, GoPay, atau Transfer Bank.
            </p>
          </CardContent>
        </Card>
      ) : (
        <PaymentTable payments={payments} formatCurrency={formatCurrency} />
      )}

      <CreateInvoiceModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        assignments={assignments}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateInvoice}
        submitting={submitting}
        submitError={submitError}
      />
    </AppLayout>
  );
};
