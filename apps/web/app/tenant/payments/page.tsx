import { Metadata } from "next";
import { TenantPaymentsView } from "@/components/client/tenant/payments";

export const metadata: Metadata = {
  title: "Tagihan & Pembayaran | RentMate",
  description: "Kelola tagihan sewa bulanan dan riwayat pembayaran.",
};

export default function TenantPaymentsPage() {
  return <TenantPaymentsView />;
}
