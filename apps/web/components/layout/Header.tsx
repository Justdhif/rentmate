'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Bell, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Dashboard',
  subtitle,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Notification indicator */}
        <button
          className="relative p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          title="Notifikasi"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile info */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
            {user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'O'}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <p className="font-semibold text-gray-800 line-clamp-1">
              {user?.profile?.fullName || user?.email || 'Owner'}
            </p>
            <span className="inline-block px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded text-[10px] font-medium uppercase">
              {user?.role || 'OWNER'}
            </span>
          </div>

          <button
            onClick={() => logout()}
            className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors ml-2"
            title="Keluar (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
