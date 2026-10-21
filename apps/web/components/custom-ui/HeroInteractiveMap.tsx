"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Navigation,
  Star,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LocationSearchInput,
  LocationSuggestion,
} from "./LocationSearchInput";
import {
  BudgetRangeSlider,
  formatShortPrice,
} from "./BudgetRangeSlider";
import "leaflet/dist/leaflet.css";

// City coordinates and default zoom levels
export const CITY_COORDINATES: Record<
  string,
  { lat: number; lng: number; zoom: number; label: string }
> = {
  "Semua Kota": { lat: -7.2, lng: 109.8, zoom: 6, label: "Seluruh Indonesia" },
  "Jakarta Selatan": { lat: -6.2615, lng: 106.8106, zoom: 13, label: "Jaksel" },
  Depok: { lat: -6.3685, lng: 106.8322, zoom: 13, label: "Depok" },
  Bandung: { lat: -6.885, lng: 107.6135, zoom: 13, label: "Bandung" },
  Yogyakarta: { lat: -7.7915, lng: 110.3638, zoom: 13, label: "Jogja" },
  Surabaya: { lat: -7.2754, lng: 112.7565, zoom: 13, label: "Surabaya" },
  Denpasar: { lat: -8.6705, lng: 115.234, zoom: 13, label: "Bali" },
};

// Fallback offsets to scatter items nicely if exact lat/lng is missing
function getPropertyCoordinates(prop: any, index: number) {
  if (prop.lat && prop.lng) {
    return { lat: Number(prop.lat), lng: Number(prop.lng) };
  }
  if (prop.latitude && prop.longitude) {
    return { lat: Number(prop.latitude), lng: Number(prop.longitude) };
  }

  // Fallback to city center + jitter
  const cityKey = prop.city || "Jakarta Selatan";
  const cityData =
    CITY_COORDINATES[cityKey] || CITY_COORDINATES["Jakarta Selatan"];

  // Deterministic micro offset based on index
  const angle = (index * 67.5 * Math.PI) / 180;
  const radius = 0.012 + (index % 4) * 0.008;
  return {
    lat: cityData.lat + radius * Math.sin(angle),
    lng: cityData.lng + radius * Math.cos(angle),
  };
}

interface HeroInteractiveMapProps {
  properties: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCity: string;
  setSelectedCity: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  priceRange: [number, number];
  setPriceRange: (val: [number, number]) => void;
  popularCities: string[];
}

