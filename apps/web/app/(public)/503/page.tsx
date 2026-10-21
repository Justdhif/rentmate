import { Metadata } from "next";
import { ErrorView } from "@/components/client/public/errors";

export const metadata: Metadata = {
  title: "503 - Service Unavailable | RentMate",
};

export default function ServiceUnavailablePage() {
  return <ErrorView type="503" />;
}
