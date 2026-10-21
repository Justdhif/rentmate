import { Metadata } from "next";
import { OwnerAnalyticsView } from "@/components/client/owner/analytics";

export const metadata: Metadata = {
  title: "Analitik Bisnis | RentMate",
  description: "Statistik okupansi, performa pendapatan sewa, dan tren operasional.",
};

export default function OwnerAnalyticsPage() {
  return <OwnerAnalyticsView />;
}
