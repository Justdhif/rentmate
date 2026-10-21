import { Metadata } from "next";
import { OwnerAiAssistantView } from "@/components/client/owner/ai-assistant";

export const metadata: Metadata = {
  title: "AI Assistant | RentMate",
  description: "Asisten cerdas berbasis AI untuk operasional dan rekomendasi strategi kos Anda.",
};

export default function OwnerAiAssistantPage() {
  return <OwnerAiAssistantView />;
}
