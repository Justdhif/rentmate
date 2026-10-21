"use client";

import React from "react";
import { Home } from "lucide-react";
import { PropertyCard } from "@/components/custom-ui/PropertyCard";

interface SearchResultsGridProps {
  properties: any[];
  selectedType: string;
  setSelectedType: (type: string) => void;
}

export function SearchResultsGrid({
  properties,
  selectedType,
  setSelectedType,
}: SearchResultsGridProps) {
  const types = ["ALL", "Campur", "Putri", "Putra"];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-foreground tracking-tight">
            Hasil Pencarian Kos
          </h1>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
            Menemukan {properties.length} properti yang sesuai
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                selectedType === t
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-accent"
              }`}
            >
              {t === "ALL" ? "Semua Tipe" : `Kos ${t}`}
            </button>
          ))}
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-card rounded-3xl border border-slate-200 dark:border-border p-8">
          <Home className="w-12 h-12 mx-auto text-slate-300 dark:text-muted-foreground mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-foreground">
            Tidak ada hasil ditemukan
          </p>
          <p className="text-xs text-slate-400 dark:text-muted-foreground mt-1">
            Coba sesuaikan kata kunci pencarian Anda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </main>
  );
}
