import { Metadata } from "next";
import { OwnerRoomsView } from "@/components/client/owner/rooms";

export const metadata: Metadata = {
  title: "Kelola Kamar | RentMate",
  description: "Manajemen kamar kos, status ketersediaan, dan fasilitas.",
};

export default function OwnerRoomsPage() {
  return <OwnerRoomsView />;
}
