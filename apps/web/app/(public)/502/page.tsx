import { Metadata } from "next";
import { ErrorView } from "@/components/client/public/errors";

export const metadata: Metadata = {
  title: "502 - Bad Gateway | RentMate",
};

export default function BadGatewayPage() {
  return <ErrorView type="502" />;
}