export function HeroInteractiveMap({
  properties,
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  selectedType,
  setSelectedType,
  priceRange,
  setPriceRange,
  popularCities,
}: HeroInteractiveMapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [activeProperty, setActiveProperty] = useState<any | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Ref for horizontal mouse-wheel scrolling in cities bar
  const cityScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cityScrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Handle selection of a location suggestion from autocomplete
  const handleLocationSelect = (item: LocationSuggestion) => {
    if (item.city) {
      const matchedCity = popularCities.find((c) =>
        item.city?.toLowerCase().includes(c.toLowerCase())
      );
      if (matchedCity) {
        setSelectedCity(matchedCity);
      }
    }

    if (mapInstanceRef.current && item.lat && item.lng) {
      mapInstanceRef.current.flyTo([item.lat, item.lng], 14, {
        duration: 1.4,
      });
    }
  };

  // Handle Geolocation (Find near me)
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current.flyTo([latitude, longitude], 14, {
          duration: 1.5,
        });
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 7000 }
    );
  };

  // Compute properties with coordinates
  const propertiesWithCoords = useMemo(() => {
    return properties.map((prop, idx) => {
      const coords = getPropertyCoordinates(prop, idx);
      return {
        ...prop,
        _lat: coords.lat,
        _lng: coords.lng,
      };
    });
  }, [properties]);

  // Filter for map markers based on current city, type, and dual price range
  const visibleMapProperties = useMemo(() => {
    return propertiesWithCoords.filter((prop) => {
      if (selectedCity !== "Semua Kota" && prop.city !== selectedCity) {
        return false;
      }
      if (selectedType !== "ALL" && prop.type !== selectedType) {
        return false;
      }

      // Dual-range price filter
      if (prop.price < priceRange[0] || prop.price > priceRange[1]) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = prop.name?.toLowerCase().includes(q);
        const matchAddress = prop.address?.toLowerCase().includes(q);
        const matchCity = prop.city?.toLowerCase().includes(q);
        if (!matchName && !matchAddress && !matchCity) return false;
      }

      return true;
    });
  }, [
    propertiesWithCoords,
    selectedCity,
    selectedType,
    priceRange,
    searchQuery,
  ]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default;

      if (!isMounted) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialCity =
        CITY_COORDINATES[selectedCity] || CITY_COORDINATES["Jakarta Selatan"];

      const map = L.map(mapContainerRef.current, {
        center: [initialCity.lat, initialCity.lng],
        zoom: initialCity.zoom,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      // Add zoom control at bottom-right
      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(map);

      // Tile URLs: CARTO Voyager (Light) & CARTO Dark Matter (Dark) with valid API key
      const cartoKey =
        process.env.NEXT_PUBLIC_CARTO_API_KEY ||
        "cb1_4oii_1_eb3bcab6cade12a9dfb1c686";
      const tileUrl = isDark
        ? `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${cartoKey}`
        : `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${cartoKey}`;

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Group layer for property markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
      setMapReady(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. React to Theme Change (Smooth tile swap)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    const cartoKey =
      process.env.NEXT_PUBLIC_CARTO_API_KEY ||
      "cb1_4oii_1_eb3bcab6cade12a9dfb1c686";
    const tileUrl = isDark
      ? `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${cartoKey}`
      : `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${cartoKey}`;

    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(tileUrl);
    }
  }, [isDark, mapReady]);

  // 3. React to City Change (Smooth Fly-To)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    const targetCity =
      CITY_COORDINATES[selectedCity] || CITY_COORDINATES["Semua Kota"];

    mapInstanceRef.current.flyTo([targetCity.lat, targetCity.lng], targetCity.zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedCity, mapReady]);

  // 4. Render Airbnb-Style Price Markers with Pointer Tail & Modern Tooltip
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !mapReady) return;

    const renderMarkers = async () => {
      const L = (await import("leaflet")).default;
      const markersLayer = markersLayerRef.current;
      markersLayer.clearLayers();

      visibleMapProperties.forEach((prop) => {
        const shortPrice = formatShortPrice(prop.price);

        // Dot color by property type
        const typeBadgeColor =
          prop.type === "Putri"
            ? "#ec4899"
            : prop.type === "Putra"
            ? "#3b82f6"
            : "#6366f1";

        // HTML custom price chip marker with downward pointer tail (Airbnb style)
        const markerHtml = `
          <div class="rentmate-pin-anchor ${
            activeProperty?.id === prop.id ? "is-active" : ""
          }">
            <div class="rentmate-pin-pill">
              <span class="rentmate-pin-dot" style="background-color: ${typeBadgeColor};"></span>
              <span class="rentmate-pin-price">${shortPrice}</span>
            </div>
            <div class="rentmate-pin-tail"></div>
          </div>
        `;

        const priceIcon = L.divIcon({
          className: "rentmate-map-icon-wrapper",
          html: markerHtml,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([prop._lat, prop._lng], {
          icon: priceIcon,
        });

        // Modern sleek tooltip (replaces browser default ugly yellow title)
        marker.bindTooltip(
          `
          <div class="rentmate-tooltip-content">
            <div class="rentmate-tooltip-title">${prop.name}</div>
            <div class="rentmate-tooltip-sub">${prop.type} • ${prop.city}</div>
          </div>
          `,
          {
            direction: "top",
            offset: [0, -28],
            className: "rentmate-modern-tooltip",
            opacity: 1,
          }
        );

        // Click marker: set active preview card & center gently
        marker.on("click", () => {
          setActiveProperty(prop);
          mapInstanceRef.current?.panTo([prop._lat, prop._lng], {
            animate: true,
            duration: 0.5,
          });
        });

        marker.addTo(markersLayer);
      });
    };

    renderMarkers();
  }, [visibleMapProperties, mapReady, activeProperty]);

  // Reset to default overview
  const handleResetView = () => {
    setSelectedCity("Semua Kota");
    setSearchQuery("");
    setPriceRange([500000, 5000000]);
    setSelectedType("ALL");
    setActiveProperty(null);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-20 border-b border-slate-200/80 dark:border-border/70 bg-slate-50/60 dark:bg-background/95">
      {/* Subtle organic ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-rose-/5 dark:bg-rose-/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* TOP ROW: Trust Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-card border border-slate-200/90 dark:border-border shadow-xs text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live Map Explorer</span>
            <span className="text-slate-300 dark:text-muted-foreground">•</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              1,200+ Kamar Kos Aktif
            </span>
          </div>

          {/* Social Proof Stats */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verifikasi Langsung Pemilik</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-bold text-slate-800 dark:text-foreground">
                4.9/5
              </span>
              <span>dari 3,800+ Mahasiswa & Pekerja</span>
            </div>
          </div>
        </div>

        {/* MAIN SPLIT GRID: 5-Cols Search (Left) & 7-Cols Interactive Map (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:items-stretch">
          {/* LEFT COLUMN: Search & Filter Hub (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Cari & Temukan Kos Nyaman Langsung dari{" "}
                <span className="text-rose-600 dark:text-rose-400">
                  Peta Interaktif.
                </span>
              </h1>
              {/* Shortened concise 1-line description for perfect vertical alignment */}
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Jelajahi kos putra, putri, dan campur dengan harga transparan tanpa biaya calo.
              </p>
            </div>

            {/* UNIFIED SEARCH & FILTER CARD (All controls inside one cohesive card) */}
            <div className="bg-white dark:bg-card border border-slate-200/90 dark:border-border rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-200/50 dark:shadow-none space-y-3.5 relative">
              {/* 1. MODULAR LOCATION AUTOCOMPLETE INPUT */}
              <LocationSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onLocationSelect={handleLocationSelect}
                onLocateMe={handleLocateMe}
                isLocating={isLocating}
                placeholder="Ketik alamat, kampus (UI, ITB), stasiun..."
              />

              {/* 2. PILIH KOTA & KAWASAN: SINGLE ROW WITH MOUSE WHEEL SCROLL & NO SCROLLBAR */}
              <div className="pt-2 border-t border-slate-100 dark:border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-300">
                    Pilih Kota / Kawasan
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (Geser / scroll mouse horizontal)
                  </span>
                </div>

                {/* Single-row horizontal scroll container (no scrollbar, wheel scrollable) */}
                <div
                  ref={cityScrollRef}
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {popularCities.map((city) => {
                    const isActive = selectedCity === city;
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSelectedCity(city);
                          setActiveProperty(null);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer border shrink-0 whitespace-nowrap ${
                          isActive
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-slate-50 dark:bg-muted/40 text-slate-600 dark:text-slate-300 border-slate-200/90 dark:border-border hover:bg-slate-100 dark:hover:bg-muted"
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. MODULAR DUAL-THUMB BUDGET RANGE SLIDER (Volume Bar 2 Arah) */}
              <div className="pt-2 border-t border-slate-100 dark:border-border/60">
                <BudgetRangeSlider
                  value={priceRange}
                  onChange={setPriceRange}
                  min={500000}
                  max={5000000}
                  step={100000}
                />
              </div>

              {/* 4. TIPE KOS SELECTOR */}
              <div className="pt-2 border-t border-slate-100 dark:border-border/60">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Tipe Kos
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "ALL", label: "Semua" },
                    { id: "Campur", label: "Campur" },
                    { id: "Putri", label: "Putri" },
                    { id: "Putra", label: "Putra" },
                  ].map((item) => {
                    const isSelected = selectedType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedType(item.id)}
                        className={`text-xs py-1.5 rounded-lg font-semibold transition cursor-pointer border text-center ${
                          isSelected
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-slate-50 dark:bg-muted/40 text-slate-600 dark:text-slate-300 border-slate-200/90 dark:border-border hover:bg-slate-100 dark:hover:bg-muted"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. ACTION BUTTON: JUMP TO PROPERTIES LIST */}
              <div className="pt-1">
                <a
                  href="#properties"
                  className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>
                    Lihat {visibleMapProperties.length} Kos yang Cocok
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Leaflet Map Canvas (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-border shadow-2xl shadow-rose-950/10 dark:shadow-black/60 bg-slate-100 dark:bg-card h-[500px] sm:h-[560px] lg:h-full min-h-[520px]">
              {/* Map Canvas Container */}
              <div
                ref={mapContainerRef}
                className="w-full h-full z-0 outline-none"
              />

              {/* Top Floating Badge Bar */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-[1000]">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-800 shadow-md flex items-center gap-2 pointer-events-auto">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {selectedCity === "Semua Kota"
                      ? "Area: Seluruh Indonesia"
                      : `Area: ${selectedCity}`}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold">
                    {visibleMapProperties.length} Kos
                  </span>
                </div>

                {/* Reset View Button */}
                {(selectedCity !== "Semua Kota" || searchQuery) && (
                  <button
                    onClick={handleResetView}
                    className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-800 shadow-md text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition pointer-events-auto cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Area</span>
                  </button>
                )}
              </div>

              {/* Bottom Left Floating Legend & Locator */}
              <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2 pointer-events-none">
                {/* Geolocation Button */}
                <button
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 pointer-events-auto cursor-pointer transition disabled:opacity-50"
                  title="Cari Kos di Dekat Lokasi Saya"
                >
                  <Navigation
                    className={`w-3.5 h-3.5 text-rose-600 dark:text-rose-400 ${
                      isLocating ? "animate-spin" : ""
                    }`}
                  />
                  <span>
                    {isLocating ? "Mencari Lokasi..." : "Di Dekat Saya"}
                  </span>
                </button>

                {/* Legend Pill */}
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-3 pointer-events-auto shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Campur</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>Putri</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-" />
                    <span>Putra</span>
                  </div>
                </div>
              </div>

              {/* ACTIVE PROPERTY PREVIEW CARD OVERLAY (when clicked on pin) */}
              {activeProperty && (
                <div className="absolute bottom-4 right-4 max-w-xs sm:max-w-sm w-full z-[1000] animate-in fade-in slide-in-from-bottom-3 duration-200">
                  <div className="bg-white dark:bg-card rounded-2xl p-3 border border-slate-200 dark:border-border shadow-2xl flex gap-3 relative">
                    <button
                      onClick={() => setActiveProperty(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center text-xs font-bold shadow-md cursor-pointer hover:scale-110 transition-transform"
                      title="Tutup Preview"
                    >
                      ✕
                    </button>

                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                      <img
                        src={
                          activeProperty.photos?.[0] ||
                          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80"
                        }
                        alt={activeProperty.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white uppercase">
                        {activeProperty.type}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>{activeProperty.rating || "4.8"}</span>
                          <span className="text-slate-400 font-normal">
                            ({activeProperty.reviewCount || 10})
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-foreground line-clamp-1 mt-0.5">
                          {activeProperty.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-muted-foreground truncate">
                          {activeProperty.address}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-border/60">
                        <div>
                          <p className="text-xs font-black text-rose-600 dark:text-rose-400">
                            {formatShortPrice(activeProperty.price)}
                            <span className="text-[10px] text-slate-400 font-normal">
                              /bln
                            </span>
                          </p>
                        </div>
                        <Link
                          href={`/properties/${activeProperty.id}`}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer transition shadow-xs"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for Leaflet price chips & clean transitions */}
      <style jsx global>{`
        /* Hide scrollbars cleanly */
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        .rentmate-map-icon-wrapper {
          background: transparent !important;
          border: none !important;
        }

        /* 1. Pin Container & Anchor (Point exact GPS coordinate) */
        .rentmate-pin-anchor {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -100%);
          cursor: pointer;
          user-select: none;
          transition: transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35));
        }

        .rentmate-pin-anchor:hover,
        .rentmate-pin-anchor.is-active {
          transform: translate(-50%, -108%) scale(1.15);
          z-index: 99999 !important;
          filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.5));
        }

        /* 2. Pin Pill Capsule */
        .rentmate-pin-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 11px;
          border-radius: 9999px;
          background: #0f172a;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.22);
          transition: all 0.18s ease;
        }

        .rentmate-pin-price {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: -0.01em;
          line-height: 1;
          white-space: nowrap;
        }

        .rentmate-pin-dot {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          flex-shrink: 0;
          box-shadow: 0 0 6px currentColor;
        }

        /* 3. Bottom Pointer Tail (Arrow) */
        .rentmate-pin-tail {
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #0f172a;
          margin-top: -1px;
          transition: border-top-color 0.18s ease;
        }

        /* Light Mode Pill Styling */
        html:not(.dark) .rentmate-pin-pill {
          background: #ffffff;
          color: #0f172a;
          border: 1.5px solid rgba(15, 23, 42, 0.12);
        }
        html:not(.dark) .rentmate-pin-tail {
          border-top-color: #ffffff;
        }

        /* Hover & Selected Active States */
        .rentmate-pin-anchor:hover .rentmate-pin-pill,
        .rentmate-pin-anchor.is-active .rentmate-pin-pill {
          background: #4f46e5 !important;
          color: #ffffff !important;
          border-color: #818cf8 !important;
        }
        .rentmate-pin-anchor:hover .rentmate-pin-tail,
        .rentmate-pin-anchor.is-active .rentmate-pin-tail {
          border-top-color: #4f46e5 !important;
        }
        .rentmate-pin-anchor:hover .rentmate-pin-dot,
        .rentmate-pin-anchor.is-active .rentmate-pin-dot {
          background-color: #ffffff !important;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.9) !important;
        }

        /* 4. Modern Glass Tooltip (replaces yellow browser tooltip) */
        .rentmate-modern-tooltip {
          background: rgba(15, 23, 42, 0.96) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          border-radius: 10px !important;
          padding: 6px 10px !important;
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(8px) !important;
        }
        .rentmate-modern-tooltip::before {
          border-top-color: rgba(15, 23, 42, 0.96) !important;
        }
        .rentmate-tooltip-content {
          text-align: center;
        }
        .rentmate-tooltip-title {
          font-weight: 700;
          font-size: 11px;
          color: #ffffff;
          white-space: nowrap;
        }
        .rentmate-tooltip-sub {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 1px;
        }
        html:not(.dark) .rentmate-modern-tooltip {
          background: rgba(255, 255, 255, 0.96) !important;
          border: 1px solid rgba(15, 23, 42, 0.12) !important;
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.18) !important;
        }
        html:not(.dark) .rentmate-modern-tooltip::before {
          border-top-color: rgba(255, 255, 255, 0.96) !important;
        }
        html:not(.dark) .rentmate-tooltip-title {
          color: #0f172a;
        }
        html:not(.dark) .rentmate-tooltip-sub {
          color: #64748b;
        }

        /* Leaflet zoom controls styling */
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          border-radius: 12px !important;
          overflow: hidden;
          margin-bottom: 16px !important;
          margin-right: 16px !important;
        }
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-bottom: 1px solid #e2e8f0 !important;
          font-weight: bold !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
        }
        .dark .leaflet-control-zoom-in,
        .dark .leaflet-control-zoom-out {
          background-color: #0f172a !important;
          color: #f8fafc !important;
          border-bottom: 1px solid #334155 !important;
        }
        .leaflet-control-zoom-in:hover,
        .leaflet-control-zoom-out:hover {
          background-color: #f1f5f9 !important;
        }
        .dark .leaflet-control-zoom-in:hover,
        .dark .leaflet-control-zoom-out:hover {
          background-color: #1e293b !important;
        }
      `}</style>
    </section>
  );
}
