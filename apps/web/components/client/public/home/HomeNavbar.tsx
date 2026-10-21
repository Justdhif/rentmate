"use client";

import React from "react";
import Link from "next/link";
import { useAuth, getRoleRedirectPath } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  Building2,
  Home,
  Wrench,
  Shield,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HomeNavbar() {
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useTranslation();

  const renderRoleDashboardButton = () => {
    if (!user) return null;

    const targetPath = getRoleRedirectPath(user.role);
    let label = t('nav.roleUserDashboard');
    let Icon: any = Building2;

    switch (user.role) {
      case "OWNER":
        label = t('nav.roleOwnerDashboard');
        Icon = Building2;
        break;
      case "TENANT":
        label = t('nav.roleTenantDashboard');
        Icon = Home;
        break;
      case "TECHNICIAN":
        label = t('nav.roleTechDashboard');
        Icon = Wrench;
        break;
      case "ADMIN":
        label = t('nav.roleAdminDashboard');
        Icon = Shield;
        break;
      case "USER":
      default:
        label = t('nav.roleUserDashboard');
        Icon = User;
        break;
    }

    return (
      <Link href={targetPath}>
        <Button className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 gap-2 cursor-pointer transition">
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </Button>
      </Link>
    );
  };

  const userInitials =
    user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || "U";

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-slate-200/80 dark:border-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-red to-crimson flex items-center justify-center text-primary-foreground font-black text-xl shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
            R
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-foreground text-lg tracking-tight leading-tight">
              RentMate
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {t('home.brandTagline')}
            </span>
          </div>
        </Link>

        {/* Nav links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-muted-foreground">
          <a
            href="#properties"
            className="hover:text-primary dark:hover:text-foreground transition-colors"
          >
            {t('home.navProperties')}
          </a>
          <a
            href="#features"
            className="hover:text-primary dark:hover:text-foreground transition-colors"
          >
            {t('home.navFeatures')}
          </a>
          <Link
            href="/register?role=OWNER"
            className="text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t('home.navRegisterOwner')}</span>
          </Link>
        </nav>

        {/* Right Area: Language, Theme, & User Session */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => setLocale(locale === "id" ? "en" : "id")}
            className="text-xs font-bold uppercase px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-accent transition cursor-pointer"
            title={t('home.changeLanguage')}
          >
            {locale.toUpperCase()}
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth Actions */}
          {user ? (
            <div className="flex items-center gap-3">
              {renderRoleDashboardButton()}

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 outline-none cursor-pointer">
                    <Avatar className="w-9 h-9 border border-border">
                      {user.profile?.avatarUrl && (
                        <AvatarImage
                          src={user.profile.avatarUrl}
                          alt={user.profile.fullName || user.email}
                        />
                      )}
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 rounded-2xl shadow-xl border-slate-100 dark:border-border bg-card"
                >
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-foreground truncate">
                      {user.profile?.fullName || t('home.userFallback')}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user.email}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                      {user.role}
                    </span>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={getRoleRedirectPath(user.role)}
                      className="cursor-pointer text-xs"
                    >
                      {t('home.toRolePortal')} ({user.role})
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/favorites"
                      className="cursor-pointer text-xs"
                    >
                      {t('home.myFavoriteKosts')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer text-xs">
                      {t('home.accountSettings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-destructive cursor-pointer text-xs flex items-center gap-2 hover:bg-destructive/10"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('home.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs font-semibold h-9 px-3.5 cursor-pointer"
                >
                  {t('home.login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="rounded-xl text-xs font-semibold h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25 cursor-pointer"
                >
                  {t('home.register')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
