import { Metadata } from "next";
import { HomeView } from "@/components/client/public/home";

export const metadata: Metadata = {
  title: "RentMate - Temukan Kost Nyaman, Sewa Tanpa Ribet",
  description:
    "Platform sewa & manajemen kos terintegrasi di Indonesia dengan peta interaktif dan AI Assistant.",
};

export default function HomePage() {
  return <HomeView />;
}
