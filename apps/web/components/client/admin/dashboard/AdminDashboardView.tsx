"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/custom-ui/layout/AppLayout";
import { AdminWelcomeBanner } from "./AdminWelcomeBanner";
import { AdminQuickNavCards } from "./AdminQuickNavCards";

export function AdminDashboardView() {
  const { user } = useAuth();
  const fullName = user?.profile?.fullName || "Super Admin";

  return (
    <AppLayout
      title="Panel Admin Platform"
      subtitle="Manajemen pengguna global, monitoring statistik platform, dan pengawasan operasional RentMate"
      breadcrumbs={[
        { label: "Beranda", href: "/" },
        { label: "Panel Admin" },
        { label: "Dashboard" },
      ]}
    >
      <div className="space-y-6">
        {/* Banner */}
        <AdminWelcomeBanner fullName={fullName} />

        {/* Admin Navigation Cards */}
        <AdminQuickNavCards />
      </div>
    </AppLayout>
  );
}
