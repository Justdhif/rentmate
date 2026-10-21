import { Metadata } from "next";
import { TenantFavoritesView } from "@/components/client/tenant/favorites";

export const metadata: Metadata = {
  title: "Koleksi Favorit | RentMate",
  description: "Daftar properti gedung kost dan unit kamar yang Anda simpan.",
};

export default function TenantFavoritesPage() {
  return <TenantFavoritesView />;
}
