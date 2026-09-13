'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  UploadCloud,
  Plus,
  Trash2,
  Star,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Link as LinkIcon,
  Sparkles,
  Check,
  Building2,
  BedDouble,
  Image as ImageIcon,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export interface ImagePreset {
  label: string;
  url: string;
  category?: string;
}

export const PROPERTY_PHOTO_PRESETS: ImagePreset[] = [
  {
    label: 'Tampak Depan Gedung Modern',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    category: 'Eksterior',
  },
  {
    label: 'Lobi & Area Resepsionis',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
    category: 'Interior',
  },
  {
    label: 'Area Parkir & Taman',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    category: 'Fasilitas',
  },
  {
    label: 'Dapur & Ruang Santai Bersama',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
    category: 'Fasilitas',
  },
];

export const ROOM_PHOTO_PRESETS: ImagePreset[] = [
  {
    label: 'Kamar Minimalis Modern',
    url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
    category: 'Kamar',
  },
  {
    label: 'Deluxe Bed & Meja Kerja',
    url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
    category: 'Kamar',
  },
  {
    label: 'Kamar Mandi Dalam Bersih',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
    category: 'Kamar Mandi',
  },
  {
    label: 'Kamar dengan Jendela & Balkon',
    url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
    category: 'Kamar',
  },
];

/**
 * Compresses an image file locally using an offscreen canvas
 */
export async function compressImageFile(file: File, maxWidth = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Reusable Fullscreen Lightbox Modal (Google Maps Style Photo Viewer)
 */
export const ImageLightboxModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}> = ({ isOpen, onClose, images, initialIndex = 0, title }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-slate-950/95 text-white border-slate-800 shadow-2xl backdrop-blur-md">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white truncate max-w-md">
                {title || 'Galeri Foto'}
              </h4>
              <p className="text-xs text-slate-400">
                Foto {currentIndex + 1} dari {images.length}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full h-8 w-8 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Stage */}
        <div className="relative flex items-center justify-center p-4 sm:p-8 min-h-[420px] max-h-[70vh] bg-black/40 select-none">
          <img
            src={currentImg}
            alt={`Foto ${currentIndex + 1}`}
            className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-200"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg border border-slate-700/60 transition-all hover:scale-110 cursor-pointer"
                title="Foto Sebelumnya (Panah Kiri)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg border border-slate-700/60 transition-all hover:scale-110 cursor-pointer"
                title="Foto Berikutnya (Panah Kanan)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {images.length > 1 && (
          <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/80 overflow-x-auto flex items-center gap-2.5 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-105 opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-indigo-600/90 text-[8px] font-bold text-white text-center py-0.5">
                    Cover
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Allowed file types & max file size limit (5MB per image file)
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FILE_SIZE_MB = 5;

/**
 * Modal Dialog for Managing & Uploading Photos
 */
