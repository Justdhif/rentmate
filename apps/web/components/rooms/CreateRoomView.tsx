'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageGalleryUploader } from '@/components/common/ImageGalleryUploader';
import { api } from '@/lib/api';
import {
  Building2,
  DoorClosed,
  Layers,
  Banknote,
  Sparkles,
  Wind,
  Bath,
  Wifi,
  BedDouble,
  Laptop,
  Sun,
  Flame,
  Tv,
  Check,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/LanguageContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useAuth } from '@/contexts/AuthContext';

// Standard room facilities catalog with Lucide icons
const ROOM_FACILITIES = [
  { id: 'ac', name: 'AC', icon: Wind },
  { id: 'km_dalam', name: 'Kamar Mandi Dalam', icon: Bath },
  { id: 'km_luar', name: 'Kamar Mandi Luar', icon: Bath },
  { id: 'wifi', name: 'WiFi', icon: Wifi },
  { id: 'kasur', name: 'Kasur Springbed', icon: BedDouble },
  { id: 'lemari', name: 'Lemari Pakaian', icon: DoorClosed },
  { id: 'meja', name: 'Meja Kerja & Kursi', icon: Laptop },
  { id: 'jendela', name: 'Jendela Luar / Ventilasi', icon: Sun },
  { id: 'water_heater', name: 'Water Heater', icon: Flame },
  { id: 'tv', name: 'Smart TV', icon: Tv },
];

