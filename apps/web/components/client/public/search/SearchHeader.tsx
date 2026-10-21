"use client";

import React from "react";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export function SearchHeader({ searchQuery, setSearchQuery }: SearchHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-slate-200/80 dark:border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi, kota, atau nama kos..."
              className="pl-10 h-10 rounded-xl text-xs bg-slate-50 dark:bg-muted/40"
            />
          </div>
        </div>
        <Link href="/">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-indigo-600/20">
            R
          </div>
        </Link>
      </div>
    </header>
  );
}
