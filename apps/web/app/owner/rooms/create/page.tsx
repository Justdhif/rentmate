import { Metadata } from "next";
import { OwnerCreateRoomView } from "@/components/client/owner/rooms";

export const metadata: Metadata = {
  title: "Tambah Kamar Baru | RentMate",
  description: "Tambahkan kamar kos baru ke properti Anda.",
};

export default function CreateRoomPage() {
  return <OwnerCreateRoomView />;
}
