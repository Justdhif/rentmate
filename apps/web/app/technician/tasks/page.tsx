import { Metadata } from "next";
import { TechnicianTasksView } from "@/components/client/technician/tasks";

export const metadata: Metadata = {
  title: "Tugas Saya | Teknisi RentMate",
  description: "Daftar penugasan perbaikan yang didelegasikan ke teknisi.",
};

export default function TechnicianTasksPage() {
  return <TechnicianTasksView />;
}
