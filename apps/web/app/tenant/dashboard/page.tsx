import { Metadata } from "next";
import { TenantDashboardView } from "@/components/client/tenant/dashboard";

export const metadata: Metadata = {
  title: "Kamar Saya | RentMate",
  description: "Pantau masa sewa, tagihan bulanan, serta ajukan perbaikan fasilitas kamar Anda.",
};

export default function TenantDashboardPage() {
  return <TenantDashboardView />;
}
