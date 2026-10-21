'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getRoleRedirectPath } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  FileQuestion,
  ShieldAlert,
  ServerCrash,
  WifiOff,
  ClockAlert,
  ArrowLeft,
  Home,
  RefreshCw,
  LayoutDashboard,
  LucideIcon,
} from 'lucide-react';

export type ErrorType = '404' | '403' | '500' | '502' | '503';

interface ErrorViewProps {
  type: ErrorType;
  title?: string;
  description?: string;
  reset?: () => void;
  showBack?: boolean;
}

const ERROR_CONFIG: Record<
  ErrorType,
  {
    icon: LucideIcon;
    color: string;
    bgGlow: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  }
> = {
  '404': {
    icon: FileQuestion,
    color: 'text-primary600 dark:text-primary400',
    bgGlow: 'bg-primary500/10 dark:bg-primary500/20',
    badgeBg: 'bg-primary50 dark:bg-primary950/60',
    badgeText: 'text-primary700 dark:text-primary300',
    badgeBorder: 'border-border200 dark:border-border800/60',
  },
  '403': {
    icon: ShieldAlert,
    color: 'text-amber-600 dark:text-amber-400',
    bgGlow: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800/60',
  },
  '500': {
    icon: ServerCrash,
    color: 'text-primary600 dark:text-primary400',
    bgGlow: 'bg-primary500/10 dark:bg-primary500/20',
    badgeBg: 'bg-primary50 dark:bg-primary950/60',
    badgeText: 'text-primary700 dark:text-primary300',
    badgeBorder: 'border-border200 dark:border-border800/60',
  },
  '502': {
    icon: WifiOff,
    color: 'text-primary',
    bgGlow: 'bg-primary/10 dark:bg-primary/20',
    badgeBg: 'bg-primary dark:bg-secondary/60',
    badgeText: 'text-primary',
    badgeBorder: 'border-border dark:border-border',
  },
  '503': {
    icon: ClockAlert,
    color: 'text-primary',
    bgGlow: 'bg-primary/10 dark:bg-primary/20',
    badgeBg: 'bg-primary dark:bg-secondary/60',
    badgeText: 'text-primary',
    badgeBorder: 'border-border dark:border-border',
  },
};

export const ErrorView: React.FC<ErrorViewProps> = ({
  type,
  title,
  description,
  reset,
  showBack = true,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const config = ERROR_CONFIG[type] || ERROR_CONFIG['404'];
  const Icon = config.icon;

  const defaultTitle = t(`errors.${type}.title`) || 'Terjadi Kesalahan';
  const defaultDesc = t(`errors.${type}.desc`) || 'Permintaan Anda tidak dapat diproses saat ini.';
  const badgeLabel = t(`errors.${type}.badge`) || `Error ${type}`;

  const dashboardPath = user ? getRoleRedirectPath(user.role) : '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/60 dark:bg-background px-4 py-12 relative overflow-hidden select-none">
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
        <div
          className={`w-[600px] h-[600px] rounded-full blur-3xl opacity-40 transition-all duration-700 animate-pulse ${config.bgGlow}`}
        />
        <div className="w-[380px] h-[380px] rounded-full border border-slate-200/50 dark:border-slate-800/40 absolute" />
        <div className="w-[520px] h-[520px] rounded-full border border-slate-200/30 dark:border-slate-800/20 absolute" />
      </div>

      <div className="max-w-md w-full mx-auto text-center space-y-6 animate-fade-in relative z-10">
        {/* Brand Logo Mini */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur-md border border-slate-200/60 dark:border-border/60 shadow-xs hover:border-slate-300 transition-colors"
        >
          <div className="w-6 h-6 rounded-lg bg-primary600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            R
          </div>
          <span className="font-bold text-slate-800 dark:text-foreground text-sm tracking-tight">
            RentMate
          </span>
        </Link>

        {/* Big Code & Icon */}
        <div className="relative flex flex-col items-center justify-center pt-2">
          <div
            className={`w-24 h-24 rounded-3xl ${config.badgeBg} border ${config.badgeBorder} shadow-lg shadow-black/5 flex items-center justify-center relative mb-3 group transition-transform duration-300 hover:scale-105`}
          >
            <Icon className={`w-12 h-12 ${config.color} transition-transform duration-300`} />
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder} shadow-2xs`}
          >
            {badgeLabel}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-foreground tracking-tight">
            {title || defaultTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {description || defaultDesc}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {reset ? (
            <Button
              onClick={reset}
              variant="default"
              className="w-full sm:w-auto h-11 px-6 bg-primary600 hover:bg-primary/90700 text-white rounded-xl shadow-sm gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('errors.tryAgain') || 'Coba Lagi'}</span>
            </Button>
          ) : (
            <Button
              asChild
              variant="default"
              className="w-full sm:w-auto h-11 px-6 bg-primary600 hover:bg-primary/90700 text-white rounded-xl shadow-sm gap-2"
            >
              <Link href={dashboardPath}>
                {user ? (
                  <>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t('errors.backToDashboard') || 'Kembali ke Dashboard'}</span>
                  </>
                ) : (
                  <>
                    <Home className="w-4 h-4" />
                    <span>{t('errors.backToHome') || 'Kembali ke Beranda'}</span>
                  </>
                )}
              </Link>
            </Button>
          )}

          {showBack && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 dark:border-border text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-accent gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('common.back') || 'Kembali'}</span>
            </Button>
          )}
        </div>

        {/* Bottom Help Text */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-border/60">
          <p className="text-xs text-slate-400 dark:text-muted-foreground">
            Butuh bantuan teknis? Hubungi tim dukungan RentMate di{' '}
            <a
              href="mailto:support@rentmate.com"
              className="text-primary600 dark:text-primary400 hover:underline font-medium"
            >
              support@rentmate.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