function CreateRoomContent() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const confirm = useConfirm();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const defaultPropertyId = searchParams.get('propertyId') || '';

  // Properties list
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoadingProps, setIsLoadingProps] = useState(true);

  // Form states
  const [propertyId, setPropertyId] = useState(defaultPropertyId);
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState<number>(1);
  const [type, setType] = useState('DELUXE');
  const [dimension, setDimension] = useState('3.5 x 3 m');
  const [status, setStatus] = useState<'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'>('AVAILABLE');
  const [monthlyPrice, setMonthlyPrice] = useState<number>(1500000);
  const [dailyPrice, setDailyPrice] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([
    'AC',
    'Kamar Mandi Dalam',
    'WiFi',
    'Kasur Springbed',
  ]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoadingProps(true);
        const res = await api.get<any[]>('/properties');
        if (res.success && res.data) {
          setProperties(res.data);
          if (!propertyId && res.data.length > 0) {
            setPropertyId(defaultPropertyId || res.data[0].id);
          }
        }
      } catch (err: any) {
        console.warn('Gagal memuat properti:', err?.message || err);
      } finally {
        setIsLoadingProps(false);
      }
    };

    if (user) {
      fetchProperties();
    }
  }, [user, defaultPropertyId]);

  // Dirty state tracking for navigation safety
  const isDirty = useMemo(() => {
    return (
      roomNumber.trim() !== '' ||
      photos.length > 0 ||
      selectedFacilities.length > 4 ||
      monthlyPrice !== 1500000 ||
      description.trim() !== ''
    );
  }, [roomNumber, photos, selectedFacilities, monthlyPrice, description]);

  const handleCancel = async () => {
    if (isDirty) {
      const confirmed = await confirm.discard({
        title: t('rooms.discardConfirmTitle'),
        description: t('rooms.discardConfirmDesc'),
        confirmText: t('common.confirmDiscardButton'),
        cancelText: t('common.cancel'),
      });
      if (!confirmed) return;
    }

    if (defaultPropertyId) {
      router.push(`/properties/${defaultPropertyId}`);
    } else {
      router.push('/rooms');
    }
  };

  const handleToggleFacility = (name: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  };

  const formatRupiah = (amount: number) => {
    return 'Rp ' + amount.toLocaleString(locale === 'en' ? 'en-US' : 'id-ID');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!propertyId) {
      setErrorMsg(t('rooms.warningNoProperty'));
      toast.warning(t('rooms.warningNoProperty'));
      return;
    }

    if (!roomNumber.trim()) {
      setErrorMsg(t('rooms.modalRoomNumberPlaceholder'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        propertyId,
        roomNumber: roomNumber.trim(),
        floor: Number(floor) || 1,
        type: type.toUpperCase(),
        monthlyPrice: Number(monthlyPrice) || 0,
        dailyPrice: Number(dailyPrice) || 0,
        deposit: Number(deposit) || 0,
        dimension: dimension.trim(),
        status,
        description: description.trim(),
        photos,
        facilities: selectedFacilities,
      };

      const res = await api.post('/rooms', payload);
      if (res.success) {
        setSuccessMsg(t('rooms.createSuccess', { roomNumber }));
        toast.success(t('rooms.createSuccess', { roomNumber }));

        // Clear local storage draft if any
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rentmate_create_room_photos');
        }

        setTimeout(() => {
          if (defaultPropertyId) {
            router.push(`/properties/${defaultPropertyId}`);
          } else {
            router.push('/rooms');
          }
        }, 1200);
      }
    } catch (err: any) {
      const msg = err.message || t('rooms.createFailed');
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
        {/* Header with back button & breadcrumbs */}
        <PageHeader
          onBack={handleCancel}
          showBackButton
          title={t('rooms.createTitle')}
          description={t('rooms.createDesc')}
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
          {/* Top Row: Basic Info & Photo Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (6 cols): Informasi Spesifikasi Kamar */}
            <div className="lg:col-span-6 space-y-6">
              <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-border/60">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <DoorClosed className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                        {t('rooms.specSectionTitle')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-muted-foreground">
                        {t('rooms.specSectionDesc')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Gedung Properti Kost */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                        {t('rooms.propertyLabel')} *
                      </label>
                      <Select
                        value={propertyId}
                        onValueChange={(val) => setPropertyId(val)}
                        disabled={isLoadingProps}
                      >
                        <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50/80 dark:bg-card border-slate-200 dark:border-border text-slate-900 dark:text-foreground">
                          <div className="flex items-center gap-2 truncate">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <SelectValue
                              placeholder={
                                isLoadingProps
                                  ? t('properties.loadingDatabase')
                                  : t('rooms.modalPropertyPlaceholder')
                              }
                            />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} {p.city ? `(${p.city})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Nomor Kamar & Lantai */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                          {t('rooms.roomNumberLabel')} *
                        </label>
                        <Input
                          type="text"
                          required
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          placeholder={t('rooms.roomNumberPlaceholder')}
                          className="h-11 rounded-xl bg-slate-50/80 dark:bg-card border-slate-200 dark:border-border text-slate-900 dark:text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                          {t('rooms.floorLabel')} *
                        </label>
                        <div className="relative">
                          <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 z-10 pointer-events-none" />
                          <Input
                            type="number"
                            min={1}
                            max={50}
                            required
                            value={floor}
                            onChange={(e) => setFloor(Number(e.target.value))}
                            className="pl-10 h-11 rounded-xl bg-slate-50/80 dark:bg-card border-slate-200 dark:border-border text-slate-900 dark:text-foreground"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tipe Kamar & Ukuran / Dimensi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                          {t('rooms.typeLabel')} *
                        </label>
                        <Select value={type} onValueChange={(val) => setType(val)}>
                          <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50/80 dark:bg-card border-slate-200 dark:border-border text-slate-900 dark:text-foreground">
                            <SelectValue placeholder={t('rooms.modalTypePlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STANDARD">{t('rooms.roomTypeStandard')}</SelectItem>
                            <SelectItem value="DELUXE">{t('rooms.roomTypeDeluxe')}</SelectItem>
                            <SelectItem value="VIP">{t('rooms.roomTypeVip')}</SelectItem>
                            <SelectItem value="SUITE">Suite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                          {t('rooms.dimensionLabel')}
                        </label>
                        <Input
                          type="text"
                          value={dimension}
                          onChange={(e) => setDimension(e.target.value)}
                          placeholder={t('rooms.dimensionPlaceholder')}
                          className="h-11 rounded-xl bg-slate-50/80 dark:bg-card border-slate-200 dark:border-border text-slate-900 dark:text-foreground"
                        />
                      </div>
                    </div>

                    {/* Status Awal Kamar */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                        {t('rooms.initialStatusLabel')}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'AVAILABLE', label: t('rooms.statusAvailable'), color: 'emerald' },
                          { id: 'OCCUPIED', label: t('rooms.statusOccupied'), color: 'amber' },
                          { id: 'MAINTENANCE', label: t('rooms.statusMaintenance'), color: 'rose' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setStatus(s.id as any)}
                            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                              status === s.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-slate-50/80 dark:bg-muted/40 border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Tarif Sewa & Biaya */}
              <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-border/60">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                        {t('rooms.pricingSectionTitle')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-muted-foreground">
                        {t('rooms.pricingSectionDesc')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Harga Bulanan */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-foreground uppercase tracking-wider">
                          {t('rooms.monthlyPriceLabel')} *
                        </label>
                        <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                          {formatRupiah(monthlyPrice)} /bln
                        </span>
                      </div>
                      <Input
                        type="number"
                        min={100000}
                        step={50000}
                        required
                        value={monthlyPrice}
                        onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                        className="h-11 rounded-xl bg-slate-50/80 dark:bg-card border-slate-200 dark:border-border text-slate-900 dark:text-foreground"
                      />
                    </div>

                    {/* Harga Harian & Deposit */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                          {t('rooms.dailyPriceLabel')}
                        </label>
                        <Input
                          type="number"
                          min={0}
                          step={10000}
                          value={dailyPrice || ''}
                          onChange={(e) => setDailyPrice(Number(e.target.value))}
                          placeholder="0"
                          className="h-11 rounded-xl bg-slate-50/80 dark:bg-card border-slate-200 dark:border-border text-slate-900 dark:text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                          {t('rooms.depositLabel')}
                        </label>
                        <Input
                          type="number"
                          min={0}
                          step={50000}
                          value={deposit || ''}
                          onChange={(e) => setDeposit(Number(e.target.value))}
                          placeholder="0"
                          className="h-11 rounded-xl bg-slate-50/80 dark:bg-card border-slate-200 dark:border-border text-slate-900 dark:text-foreground"
                        />
                      </div>
                    </div>

                    {/* Deskripsi Kamar */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-foreground uppercase tracking-wider mb-1.5">
                        {t('rooms.roomDescLabel')}
                      </label>
                      <Textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('rooms.roomDescPlaceholder')}
                        className="w-full p-3 rounded-xl bg-slate-50/80 dark:bg-card border-slate-200 dark:border-border text-slate-900 dark:text-foreground resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (6 cols): Galeri Foto Kamar */}
            <div className="lg:col-span-6 space-y-6">
              <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card">
                <CardContent className="p-6">
                  <ImageGalleryUploader
                    images={photos}
                    onChange={setPhotos}
                    type="room"
                    title={t('rooms.photoSectionTitle')}
                    description={t('rooms.photoSectionDesc')}
                    storageKey="rentmate_create_room_photos"
                  />
                </CardContent>
              </Card>

              {/* Fasilitas Kamar */}
              <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-border/60">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                        {t('rooms.facilitiesSectionTitle')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-muted-foreground">
                        {t('rooms.facilitiesSectionDesc')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {ROOM_FACILITIES.map((facility) => {
                      const isSelected = selectedFacilities.includes(facility.name);
                      const IconComponent = facility.icon;
                      return (
                        <button
                          key={facility.id}
                          type="button"
                          onClick={() => handleToggleFacility(facility.name)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-600 text-blue-900 dark:text-blue-200 shadow-xs ring-1 ring-blue-500/30'
                              : 'bg-slate-50/60 dark:bg-card border-slate-200 dark:border-border text-slate-700 dark:text-muted-foreground hover:border-slate-300 hover:bg-slate-100/60'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-200/80 dark:bg-muted text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold truncate flex-1">
                            {facility.name}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="h-11 px-6 rounded-xl border-slate-200 dark:border-border text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
            >
              {t('rooms.btnCancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitting || isLoadingProps}
              className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('rooms.btnSaving')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t('rooms.btnSave')}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export const CreateRoomView: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreateRoomContent />
    </Suspense>
  );
};
