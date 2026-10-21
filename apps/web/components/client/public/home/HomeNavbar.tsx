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
  const { locale, setLocale } = useTranslation();

  const renderRoleDashboardButton = () => {
    if (!user) return null;

    const targetPath = getRoleRedirectPath(user.role);
    let label = "Dashboard";
    let Icon: any = Building2;

    switch (user.role) {
      case "OWNER":
        label = "Dashboard Pemilik";
        Icon = Building2;
        break;
      case "TENANT":
        label = "Kamar Saya";
        Icon = Home;
        break;
      case "TECHNICIAN":
        label = "Pekerjaan Saya";
        Icon = Wrench;
        break;
      case "ADMIN":
        label = "Panel Admin";
        Icon = Shield;
        break;
      case "USER":
      default:
        label = "Dashboard Saya";
        Icon = User;
        break;
    }

    return (
      <Link href={targetPath}>
        <Button className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 gap-2 cursor-pointer transition">
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
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-700 via-rose-600 to-rose-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-rose-600/25 group-hover:scale-105 transition-transform">
            R
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-foreground text-lg tracking-tight leading-tight">
              RentMate
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Sewa & Manajemen Kos
            </span>
          </div>
        </Link>

        {/* Nav links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-muted-foreground">
          <a
            href="#properties"
            className="hover:text-rose-600 dark:hover:text-foreground transition-colors"
          >
            Jelajah Kos
          </a>
          <a
            href="#features"
            className="hover:text-rose-600 dark:hover:text-foreground transition-colors"
          >
            Keunggulan
          </a>
          <Link
            href="/register?role=OWNER"
            className="text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Daftarkan Kos Anda</span>
          </Link>
        </nav>

        {/* Right Area: Language, Theme, & User Session */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => setLocale(locale === "id" ? "en" : "id")}
            className="text-xs font-bold uppercase px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-accent transition cursor-pointer"
            title="Ganti Bahasa"
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
                    <Avatar className="w-9 h-9 border border-rose-200 dark:border-border">
                      {user.profile?.avatarUrl && (
                        <AvatarImage
                          src={user.profile.avatarUrl}
                          alt={user.profile.fullName || user.email}
                        />
                      )}
                      <AvatarFallback className="bg-rose-600 text-white font-bold text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 rounded-2xl shadow-xl border-slate-100 dark:border-border"
                >
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-foreground truncate">
                      {user.profile?.fullName || "Pengguna"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user.email}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {user.role}
                    </span>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={getRoleRedirectPath(user.role)}
                      className="cursor-pointer text-xs"
                    >
                      Ke Portal Role ({user.role})
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/favorites"
                      className="cursor-pointer text-xs"
                    >
                      Kos Favorit Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer text-xs">
                      Pengaturan Akun
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-rose-600 dark:text-rose-400 cursor-pointer text-xs flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
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
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="rounded-xl text-xs font-semibold h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/25 cursor-pointer"
                >
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
