import { Metadata } from "next";
import { AdminUsersView } from "@/components/client/admin/users";

export const metadata: Metadata = {
  title: "Kelola Pengguna | Admin RentMate",
  description: "Kelola seluruh pengguna dan penyewa pada platform RentMate.",
};

export default function AdminUsersPage() {
  return <AdminUsersView />;
}
