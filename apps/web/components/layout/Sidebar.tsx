'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  DoorClosed,
  Users,
  CreditCard,
  Wrench,
  BarChart3,
  Bot,
  Settings,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Rooms', href: '/rooms', icon: DoorClosed },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  {
    name: 'AI Assistant',
    href: '/ai-assistant',
    icon: Bot,
    badge: 'Smart',
  },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          R
        </div>
        <div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            RentMate
          </span>
          <span className="block text-[10px] uppercase font-semibold tracking-wider text-indigo-600">
            Owner Suite
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  <Sparkles className="w-2.5 h-2.5" />
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="p-4 border-t border-gray-100">
        <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/50 text-xs">
          <p className="font-semibold text-indigo-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            RentMate AI Active
          </p>
          <p className="text-gray-500 mt-1 leading-relaxed">
            Groq Llama 3.3 Engine aktif menganalisis data kost Anda.
          </p>
        </div>
      </div>
    </aside>
  );
};
