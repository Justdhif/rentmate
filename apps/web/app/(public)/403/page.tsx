import { Metadata } from "next";
import { ErrorView } from "@/components/client/public/errors";

export const metadata: Metadata = {
  title: "403 - Akses Ditolak | RentMate",
};

export default function ForbiddenPage() {
  return <ErrorView type="403" />;
}
