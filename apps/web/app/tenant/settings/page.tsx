import { Metadata } from "next";
import { TenantSettingsView } from "@/components/client/tenant/settings";

export const metadata: Metadata = {
  title: "Pengaturan Akun | RentMate",
  description: "Kelola profil dan preferensi akun Anda.",
};

export default function TenantSettingsPage() {
  return <TenantSettingsView />;
}
