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

import { cookies } from "next/headers";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import NextTopLoader from "nextjs-toploader";
import { GlobalSplashManager } from "@/components/ui/GlobalSplashManager";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "RentMate - Smart Kost Management Platform",
  description: "Platform Manajemen Kost Terintegrasi dengan AI Smart Assistant",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("rentmate_theme")?.value;
  const isDark = themeCookie === "dark";
  const initialTheme = (themeCookie as "light" | "dark" | "system") || "system";

  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${
        isDark ? "dark" : ""
      }`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
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
        <ThemeProvider initialTheme={initialTheme}>
          <AuthProvider>
            <GlobalSplashManager>{children}</GlobalSplashManager>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
