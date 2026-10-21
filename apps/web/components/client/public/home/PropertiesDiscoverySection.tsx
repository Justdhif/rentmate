"use client";

import React from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/custom-ui/PropertyCard";

interface PropertiesDiscoverySectionProps {
  properties: any[];
  selectedType: string;
  setSelectedType: (type: string) => void;
  onResetFilter: () => void;
}

export function PropertiesDiscoverySection({
  properties,
  selectedType,
  setSelectedType,
  onResetFilter,
}: PropertiesDiscoverySectionProps) {
  const propertyTypes = ["ALL", "Campur", "Putri", "Putra"];

  return (
    <section
      id="properties"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-9 pb-16 scroll-mt-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Home className="w-4 h-4" />
            <span>Daftar Properti</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-foreground tracking-tight">
            Pilihan Kos Rekomendasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground mt-1">
            Menampilkan {properties.length} kos siap huni dengan fasilitas terverifikasi
          </p>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {propertyTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                selectedType === type
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-card border border-slate-200/80 dark:border-border text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-accent"
              }`}
            >
              {type === "ALL" ? "Semua Tipe" : `Kos ${type}`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-card rounded-3xl border border-slate-200/80 dark:border-border p-8">
          <Home className="w-12 h-12 mx-auto text-slate-300 dark:text-muted-foreground mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-foreground">
            Tidak ada kos yang cocok
          </h3>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian, filter kota, atau rentang budget Anda.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilter}
            className="mt-4 rounded-xl text-xs font-semibold"
          >
            Reset Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {properties.map((prop, idx) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              index={idx}
              hideActions={true}
            />
          ))}
        </div>
      )}
    </section>
  );
}
