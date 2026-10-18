'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  api,
  setStoredTokens,
  setStoredUser,
  getStoredUser,
  clearStoredAuth,
  getStoredToken,
  getStoredRefreshToken,
  refreshTokensSilently,
} from '@/lib/api';

export interface UserProfile {
  id: string;
  fullName: string;
  username?: string;
  avatarUrl?: string;
  phoneNumber?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'TENANT' | 'TECHNICIAN';
  profile?: UserProfile;
}

export interface GoogleAuthResult {
  isNewUser: boolean;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  googleId?: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string, role?: 'OWNER' | 'TENANT') => Promise<GoogleAuthResult>;
  register: (fullName: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  cycleTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await api.get<User>('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
        setStoredUser(res.data);
      } else {
        setUser(null);
        setToken(null);
        clearStoredAuth();
      }
    } catch (err: any) {
      // Only clear credentials if backend explicitly confirms unauthorized session
      if (err?.statusCode === 401 || err?.status === 401) {
        setUser(null);
        setToken(null);
        clearStoredAuth();
      }
    }
  }, []);

  /**
   * Proactively cycles the access and refresh tokens in the background
   * (Sliding session / Endless token cycle)
   */
  const cycleTokens = useCallback(async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return;

    try {
      const res = await refreshTokensSilently();
      if (res.status === 'SUCCESS' && res.token) {
        setToken(res.token);
      }
    } catch {
      // Ignored for silent background execution
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getStoredToken();
      const savedUser = getStoredUser<User>();

      // Immediate hydration if local/cookie session exists
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        setIsLoading(false);
        // Validate / sync with backend in the background without blocking UI
        fetchCurrentUser();
        return;
      }

      if (savedToken) {
        setToken(savedToken);
        await fetchCurrentUser();
      }

      setIsLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser]);

  // Background Token Cycling:
  // Cycle periodically every 15 minutes if session active
  useEffect(() => {
    const CYCLE_INTERVAL_MS = 15 * 60 * 1000;
    const interval = setInterval(() => {
      if (getStoredToken() && getStoredRefreshToken()) {
        cycleTokens();
      }
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [cycleTokens]);

  // Cross-Tab Session Synchronization:
  // Instantly responds if user logs in or logs out from another browser tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rentmate_token') {
        if (!e.newValue) {
          // Token was removed/cleared in another tab -> sync logout immediately
          setUser(null);
          setToken(null);
          clearStoredAuth();
          if (
            typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/register')
          ) {
            router.push('/login');
          }
        } else {
          // Token updated in another tab -> sync state
          setToken(e.newValue);
          fetchCurrentUser();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchCurrentUser, router]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/login',
      { email, password },
    );

    if (res.success && res.data) {
      setStoredTokens(res.data.accessToken, res.data.refreshToken);
      setStoredUser(res.data.user);
      setToken(res.data.accessToken);
      setUser(res.data.user);
      router.push('/dashboard');
    }
  };

  const loginWithGoogle = async (
    idToken: string,
    role?: 'OWNER' | 'TENANT',
  ): Promise<GoogleAuthResult> => {
    const res = await api.post<GoogleAuthResult>('/auth/google', {
      idToken,
      role,
    });

    if (res.success && res.data) {
      if (res.data.isNewUser) {
        return res.data;
      }

      if (res.data.accessToken && res.data.user) {
        setStoredTokens(res.data.accessToken, res.data.refreshToken);
        setStoredUser(res.data.user);
        setToken(res.data.accessToken);
        setUser(res.data.user);
        router.push('/dashboard');
      }
      return res.data;
    }

    throw new Error(res.message || 'Autentikasi Google gagal');
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    role = 'OWNER',
  ) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/register',
      { fullName, email, password, role },
    );

    if (res.success && res.data) {
      setStoredTokens(res.data.accessToken, res.data.refreshToken);
      setStoredUser(res.data.user);
      setToken(res.data.accessToken);
      setUser(res.data.user);
      router.push('/dashboard');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      clearStoredAuth();
      setUser(null);
      setToken(null);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
        cycleTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}