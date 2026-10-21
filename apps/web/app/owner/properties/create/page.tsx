import { Metadata } from "next";
import { OwnerCreatePropertyView } from "@/components/client/owner/properties";

export const metadata: Metadata = {
  title: "Tambah Properti Baru | RentMate",
  description: "Daftarkan unit properti kost baru Anda ke dalam sistem RentMate.",
};

export default function CreatePropertyPage() {
  return <OwnerCreatePropertyView />;
}
