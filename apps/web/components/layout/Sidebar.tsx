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
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

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
    <ShadcnSidebar collapsible="icon" className="border-r border-border">
      {/* Brand Header */}
      <SidebarHeader className="h-16 border-b border-border/50 justify-center px-4">
        <Link href="/dashboard" className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm shrink-0">
            R
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
            <span className="font-bold text-foreground text-lg tracking-tight leading-tight">
              RentMate
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-primary">
              Owner Suite
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation Links */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
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
                          ? 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    >
                      <Link href={item.href}>
                        <Icon className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge
                            size="sm"
                            variant="purple"
                            className="group-data-[collapsible=icon]:hidden gap-1 text-[10px] font-bold uppercase tracking-wider py-0 px-2"
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
      </SidebarContent>

      {/* Footer Banner */}
      <SidebarFooter className="p-3 border-t border-border/50 group-data-[collapsible=icon]:hidden">
        <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-xl border border-indigo-100/50 dark:border-indigo-900/50 text-xs">
          <p className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            RentMate AI Active
          </p>
          <p className="text-muted-foreground mt-1 leading-relaxed text-[11px]">
            Groq Llama 3.3 Engine aktif menganalisis data kost Anda.
          </p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </ShadcnSidebar>
  );
};
