'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Compass,
  CheckCircle2,
  AlertCircle,
  Phone,
  FileText,
  ShieldAlert,
  Search,
  Crosshair,
  LocateFixed,
  Loader2,
} from 'lucide-react';
import { PropertyMapPicker, LocationData } from './PropertyMapPicker';
import { reverseGeocodeCoords } from '@/lib/location';
import {
  fetchProvinces,
  fetchRegencies,
  fetchDistricts,
  findMatchingRegion,
  RegionItem,
} from '@/lib/indonesia-regions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ImageGalleryUploader } from '@/components/common/ImageGalleryUploader';

export const CreatePropertyView: React.FC = () => {
  const router = useRouter();

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('CAMPUR');
  const [contactInfo, setContactInfo] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // Restore photos from localStorage on initial render
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('rentmate_create_property_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPhotos(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Address & search states (two-way sync with map)
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Indonesian administrative regions (Kemendagri API)
  const [provinces, setProvinces] = useState<RegionItem[]>([]);
  const [regencies, setRegencies] = useState<RegionItem[]>([]);
  const [districts, setDistricts] = useState<RegionItem[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedRegencyId, setSelectedRegencyId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingRegencies, setIsLoadingRegencies] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingProvinces(true);
    fetchProvinces()
      .then((data) => {
        if (isMounted) setProvinces(data);
      })
      .catch((err) => console.warn('Failed to load provinces', err))
      .finally(() => {
        if (isMounted) setIsLoadingProvinces(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch regencies when selectedProvinceId changes
  useEffect(() => {
    if (!selectedProvinceId) {
      setRegencies([]);
      setSelectedRegencyId('');
      setDistricts([]);
      setSelectedDistrictId('');
      return;
    }
    let isMounted = true;
    setIsLoadingRegencies(true);
    fetchRegencies(selectedProvinceId)
      .then((data) => {
        if (isMounted) setRegencies(data);
      })
      .catch((err) => console.warn('Failed to load regencies', err))
      .finally(() => {
        if (isMounted) setIsLoadingRegencies(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedProvinceId]);

  // Fetch districts when selectedRegencyId changes
  useEffect(() => {
    if (!selectedRegencyId) {
      setDistricts([]);
      setSelectedDistrictId('');
      return;
    }
    let isMounted = true;
    setIsLoadingDistricts(true);
    fetchDistricts(selectedRegencyId)
      .then((data) => {
        if (isMounted) setDistricts(data);
      })
      .catch((err) => console.warn('Failed to load districts', err))
      .finally(() => {
        if (isMounted) setIsLoadingDistricts(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedRegencyId]);

  // Helper to geocode a region name and fly map to it
  const flyMapToRegion = async (query: string) => {
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query + ', Indonesia')}&limit=1`
      );
      if (res.ok) {
        const data = await res.json();
        const feat = data.features?.[0];
        if (feat) {
          const [lon, latCoord] = feat.geometry.coordinates;
          setLat(latCoord);
          setLng(lon);
          setTargetCoords({ lat: latCoord, lng: lon });
        }
      }
    } catch {
      // Ignore geocode error
    }
  };

  // Sync GPS reverse geocoded names with dropdown selections
  const syncWithRegions = async (provName?: string, cityName?: string, distName?: string) => {
    try {
      // 1. Match Province
      let provList = provinces;
      if (provList.length === 0) {
        provList = await fetchProvinces();
        setProvinces(provList);
      }

      let matchedProv: RegionItem | undefined;
      if (provName) {
        matchedProv = findMatchingRegion(provName, provList);
      }

      if (matchedProv) {
        setSelectedProvinceId(matchedProv.id);
        setProvince(matchedProv.displayName);

        // 2. Match Regency / City
        const regList = await fetchRegencies(matchedProv.id);
        setRegencies(regList);

        let matchedReg: RegionItem | undefined;
        if (cityName) {
          matchedReg = findMatchingRegion(cityName, regList);
        }

        if (matchedReg) {
          setSelectedRegencyId(matchedReg.id);
          setCity(matchedReg.displayName);

          // 3. Match District / Kecamatan
          const distList = await fetchDistricts(matchedReg.id);
          setDistricts(distList);

          if (distName) {
            const matchedDist = findMatchingRegion(distName, distList);
            if (matchedDist) {
              setSelectedDistrictId(matchedDist.id);
              setDistrict(matchedDist.displayName);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Sync with regions failed', err);
    }
  };

  // Handlers for manual dropdown selections
  const handleSelectProvince = (provId: string) => {
    setSelectedProvinceId(provId);
    setSelectedRegencyId('');
    setSelectedDistrictId('');
    const provObj = provinces.find((p) => p.id === provId);
    const provDisplayName = provObj?.displayName || '';
    setProvince(provDisplayName);
    setCity('');
    setDistrict('');
    if (provDisplayName) {
      flyMapToRegion(provDisplayName);
    }
  };

  const handleSelectRegency = (regId: string) => {
    setSelectedRegencyId(regId);
    setSelectedDistrictId('');
    const regObj = regencies.find((r) => r.id === regId);
    const regDisplayName = regObj?.displayName || '';
    setCity(regDisplayName);
    setDistrict('');
    if (regDisplayName && province) {
      flyMapToRegion(`${regDisplayName}, ${province}`);
    }
  };

  const handleSelectDistrict = (distId: string) => {
    setSelectedDistrictId(distId);
    const distObj = districts.find((d) => d.id === distId);
    const distDisplayName = distObj?.displayName || '';
    setDistrict(distDisplayName);
    if (distDisplayName && city) {
      flyMapToRegion(`${distDisplayName}, ${city}, ${province}`);
    }
  };

  // Address search & autocomplete states
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lng: number } | null>(null);

  const addressContainerRef = React.useRef<HTMLDivElement>(null);
  const isSelectingRef = React.useRef(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressContainerRef.current &&
        !addressContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for address suggestions directly as user types into address input
  React.useEffect(() => {
    // If the change came from clicking a suggestion or programmatically setting address, skip search
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    if (!address.trim() || address.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Fast Photon autocomplete API (OpenStreetMap-backed, permissive CORS, sub-second latency)
        const photonRes = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(address.trim())}&limit=5`
        );
        if (photonRes.ok) {
          const photonData = await photonRes.json();
          if (photonData.features && photonData.features.length > 0) {
            const mapped = photonData.features.map((f: any) => {
              const p = f.properties;
              const coords = f.geometry.coordinates; // [lng, lat]
              const placeName = p.name || '';
              const street = p.street ? `${p.street} ` : '';
              const c = p.city || p.county || '';
              const s = p.state || '';
              const pc = p.postcode || '';
              const country = p.country || 'Indonesia';
              const displayName = [placeName, street, c, s, country].filter(Boolean).join(', ');
              return {
                lat: coords[1],
                lng: coords[0],
                displayName,
                name: placeName,
                city: c,
                province: s,
                postalCode: pc,
              };
            });
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
            address.trim()
          )}&countrycodes=id&limit=5&addressdetails=1`
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          const mapped = nomData.map((item: any) => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            displayName: item.display_name,
            name: item.name,
            city: item.address?.city || item.address?.town || item.address?.city_district || '',
            province: item.address?.state || '',
            postalCode: item.address?.postcode || '',
          }));
          setSearchResults(mapped);
          setShowDropdown(true);
        }
      } catch (err) {
        console.warn('Search geocoding error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [address]);

  // Handler when a suggestion is picked from autocomplete dropdown
  const handleSelectSuggestion = (item: any) => {
    isSelectingRef.current = true;
    setAddress(item.displayName);
    setShowDropdown(false);
    setSearchResults([]);

    setLat(item.lat);
    setLng(item.lng);
    setTargetCoords({ lat: item.lat, lng: item.lng });

    if (item.city) setCity(item.city);
    if (item.province) setProvince(item.province);
    if (item.postalCode) setPostalCode(item.postalCode);
    syncWithRegions(item.province, item.city);
    toast.success('Alamat dipilih! Peta dan detail wilayah diperbarui.');
  };

  // Handler to detect current GPS location
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Browser Anda tidak mendukung deteksi lokasi.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        setTargetCoords({ lat: latitude, lng: longitude });

        try {
          const result = await reverseGeocodeCoords(latitude, longitude);
          if (result) {
            if (result.city) setCity(result.city);
            if (result.province) setProvince(result.province);
            if (result.postalCode) setPostalCode(result.postalCode);
            if (result.address) {
              isSelectingRef.current = true;
              setShowDropdown(false);
              setSearchResults([]);
              setAddress(result.address);
            }
            syncWithRegions(result.province, result.city);
          }
          toast.success('Lokasi GPS dan detail wilayah berhasil disinkronkan!');
        } catch {
          toast.success('Lokasi GPS ditemukan!');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error('Gagal mendeteksi lokasi: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handler when map pin is moved or search result picked on map
  const handleLocationSelect = (loc: LocationData) => {
    setLat(loc.lat);
    setLng(loc.lng);
    isSelectingRef.current = true;
    setShowDropdown(false);
    setSearchResults([]);
    if (loc.address) setAddress(loc.address);
    if (loc.city) setCity(loc.city);
    if (loc.province) setProvince(loc.province);
    if (loc.postalCode) setPostalCode(loc.postalCode);
    syncWithRegions(loc.province, loc.city);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Nama properti / kost wajib diisi.');
      toast.error('Nama properti / kost wajib diisi.');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('Alamat properti wajib diisi atau ditentukan pada peta.');
      toast.error('Alamat properti wajib diisi atau ditentukan pada peta.');
      return;
    }

    setSubmitting(true);

    try {
      // Build full address string formatted with district/city/province/postalCode/coords
      let fullFormattedAddress = address.trim();
      const additionalParts = [district.trim(), city.trim(), province.trim(), postalCode.trim()].filter(Boolean);
      if (additionalParts.length > 0) {
        fullFormattedAddress += ` (${additionalParts.join(', ')})`;
      }
      if (lat && lng) {
        fullFormattedAddress += ` [${lat.toFixed(6)}, ${lng.toFixed(6)}]`;
      }

      const payload: any = {
        name: name.trim(),
        address: fullFormattedAddress,
        description: description.trim() || undefined,
        rules: rules.trim() || undefined,
        contactInfo: contactInfo.trim() || undefined,
        photos: photos.length > 0 ? photos : [],
      };

      const res = await api.post('/properties', payload);

      if (res.success) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('rentmate_create_property_photos');
          } catch {
            // Ignore
          }
        }
        setSuccessMsg('Properti berhasil ditambahkan! Mengalihkan...');
        toast.success(`Properti "${name.trim()}" berhasil ditambahkan!`);
        setTimeout(() => {
          router.push('/properties');
        }, 1000);
      }
    } catch (err: any) {
      const msg = err.message || 'Gagal menambahkan properti. Silakan periksa kembali formulir.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
        <PageHeader
          backHref="/properties"
          title="Tambah Properti Baru"
          description="Daftarkan unit gedung kost Anda dengan menentukan titik lokasi pada peta interaktif."
        />

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 text-sm flex items-start gap-3 animate-slide-up shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-sm flex items-center gap-3 animate-slide-up shadow-xs">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Row: Basic Info (Left) & Photo Gallery (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Informasi Utama Kost */}
            <div className="lg:col-span-6">
              <Card className="rounded-2xl border border-gray-100 dark:border-border/60 shadow-xs bg-white dark:bg-card h-full">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 dark:border-border/60">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-foreground">
                        Informasi Utama Kost
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">
                        Identitas dan tipe properti yang akan dikelola.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                        Nama Properti / Kost <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="cth. Kost Harmoni Residence"
                        className="h-11 rounded-xl bg-white dark:bg-card border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                          Tipe Kost
                        </label>
                        <Select value={type} onValueChange={(val) => setType(val)}>
                          <SelectTrigger className="w-full h-11 rounded-xl bg-white dark:bg-card border-gray-200 dark:border-border text-gray-900 dark:text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                            <SelectValue placeholder="Pilih tipe kost" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CAMPUR">Campur (Putra & Putri)</SelectItem>
                            <SelectItem value="PUTRA">Khusus Putra</SelectItem>
                            <SelectItem value="PUTRI">Khusus Putri</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                          Kontak Pengelola / WA
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-gray-400 dark:text-muted-foreground absolute left-3.5 top-3.5 z-10 pointer-events-none" />
                          <Input
                            type="tel"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            placeholder="081234567890"
                            className="pl-10 h-11 rounded-xl bg-white dark:bg-card border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                        Deskripsi Singkat (Opsional)
                      </label>
                      <Textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ceritakan keunggulan, lokasi strategis (dekat kampus/stasiun), atau suasana kost..."
                        className="w-full p-3 rounded-xl bg-white dark:bg-card border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 resize-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                        Peraturan Kost (Opsional)
                      </label>
                      <Textarea
                        rows={2}
                        value={rules}
                        onChange={(e) => setRules(e.target.value)}
                        placeholder="cth. Jam malam tamu maks 22.00, dilarang membawa hewan peliharaan..."
                        className="w-full p-3 rounded-xl bg-white dark:bg-card border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Google Maps Style Photo Gallery */}
            <div className="lg:col-span-6">
              <Card className="rounded-2xl border border-gray-100 dark:border-border/60 shadow-xs bg-white dark:bg-card h-full">
                <CardContent className="p-6">
                  <ImageGalleryUploader
                    images={photos}
                    onChange={setPhotos}
                    type="property"
                    title="Foto & Galeri Properti (Google Maps Preview)"
                    description="Pratinjau foto gedung kost seperti pada Google Maps. Foto pertama otomatis menjadi cover utama properti."
                    storageKey="rentmate_create_property_photos"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Row: Unified Wide Card (Alamat Manual & Peta Leaflet Berdampingan) */}
          <Card className="rounded-2xl border border-gray-100 dark:border-border/60 shadow-xs bg-white dark:bg-card">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-foreground">
                      Lokasi & Detail Alamat Properti
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">
                      Cari alamat, gunakan GPS, atau tentukan titik langsung pada peta interaktif di sebelah kanan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Side-by-Side (Manjang Nyamping): Left = Address Inputs & Search, Right = Leaflet Map */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Sub-Column (5 Cols): Form Input Alamat & Search Autocomplete */}
                <div className="lg:col-span-5 flex flex-col space-y-4 h-full">
                  {/* 1. Provinsi & Kota / Kabupaten (Cascading Dropdown dari API Kemendagri) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Provinsi</span>
                        {isLoadingProvinces && (
                          <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                        )}
                      </label>
                      <Select
                        value={selectedProvinceId}
                        onValueChange={handleSelectProvince}
                        disabled={isLoadingProvinces}
                      >
                        <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-card border-gray-200 dark:border-border text-gray-900 dark:text-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500">
                          <SelectValue placeholder="Pilih Provinsi" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64 bg-white dark:bg-card border-gray-200 dark:border-border">
                          {provinces.map((prov) => (
                            <SelectItem key={prov.id} value={prov.id} className="cursor-pointer text-xs">
                              {prov.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Kota / Kabupaten</span>
                        {isLoadingRegencies && (
                          <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                        )}
                      </label>
                      <Select
                        value={selectedRegencyId}
                        onValueChange={handleSelectRegency}
                        disabled={!selectedProvinceId || isLoadingRegencies}
                      >
                        <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-card border-gray-200 dark:border-border text-gray-900 dark:text-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 disabled:opacity-50">
                          <SelectValue
                            placeholder={
                              !selectedProvinceId
                                ? 'Pilih provinsi dahulu'
                                : isLoadingRegencies
                                ? 'Memuat kota...'
                                : 'Pilih Kota / Kab'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-64 bg-white dark:bg-card border-gray-200 dark:border-border">
                          {regencies.map((reg) => (
                            <SelectItem key={reg.id} value={reg.id} className="cursor-pointer text-xs">
                              {reg.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 2. Kecamatan & Kode Pos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Kecamatan</span>
                        {isLoadingDistricts && (
                          <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                        )}
                      </label>
                      <Select
                        value={selectedDistrictId}
                        onValueChange={handleSelectDistrict}
                        disabled={!selectedRegencyId || isLoadingDistricts}
                      >
                        <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-card border-gray-200 dark:border-border text-gray-900 dark:text-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 disabled:opacity-50">
                          <SelectValue
                            placeholder={
                              !selectedRegencyId
                                ? 'Pilih kota dahulu'
                                : isLoadingDistricts
                                ? 'Memuat kecamatan...'
                                : 'Pilih Kecamatan'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-64 bg-white dark:bg-card border-gray-200 dark:border-border">
                          {districts.map((dist) => (
                            <SelectItem key={dist.id} value={dist.id} className="cursor-pointer text-xs">
                              {dist.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                        Kode Pos
                      </label>
                      <Input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="cth. 40141"
                        className="h-10 rounded-xl bg-white dark:bg-card border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* 3. Titik Koordinat GPS */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                      Titik Koordinat GPS
                    </label>
                    <div className="h-10 px-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50/70 dark:bg-muted/20 text-xs font-mono text-gray-600 dark:text-gray-300 flex items-center">
                      {lat && lng ? (
                        <span className="truncate">
                          {lat.toFixed(5)}, {lng.toFixed(5)}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Pilih di peta atau gunakan Lokasi Saya</span>
                      )}
                    </div>
                  </div>

                  {/* 3. Input Alamat Lengkap & Detail (Tersatu dengan Pencarian & Saran Alamat & Tombol Lokasi Saya di Kiri) */}
                  <div ref={addressContainerRef} className="relative flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 dark:text-foreground uppercase tracking-wider">
                        Alamat Lengkap & Patokan <span className="text-rose-500">*</span>
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleUseCurrentLocation}
                        disabled={isLocating}
                        className="group h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/25 cursor-pointer shadow-2xs transition-all duration-150 active:scale-95 disabled:opacity-60"
                        title="Deteksi Lokasi GPS Saya"
                      >
                        {isLocating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <LocateFixed className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-150" />
                        )}
                        <span>{isLocating ? 'Mencari Lokasi...' : 'Lokasi Saya'}</span>
                      </Button>
                    </div>

                    <div className="relative flex-1 flex flex-col">
                      <Textarea
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onFocus={() => {
                          if (searchResults.length > 0) setShowDropdown(true);
                        }}
                        placeholder="Ketik alamat lengkap atau landmark kost (cth. Jl. Ciumbuleuit No. 45, dekat kampus UNPAR)..."
                        className="w-full flex-1 min-h-[140px] p-3 pr-10 rounded-xl bg-white dark:bg-card border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 resize-none leading-relaxed shadow-xs"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        </div>
                      )}
                    </div>

                    {/* Floating Suggestions Dropdown (Positioned Above to Prevent Bottom Cut-Off) */}
                    {showDropdown && searchResults.length > 0 && (
                      <div className="absolute bottom-[100%] mb-2.5 left-0 right-0 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-border/60 animate-fade-in">
                        <div className="px-3.5 py-2 bg-gray-50/90 dark:bg-muted/60 text-xs text-gray-700 dark:text-gray-300 font-semibold flex items-center justify-between border-b border-gray-100 dark:border-border/60">
                          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                            <Search className="w-3.5 h-3.5" />
                            <span>Saran Alamat Ditemukan ({searchResults.length})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowDropdown(false)}
                            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer text-xs flex items-center gap-1 hover:underline"
                          >
                            ✕ Tutup
                          </button>
                        </div>
                        {searchResults.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onMouseDown={(e) => {
                              // Prevent blur from closing before click is registered
                              e.preventDefault();
                              handleSelectSuggestion(item);
                            }}
                            className="w-full text-left p-3 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 text-xs flex items-start gap-2.5 transition-colors cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-foreground truncate">
                                {item.name || item.displayName}
                              </p>
                              <p className="line-clamp-2 text-gray-500 dark:text-muted-foreground text-[11px] mt-0.5">
                                {item.displayName}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Sync Notice Banner */}
                  <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-100/80 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed flex items-start gap-2.5 shrink-0">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-0.5">Sinkronisasi Peta Otomatis</p>
                      <p className="text-[11px] text-indigo-700/90 dark:text-indigo-300/80">
                        Memilih saran pencarian atau menggeser pin di sebelah kanan akan otomatis memperbarui koordinat dan detail alamat.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Sub-Column (7 Cols): Interactive Leaflet Map */}
                <div className="lg:col-span-7 flex flex-col h-full min-h-[420px]">
                  <PropertyMapPicker
                    targetCoords={targetCoords}
                    onLocationSelect={handleLocationSelect}
                    showSearchBar={false}
                    className="h-full flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/properties')}
              className="rounded-xl px-5 h-11 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-xl px-8 h-11 shadow-md shadow-indigo-500/20 font-semibold cursor-pointer"
            >
              {submitting ? 'Menyimpan Properti...' : 'Simpan Properti'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
