import { Metadata } from "next";
import { TechnicianSettingsView } from "@/components/client/technician/settings";

export const metadata: Metadata = {
  title: "Pengaturan Akun | Teknisi RentMate",
  description: "Pengaturan profil, kontak, dan spesialisasi teknisi.",
};

export default function TechnicianSettingsPage() {
  return <TechnicianSettingsView />;
}
