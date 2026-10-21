import { Metadata } from "next";
import { TechnicianMaintenanceView } from "@/components/client/technician/maintenance";

export const metadata: Metadata = {
  title: "Maintenance & Perbaikan | Teknisi RentMate",
  description: "Daftar laporan pemeliharaan fasilitas kos.",
};

export default function TechnicianMaintenancePage() {
  return <TechnicianMaintenanceView />;
}
