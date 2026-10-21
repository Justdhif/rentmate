"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { AppLayout } from "@/components/custom-ui/layout/AppLayout";
import { api } from "@/lib/api";
import { UserWelcomeBanner } from "./UserWelcomeBanner";
import { UserStatsCards } from "./UserStatsCards";
import { UserHowItWorksCard } from "./UserHowItWorksCard";
import { UserExploreCtaCard } from "./UserExploreCtaCard";

export function UserDashboardView() {
  const { user } = useAuth();
  const { favoritePropertyIds } = useFavorites();
  const [favoriteProperties, setFavoriteProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const res = await api.get("/favorites");
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setFavoriteProperties(res.data);
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFavorites();
    return () => {
      isMounted = false;
    };
  }, []);

  const fullName =
    user?.profile?.fullName || user?.email?.split("@")[0] || "Teman RentMate";

  return (
    <AppLayout
      title="Dashboard Pencari Kos"
      subtitle="Jelajahi kos impian, kelola daftar wishlist favorit, dan pantau status sewa Anda"
      breadcrumbs={[
        { label: "Beranda", href: "/" },
        { label: "Dashboard Pencari Kos" },
      ]}
    >
      <div className="space-y-6">
        {/* 1. Welcome Banner */}
        <UserWelcomeBanner fullName={fullName} />

        {/* 2. Stats Overview Cards */}
        <UserStatsCards
          favoriteCount={favoritePropertyIds.size}
          userEmail={user?.email}
        />

        {/* 3. How It Works & CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserHowItWorksCard />
          <UserExploreCtaCard />
        </div>
      </div>
    </AppLayout>
  );
}
