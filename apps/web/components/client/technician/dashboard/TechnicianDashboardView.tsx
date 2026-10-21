"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/custom-ui/layout/AppLayout";
import { TechnicianWelcomeBanner } from "./TechnicianWelcomeBanner";
import { TechnicianQuickLinks } from "./TechnicianQuickLinks";

export function TechnicianDashboardView() {
  const { user } = useAuth();
  const fullName =
    user?.profile?.fullName || user?.email?.split("@")[0] || "Teknisi";

  return (
    <AppLayout
      title="Dashboard Teknisi"
      subtitle="Pantau tiket perbaikan dan pekerjaan maintenance yang ditugaskan ke Anda"
      breadcrumbs={[
        { label: "Beranda", href: "/" },
        { label: "Portal Teknisi" },
        { label: "Dashboard" },
      ]}
    >
      <div className="space-y-6">
        {/* Banner */}
        <TechnicianWelcomeBanner fullName={fullName} />

        {/* Quick Links */}
        <TechnicianQuickLinks />
      </div>
    </AppLayout>
  );
}
