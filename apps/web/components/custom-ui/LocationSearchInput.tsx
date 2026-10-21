"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  LocateFixed,
  Loader2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export interface LocationSuggestion {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  city?: string;
  province?: string;
}

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: LocationSuggestion) => void;
  onLocateMe?: () => void;
  isLocating?: boolean;
  placeholder?: string;
  className?: string;
  label?: string;
  showLocateButton?: boolean;
}

export function LocationSearchInput({
  value,
  onChange,
  onLocationSelect,
  onLocateMe,
  isLocating = false,
  placeholder = "Ketik alamat, kampus (UI, ITB), stasiun...",
  className = "",
  label = "Lokasi / Alamat / Landmark",
  showLocateButton = true,
}: LocationSearchInputProps) {
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search suggestions via Photon (OpenStreetMap) with fallback to Nominatim
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const photonRes = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            value.trim() + ", Indonesia"
          )}&limit=5`
        );
        if (photonRes.ok) {
          const photonData = await photonRes.json();
          if (photonData.features && photonData.features.length > 0) {
            const mapped: LocationSuggestion[] = photonData.features.map(
              (f: any) => {
                const p = f.properties;
                const coords = f.geometry.coordinates; // [lng, lat]
                const placeName = p.name || "";
                const street = p.street ? `${p.street} ` : "";
                const c = p.city || p.county || "";
                const s = p.state || "";
                const country = p.country || "Indonesia";
                const displayName = [placeName, street, c, s, country]
                  .filter(Boolean)
                  .join(", ");
                return {
                  lat: coords[1],
                  lng: coords[0],
                  displayName,
                  name: placeName || displayName,
                  city: c,
                  province: s,
                };
              }
            );
            setSearchResults(mapped);
            setShowDropdown(true);
            setIsSearching(false);
            return;
          }
        }
      } catch {
        // Fallback silently to Nominatim
      }

      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value.trim()
          )}&countrycodes=id&limit=5&addressdetails=1`
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          const mapped: LocationSuggestion[] = nomData.map((item: any) => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            displayName: item.display_name,
            name: item.name || item.display_name,
            city:
              item.address?.city ||
              item.address?.town ||
              item.address?.city_district ||
              "",
            province: item.address?.state || "",
          }));
          setSearchResults(mapped);
          setShowDropdown(true);
        }
      } catch (err) {
        console.warn("Search geocoding error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (item: LocationSuggestion) => {
    onChange(item.name || item.displayName);
    setShowDropdown(false);
    setSearchResults([]);
    onLocationSelect?.(item);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label & Optional Locate Me Button */}
      {(label || showLocateButton) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-300">
              {label}
            </label>
          )}
          {showLocateButton && onLocateMe && (
            <button
              type="button"
              onClick={onLocateMe}
              disabled={isLocating}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:underline cursor-pointer transition disabled:opacity-50"
            >
              {isLocating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <LocateFixed className="w-3 h-3" />
              )}
              <span>{isLocating ? "Mencari..." : "Lokasi Saya"}</span>
            </button>
          )}
        </div>
      )}

      {/* Input Field with Pin and Action Icons */}
      <div className="relative">
        <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400 absolute left-3.5 top-3.5 pointer-events-none" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) setShowDropdown(true);
          }}
          className="pl-10 pr-9 h-11 rounded-xl border-slate-200 dark:border-border bg-slate-50/70 dark:bg-muted/30 text-xs font-medium focus-visible:ring-rose-500"
        />

        {/* Right Status / Clear Icon */}
        {isSearching ? (
          <div className="absolute right-3 top-3.5 pointer-events-none">
            <Loader2 className="w-4 h-4 animate-spin text-rose-600 dark:text-rose-400" />
          </div>
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSearchResults([]);
              setShowDropdown(false);
            }}
            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            title="Hapus pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown List */}
      {showDropdown && searchResults.length > 0 && (
        <div className="absolute top-[100%] mt-2 left-0 right-0 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-border/60 animate-in fade-in duration-150">
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <Search className="w-3 h-3" />
              <span>Saran Lokasi ({searchResults.length})</span>
            </span>
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-[10px]"
            >
              Tutup
            </button>
          </div>
          {searchResults.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              className="w-full text-left p-2.5 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 text-xs flex items-start gap-2.5 transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-slate-900 dark:text-foreground truncate">
                  {item.name}
                </p>
                <p className="line-clamp-1 text-slate-500 dark:text-muted-foreground text-[11px] mt-0.5">
                  {item.displayName}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
