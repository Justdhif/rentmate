'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getStoredToken } from '@/lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface FavoritesContextType {
  favoritePropertyIds: Set<string>;
  favoriteRoomIds: Set<string>;
  isPropertyFavorite: (id: string) => boolean;
  isRoomFavorite: (id: string) => boolean;
  togglePropertyFavorite: (id: string, name?: string) => Promise<boolean>;
  toggleRoomFavorite: (id: string, name?: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favoritePropertyIds, setFavoritePropertyIds] = useState<Set<string>>(new Set());
  const [favoriteRoomIds, setFavoriteRoomIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavoriteIds = useCallback(async () => {
    if (!user || !getStoredToken()) {
      setFavoritePropertyIds(new Set());
      setFavoriteRoomIds(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.get('/favorites/ids');
      if (res?.success && res.data) {
        setFavoritePropertyIds(new Set(res.data.propertyIds || []));
        setFavoriteRoomIds(new Set(res.data.roomIds || []));
      }
    } catch {
      // Non-critical, fallback to empty
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavoriteIds();
  }, [fetchFavoriteIds]);

  const isPropertyFavorite = useCallback(
    (id: string) => favoritePropertyIds.has(id),
    [favoritePropertyIds]
  );

  const isRoomFavorite = useCallback(
    (id: string) => favoriteRoomIds.has(id),
    [favoriteRoomIds]
  );

  const togglePropertyFavorite = useCallback(
    async (id: string, name?: string): Promise<boolean> => {
      if (!user) {
        toast.error('Silakan login terlebih dahulu untuk menyimpan ke favorit');
        return false;
      }

      const wasFavorite = favoritePropertyIds.has(id);
      const nextState = !wasFavorite;

      // Optimistic update
      setFavoritePropertyIds((prev) => {
        const next = new Set(prev);
        if (nextState) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });

      try {
        const res = await api.post('/favorites/toggle', { propertyId: id });
        if (res?.success) {
          const title = name ? `"${name}"` : 'Properti';
          if (nextState) {
            toast.success(`${title} ditambahkan ke favorit`);
          } else {
            toast.info(`${title} dihapus dari favorit`);
          }
          return nextState;
        } else {
          throw new Error('Failed to toggle');
        }
      } catch (err: any) {
        // Rollback
        setFavoritePropertyIds((prev) => {
          const next = new Set(prev);
          if (wasFavorite) {
            next.add(id);
          } else {
            next.delete(id);
          }
          return next;
        });
        toast.error('Gagal memperbarui status favorit');
        return wasFavorite;
      }
    },
    [user, favoritePropertyIds]
  );

  const toggleRoomFavorite = useCallback(
    async (id: string, name?: string): Promise<boolean> => {
      if (!user) {
        toast.error('Silakan login terlebih dahulu untuk menyimpan ke favorit');
        return false;
      }

      const wasFavorite = favoriteRoomIds.has(id);
      const nextState = !wasFavorite;

      // Optimistic update
      setFavoriteRoomIds((prev) => {
        const next = new Set(prev);
        if (nextState) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });

      try {
        const res = await api.post('/favorites/toggle', { roomId: id });
        if (res?.success) {
          const title = name ? `Kamar ${name}` : 'Kamar';
          if (nextState) {
            toast.success(`${title} ditambahkan ke favorit`);
          } else {
            toast.info(`${title} dihapus dari favorit`);
          }
          return nextState;
        } else {
          throw new Error('Failed to toggle');
        }
      } catch (err: any) {
        // Rollback
        setFavoriteRoomIds((prev) => {
          const next = new Set(prev);
          if (wasFavorite) {
            next.add(id);
          } else {
            next.delete(id);
          }
          return next;
        });
        toast.error('Gagal memperbarui status favorit');
        return wasFavorite;
      }
    },
    [user, favoriteRoomIds]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoritePropertyIds,
        favoriteRoomIds,
        isPropertyFavorite,
        isRoomFavorite,
        togglePropertyFavorite,
        toggleRoomFavorite,
        refreshFavorites: fetchFavoriteIds,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
