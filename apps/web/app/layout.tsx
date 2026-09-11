import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { AuthProvider } from "@/contexts/AuthContext";
import NextTopLoader from "nextjs-toploader";
import { GlobalSplashManager } from "@/components/ui/GlobalSplashManager";

export const metadata: Metadata = {
  title: "RentMate - Smart Kost Management Platform",
  description: "Platform Manajemen Kost Terintegrasi dengan AI Smart Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <NextTopLoader
          color="#4f46e5"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 12px #4f46e5, 0 0 6px #6366f1"
        />
        <AuthProvider>
          <GlobalSplashManager>{children}</GlobalSplashManager>
        </AuthProvider>
      </body>
    </html>
  );
}
