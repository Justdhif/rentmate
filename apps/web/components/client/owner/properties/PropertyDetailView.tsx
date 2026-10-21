'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Star,
  Heart,
  Edit,
  MoreVertical,
  Wifi,
  Wind,
  Bike,
  Users,
  DoorClosed,
  CheckCircle2,
  Camera,
  Search,
  SlidersHorizontal,
  ChevronDown,
  PhoneCall,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  FileText,
  Zap,
  Droplets,
  Calendar,
  X,
  BedDouble,
  Bath,
  Tv,
  Check,
  Share2,
  Trash2,
  ArrowUpDown,
  UtensilsCrossed,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { toast } from 'sonner';
import { ImageLightboxModal } from '@/components/custom-ui/ImageGalleryUploader';
import { EmptyState } from '@/components/custom-ui/EmptyState';

export interface RoomItem {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  roomType?: string;
  type?: string;
  price: number;
  monthlyPrice?: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  description?: string;
  facilities?: string[];
  photos?: string[];
  dimension?: string;
  sizeM2?: number;
}

export interface PropertyData {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  city?: string;
  province?: string;
  postalCode?: string;
  description?: string;
  rules?: string;
  contactInfo?: string;
  photos?: string[];
  type?: string;
  facilities?: any[];
  rooms?: RoomItem[];
  rating?: number;
  reviewCount?: number;
}

export const getFacilityIcon = (name: string): React.ComponentType<{ className?: string }> => {
  const n = (name || '').toLowerCase();
  if (n.includes('cctv') || n.includes('security') || n.includes('keamanan') || n.includes('satpam') || n.includes('one gate') || n.includes('access card') || n.includes('akses card')) return ShieldCheck;
  if (n.includes('wifi') || n.includes('wi-fi') || n.includes('internet')) return Wifi;
  if (/\bac\b/i.test(n) || n.includes('air conditioner') || n.includes('pendingin')) return Wind;
  if (n.includes('parkir') || n.includes('motor') || n.includes('mobil') || n.includes('parking') || n.includes('sepeda')) return Bike;
  if (n.includes('kasur') || n.includes('bed') || n.includes('springbed') || n.includes('bantal')) return BedDouble;
  if (n.includes('lemari') || n.includes('wardrobe') || n.includes('pintu')) return DoorClosed;
  if (n.includes('meja') || n.includes('kursi') || n.includes('desk') || n.includes('belajar') || n.includes('kerja') || n.includes('buku')) return FileText;
  if (n.includes('kamar mandi') || n.includes('bath') || n.includes('toilet') || n.includes('shower') || n.includes('water heater')) return Bath;
  if (n.includes('dapur') || n.includes('kitchen') || n.includes('kompor') || n.includes('masak') || n.includes('kulkas') || n.includes('kantin')) return UtensilsCrossed;
  if (n.includes('tv') || n.includes('televisi')) return Tv;
  if (n.includes('dispenser') || n.includes('air')) return Droplets;
  if (n.includes('jemuran') || n.includes('cuci') || n.includes('laundry') || n.includes('mesin cuci')) return Building2;
  if (n.includes('gerbang') || n.includes('gate') || n.includes('akses') || n.includes('24 jam') || n.includes('jam malam')) return Clock;
  if (n.includes('penjaga') || n.includes('tamu') || n.includes('santai') || n.includes('bersama') || n.includes('lounge') || n.includes('co-working')) return Users;
  if (n.includes('bersih') || n.includes('cleaning') || n.includes('kebersihan')) return Sparkles;
  if (n.includes('listrik') || n.includes('token') || n.includes('daya')) return Zap;
  return CheckCircle2;
};

