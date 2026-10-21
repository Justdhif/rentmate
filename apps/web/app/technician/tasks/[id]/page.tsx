import { Metadata } from "next";
import { TechnicianTaskDetailView } from "@/components/client/technician/tasks";

export const metadata: Metadata = {
  title: "Detail Pekerjaan Maintenance | RentMate",
  description: "Rincian tugas perbaikan dan unggah bukti penanganan teknisi.",
};

export default function TechnicianTaskDetailPage() {
  return <TechnicianTaskDetailView />;
}
