import { Metadata } from "next";
import { FavoritesView } from "@/components/client/public/favorites";

export const metadata: Metadata = {
  title: "Koleksi Favorit | RentMate",
  description: "Daftar properti gedung kost dan unit kamar yang Anda simpan.",
};

export default function FavoritesPage() {
  return <FavoritesView />;
}