export const PhotoUploadDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialPhotos: string[];
  onSave: (savedPhotos: string[]) => void;
  type?: 'property' | 'room';
  maxImages?: number;
}> = ({
  isOpen,
  onClose,
  initialPhotos = [],
  onSave,
  type = 'property',
  maxImages = 10,
}) => {
  // Temporary state inside modal
  const [draftPhotos, setDraftPhotos] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbContainerRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (idx: number) => {
    if (!thumbContainerRef.current) return;
    const container = thumbContainerRef.current;
    const items = container.querySelectorAll<HTMLElement>('.group\\/thumb');
    if (items[idx]) {
      items[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const handlePrevPhoto = () => {
    if (draftPhotos.length === 0) return;
    const nextIdx = (selectedIdx - 1 + draftPhotos.length) % draftPhotos.length;
    setSelectedIdx(nextIdx);
    scrollToIndex(nextIdx);
  };

  const handleNextPhoto = () => {
    if (draftPhotos.length === 0) return;
    const nextIdx = (selectedIdx + 1) % draftPhotos.length;
    setSelectedIdx(nextIdx);
    scrollToIndex(nextIdx);
  };

  // Sync draft state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftPhotos([...initialPhotos]);
      setSelectedIdx(0);
    }
  }, [isOpen, initialPhotos]);

  useEffect(() => {
    if (selectedIdx >= draftPhotos.length && draftPhotos.length > 0) {
      setSelectedIdx(draftPhotos.length - 1);
    }
  }, [draftPhotos.length, selectedIdx]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (draftPhotos.length >= maxImages) {
      toast.error(`Kapasitas penuh! Maksimal ${maxImages} foto diperbolehkan.`);
      return;
    }

    if (draftPhotos.length + files.length > maxImages) {
      toast.warning(`Hanya ${maxImages - draftPhotos.length} foto pertama yang akan diproses karena batas maksimal ${maxImages} foto.`);
    }

    setIsUploading(true);
    const newPhotos: string[] = [];

    try {
      const allowedFiles = Array.from(files).slice(0, maxImages - draftPhotos.length);
      for (const file of allowedFiles) {
        // 1. Validate file extension
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
        const isValidExt = ALLOWED_EXTENSIONS.includes(fileExt);
        const isValidMime = ALLOWED_MIME_TYPES.includes(file.type);

        if (!isValidExt || !isValidMime) {
          toast.error(
            `File "${file.name}" ditolak! Format tidak didukung. Harap gunakan format: JPG, JPEG, PNG, atau WEBP.`
          );
          continue;
        }

        // 2. Validate maximum file size (5MB)
        if (file.size > MAX_FILE_SIZE_BYTES) {
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
          toast.error(
            `File "${file.name}" (${fileSizeMB}MB) terlalu besar! Ukuran maksimal per file adalah ${MAX_FILE_SIZE_MB}MB.`
          );
          continue;
        }

        // 3. Compress & convert to DataURL
        const dataUrl = await compressImageFile(file);
        newPhotos.push(dataUrl);
      }

      if (newPhotos.length > 0) {
        setDraftPhotos((prev) => [...prev, ...newPhotos]);
        toast.success(`${newPhotos.length} foto berhasil ditambahkan!`);
      }
    } catch (err: any) {
      toast.error('Gagal memproses gambar: ' + (err.message || 'Kesalahan format'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (index: number) => {
    setDraftPhotos((prev) => prev.filter((_, idx) => idx !== index));
    if (selectedIdx >= draftPhotos.length - 1) {
      setSelectedIdx(Math.max(0, draftPhotos.length - 2));
    }
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = draftPhotos[index];
    const rest = draftPhotos.filter((_, idx) => idx !== index);
    setDraftPhotos([target, ...rest]);
    setSelectedIdx(0);
    toast.success('Foto terpilih dijadikan sebagai Foto Utama (Cover)!');
  };

  const handleApply = () => {
    onSave(draftPhotos);
    onClose();
    toast.success(`${draftPhotos.length} foto tersimpan ke form properti.`);
  };

  const currentPreview = draftPhotos[selectedIdx] || draftPhotos[0];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-card border-gray-200 dark:border-border shadow-2xl rounded-2xl flex flex-col max-h-[90vh]">
        {/* Header - Bersih tanpa duplicate badge */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-border/60 bg-gray-50/50 dark:bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-foreground">
                {type === 'room' ? 'Unggah Foto Kamar' : 'Unggah Foto Properti'}
              </DialogTitle>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">
                Format: JPG, PNG, WEBP (Maks {MAX_FILE_SIZE_MB}MB per foto). Foto pertama menjadi Cover utama.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Main Hero Preview Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`relative w-full aspect-video sm:aspect-[16/9] max-h-[300px] rounded-2xl overflow-hidden border transition-all duration-300 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/20 ring-4 ring-indigo-500/20 scale-[0.99]'
                : 'border-gray-200 dark:border-border bg-slate-900/5 dark:bg-slate-950'
            } shadow-sm group`}
          >
            {draftPhotos.length > 0 ? (
              <>
                <img
                  src={currentPreview}
                  alt="Pratinjau Foto"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40 pointer-events-none" />

                {/* Top overlay buttons */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    {selectedIdx === 0 ? (
                      <Badge className="bg-amber-500 text-white font-semibold flex items-center gap-1 text-[11px] px-2.5 py-0.5 shadow-md">
                        <Star className="w-3 h-3 fill-white" />
                        Foto Utama (Cover)
                      </Badge>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetCover(selectedIdx)}
                        className="h-7 text-xs rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md cursor-pointer gap-1.5"
                      >
                        <Star className="w-3 h-3" />
                        Jadikan Cover
                      </Button>
                    )}
                    <span className="text-[11px] font-medium text-white/90 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                      {selectedIdx + 1} dari {draftPhotos.length}
                    </span>
                  </div>

                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDeletePhoto(selectedIdx)}
                    className="h-8 w-8 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white border border-rose-400/30 backdrop-blur-md cursor-pointer"
                    title="Hapus foto ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Left / Right arrows */}
                {draftPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all z-10 cursor-pointer shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all z-10 cursor-pointer shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              /* Empty dropzone state: Click anywhere to upload */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center h-full p-6 text-center cursor-pointer hover:bg-indigo-50/10 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-xs border border-indigo-100 dark:border-indigo-500/20">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-foreground">
                  Pilih atau Tarik File Foto ke Sini
                </h4>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1 max-w-sm">
                  Klik area ini atau tombol di bawah untuk memilih file foto (JPG, PNG, WEBP).
                </p>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Action Row: 1 Focused Primary Button & 1 Info Badge */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={draftPhotos.length >= maxImages || isUploading}
              className="h-10 px-5 text-xs rounded-xl gap-2 font-semibold shadow-xs cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Memproses Foto...' : 'Pilih File Gambar'}</span>
            </Button>

            <Badge
              variant="outline"
              className="text-xs font-semibold px-3 py-1.5 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800"
            >
              {draftPhotos.length} / {maxImages} Foto Terpilih
            </Badge>
          </div>

          {/* Thumbnails Row With Chevron Scroll Controls */}
          {draftPhotos.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-gray-700 dark:text-muted-foreground uppercase tracking-wider">
                Daftar Thumbnail Foto
              </span>
              <div className="relative flex items-center gap-1.5">
                {/* Left Chevron Button */}
                {draftPhotos.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs transition-all hover:scale-105 cursor-pointer"
                    title="Foto Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {/* Scrollable Thumbnails List */}
                <div
                  ref={thumbContainerRef}
                  onWheel={(e) => {
                    if (e.deltaY !== 0) {
                      e.currentTarget.scrollLeft += e.deltaY;
                    }
                  }}
                  className="flex-1 flex items-center gap-2 overflow-x-auto px-1 py-1 no-scrollbar scroll-smooth"
                >
                  {draftPhotos.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedIdx(idx);
                        scrollToIndex(idx);
                      }}
                      className={`group/thumb relative w-18 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer shadow-xs ${
                        selectedIdx === idx
                          ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-105'
                          : 'border-gray-200 dark:border-border hover:border-indigo-300 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-0.5 left-0.5 bg-amber-500 text-white text-[8px] font-bold px-1 py-0.2 rounded shadow-xs">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(idx);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
                        title="Hapus foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Right Chevron Button */}
                {draftPhotos.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs transition-all hover:scale-105 cursor-pointer"
                    title="Foto Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 dark:border-border/60 bg-gray-50/50 dark:bg-muted/20">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-xl text-xs cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="rounded-xl px-5 text-xs font-semibold shadow-xs cursor-pointer"
          >
            Simpan {draftPhotos.length > 0 ? `(${draftPhotos.length} Foto)` : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ImageGalleryUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  type?: 'property' | 'room';
  title?: string;
  description?: string;
  maxImages?: number;
  storageKey?: string;
}

/**
 * Clean In-Page Photo Preview & Gallery Widget
 * Displays only current photos with a clear "Unggah Foto" action button that opens PhotoUploadDialog.
 */
export const ImageGalleryUploader: React.FC<ImageGalleryUploaderProps> = ({
  images = [],
  onChange,
  type = 'property',
  title,
  description,
  maxImages = 10,
  storageKey,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const thumbContainerRef = useRef<HTMLDivElement>(null);

  // Restore photos from localStorage on initial mount if storageKey is provided and images is empty
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && images.length === 0) {
          onChange(parsed);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [storageKey]);

  // Ensure selected index is always valid
  useEffect(() => {
    if (selectedIdx >= images.length && images.length > 0) {
      setSelectedIdx(images.length - 1);
    }
  }, [images.length, selectedIdx]);

  const scrollToIndex = (index: number) => {
    if (thumbContainerRef.current) {
      const container = thumbContainerRef.current;
      const targetItem = container.children[index] as HTMLElement;
      if (targetItem) {
        targetItem.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  };

  const handlePrevPhoto = () => {
    if (images.length <= 1) return;
    const newIdx = (selectedIdx - 1 + images.length) % images.length;
    setSelectedIdx(newIdx);
    scrollToIndex(newIdx);
  };

  const handleNextPhoto = () => {
    if (images.length <= 1) return;
    const newIdx = (selectedIdx + 1) % images.length;
    setSelectedIdx(newIdx);
    scrollToIndex(newIdx);
  };

  const currentPreview = images[selectedIdx] || images[0];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Title & Badge Only */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            {type === 'room' ? (
              <BedDouble className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            )}
            {title || (type === 'room' ? 'Foto & Pratinjau Kamar' : 'Foto & Galeri Properti')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">
            {description || 'Pratinjau foto properti. Foto pertama otomatis menjadi cover utama.'}
          </p>
        </div>

        <Badge
          variant="outline"
          className="text-xs font-semibold bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800 shrink-0"
        >
          {images.length} / {maxImages} Foto
        </Badge>
      </div>

      {/* Main Preview Container (Clean Google Maps Style View) */}
      <div className="relative w-full aspect-video sm:aspect-[16/9] rounded-2xl overflow-hidden border border-gray-200 dark:border-border bg-slate-900/5 dark:bg-slate-950 shadow-sm group">
        {images.length > 0 ? (
          <>
            {/* Display Image */}
            <img
              src={currentPreview}
              alt="Pratinjau Properti"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40 pointer-events-none" />

            {/* Top Bar Overlay */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                {selectedIdx === 0 ? (
                  <Badge className="bg-amber-500/95 text-white font-semibold shadow-md flex items-center gap-1 text-[11px] px-2.5 py-0.5 backdrop-blur-xs">
                    <Star className="w-3 h-3 fill-white" />
                    Foto Utama (Cover)
                  </Badge>
                ) : (
                  <span className="text-[11px] font-medium text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10">
                    Foto ke-{selectedIdx + 1}
                  </span>
                )}
                <span className="text-[11px] font-medium text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10">
                  {selectedIdx + 1} dari {images.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={() => setIsLightboxOpen(true)}
                  className="h-8 w-8 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md cursor-pointer"
                  title="Lihat Layar Penuh"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Bottom Info Bar Overlay */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-xs z-10 pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-500/80 backdrop-blur-md flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold tracking-wide drop-shadow-md">
                  Google Maps Photo Preview
                </span>
              </div>
              <span className="text-[11px] text-white/80 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
                Foto terpilih
              </span>
            </div>
          </>
        ) : (
          /* Clean Empty Placeholder */
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-xs border border-indigo-100 dark:border-indigo-500/20">
              <Camera className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-foreground">
              Belum Ada Foto Terpilih
            </h4>
            <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1 max-w-xs">
              Foto belum ditambahkan. Gunakan tombol di bawah untuk mengunggah atau mengelola galeri foto.
            </p>
          </div>
        )}
      </div>

      {/* Thumbnails Row With Chevron Scroll Controls */}
      {images.length > 0 && (
        <div className="relative flex items-center gap-2 pt-0.5">
          {/* Left Chevron Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="w-8 h-8 rounded-xl bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs transition-all hover:scale-105 cursor-pointer"
              title="Foto Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable Thumbnails List */}
          <div
            ref={thumbContainerRef}
            className="flex-1 flex items-center gap-2.5 overflow-x-auto px-1 py-1 no-scrollbar scroll-smooth"
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedIdx(idx);
                  scrollToIndex(idx);
                }}
                className={`group/thumb relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer shadow-xs ${
                  selectedIdx === idx
                    ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-105'
                    : 'border-gray-200 dark:border-border hover:border-indigo-300 opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.2 rounded shadow-xs">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Right Chevron Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handleNextPhoto}
              className="w-8 h-8 rounded-xl bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs transition-all hover:scale-105 cursor-pointer"
              title="Foto Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Bottom Action Area (Fokus di Bawah Mengisi Space Kosong) */}
      <div className="pt-2 mt-auto">
        <Button
          type="button"
          onClick={() => setIsUploadDialogOpen(true)}
          className="w-full h-11 rounded-xl gap-2 font-semibold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{images.length > 0 ? `Kelola / Tambah Foto (${images.length}/${maxImages})` : 'Unggah Foto Properti'}</span>
        </Button>
        <p className="text-center text-[11px] text-gray-400 dark:text-muted-foreground mt-2">
          Mendukung file gambar JPG, PNG, WEBP (Maksimal 5MB per foto)
        </p>
      </div>

      {/* Upload & Manage Modal Dialog */}
      <PhotoUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        initialPhotos={images}
        onSave={(savedPhotos) => {
          onChange(savedPhotos);
          if (storageKey && typeof window !== 'undefined') {
            try {
              if (savedPhotos.length > 0) {
                localStorage.setItem(storageKey, JSON.stringify(savedPhotos));
              } else {
                localStorage.removeItem(storageKey);
              }
            } catch (e) {
              console.warn('Failed to save photos to localStorage', e);
            }
          }
          if (selectedIdx >= savedPhotos.length) {
            setSelectedIdx(Math.max(0, savedPhotos.length - 1));
          }
        }}
        type={type}
        maxImages={maxImages}
      />

      {/* Fullscreen Lightbox Modal */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        initialIndex={selectedIdx}
        title={title || (type === 'room' ? 'Pratinjau Kamar' : 'Pratinjau Properti Kost')}
      />
    </div>
  );
};
