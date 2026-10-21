import { Metadata } from "next";
import { AdminSettingsView } from "@/components/client/admin/settings";

export const metadata: Metadata = {
  title: "Pengaturan Platform | Admin RentMate",
  description: "Pengaturan akun admin dan preferensi sistem RentMate.",
};

export default function AdminSettingsPage() {
  return <AdminSettingsView />;
}
