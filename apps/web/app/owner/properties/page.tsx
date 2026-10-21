import { Metadata } from "next";
import { OwnerPropertiesView } from "@/components/client/owner/properties";

export const metadata: Metadata = {
  title: "Kelola Properti | RentMate",
  description: "Daftar properti gedung kos yang Anda miliki.",
};

export default function OwnerPropertiesPage() {
  return <OwnerPropertiesView />;
}
