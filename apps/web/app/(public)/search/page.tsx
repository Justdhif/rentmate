import { Metadata } from "next";
import { SearchView } from "@/components/client/public/search";

export const metadata: Metadata = {
  title: "Pencarian Kos | RentMate",
  description: "Cari kos nyaman dan terjangkau di berbagai kota di Indonesia.",
};

export default function SearchPage() {
  return <SearchView />;
}
