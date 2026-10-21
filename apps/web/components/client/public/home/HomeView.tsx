"use client";

import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { HeroInteractiveMap } from "@/components/custom-ui/HeroInteractiveMap";
import { Footer } from "@/components/custom-ui/layout/Footer";
import { HomeNavbar } from "./HomeNavbar";
import { PropertiesDiscoverySection } from "./PropertiesDiscoverySection";
import { FeaturesSection } from "./FeaturesSection";
import { OwnerCtaSection } from "./OwnerCtaSection";

export function HomeView() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Semua Kota");
  const [selectedType, setSelectedType] = useState("ALL");
  const [priceRange, setPriceRange] = useState<[number, number]>([500000, 5000000]);

  // Fetch live properties pure from backend explore endpoint
  useEffect(() => {
    let isMounted = true;
    const fetchExplore = async () => {
      try {
        setLoading(true);
        const res = await api.get("/properties/public/explore");
        if (
          isMounted &&
          res?.success &&
          Array.isArray(res.data)
        ) {
          // Normalize photos & facilities directly from backend data
          const mapped = res.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            address: p.address,
            city: p.city || "Indonesia",
            lat: p.lat || p.latitude,
            lng: p.lng || p.longitude,
            type: p.type || "Campur",
            price:
              Number(p.price) ||
              (p.rooms?.[0]?.price ? Number(p.rooms[0].price) : 0),
            rating: p.rating || 0,
            reviewCount: p.reviewCount || 0,
            totalRooms: p.totalRooms || p.rooms?.length || 0,
            availableRooms:
              p.availableRooms ||
              p.rooms?.filter((r: any) => r.status === "AVAILABLE")?.length ||
              0,
            photos: Array.isArray(p.photos) ? p.photos : [],
            facilities: p.facilities
              ? p.facilities.map((f: any) =>
                  typeof f === "string" ? f : f.name,
                )
              : [],
          }));
          setProperties(mapped);
        } else if (isMounted) {
          setProperties([]);
        }
      } catch {
        if (isMounted) setProperties([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExplore();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically extract unique cities from backend properties
  const popularCities = useMemo(() => {
    const cities = new Set<string>();
    properties.forEach((p) => {
      if (p.city && typeof p.city === "string" && p.city.trim()) {
        cities.add(p.city.trim());
      }
    });
    return ["Semua Kota", ...Array.from(cities)];
  }, [properties]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = prop.name?.toLowerCase().includes(query);
        const matchAddress = prop.address?.toLowerCase().includes(query);
        const matchCity = prop.city?.toLowerCase().includes(query);
        if (!matchName && !matchAddress && !matchCity) return false;
      }

      // City filter
      if (selectedCity !== "Semua Kota" && prop.city !== selectedCity) {
        return false;
      }

      // Type filter
      if (selectedType !== "ALL" && prop.type !== selectedType) {
        return false;
      }

      // Dual-range budget filter
      if (prop.price > 0 && (prop.price < priceRange[0] || prop.price > priceRange[1])) {
        return false;
      }

      return true;
    });
  }, [properties, searchQuery, selectedCity, selectedType, priceRange]);

  const handleResetFilter = () => {
    setSearchQuery("");
    setSelectedCity("Semua Kota");
    setSelectedType("ALL");
    setPriceRange([500000, 5000000]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-foreground selection:bg-indigo-500 selection:text-white">
      {/* 1. Public Navbar */}
      <HomeNavbar />

      {/* 2. Interactive Map Hero Section */}
      <HeroInteractiveMap
        properties={properties}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        popularCities={popularCities}
      />

      {/* 3. Properties Discovery Grid */}
      <PropertiesDiscoverySection
        properties={filteredProperties}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        onResetFilter={handleResetFilter}
      />

      {/* 4. Value Proposition Section */}
      <FeaturesSection />

      {/* 5. Owner Call to Action */}
      <OwnerCtaSection />

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}
