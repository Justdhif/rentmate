import { Metadata } from "next";
import { OwnerPaymentsView } from "@/components/client/owner/payments";

export const metadata: Metadata = {
  title: "Tagihan & Pembayaran | RentMate",
  description: "Kelola tagihan, invoice sewa bulanan, dan verifikasi bukti transfer.",
};

export default function OwnerPaymentsPage() {
  return <OwnerPaymentsView />;
}
