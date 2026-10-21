import { Metadata } from "next";
import { AdminVerificationsView } from "@/components/client/admin/verifications";

export const metadata: Metadata = {
  title: "Verifikasi Properti | Admin RentMate",
  description: "Verifikasi dan persetujuan properti kos baru.",
};

export default function AdminVerificationsPage() {
  return <AdminVerificationsView />;
}
