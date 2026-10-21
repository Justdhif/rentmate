import { Metadata } from "next";
import { AdminDashboardView } from "@/components/client/admin/dashboard";

export const metadata: Metadata = {
  title: "Panel Admin | RentMate",
  description: "Manajemen pengguna platform, monitoring statistik, dan operasional RentMate.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardView />;
}
