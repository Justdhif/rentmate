import { Metadata } from "next";
import { LoginView } from "@/components/client/public/auth/login";

export const metadata: Metadata = {
  title: "Masuk | RentMate",
  description: "Masuk ke akun RentMate Anda.",
};

export default function LoginPage() {
  return <LoginView />;
}
