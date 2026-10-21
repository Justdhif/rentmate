import { Metadata } from "next";
import { TechnicianDashboardView } from "@/components/client/technician/dashboard";

export const metadata: Metadata = {
  title: "Dashboard Teknisi | RentMate",
  description: "Pantau tiket perbaikan dan pekerjaan maintenance yang ditugaskan ke Anda.",
};

export default function TechnicianDashboardPage() {
  return <TechnicianDashboardView />;
}