interface PropertyDetailViewProps {
  propertyId: string;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ propertyId }) => {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const confirm = useConfirm();

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rooms' | 'detail' | 'facilities' | 'reviews'>('rooms');

  // Search & Filter toolbar state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'room_number'>('newest');

  // Sidebar Filter state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([500000, 2500000]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  // Favorites state
  const {
    isPropertyFavorite,
    isRoomFavorite,
    togglePropertyFavorite,
    toggleRoomFavorite,
  } = useFavorites();

  // Reviews state
  const [reviewsData, setReviewsData] = useState<{
    reviews: any[];
    summary: {
      averageRating: number;
      totalReviews: number;
      breakdown: { stars: number; count: number; percentage: number }[];
    };
  }>({
    reviews: [],
    summary: {
      averageRating: 0,
      totalReviews: 0,
      breakdown: [
        { stars: 5, count: 0, percentage: 0 },
        { stars: 4, count: 0, percentage: 0 },
        { stars: 3, count: 0, percentage: 0 },
        { stars: 2, count: 0, percentage: 0 },
        { stars: 1, count: 0, percentage: 0 },
      ],
    },
  });
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRoomId, setReviewRoomId] = useState<string>('NONE');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Lightbox modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // Interactive Action Modals
  const [selectedRoomDetail, setSelectedRoomDetail] = useState<RoomItem | null>(null);
  const [selectedRoomRent, setSelectedRoomRent] = useState<RoomItem | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Rental submission form
  const [rentStartDate, setRentStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [rentDuration, setRentDuration] = useState(1);
  const [tenantName, setTenantName] = useState(user?.profile?.fullName || '');
  const [tenantPhone, setTenantPhone] = useState('');
  const [rentNotes, setRentNotes] = useState('');
  const [isSubmittingRent, setIsSubmittingRent] = useState(false);

  // Fetch property and rooms directly from database
  const fetchPropertyData = async () => {
    try {
      setIsLoading(true);
      const [propRes, roomsRes] = await Promise.allSettled([
        api.get(`/properties/${propertyId}`),
        api.get(`/rooms?propertyId=${propertyId}`),
      ]);

      let propData: PropertyData | null = null;
      if (propRes.status === 'fulfilled' && propRes.value?.success) {
        propData = propRes.value.data;
      }

      let roomsData: RoomItem[] = [];
      if (roomsRes.status === 'fulfilled' && roomsRes.value?.success) {
        roomsData = roomsRes.value.data || [];
      } else if (propData?.rooms && propData.rooms.length > 0) {
        roomsData = propData.rooms;
      }

      setProperty(propData);
      setRooms(roomsData);
    } catch (err: any) {
      console.error('Error fetching property detail:', err);
      toast.error(t('propertyDetail.propertyNotFoundDesc'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setIsReviewsLoading(true);
      const res = await api.get(`/reviews/property/${propertyId}`);
      if (res?.success && res.data) {
        setReviewsData(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk menulis ulasan');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error(t('propertyDetail.commentPlaceholder'));
      return;
    }

    try {
      setIsSubmittingReview(true);
      const payload: any = {
        propertyId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      };
      if (reviewRoomId && reviewRoomId !== 'NONE') {
        payload.roomId = reviewRoomId;
      }
      const res = await api.post('/reviews', payload);
      if (res?.success) {
        toast.success(t('propertyDetail.reviewSuccess'));
        setIsReviewModalOpen(false);
        setReviewComment('');
        setReviewRating(5);
        setReviewRoomId('NONE');
        fetchReviews();
        fetchPropertyData();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengirim ulasan');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const confirmed = await confirm.danger({
      title: t('propertyDetail.deleteReview'),
      description: t('propertyDetail.deleteReviewConfirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    });
    if (!confirmed) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success(t('propertyDetail.deleteReviewSuccess'));
      fetchReviews();
      fetchPropertyData();
    } catch {
      toast.error('Gagal menghapus ulasan');
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchPropertyData();
      fetchReviews();
    }
  }, [propertyId]);

  // Format currency helper
  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString(locale === 'en' ? 'en-US' : 'id-ID');
  };

  // Open Lightbox gallery
  const openGallery = (imgs: string[], title: string) => {
    if (!imgs || imgs.length === 0) return;
    setLightboxImages(imgs);
    setLightboxTitle(title);
    setIsLightboxOpen(true);
  };

  // Available room types found in database rooms
  const availableRoomTypes = useMemo(() => {
    const types = new Set<string>();
    rooms.forEach((r) => {
      const tName = r.roomType || r.type || 'Standar';
      types.add(tName);
    });
    return Array.from(types);
  }, [rooms]);

  // Filtered & Sorted rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const numMatch = r.roomNumber.toLowerCase().includes(q);
        const typeMatch = (r.roomType || r.type || '').toLowerCase().includes(q);
        if (!numMatch && !typeMatch) return false;
      }

      // 2. Type Filter (Toolbar)
      const currentType = (r.roomType || r.type || 'Standar').toLowerCase();
      if (typeFilter !== 'ALL' && currentType !== typeFilter.toLowerCase()) {
        return false;
      }

      // 3. Status Filter (Toolbar)
      if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false;
      }

      // 4. Sidebar: Selected Types
      if (selectedTypes.length > 0) {
        const matchesSidebarType = selectedTypes.some(
          (st) => st.toLowerCase() === currentType
        );
        if (!matchesSidebarType) return false;
      }

      // 5. Sidebar: Price Range
      const roomPrice = Number(r.price ?? r.monthlyPrice ?? 0);
      if (roomPrice < priceRange[0] || roomPrice > priceRange[1]) {
        return false;
      }

      // 6. Sidebar: Facilities
      if (selectedFacilities.length > 0) {
        const roomFacs = (r.facilities || []).map((f) => f.toLowerCase());
        const hasAllSelected = selectedFacilities.every((sf) =>
          roomFacs.some((rf) => rf.includes(sf.toLowerCase()))
        );
        if (!hasAllSelected) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = Number(a.price ?? a.monthlyPrice ?? 0);
      const priceB = Number(b.price ?? b.monthlyPrice ?? 0);

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'room_number') return a.roomNumber.localeCompare(b.roomNumber);
      return 0; // newest / default
    });
  }, [rooms, searchQuery, typeFilter, statusFilter, selectedTypes, priceRange, selectedFacilities, sortBy]);

  // Available room count
  const availableRoomsCount = useMemo(() => {
    return rooms.filter((r) => r.status === 'AVAILABLE').length;
  }, [rooms]);

  // Dynamically group facilities from database (property.facilities & rooms.facilities)
  const groupedFacilities = useMemo(() => {
    // 1. Extract property-level facilities
    const propFacilities: string[] = (property?.facilities || [])
      .map((f: any) => (typeof f === 'string' ? f : f?.name || ''))
      .filter(Boolean);

    // 2. Extract room-level facilities across all rooms
    const roomUnitFacilities: string[] = Array.from(
      new Set(
        (rooms || []).flatMap((r: any) =>
          Array.isArray(r.facilities) ? r.facilities : []
        )
      )
    ).filter(Boolean);

    const isParkingSecurity = (name: string) => {
      const n = name.toLowerCase();
      return (
        n.includes('parkir') ||
        n.includes('parking') ||
        n.includes('motor') ||
        n.includes('mobil') ||
        n.includes('sepeda') ||
        n.includes('cctv') ||
        n.includes('security') ||
        n.includes('keamanan') ||
        n.includes('satpam') ||
        n.includes('penjaga') ||
        n.includes('gerbang') ||
        n.includes('gate') ||
        n.includes('access card') ||
        n.includes('akses card') ||
        n.includes('one gate')
      );
    };

    const isRoomFacility = (name: string) => {
      if (isParkingSecurity(name)) return false;
      const n = name.toLowerCase();
      return (
        /\bac\b/i.test(n) ||
        n.includes('air conditioner') ||
        n.includes('kasur') ||
        n.includes('springbed') ||
        n.includes('bed') ||
        n.includes('bantal') ||
        n.includes('lemari') ||
        n.includes('wardrobe') ||
        n.includes('meja') ||
        n.includes('kursi') ||
        n.includes('desk') ||
        n.includes('kamar mandi') ||
        n.includes('bath') ||
        n.includes('toilet') ||
        n.includes('water heater') ||
        n.includes('shower') ||
        n.includes('tv') ||
        n.includes('televisi')
      );
    };

    // Construct Room Facilities list: start with roomUnitFacilities,
    // plus any propFacilities that are specific to rooms
    const roomList = [...roomUnitFacilities];
    propFacilities.forEach((item) => {
      if (isRoomFacility(item) && !roomList.some((r) => r.toLowerCase() === item.toLowerCase())) {
        roomList.push(item);
      }
    });

    // Construct Parking & Security list
    const parkingSecurityList: string[] = [];
    propFacilities.forEach((item) => {
      if (isParkingSecurity(item) && !parkingSecurityList.some((p) => p.toLowerCase() === item.toLowerCase())) {
        parkingSecurityList.push(item);
      }
    });

    // Construct Shared Facilities: items in propFacilities that are neither room nor parking
    const sharedList: string[] = [];
    propFacilities.forEach((item) => {
      const alreadyInRoom = roomList.some((r) => r.toLowerCase() === item.toLowerCase());
      const alreadyInParking = parkingSecurityList.some((p) => p.toLowerCase() === item.toLowerCase());
      if (!alreadyInRoom && !alreadyInParking) {
        sharedList.push(item);
      }
    });

    const totalCount = roomList.length + sharedList.length + parkingSecurityList.length;

    // Header facilities preview (top 3)
    const headerCandidates = [...propFacilities, ...roomUnitFacilities];
    const uniqueHeaderCandidates = Array.from(new Set(headerCandidates));
    const headerFacilities = uniqueHeaderCandidates.slice(0, 3);

    return {
      roomList,
      sharedList,
      parkingSecurityList,
      totalCount,
      headerFacilities,
    };
  }, [property?.facilities, rooms]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setSelectedTypes([]);
    setPriceRange([500000, 2500000]);
    setSelectedFacilities([]);
    setSortBy('newest');
    toast.info(t('properties.resetFilters'));
  };

  // Submit rental application
  const handleRentalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomRent) return;

    setIsSubmittingRent(true);
    setTimeout(() => {
      setIsSubmittingRent(false);
      toast.success(
        t('propertyDetail.rentSuccessToast', { roomNumber: selectedRoomRent.roomNumber })
      );
      setSelectedRoomRent(null);
    }, 600);
  };

  // Property photos
  const propertyPhotos =
    property?.photos && property.photos.length > 0
      ? property.photos
      : [];
  const coverPhoto = propertyPhotos[0] || null;
  const photoCount = propertyPhotos.length;

  // Determine property type badge
  const propertyTypeLabel = useMemo(() => {
    const desc = ((property?.description || '') + ' ' + (property?.type || '')).toLowerCase();
    if (desc.includes('putri') || desc.includes('wanita') || desc.includes('female')) {
      return t('propertyDetail.typeFemale');
    }
    if (desc.includes('campur') || desc.includes('mixed')) {
      return t('propertyDetail.typeMixed');
    }
    return t('propertyDetail.typeMale');
  }, [property, t]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-4">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">
          {t('propertyDetail.loadingProperty')}
        </p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4">
        <div className="w-16 h-16 bg-primary50 text-primary500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <DoorClosed className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {t('propertyDetail.propertyNotFound')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-muted-foreground mb-6">
          {t('propertyDetail.propertyNotFoundDesc')}
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/properties">{t('propertyDetail.backToProperties')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP HEADER CARD (Matches Reference Image) */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border/60 p-4 sm:p-6 shadow-2xs hover:shadow-xs transition-all duration-300">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Kost Picture Container */}
          <div className="relative w-full lg:w-72 xl:w-80 aspect-[16/11] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 shadow-inner group select-none">
            {coverPhoto ? (
              <>
                <img
                  src={coverPhoto}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => openGallery(propertyPhotos, property.name)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25 pointer-events-none" />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400">
                <Building2 className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300 dark:text-slate-600" />
                <span className="text-xs font-medium">{t('propertyDetail.noPhotos')}</span>
              </div>
            )}

            {/* Status Badge: Aktif (Top-Left) */}
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-xs backdrop-blur-md">
                {t('propertyDetail.statusActive')}
              </span>
            </div>

            {/* Photo Counter Badge (Bottom-Right) */}
            {photoCount > 0 && (
              <div
                onClick={() => openGallery(propertyPhotos, property.name)}
                className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/65 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                title={t('properties.viewPhotoGallery')}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>
                  {t('propertyDetail.photoCount', { current: 1, total: photoCount })}
                </span>
              </div>
            )}
          </div>

          {/* Right: Kost Information & Action Buttons */}
          <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch space-y-4">
            <div>
              {/* Row 1: Title & Verified Badge + Actions */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-foreground tracking-tight line-clamp-1">
                    {property.name}
                  </h1>
                  <span title={t('propertyDetail.verifiedBadge')}>
                    <CheckCircle2 className="w-5 h-5 fill-rose-600 text-white shrink-0" />
                  </span>
                </div>

                {/* Favorite, Edit & Menu Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`h-9 px-3.5 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer transition-all ${
                      isPropertyFavorite(property.id)
                        ? 'border-border200 dark:border-border900/50 bg-primary50 dark:bg-primary950/40 text-primary600 dark:text-primary400 hover:bg-primary/90100 dark:hover:bg-primary/90900/60'
                        : 'border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => togglePropertyFavorite(property.id, property.name)}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${
                        isPropertyFavorite(property.id)
                          ? 'fill-rose-500 text-primary500'
                          : 'text-slate-500 hover:text-primary500'
                      }`}
                    />
                    <span>
                      {isPropertyFavorite(property.id)
                        ? t('propertyDetail.unfavoriteProperty')
                        : t('propertyDetail.favoriteProperty')}
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3.5 rounded-xl border-border dark:border-border text-primary bg-secondary/50 hover:bg-primary/80 dark:bg-secondary/40 text-xs font-semibold gap-1.5 cursor-pointer"
                    onClick={() => router.push(`/properties/create?edit=${property.id}`)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{t('propertyDetail.editKost')}</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuItem
                        onClick={() => router.push(`/rooms?propertyId=${property.id}`)}
                        className="gap-2 cursor-pointer"
                      >
                        <DoorClosed className="w-4 h-4 text-primary" />
                        <span>{t('properties.manageRooms')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success(t('properties.photoBadge', { count: photoCount }));
                          }
                        }}
                        className="gap-2 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-slate-500" />
                        <span>{t('propertyDetail.moreOptions')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Row 2: Location Address */}
              <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground flex items-center gap-1.5 mt-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="line-clamp-1">
                  {property.address}
                  {property.city ? `, ${property.city}` : ''}
                </span>
              </p>

              {/* Row 3: Quick Spec Icons Row */}
              <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{propertyTypeLabel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DoorClosed className="w-4 h-4 text-slate-500" />
                  <span>
                    {t('propertyDetail.roomsCount', { count: rooms.length })}
                  </span>
                </div>
                {groupedFacilities.headerFacilities.map((facName, i) => {
                  const FacIcon = getFacilityIcon(facName);
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <FacIcon className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate max-w-[140px]">{facName}</span>
                    </div>
                  );
                })}
              </div>

              {/* Row 4: Rating */}
              {property.rating && property.reviewCount ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mt-3">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>
                    {t('propertyDetail.ratingCount', {
                      rating: property.rating,
                      count: property.reviewCount,
                    })}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 mt-3">
                  <Star className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  <span>{t('propertyDetail.noReviewsBadge')}</span>
                </div>
              )}
            </div>

            {/* Row 5: Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-2 line-clamp-2">
              {property.description || t('propertyDetail.defaultDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION BAR */}
      <div className="border-b border-slate-200 dark:border-border/60">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'rooms'
                ? 'border-border text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t('propertyDetail.tabRooms')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('detail')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'detail'
                ? 'border-border text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t('propertyDetail.tabDetail')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('facilities')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'facilities'
                ? 'border-border text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t('propertyDetail.tabFacilities')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-border text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t('propertyDetail.tabReviews')}
          </button>
        </nav>
      </div>

      {/* 3. MAIN CONTENT (TWO COLUMNS: LEFT 3/4, RIGHT 1/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: MAIN TAB CONTENT */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {activeTab === 'rooms' && (
            <>
              {/* SEARCH & FILTER CONTROLS (SEAMLESS TOOLBAR) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Input */}
                <div className="flex-1 relative min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('propertyDetail.searchPlaceholder')}
                    className="pl-9.5 pr-8 h-10 rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border text-xs sm:text-sm shadow-2xs focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters & Sort Controls Group */}
                <div className="flex items-center flex-wrap sm:flex-nowrap gap-2.5">
                  {/* Filter: Semua Tipe */}
                  <div className="w-full sm:w-36">
                    <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val)}>
                      <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border text-xs sm:text-sm text-slate-700 dark:text-slate-200 shadow-2xs">
                        <SelectValue placeholder={t('propertyDetail.allTypes')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="ALL" className="text-xs sm:text-sm cursor-pointer">
                          {t('propertyDetail.allTypes')}
                        </SelectItem>
                        {availableRoomTypes.map((tName) => (
                          <SelectItem key={tName} value={tName} className="text-xs sm:text-sm cursor-pointer">
                            {tName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter: Semua Status */}
                  <div className="w-full sm:w-36">
                    <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                      <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border text-xs sm:text-sm text-slate-700 dark:text-slate-200 shadow-2xs">
                        <SelectValue placeholder={t('propertyDetail.allStatuses')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="ALL" className="text-xs sm:text-sm cursor-pointer">
                          {t('propertyDetail.allStatuses')}
                        </SelectItem>
                        <SelectItem value="AVAILABLE" className="text-xs sm:text-sm cursor-pointer">
                          {t('propertyDetail.statusAvailable')}
                        </SelectItem>
                        <SelectItem value="OCCUPIED" className="text-xs sm:text-sm cursor-pointer">
                          {t('propertyDetail.statusOccupied')}
                        </SelectItem>
                        <SelectItem value="MAINTENANCE" className="text-xs sm:text-sm cursor-pointer">
                          {t('propertyDetail.statusMaintenance')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort: Urutkan */}
                  <div className="w-full sm:w-44">
                    <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                      <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border text-xs sm:text-sm text-slate-700 dark:text-slate-200 shadow-2xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {sortBy === 'newest'
                              ? t('propertyDetail.sortBy', { label: t('propertyDetail.sortNewest') })
                              : sortBy === 'price_asc'
                              ? t('propertyDetail.sortBy', { label: t('propertyDetail.sortPriceAsc') })
                              : sortBy === 'price_desc'
                              ? t('propertyDetail.sortBy', { label: t('propertyDetail.sortPriceDesc') })
                              : t('propertyDetail.sortBy', { label: t('propertyDetail.sortRoomNumber') })}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="newest" className="text-xs sm:text-sm cursor-pointer">
                          {t('propertyDetail.sortBy', { label: t('propertyDetail.sortNewest') })}
                        </SelectItem>
                        <SelectItem value="price_asc" className="text-xs sm:text-sm cursor-pointer">
                          {t('propertyDetail.sortBy', { label: t('propertyDetail.sortPriceAsc') })}
                        </SelectItem>
                        <SelectItem value="price_desc" className="text-xs sm:text-sm cursor-pointer">
                          {t('propertyDetail.sortBy', { label: t('propertyDetail.sortPriceDesc') })}
                        </SelectItem>
                        <SelectItem value="room_number" className="text-xs sm:text-sm cursor-pointer">
                          {t('propertyDetail.sortBy', { label: t('propertyDetail.sortRoomNumber') })}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Button Tambah Kamar */}
                  <Button
                    asChild
                    size="sm"
                    className="h-10 px-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs cursor-pointer gap-1.5 shrink-0"
                  >
                    <Link href={`/rooms/create?propertyId=${property.id}`}>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('propertyDetail.addRoom')}</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* ROOMS GRID (3 COLUMNS) */}
              {rooms.length === 0 ? (
                <EmptyState
                  icon={DoorClosed}
                  iconColor="rose"
                  title={t('propertyDetail.noRoomsYetTitle')}
                  description={t('propertyDetail.noRoomsYetDesc')}
                  action={{
                    label: t('propertyDetail.addRoom'),
                    href: `/rooms/create?propertyId=${property.id}`,
                    icon: Plus,
                  }}
                />
              ) : filteredRooms.length === 0 ? (
                <EmptyState
                  icon={DoorClosed}
                  iconColor="slate"
                  title={t('propertyDetail.emptyRooms')}
                  description={t('propertyDetail.emptyRoomsDesc')}
                  action={{
                    label: t('propertyDetail.reset'),
                    onClick: handleResetFilters,
                    variant: 'outline',
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredRooms.map((room) => {
                    const isAvailable = room.status === 'AVAILABLE';
                    const isFav = isRoomFavorite(room.id);
                    const roomPhotos = room.photos && room.photos.length > 0 ? room.photos : [];
                    const coverRoomPhoto = roomPhotos[0] || null;
                    const roomPrice = Number(room.price ?? room.monthlyPrice ?? 0);
                    const roomTypeName = room.roomType || room.type || 'Standar';
                    const dimensionsText =
                      room.dimension ||
                      (roomTypeName === 'Deluxe'
                        ? '4 x 3.5 m (±14 m²)'
                        : '3.5 x 3 m (±10.5 m²)');

                    return (
                      <div
                        key={room.id}
                        className="rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card overflow-hidden shadow-2xs hover:shadow-lg hover:border-primary transition-all duration-300 flex flex-col justify-between group"
                      >
                        <div>
                          {/* Room Photo Banner */}
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-muted select-none">
                            {coverRoomPhoto ? (
                              <>
                                <img
                                  src={coverRoomPhoto}
                                  alt={room.roomNumber}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                                  onClick={() => openGallery(roomPhotos, room.roomNumber)}
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/60 text-slate-400">
                                <DoorClosed className="w-10 h-10 stroke-[1.5] text-slate-300 dark:text-slate-600 mb-1" />
                                <span className="text-[11px] font-medium">{t('propertyDetail.noPhotos')}</span>
                              </div>
                            )}

                            {/* Status Badge: Tersedia / Terisi */}
                            <div className="absolute top-3 left-3 z-10">
                              {isAvailable ? (
                                <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 backdrop-blur-md shadow-2xs">
                                  {t('propertyDetail.statusAvailable')}
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 backdrop-blur-md shadow-2xs">
                                  {t('propertyDetail.statusOccupied')}
                                </span>
                              )}
                            </div>

                            {/* Heart Favorite Button (Top Right) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRoomFavorite(room.id, room.roomNumber);
                              }}
                              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 flex items-center justify-center backdrop-blur-md shadow-xs transition-all cursor-pointer"
                              title={isFav ? t('properties.removeFromFavorite') : t('properties.addToFavorite')}
                            >
                              <Heart
                                className={`w-4 h-4 transition-colors ${
                                  isFav
                                    ? 'fill-rose-500 text-primary500'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-primary500'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Room Card Body */}
                          <div className="p-4 sm:p-4.5 space-y-2.5">
                            {/* Room Name */}
                            <h3 className="font-bold text-slate-900 dark:text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
                              {room.roomNumber}
                            </h3>

                            {/* Room Type & Dimensions */}
                            <p className="text-xs text-slate-500 dark:text-muted-foreground line-clamp-1">
                              {t('propertyDetail.roomTypePrefix', { type: roomTypeName })} • {dimensionsText}
                            </p>

                            {/* Price */}
                            <div className="flex items-baseline gap-1 pt-1">
                              <span className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                                {formatRupiah(roomPrice)}
                              </span>
                              <span className="text-xs font-normal text-slate-500 dark:text-muted-foreground">
                                {t('propertyDetail.perMonth')}
                              </span>
                            </div>

                            {/* Amenities Row Icons */}
                            {room.facilities && room.facilities.length > 0 && (
                              <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300 pt-1.5 border-t border-slate-100 dark:border-border/60 overflow-hidden">
                                {room.facilities.slice(0, 3).map((fName, fIdx) => {
                                  const FacIcon = getFacilityIcon(fName);
                                  return (
                                    <div key={fIdx} className="flex items-center gap-1 shrink-0" title={fName}>
                                      <FacIcon className="w-3.5 h-3.5 text-slate-500" />
                                      <span className="truncate max-w-[85px]">{fName}</span>
                                    </div>
                                  );
                                })}
                                {room.facilities.length > 3 && (
                                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                    +{room.facilities.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Room Card Actions */}
                        <div className="p-4 sm:p-4.5 pt-0">
                          {isAvailable ? (
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRoomDetail(room)}
                                className="flex-1 h-9 rounded-xl border-slate-200 dark:border-border text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                {t('propertyDetail.viewDetail')}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => setSelectedRoomRent(room)}
                                className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
                              >
                                {t('propertyDetail.rentNow')}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              disabled
                              className="w-full h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 text-xs font-semibold cursor-not-allowed"
                            >
                              {t('propertyDetail.notAvailable')}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: DETAIL KOST (Full Specifications, Rules, Policies) */}
          {activeTab === 'detail' && (
            <div className="space-y-6">
              {/* Specifications Card */}
              <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border/60 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-border/60">
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {t('propertyDetail.detailSpecsTitle')}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('propertyDetail.detailSpecsDesc')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-border/50">
                    <span className="text-[11px] text-slate-500">{t('propertyDetail.buildingArea')}</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {rooms.reduce((acc, r) => acc + (r.sizeM2 || 0), 0) > 0
                        ? `±${rooms.reduce((acc, r) => acc + (r.sizeM2 || 0), 0)} m²`
                        : '-'}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-border/50">
                    <span className="text-[11px] text-slate-500">{t('propertyDetail.floorCount')}</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {rooms.length > 0 ? `${Math.max(...rooms.map((r) => r.floor || 1))} Lantai` : '-'}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-border/50">
                    <span className="text-[11px] text-slate-500">{t('propertyDetail.totalRoomCapacity')}</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {rooms.length} Kamar
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-border/50">
                    <span className="text-[11px] text-slate-500">{t('propertyDetail.kostType')}</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {propertyTypeLabel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rules & Regulations Card */}
              <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border/60 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-border/60">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {t('propertyDetail.rulesTitle')}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('propertyDetail.rulesDesc')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {property.rules ? (
                    <p className="whitespace-pre-line leading-relaxed">{property.rules}</p>
                  ) : (
                    <p className="text-slate-500 dark:text-muted-foreground italic">
                      {t('propertyDetail.noRulesDesc')}
                    </p>
                  )}
                </div>
              </div>

              {/* Deposit Policy Card */}
              <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border/60 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-border/60">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {t('propertyDetail.depositTitle')}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('propertyDetail.depositDesc')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-4 rounded-xl bg-secondary/50 dark:bg-primary/30 border border-border dark:border-border">
                    <h4 className="font-bold text-primary">Deposit Jaminan</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      Deposit jaminan sebesar Rp 500.000 dibayarkan saat check-in dan akan dikembalikan 100% pada akhir masa sewa.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Listrik & Utilitas</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      Biaya sewa sudah termasuk air bersih dan pemeliharaan area umum. Listrik menggunakan sistem token meteran mandiri per kamar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FASILITAS (Grouped Amenities from Database) */}
          {activeTab === 'facilities' && (
            <div className="space-y-6">
              {groupedFacilities.totalCount === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  iconColor="slate"
                  title={t('propertyDetail.noFacilitiesTitle')}
                  description={t('propertyDetail.noFacilitiesDesc')}
                />
              ) : (
                <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border/60 p-6 shadow-2xs space-y-6">
                  {/* Category 1: Fasilitas Kamar */}
                  {groupedFacilities.roomList.length > 0 && (
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {t('propertyDetail.facilitiesRoomTitle')}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                        {groupedFacilities.roomList.map((item, i) => {
                          const IconComponent = getFacilityIcon(item);
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-border/50 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                            >
                              <IconComponent className="w-4 h-4 text-primary shrink-0" />
                              <span className="truncate">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Category 2: Fasilitas Bersama */}
                  {groupedFacilities.sharedList.length > 0 && (
                    <div className={groupedFacilities.roomList.length > 0 ? 'pt-4 border-t border-slate-100 dark:border-border/60' : ''}>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {t('propertyDetail.facilitiesSharedTitle')}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                        {groupedFacilities.sharedList.map((item, i) => {
                          const IconComponent = getFacilityIcon(item);
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-border/50 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                            >
                              <IconComponent className="w-4 h-4 text-primary shrink-0" />
                              <span className="truncate">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Category 3: Parkir & Keamanan */}
                  {groupedFacilities.parkingSecurityList.length > 0 && (
                    <div className={groupedFacilities.roomList.length > 0 || groupedFacilities.sharedList.length > 0 ? 'pt-4 border-t border-slate-100 dark:border-border/60' : ''}>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {t('propertyDetail.facilitiesParkingTitle')}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                        {groupedFacilities.parkingSecurityList.map((item, i) => {
                          const IconComponent = getFacilityIcon(item);
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-border/50 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                            >
                              <IconComponent className="w-4 h-4 text-primary shrink-0" />
                              <span className="truncate">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ULASAN (Reviews Breakdown & Comments) */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Reviews Header & Summary Card */}
              <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border/60 p-6 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-border/60">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {t('propertyDetail.reviewsTitle')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t('propertyDetail.writeReviewDesc')}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="rounded-xl px-4 h-9.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-xs cursor-pointer shrink-0"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{t('propertyDetail.writeReview')}</span>
                  </Button>
                </div>

                {/* Score & Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Left: Score Box */}
                  <div className="md:col-span-4 text-center md:text-left flex flex-col items-center md:items-start justify-center">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        {reviewsData.summary.averageRating > 0
                          ? reviewsData.summary.averageRating.toFixed(1)
                          : property.rating || '0.0'}
                      </span>
                      <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const effectiveRating =
                          reviewsData.summary.averageRating || property.rating || 0;
                        return (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(effectiveRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        );
                      })}
                    </div>

                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      {t('propertyDetail.basedOnReviews', {
                        count:
                          reviewsData.summary.totalReviews ||
                          property.reviewCount ||
                          0,
                      })}
                    </p>
                  </div>

                  {/* Right: Breakdown Bars */}
                  <div className="md:col-span-8 space-y-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-border/60 pt-4 md:pt-0 md:pl-8">
                    {reviewsData.summary.breakdown.map((item) => (
                      <div key={item.stars} className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 shrink-0">
                          <span>{item.stars}</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="w-14 text-right text-slate-400 dark:text-slate-500 text-[11px] font-medium shrink-0">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              {isReviewsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 rounded-2xl bg-white dark:bg-card border border-slate-200/60 dark:border-border/40 animate-pulse p-6"
                    />
                  ))}
                </div>
              ) : reviewsData.reviews.length === 0 ? (
                <EmptyState
                  icon={Star}
                  iconColor="amber"
                  title={t('propertyDetail.noReviewsTitle')}
                  description={t('propertyDetail.noReviewsDesc')}
                  action={{
                    label: t('propertyDetail.writeReview'),
                    onClick: () => setIsReviewModalOpen(true),
                    icon: Edit,
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {reviewsData.reviews.map((rev) => {
                    const isAuthor =
                      user?.id === rev.userId || user?.role === 'ADMIN';
                    const initials =
                      rev.reviewer?.name
                        ?.split(' ')
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || 'P';

                    return (
                      <div
                        key={rev.id}
                        className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border/60 p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Reviewer Info */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary50 dark:bg-primary950/60 border border-border200/60 dark:border-border800/40 text-primary600 dark:text-primary400 font-bold text-sm flex items-center justify-center overflow-hidden shrink-0">
                              {rev.reviewer?.avatarUrl ? (
                                <img
                                  src={rev.reviewer.avatarUrl}
                                  alt={rev.reviewer.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{initials}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                  {rev.reviewer?.name}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary dark:bg-secondary/50 text-primary border border-border dark:border-border">
                                  {t('propertyDetail.verifiedTenant')}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {new Date(rev.createdAt).toLocaleDateString(
                                  locale === 'en' ? 'en-US' : 'id-ID',
                                  {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  }
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Right: Stars & Delete Button */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200 dark:text-slate-700'
                                  }`}
                                />
                              ))}
                            </div>

                            {isAuthor && (
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev.id)}
                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-primary600 hover:bg-primary/9050 dark:hover:bg-primary/90950/40 flex items-center justify-center transition-colors cursor-pointer"
                                title={t('propertyDetail.deleteReview')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Room Info Badge if reviewed for specific room */}
                        {rev.roomNumber && (
                          <div className="mt-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-border/40">
                              <DoorClosed className="w-3.5 h-3.5 text-primary" />
                              <span>
                                {t('rooms.roomNumber', {
                                  number: rev.roomNumber,
                                })}
                                {rev.roomType ? ` (${rev.roomType})` : ''}
                              </span>
                            </span>
                          </div>
                        )}

                        {/* Comment Content */}
                        <p className="mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {rev.comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SIDEBAR FILTERS & SUPPORT (Matches Reference Image) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* Card 1: Filter Pencarian */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border/60 p-5 shadow-2xs space-y-5">
            {/* Header: Filter Pencarian + Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border/60">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-foreground text-sm">
                <SlidersHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span>{t('propertyDetail.searchFilter')}</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-primary hover:text-primary hover:underline cursor-pointer"
              >
                {t('propertyDetail.reset')}
              </button>
            </div>

            {/* Section 1: Tipe Kamar Checkboxes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('propertyDetail.filterRoomType')}
              </h4>
              <div className="space-y-2">
                {['Standar', 'Deluxe'].map((rType) => {
                  const isChecked = selectedTypes.includes(rType);
                  return (
                    <label
                      key={rType}
                      className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTypes((prev) => [...prev, rType]);
                          } else {
                            setSelectedTypes((prev) => prev.filter((t) => t !== rType));
                          }
                        }}
                      />
                      <span>{rType}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Harga (Price Range Slider) */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-border/60">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('propertyDetail.filterPrice')}
                </h4>
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {formatRupiah(priceRange[0])} – {formatRupiah(priceRange[1])}
              </p>
              <div className="pt-2">
                <Slider
                  min={500000}
                  max={2500000}
                  step={50000}
                  value={priceRange}
                  onValueChange={(val: any) => setPriceRange([val[0], val[1]])}
                  className="w-full"
                />
              </div>
            </div>

            {/* Section 3: Fasilitas Checkboxes */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-border/60">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('propertyDetail.filterFacilities')}
              </h4>
              <div className="space-y-2">
                {[
                  { id: 'AC', label: t('propertyDetail.facilityAC') },
                  { id: 'WiFi', label: t('propertyDetail.facilityWifi') },
                  { id: 'Kamar Mandi Dalam', label: t('propertyDetail.facilityBathroomInside') },
                  { id: 'Meja Belajar', label: t('propertyDetail.facilityStudyDesk') },
                  { id: 'Lemari', label: t('propertyDetail.facilityWardrobe') },
                ].map((fac) => {
                  const isChecked = selectedFacilities.includes(fac.id);
                  return (
                    <label
                      key={fac.id}
                      className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFacilities((prev) => [...prev, fac.id]);
                          } else {
                            setSelectedFacilities((prev) => prev.filter((f) => f !== fac.id));
                          }
                        }}
                      />
                      <span>{fac.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bottom Highlight Box: 12 kamar tersedia */}
            <div className="pt-2">
              <div className="bg-primary/80 dark:bg-secondary/40 rounded-xl p-3 flex items-center gap-3 border border-border dark:border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <DoorClosed className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-primary">
                  {t('propertyDetail.roomsAvailableCount', { count: availableRoomsCount })}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Butuh Bantuan? */}
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border/60 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {t('propertyDetail.needHelp')}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                  {t('propertyDetail.helpSubtitle')}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsContactModalOpen(true)}
              className="w-full h-9 rounded-xl border-border dark:border-border text-primary hover:bg-primary/60 dark:hover:bg-secondary/40 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{t('propertyDetail.contactUs')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 4. MODAL: LIHAT DETAIL KAMAR */}
      {selectedRoomDetail && (
        <Dialog open={!!selectedRoomDetail} onOpenChange={() => setSelectedRoomDetail(null)}>
          <DialogContent className="max-w-lg rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {t('propertyDetail.modalRoomDetailTitle', { roomNumber: selectedRoomDetail.roomNumber })}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {property.name} • Lantai {selectedRoomDetail.floor}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                {selectedRoomDetail.photos && selectedRoomDetail.photos[0] ? (
                  <img
                    src={selectedRoomDetail.photos[0]}
                    alt={selectedRoomDetail.roomNumber}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/60 text-slate-400">
                    <DoorClosed className="w-10 h-10 stroke-[1.5] text-slate-300 dark:text-slate-600 mb-1" />
                    <span className="text-[11px] font-medium">{t('propertyDetail.noPhotos')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-500">{t('propertyDetail.roomPrice')}</span>
                  <p className="text-base font-extrabold text-primary">
                    {formatRupiah(Number(selectedRoomDetail.price ?? selectedRoomDetail.monthlyPrice ?? 0))}{' '}
                    <span className="text-xs font-normal text-slate-500">{t('propertyDetail.perMonth')}</span>
                  </p>
                </div>
                <Badge
                  variant={selectedRoomDetail.status === 'AVAILABLE' ? 'default' : 'secondary'}
                  className={
                    selectedRoomDetail.status === 'AVAILABLE'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }
                >
                  {selectedRoomDetail.status === 'AVAILABLE'
                    ? t('propertyDetail.statusAvailable')
                    : t('propertyDetail.statusOccupied')}
                </Badge>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                  {t('propertyDetail.roomFacilities')}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  {selectedRoomDetail.facilities && selectedRoomDetail.facilities.length > 0 ? (
                    selectedRoomDetail.facilities.map((fac, idx) => {
                      const FacIcon = getFacilityIcon(fac);
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <FacIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{fac}</span>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Air Conditioner (AC)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Free Wi-Fi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Meja & Kursi Belajar</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Lemari Pakaian</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {selectedRoomDetail.status === 'AVAILABLE' && (
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setSelectedRoomRent(selectedRoomDetail);
                      setSelectedRoomDetail(null);
                    }}
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
                  >
                    {t('propertyDetail.rentNow')}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 5. MODAL: SEWA SEKARANG */}
      {selectedRoomRent && (
        <Dialog open={!!selectedRoomRent} onOpenChange={() => setSelectedRoomRent(null)}>
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {t('propertyDetail.modalRentTitle', { roomNumber: selectedRoomRent.roomNumber })}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {t('propertyDetail.modalRentDesc')}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRentalSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('propertyDetail.startDateLabel')}
                </label>
                <div className="mt-1.5">
                  <DatePicker
                    value={rentStartDate}
                    onChange={(val) => setRentStartDate(val)}
                    placeholder={t('propertyDetail.startDateLabel')}
                    clearLabel={t('common.clear', { defaultValue: 'Clear' })}
                    todayLabel={t('common.today', { defaultValue: 'Today' })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('propertyDetail.durationLabel')}
                </label>
                <select
                  value={rentDuration}
                  onChange={(e) => setRentDuration(Number(e.target.value))}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs sm:text-sm"
                >
                  <option value={1}>{t('propertyDetail.durationMonth', { count: 1 })}</option>
                  <option value={3}>{t('propertyDetail.durationMonth', { count: 3 })}</option>
                  <option value={6}>{t('propertyDetail.durationMonth', { count: 6 })}</option>
                  <option value={12}>{t('propertyDetail.durationMonth', { count: 12 })}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('propertyDetail.tenantNameLabel')}
                </label>
                <Input
                  type="text"
                  required
                  placeholder={t('propertyDetail.tenantNamePlaceholder')}
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="mt-1.5 h-10 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('propertyDetail.tenantPhoneLabel')}
                </label>
                <Input
                  type="tel"
                  required
                  placeholder={t('propertyDetail.tenantPhonePlaceholder')}
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  className="mt-1.5 h-10 rounded-xl"
                />
              </div>

              <div className="p-3.5 bg-primary/70 dark:bg-secondary/40 border border-border dark:border-border rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-primary font-medium">
                    {t('propertyDetail.estimatedTotal')}
                  </span>
                  <p className="text-base font-extrabold text-primary">
                    {formatRupiah(
                      Number(selectedRoomRent.price ?? selectedRoomRent.monthlyPrice ?? 0) * rentDuration
                    )}
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {rentDuration} x {formatRupiah(Number(selectedRoomRent.price ?? selectedRoomRent.monthlyPrice ?? 0))}
                </span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRoomRent(null)}
                  className="flex-1 rounded-xl h-10 cursor-pointer"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingRent}
                  className="flex-1 rounded-xl h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
                >
                  {isSubmittingRent ? t('common.saving') : t('propertyDetail.submitRentBtn')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 6. MODAL: HUBUNGI KAMI */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="max-w-sm rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-3">
            <PhoneCall className="w-6 h-6" />
          </div>
          <DialogTitle className="text-base font-bold">
            {t('propertyDetail.contactPromptTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            {t('propertyDetail.contactPromptDesc')}
          </DialogDescription>

          <div className="pt-4 space-y-2.5">
            <Button
              asChild
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
            >
              <a
                href={`https://wa.me/${(property.contactInfo || '6281234567890').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Halo, saya ingin menanyakan ketersediaan kamar di ${property.name}.`
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                {t('propertyDetail.contactViaWhatsapp')}
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsContactModalOpen(false)}
              className="w-full rounded-xl cursor-pointer"
            >
              {t('common.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 7. FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={lightboxImages}
          title={lightboxTitle}
        />
      )}

      {/* 8. MODAL: TULIS ULASAN */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold">
              {t('propertyDetail.writeReviewTitle')}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {t('propertyDetail.writeReviewDesc')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
            {/* Rating Stars Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {t('propertyDetail.ratingLabel')} *
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setReviewHoverRating(star)}
                    onMouseLeave={() => setReviewHoverRating(0)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (reviewHoverRating || reviewRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">
                  {reviewRating === 5 && 'Sangat Puas ⭐⭐⭐⭐⭐'}
                  {reviewRating === 4 && 'Puas ⭐⭐⭐⭐'}
                  {reviewRating === 3 && 'Cukup ⭐⭐⭐'}
                  {reviewRating === 2 && 'Kurang ⭐⭐'}
                  {reviewRating === 1 && 'Sangat Buruk ⭐'}
                </span>
              </div>
            </div>

            {/* Optional Room Selection */}
            {rooms.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t('propertyDetail.reviewRoomOptional')}
                </label>
                <Select value={reviewRoomId} onValueChange={setReviewRoomId}>
                  <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border text-xs">
                    <SelectValue
                      placeholder={t('propertyDetail.reviewRoomPlaceholder')}
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-56">
                    <SelectItem value="NONE">
                      {t('propertyDetail.reviewRoomPlaceholder')}
                    </SelectItem>
                    {rooms.map((rm) => (
                      <SelectItem key={rm.id} value={rm.id}>
                        {t('rooms.roomNumber', { number: rm.roomNumber })} (
                        {rm.roomType || rm.type || 'Standard'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Comment Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('propertyDetail.commentLabel')}
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {reviewComment.length}/1000
                </span>
              </div>
              <Textarea
                rows={4}
                required
                maxLength={1000}
                placeholder={t('propertyDetail.commentPlaceholder')}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="rounded-xl resize-none text-xs sm:text-sm bg-white dark:bg-card border-slate-200 dark:border-border focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReviewModalOpen(false)}
                className="rounded-xl text-xs font-semibold h-10 px-4 cursor-pointer"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingReview || !reviewComment.trim()}
                className="rounded-xl text-xs font-semibold h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
              >
                {isSubmittingReview
                  ? t('propertyDetail.submittingReview')
                  : t('propertyDetail.submitReview')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
