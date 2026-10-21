"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Footer } from "@/components/custom-ui/layout/Footer";
import { SearchHeader } from "./SearchHeader";
import { SearchResultsGrid } from "./SearchResultsGrid";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCity = searchParams.get("city") || "ALL";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedType, setSelectedType] = useState("ALL");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProps = async () => {
      try {
        setLoading(true);
        const res = await api.get("/properties/public/explore");
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setProperties(res.data);
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProps();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.name?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedCity !== "ALL" && p.city !== selectedCity) return false;
      if (selectedType !== "ALL" && p.type !== selectedType) return false;
      return true;
    });
  }, [properties, searchQuery, selectedCity, selectedType]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-foreground">
      <SearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <SearchResultsGrid
        properties={filtered}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />
      <Footer />
    </div>
  );
}

export function SearchView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Memuat pencarian...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
