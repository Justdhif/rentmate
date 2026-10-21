import { Metadata } from "next";
import { OwnerTenantsView } from "@/components/client/owner/tenants";

export const metadata: Metadata = {
  title: "Kelola Penghuni | RentMate",
  description: "Daftar seluruh penghuni kamar kos dan status kontrak sewa.",
};

export default function OwnerTenantsPage() {
  return <OwnerTenantsView />;
}
