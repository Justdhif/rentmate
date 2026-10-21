import { Metadata } from "next";
import { UserDashboardView } from "@/components/client/public/user/dashboard";

export const metadata: Metadata = {
  title: "Dashboard Pencari Kos | RentMate",
  description:
    "Jelajahi kos impian, kelola daftar wishlist favorit, dan pantau status sewa Anda di RentMate.",
};

export default function UserDashboardPage() {
  return <UserDashboardView />;
}
