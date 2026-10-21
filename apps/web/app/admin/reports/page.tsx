import { Metadata } from "next";
import { AdminReportsView } from "@/components/client/admin/reports";

export const metadata: Metadata = {
  title: "Laporan & Kendala | Admin RentMate",
  description: "Monitoring laporan pemeliharaan dan pengaduan kos.",
};

export default function AdminReportsPage() {
  return <AdminReportsView />;
}
