import { Metadata } from "next";
import { OwnerMaintenanceView } from "@/components/client/owner/maintenance";

export const metadata: Metadata = {
  title: "Perbaikan Fasilitas | RentMate",
  description: "Kelola tiket perbaikan, delegasikan ke teknisi resmi kos.",
};

export default function OwnerMaintenancePage() {
  return <OwnerMaintenanceView />;
}
