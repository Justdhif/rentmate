"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/custom-ui/layout/AppLayout";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { TenantWelcomeHeader } from "./TenantWelcomeHeader";
import { TenantActiveRoomCard } from "./TenantActiveRoomCard";
import { TenantOwnerContactCard } from "./TenantOwnerContactCard";
import { TenantEmptyRoomCard } from "./TenantEmptyRoomCard";

export function TenantDashboardView() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMyRoom = async () => {
      try {
        setLoading(true);
        const res = await api.get("/tenants/my-room");
        if (isMounted && res?.data) {
          setData(res.data);
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMyRoom();
    return () => {
      isMounted = false;
    };
  }, []);

  const fullName =
    user?.profile?.fullName || user?.email?.split("@")[0] || "Penghuni Kos";
  const hasActiveRoom = data?.hasActiveRoom && data?.room;

  return (
    <AppLayout
      title="Kamar Saya"
      subtitle="Pantau masa sewa, tagihan bulanan, serta ajukan perbaikan fasilitas kamar Anda"
      breadcrumbs={[
        { label: "Beranda", href: "/" },
        { label: "Portal Penghuni" },
        { label: "Kamar Saya" },
      ]}
    >
      <div className="space-y-6">
        {/* Welcome Header */}
        <TenantWelcomeHeader fullName={fullName} />

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-3xl lg:col-span-2" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        ) : hasActiveRoom ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Room Card */}
            <TenantActiveRoomCard data={data} />

            {/* Owner Contact & Quick Actions Card */}
            <TenantOwnerContactCard owner={data.property?.owner} />
          </div>
        ) : (
          <TenantEmptyRoomCard />
        )}
      </div>
    </AppLayout>
  );
}
