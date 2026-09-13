'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Crosshair, LocateFixed, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { reverseGeocodeCoords } from '@/lib/location';
import { cn } from '@/lib/utils';

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

interface PropertyMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  targetCoords?: { lat: number; lng: number } | null;
  onLocationSelect: (location: LocationData) => void;
  externalSearchTrigger?: string;
  showSearchBar?: boolean;
  className?: string;
}

export const PropertyMapPicker: React.FC<PropertyMapPickerProps> = ({
  initialLat = -6.2088,
  initialLng = 106.8456,
  targetCoords,
  onLocationSelect,
  externalSearchTrigger,
  showSearchBar = false,
  className,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      if (!isMounted) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [currentCoords.lat, currentCoords.lng],
        zoom: 15,
        zoomControl: true,
      });

      // OSM Standard Tile Layer (CORS enabled)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        crossOrigin: true,
      }).addTo(map);

      // Modern SVG Pin
      const customPinIcon = L.divIcon({
        className: 'custom-property-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="width: 38px; height: 38px; background-color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.5); border: 2.5px solid white;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div style="width: 10px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(1px); margin-top: 2px;"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([currentCoords.lat, currentCoords.lng], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      // Handle marker drag
      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        handlePositionChange(position.lat, position.lng);
      });

      // Handle map click
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handlePositionChange(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Ensure proper size calculation even when rendered inside flex cards
      const invalidate = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      };

      setTimeout(invalidate, 100);
      setTimeout(invalidate, 300);
      setTimeout(invalidate, 600);
      setTimeout(invalidate, 1200);

      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        const ro = new ResizeObserver(() => invalidate());
        ro.observe(mapContainerRef.current);
      }
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

  // Reverse geocoding helper using multi-tier reverseGeocodeCoords
  const handlePositionChange = async (lat: number, lng: number) => {
    setCurrentCoords({ lat, lng });
    setIsGeocoding(true);

    try {
      const result = await reverseGeocodeCoords(lat, lng);
      if (result) {
        onLocationSelect({
          lat,
          lng,
          address: result.address,
          city: result.city,
          province: result.province,
          postalCode: result.postalCode,
        });
        setIsGeocoding(false);
        return;
      }
    } catch {
      // Safe fallback
    }

    onLocationSelect({
      lat,
      lng,
      address: `Titik [${lat.toFixed(5)}, ${lng.toFixed(5)}]`,
    });
    setIsGeocoding(false);
  };

  // Move map & marker to new coordinates
  const flyToCoords = (lat: number, lng: number, zoom = 16) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, {
        duration: 1.2,
      });
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  // Search locations via Nominatim
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=id&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'id',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Select search result
  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    flyToCoords(lat, lng);
    handlePositionChange(lat, lng);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  // Geolocation: "Gunakan Lokasi Saya"
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.warning('Browser Anda tidak mendukung deteksi lokasi (Geolocation).');
      return;
    }

    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingUser(false);
        const { latitude, longitude } = position.coords;
        flyToCoords(latitude, longitude, 17);
        handlePositionChange(latitude, longitude);
        toast.success('Lokasi saat ini berhasil ditemukan!');
      },
      (error) => {
        setIsLocatingUser(false);
        console.warn('Geolocation denied or failed:', error.message);
        toast.error('Gagal mendeteksi lokasi saat ini. Pastikan izin lokasi telah diaktifkan.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // React to external search trigger (e.g. from manual address button)
  useEffect(() => {
    if (externalSearchTrigger && externalSearchTrigger.trim().length > 3) {
      setSearchQuery(externalSearchTrigger);
      const searchExternal = async () => {
        setIsSearching(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              externalSearchTrigger
            )}&countrycodes=id&limit=1&addressdetails=1`,
            { headers: { 'Accept-Language': 'id' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lng = parseFloat(data[0].lon);
              flyToCoords(lat, lng);
              handlePositionChange(lat, lng);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      };
      searchExternal();
    }
  }, [externalSearchTrigger]);

  // React to target coordinates change from parent
  useEffect(() => {
    if (targetCoords && typeof targetCoords.lat === 'number' && typeof targetCoords.lng === 'number') {
      flyToCoords(targetCoords.lat, targetCoords.lng);
      setCurrentCoords({ lat: targetCoords.lat, lng: targetCoords.lng });
    }
  }, [targetCoords?.lat, targetCoords?.lng]);

  return (
    <div className={cn('flex flex-col h-full w-full', showSearchBar && 'space-y-3', className)}>
      {/* Search and Action Bar (optional, hidden by default when integrated into form) */}
      {showSearchBar && (
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Cari lokasi, jalan, atau landmark kost..."
              className="pr-10 h-10 rounded-xl bg-white dark:bg-card shadow-xs text-xs sm:text-sm border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer disabled:opacity-50"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>

            {/* Search Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-11 left-0 right-0 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-border/60">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left p-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs flex items-start gap-2.5 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-gray-800 dark:text-gray-200">
                      {item.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleUseCurrentLocation}
            disabled={isLocatingUser}
            className="group h-10 px-3.5 rounded-xl bg-white dark:bg-card border-gray-200 dark:border-border shadow-xs text-xs font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 text-gray-700 dark:text-gray-200 transition-all duration-150 active:scale-95 disabled:opacity-60"
            title="Gunakan Lokasi GPS Saya"
          >
            {isLocatingUser ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
            ) : (
              <LocateFixed className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-150" />
            )}
            <span className="hidden sm:inline">{isLocatingUser ? 'Mencari Lokasi...' : 'Lokasi Saya'}</span>
          </Button>
        </div>
      )}

      {/* Map Container */}
      <div className="relative isolate z-0 w-full flex-1 min-h-[420px] h-full rounded-2xl overflow-hidden border border-gray-200 dark:border-border shadow-xs bg-slate-100 dark:bg-slate-900">
        <div
          ref={mapContainerRef}
          className="w-full h-full min-h-[420px] z-0"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Floating status badge */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-card/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-border/80 text-[11px] shadow-md flex items-center gap-2">
          {isGeocoding ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Mengambil alamat titik...
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-gray-500 dark:text-gray-400 font-mono">
                {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
              </span>
            </>
          )}
        </div>

        {/* Helper Hint */}
        <div className="absolute top-3 right-3 z-[400] bg-black/70 text-white text-[10px] px-2.5 py-1 rounded-lg backdrop-blur-xs pointer-events-none hidden sm:block">
          Klik atau geser pin untuk menentukan titik tepat
        </div>
      </div>
    </div>
  );
};
