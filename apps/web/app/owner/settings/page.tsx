import { Metadata } from "next";
import { OwnerSettingsView } from "@/components/client/owner/settings";

export const metadata: Metadata = {
  title: "Pengaturan Akun | RentMate",
  description: "Pengaturan profil pemilik, rekening penampung sewa, dan keamanan.",
};

export default function OwnerSettingsPage() {
  return <OwnerSettingsView />;
}
