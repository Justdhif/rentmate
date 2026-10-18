'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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

  const navSections = React.useMemo(
    () => [
      {
        label: t('nav.sectionMain'),
        items: [
          { name: t('nav.overview'), href: '/dashboard', icon: LayoutDashboard },
          { name: t('nav.properties'), href: '/properties', icon: Building2 },
          { name: t('nav.rooms'), href: '/rooms', icon: DoorClosed },
          { name: t('nav.favorites'), href: '/favorites', icon: Heart },
        ],
      },
      {
        label: t('nav.sectionManagement'),
        items: [
          { name: t('nav.tenants'), href: '/tenants', icon: Users },
          { name: t('nav.payments'), href: '/payments', icon: CreditCard },
          { name: t('nav.maintenance'), href: '/maintenance', icon: Wrench },
        ],
      },
      {
        label: t('nav.sectionIntelligence'),
        items: [
          { name: t('nav.analytics'), href: '/analytics', icon: BarChart3 },
          {
            name: t('nav.aiAssistant'),
            href: '/ai-assistant',
            icon: Bot,
            badge: t('nav.aiAssistantBadge'),
          },
        ],
      },
    ],
    [t]
  );

  const bottomItems = React.useMemo(
    () => [{ name: t('nav.settings'), href: '/settings', icon: Settings }],
    [t]
  );

  const initials = user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'O';
  const fullName = user?.profile?.fullName || t('nav.userFallbackName');
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
              {t('nav.brand')}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
              {t('nav.brandSub')}
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
            {t('nav.aiStatusTitle')}
          </p>
          <p className="text-slate-500 dark:text-muted-foreground mt-1 leading-relaxed text-[11px]">
            {t('nav.aiStatusDesc')}
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
                    {user?.role || t('nav.userFallbackRole')}
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
                <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs shadow-xs">
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
                href="/settings"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
              >
                <User className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" />
                <span>{t('nav.menuProfile')}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" />
                <span>{t('nav.menuSettings')}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={toggleTheme}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              {resolvedTheme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{t('nav.menuLightMode')}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span>{t('nav.menuDarkMode')}</span>
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 focus:bg-rose-50 dark:focus:bg-rose-950/40 focus:text-rose-700 dark:focus:text-rose-300 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>{t('nav.menuLogout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </ShadcnSidebar>
  );
};
