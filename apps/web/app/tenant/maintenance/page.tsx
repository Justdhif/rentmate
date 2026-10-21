import { Metadata } from "next";
import { TenantMaintenanceView } from "@/components/client/tenant/maintenance";

export const metadata: Metadata = {
  title: "Perbaikan Fasilitas | RentMate",
  description: "Lapor kerusakan dan pantau status perbaikan kamar kos.",
};

export default function TenantMaintenancePage() {
  return <TenantMaintenanceView />;
}
