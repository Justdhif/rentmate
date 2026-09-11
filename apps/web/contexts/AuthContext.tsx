'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  api,
  setStoredTokens,
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
        localStorage.setItem('rentmate_user', JSON.stringify(res.data));
      }
    } catch {
      // Handled by apiRequest 401 interceptor
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
      if (savedToken) {
        setToken(savedToken);
        const savedUser = localStorage.getItem('rentmate_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            // invalid JSON
          }
        }
        await fetchCurrentUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser]);

  // Background Token Cycling:
  // 1. Cycle periodically every 15 minutes
  useEffect(() => {
    const CYCLE_INTERVAL_MS = 15 * 60 * 1000;
    const interval = setInterval(() => {
      if (getStoredToken() && getStoredRefreshToken()) {
        cycleTokens();
      }
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [cycleTokens]);

  // 2. Cycle when user refocuses the app / switches back to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (getStoredToken() && getStoredRefreshToken()) {
          cycleTokens();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [cycleTokens]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/login',
      { email, password },
    );

    if (res.success && res.data) {
      setStoredTokens(res.data.accessToken, res.data.refreshToken);
      localStorage.setItem('rentmate_user', JSON.stringify(res.data.user));
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
        localStorage.setItem('rentmate_user', JSON.stringify(res.data.user));
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
      localStorage.setItem('rentmate_user', JSON.stringify(res.data.user));
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