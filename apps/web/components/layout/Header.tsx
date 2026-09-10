'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Bell } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <header className="h-16 bg-background border-b border-border px-4 lg:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-foreground tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification indicator */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground rounded-xl"
          title="Notifikasi"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
        </Button>

        {/* User Profile info */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'O'}
            </AvatarFallback>
          </Avatar>

          <div className="hidden sm:block text-left text-xs">
            <p className="font-semibold text-foreground line-clamp-1">
              {user?.profile?.fullName || user?.email || 'Owner'}
            </p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase font-medium mt-0.5">
              {user?.role || 'OWNER'}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl ml-1"
            title="Keluar (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
