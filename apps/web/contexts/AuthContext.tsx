'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, setStoredToken, clearStoredAuth, getStoredToken } from '@/lib/api';

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

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get<User>('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('rentmate_user', JSON.stringify(res.data));
      }
    } catch {
      clearStoredAuth();
      setUser(null);
      setToken(null);
    }
  };

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
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/login',
      { email, password },
    );

    if (res.success && res.data) {
      setStoredToken(res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem('rentmate_refresh_token', res.data.refreshToken);
      }
      localStorage.setItem('rentmate_user', JSON.stringify(res.data.user));
      setToken(res.data.accessToken);
      setUser(res.data.user);
      router.push('/dashboard');
    }
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
      setStoredToken(res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem('rentmate_refresh_token', res.data.refreshToken);
      }
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
        register,
        logout,
        refreshUser,
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
