'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  LogOut,
  ChevronUp,
  User,
} from 'lucide-react';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navSections = [
  {
    label: 'Utama',
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Properties', href: '/properties', icon: Building2 },
      { name: 'Rooms', href: '/rooms', icon: DoorClosed },
    ],
  },
  {
    label: 'Manajemen',
    items: [
      { name: 'Tenants', href: '/tenants', icon: Users },
      { name: 'Payments', href: '/payments', icon: CreditCard },
      { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    ],
  },
  {
    label: 'Kecerdasan',
    items: [
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      {
        name: 'AI Assistant',
        href: '/ai-assistant',
        icon: Bot,
        badge: 'Smart',
      },
    ],
  },
];

const bottomItems = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'O';
  const fullName = user?.profile?.fullName || 'Pemilik Kost';
  const email = user?.email || '';

  return (
    <ShadcnSidebar collapsible="icon" className="border-r border-slate-200/80 dark:border-border/60 bg-white dark:bg-card">
      {/* Brand Header */}
      <SidebarHeader className="h-16 border-b border-slate-200/80 dark:border-border/60 justify-center px-4">
        <Link href="/dashboard" className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-600/20 shrink-0">
            R
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
            <span className="font-bold text-slate-900 dark:text-foreground text-base tracking-tight leading-tight">
              RentMate
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
              Owner Suite
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation Links - Grouped */}
      <SidebarContent className="px-2 py-3">
        {navSections.map((section) => (
          <SidebarGroup key={section.label} className="py-1">
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-muted-foreground/60 px-3 mb-1">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.name}
                        className={
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/60 font-semibold border-l-[3px] border-indigo-600 rounded-l-none'
                            : 'text-slate-600 dark:text-muted-foreground hover:bg-slate-100/80 dark:hover:bg-accent hover:text-slate-900 dark:hover:text-foreground transition-colors'
                        }
                      >
                        <Link href={item.href}>
                          <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-muted-foreground'}`} />
                          <span className="flex-1 text-xs">{item.name}</span>
                          {item.badge && (
                            <Badge
                              size="sm"
                              className="group-data-[collapsible=icon]:hidden gap-1 text-[10px] font-bold uppercase tracking-wider py-0 px-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Bottom nav items */}
        <SidebarGroup className="mt-auto pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/70 font-semibold border-l-[3px] border-indigo-600 rounded-l-none'
                          : 'text-slate-600 dark:text-muted-foreground hover:bg-slate-100/80 dark:hover:bg-accent hover:text-slate-900 dark:hover:text-foreground transition-colors'
                      }
                    >
                      <Link href={item.href}>
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-muted-foreground'}`} />
                        <span className="flex-1 text-xs">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with AI Status & Complete User Profile */}
      <SidebarFooter className="p-3 border-t border-slate-200/80 dark:border-border/60 space-y-2.5">
        {/* Clean AI Status Banner (Hidden on icon collapse) */}
        <div className="group-data-[collapsible=icon]:hidden p-3 bg-slate-50 dark:bg-muted/20 rounded-xl border border-slate-200/70 dark:border-border/50 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            RentMate AI Active
          </p>
          <p className="text-slate-500 dark:text-muted-foreground mt-1 leading-relaxed text-[11px]">
            Groq Llama 3.3 siap membantu analisis operasional kost Anda.
          </p>
        </div>

        {/* User Profile Card with Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-accent transition-colors cursor-pointer text-left outline-none group-data-[collapsible=icon]:justify-center">
              <Avatar className="w-8 h-8 shrink-0">
                {user?.profile?.avatarUrl && (
                  <AvatarImage src={user.profile.avatarUrl} alt={fullName} />
                )}
                <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs shadow-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-semibold text-slate-900 dark:text-foreground truncate">
                  {fullName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                    {user?.role || 'OWNER'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {email}
                  </span>
                </div>
              </div>
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 group-data-[collapsible=icon]:hidden" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-60 mb-2">
            <div className="px-3 py-2.5 flex items-center gap-3">
              <Avatar className="w-9 h-9 shrink-0">
                {user?.profile?.avatarUrl && (
                  <AvatarImage src={user.profile.avatarUrl} alt={fullName} />
                )}
                <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs shadow-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-foreground truncate">
                  {fullName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground truncate mt-0.5">
                  {email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 cursor-pointer text-xs">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Profil Akun</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 cursor-pointer text-xs">
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Pengaturan Sistem</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 cursor-pointer text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar (Logout)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </ShadcnSidebar>
  );
};
