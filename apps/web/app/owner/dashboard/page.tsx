import { Metadata } from "next";
import { OwnerDashboardView } from "@/components/client/owner/dashboard";

export const metadata: Metadata = {
  title: "Dashboard Pemilik | RentMate",
  description: "Pantau performa properti kos, pemasukan sewa, dan status hunian kamar.",
};

export default function OwnerDashboardPage() {
  return <OwnerDashboardView />;
}
