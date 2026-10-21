import { Metadata } from "next";
import { RegisterView } from "@/components/client/public/auth/register";

export const metadata: Metadata = {
  title: "Daftar Akun | RentMate",
  description: "Daftar akun RentMate sebagai penyewa atau pemilik kos.",
};

export default function RegisterPage() {
  return <RegisterView />;
}
