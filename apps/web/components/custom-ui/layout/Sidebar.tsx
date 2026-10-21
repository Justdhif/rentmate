'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, getRoleRedirectPath } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useConfirm } from '@/contexts/ConfirmContext';
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
  Moon,
  Sun,
  Heart,
  Home,
  Compass,
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

// Distinctive curved inverted scoop corners matching the reference design
const ActiveScoopTop: React.FC = () => (
  <div
    className="pointer-events-none absolute -top-5 right-0 w-5 h-5 z-20 overflow-hidden"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 20 20"
      className="w-full h-full text-[#FFF1F2] dark:text-[#18181B] fill-current"
    >
      <path d="M20 0 V20 H0 A20 20 0 0 0 20 0 Z" />
    </svg>
  </div>
);

const ActiveScoopBottom: React.FC = () => (
  <div
    className="pointer-events-none absolute -bottom-5 right-0 w-5 h-5 z-20 overflow-hidden"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 20 20"
      className="w-full h-full text-[#FFF1F2] dark:text-[#18181B] fill-current"
    >
      <path d="M20 20 V0 H0 A20 20 0 0 1 20 20 Z" />
    </svg>
  </div>
);

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const confirm = useConfirm();

  const handleLogout = async () => {
    const confirmed = await confirm.logout();
    if (confirmed) {
      await logout();
    }
  };

  const navSections = React.useMemo(() => {
    const role = user?.role;

    if (role === 'USER') {
      return [
        {
          label: 'Menu Utama',
          items: [
            { name: 'Dashboard Pencari Kos', href: '/user/dashboard', icon: LayoutDashboard },
            { name: 'Kos Favorit (Wishlist)', href: '/favorites', icon: Heart },
          ],
        },
      ];
    }

    if (role === 'TENANT') {
      return [
        {
          label: 'Hunian Saya',
          items: [
            { name: 'Kamar Saya', href: '/tenant/dashboard', icon: Home },
            { name: 'Kos Favorit', href: '/favorites', icon: Heart },
          ],
        },
        {
          label: 'Layanan Penghuni',
          items: [
            { name: 'Tagihan & Pembayaran', href: '/tenant/payments', icon: CreditCard },
            { name: 'Lapor Kerusakan', href: '/tenant/maintenance', icon: Wrench },
          ],
        },
      ];
    }

    if (role === 'TECHNICIAN') {
      return [
        {
          label: 'Tugas & Pekerjaan',
          items: [
            { name: 'Dashboard Teknisi', href: '/technician/dashboard', icon: LayoutDashboard },
            { name: 'Tiket Maintenance', href: '/technician/maintenance', icon: Wrench },
          ],
        },
      ];
    }

    if (role === 'ADMIN') {
      return [
        {
          label: 'Superadmin Platform',
          items: [
            { name: 'Overview Global', href: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Kelola Pengguna', href: '/admin/users', icon: Users },
            { name: 'Verifikasi Listing', href: '/admin/verifications', icon: Building2 },
            { name: 'Laporan & Pengaduan', href: '/admin/reports', icon: Wrench },
          ],
        },
      ];
    }

    // Default for OWNER
    return [
      {
        label: t('nav.sectionMain'),
        items: [
          { name: t('nav.overview'), href: '/owner/dashboard', icon: LayoutDashboard },
          { name: t('nav.properties'), href: '/owner/properties', icon: Building2 },
          { name: t('nav.rooms'), href: '/owner/rooms', icon: DoorClosed },
          { name: t('nav.favorites'), href: '/favorites', icon: Heart },
        ],
      },
      {
        label: t('nav.sectionManagement'),
        items: [
          { name: t('nav.tenants'), href: '/owner/tenants', icon: Users },
          { name: t('nav.payments'), href: '/owner/payments', icon: CreditCard },
          { name: t('nav.maintenance'), href: '/owner/maintenance', icon: Wrench },
        ],
      },
      {
        label: t('nav.sectionIntelligence'),
        items: [
          { name: t('nav.analytics'), href: '/owner/analytics', icon: BarChart3 },
          {
            name: t('nav.aiAssistant'),
            href: '/owner/ai-assistant',
            icon: Bot,
            badge: t('nav.aiAssistantBadge'),
          },
        ],
      },
    ];
  }, [t, user?.role]);

  const bottomItems = React.useMemo(() => {
    const role = user?.role;
    const settingsHref =
      role === 'OWNER'
        ? '/owner/settings'
        : role === 'TENANT'
        ? '/tenant/settings'
        : role === 'TECHNICIAN'
        ? '/technician/settings'
        : role === 'ADMIN'
        ? '/admin/settings'
        : '/settings';

    return [{ name: t('nav.settings'), href: settingsHref, icon: Settings }];
  }, [t, user?.role]);

  const initials = user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'O';
  const fullName = user?.profile?.fullName || t('nav.userFallbackName');
  const email = user?.email || '';

  return (
    <ShadcnSidebar collapsible="icon" className="group-data-[side=left]:border-r-0 border-slate-200/80 dark:border-border/60 bg-sidebar dark:bg-sidebar">
      {/* Brand Header */}
      <SidebarHeader className="h-16 border-b border-slate-200/80 dark:border-border/60 justify-center px-4 group-data-[collapsible=icon]:px-0">
        <Link href={user ? getRoleRedirectPath(user.role) : '/'} className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="w-9 h-9 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-[#E11D48]/20 shrink-0 transition-colors">
            R
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
            <span className="font-bold text-slate-900 dark:text-foreground text-base tracking-tight leading-tight">
              {t('nav.brand')}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#E11D48]">
              {t('nav.brandSub')}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation Links - Grouped */}
      <SidebarContent className="pl-3 pr-0 py-3 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] group-data-[collapsible=icon]:pl-2 group-data-[collapsible=icon]:pr-0">
        {navSections.map((section) => (
          <SidebarGroup key={section.label} className="p-0 py-1">
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-muted-foreground/60 px-3 mb-1">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.name} className="relative">
                      {isActive && <ActiveScoopTop />}
                      {isActive && <ActiveScoopBottom />}
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.name}
                        className={
                          isActive
                            ? 'h-10 relative z-10 w-full !bg-[#FFF1F2] dark:!bg-[#18181B] data-[active=true]:!bg-[#FFF1F2] dark:data-[active=true]:!bg-[#18181B] hover:!bg-[#FFF1F2] dark:hover:!bg-[#18181B] text-[#E11D48] dark:text-[#E11D48] font-bold rounded-l-2xl rounded-r-none pl-3.5 pr-3 group-data-[collapsible=icon]:pl-3.5 group-data-[collapsible=icon]:pr-1 transition-all shadow-none flex items-center'
                            : 'h-10 text-slate-600 dark:text-slate-400 hover:bg-[#FFF1F2]/60 dark:hover:bg-[#27272A] hover:text-[#BE123C] dark:hover:text-[#FECDD3] transition-colors mr-3 group-data-[collapsible=icon]:mr-2 rounded-xl px-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center'
                        }
                      >
                        <Link href={item.href} className="flex items-center gap-2.5 w-full group-data-[collapsible=icon]:justify-center">
                          <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#E11D48]' : 'text-slate-400 dark:text-slate-500'}`} />
                          <span className="flex-1 text-xs truncate group-data-[collapsible=icon]:hidden">{item.name}</span>
                          {item.badge && (
                            <Badge
                              size="sm"
                              className="group-data-[collapsible=icon]:hidden gap-1 text-[10px] font-bold uppercase tracking-wider py-0 px-2 bg-[#FFF1F2] text-[#BE123C] dark:bg-[#BE123C]/20 dark:text-[#FECDD3] border-[#FECDD3] dark:border-[#BE123C]/40"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-[#E11D48]" />
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
        <SidebarGroup className="mt-auto p-0 py-1 pt-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name} className="relative">
                    {isActive && <ActiveScoopTop />}
                    {isActive && <ActiveScoopBottom />}
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={
                        isActive
                          ? 'h-10 relative z-10 w-full !bg-[#FFF1F2] dark:!bg-[#18181B] data-[active=true]:!bg-[#FFF1F2] dark:data-[active=true]:!bg-[#18181B] hover:!bg-[#FFF1F2] dark:hover:!bg-[#18181B] text-[#E11D48] dark:text-[#E11D48] font-bold rounded-l-2xl rounded-r-none pl-3.5 pr-3 group-data-[collapsible=icon]:pl-3.5 group-data-[collapsible=icon]:pr-1 transition-all shadow-none flex items-center'
                          : 'h-10 text-slate-600 dark:text-slate-400 hover:bg-[#FFF1F2]/60 dark:hover:bg-[#27272A] hover:text-[#BE123C] dark:hover:text-[#FECDD3] transition-colors mr-3 group-data-[collapsible=icon]:mr-2 rounded-xl px-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center'
                      }
                    >
                      <Link href={item.href} className="flex items-center gap-2.5 w-full group-data-[collapsible=icon]:justify-center">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#E11D48]' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span className="flex-1 text-xs truncate group-data-[collapsible=icon]:hidden">{item.name}</span>
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
        <div className="group-data-[collapsible=icon]:hidden p-3 bg-[#FFF1F2]/60 dark:bg-[#27272A]/50 rounded-xl border border-[#FECDD3] dark:border-border/50 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
            {t('nav.aiStatusTitle')}
          </p>
          <p className="text-slate-500 dark:text-muted-foreground mt-1 leading-relaxed text-[11px]">
            {t('nav.aiStatusDesc')}
          </p>
        </div>

        {/* User Profile Card with Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#FFF1F2]/80 dark:hover:bg-[#27272A] transition-colors cursor-pointer text-left outline-none group-data-[collapsible=icon]:justify-center">
              <Avatar className="w-8 h-8 shrink-0">
                {user?.profile?.avatarUrl && (
                  <AvatarImage src={user.profile.avatarUrl} alt={fullName} />
                )}
                <AvatarFallback className="bg-[#E11D48] text-white font-bold text-xs shadow-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-semibold text-slate-900 dark:text-foreground truncate">
                  {fullName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#FFF1F2] text-[#BE123C] dark:bg-[#BE123C]/20 dark:text-[#FECDD3] border border-[#FECDD3] dark:border-[#BE123C]/40">
                    {user?.role === 'USER' ? 'Pencari Kos' : user?.role || t('nav.userFallbackRole')}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {email}
                  </span>
                </div>
              </div>
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 group-data-[collapsible=icon]:hidden" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="w-64 mb-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            <div className="px-3 py-2.5 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-1 border border-slate-100 dark:border-slate-800">
              <Avatar className="w-9 h-9 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                {user?.profile?.avatarUrl && (
                  <AvatarImage src={user.profile.avatarUrl} alt={fullName} />
                )}
                <AvatarFallback className="bg-[#E11D48] text-white font-bold text-xs shadow-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {fullName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {email}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

            <DropdownMenuItem asChild>
              <Link
                href="/"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-[#FFF1F2] dark:hover:bg-[#27272A] hover:text-[#BE123C] dark:hover:text-[#FECDD3] cursor-pointer transition-colors"
              >
                <Compass className="w-4 h-4 text-[#E11D48] shrink-0" />
                <span>Jelajahi Marketplace</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href={
                  user?.role === 'OWNER'
                    ? '/owner/settings'
                    : user?.role === 'TENANT'
                    ? '/tenant/settings'
                    : user?.role === 'TECHNICIAN'
                    ? '/technician/settings'
                    : user?.role === 'ADMIN'
                    ? '/admin/settings'
                    : '/user/dashboard'
                }
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-[#FFF1F2] dark:hover:bg-[#27272A] hover:text-[#BE123C] dark:hover:text-[#FECDD3] cursor-pointer transition-colors"
              >
                <User className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" />
                <span>{t('nav.menuProfile')}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href={
                  user?.role === 'OWNER'
                    ? '/owner/settings'
                    : user?.role === 'TENANT'
                    ? '/tenant/settings'
                    : user?.role === 'TECHNICIAN'
                    ? '/technician/settings'
                    : user?.role === 'ADMIN'
                    ? '/admin/settings'
                    : '/user/dashboard'
                }
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-[#FFF1F2] dark:hover:bg-[#27272A] hover:text-[#BE123C] dark:hover:text-[#FECDD3] cursor-pointer transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" />
                <span>{t('nav.menuSettings')}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={toggleTheme}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-[#FFF1F2] dark:hover:bg-[#27272A] hover:text-[#BE123C] dark:hover:text-[#FECDD3] cursor-pointer transition-colors"
            >
              {resolvedTheme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{t('nav.menuLightMode')}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#E11D48] shrink-0" />
                  <span>{t('nav.menuDarkMode')}</span>
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#E11D48] dark:text-[#FECDD3] hover:bg-[#FFF1F2] dark:hover:bg-[#BE123C]/20 hover:text-[#BE123C] dark:hover:text-[#FFF1F2] focus:bg-[#FFF1F2] focus:text-[#BE123C] cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 text-[#E11D48] shrink-0" />
              <span>{t('nav.menuLogout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
