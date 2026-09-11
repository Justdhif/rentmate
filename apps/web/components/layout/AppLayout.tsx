'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Skeleton Sidebar */}
        <div className="hidden md:flex w-64 border-r border-border/60 flex-col p-4 gap-4 shrink-0">
          <div className="flex items-center gap-3 px-2 pb-4 border-b border-border/50">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
          <div className="space-y-2 mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        </div>
        {/* Skeleton Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-16 border-b border-border/60 px-8 flex items-center gap-4">
            <Skeleton className="h-5 w-48" />
            <div className="ml-auto flex items-center gap-3">
              <Skeleton className="h-8 w-56 rounded-lg hidden md:block" />
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>
          </div>
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
              <Skeleton className="h-40 rounded-2xl" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-64 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="flex flex-col min-w-0 flex-1 bg-background">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-5 md:p-6 lg:p-8 overflow-y-auto bg-slate-50/80 dark:bg-background">
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
