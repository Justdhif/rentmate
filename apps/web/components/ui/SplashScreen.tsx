'use client';

import React from 'react';

interface SplashScreenProps {
  message?: string;
  submessage?: string;
  isFading?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  message = 'Memuat aplikasi...',
  submessage = 'Smart Kost Management Platform',
  isFading = false,
}) => {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md transition-all duration-700 ${
        isFading ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Soft glowing background aura */}
      <div className="absolute w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative flex flex-col items-center max-w-sm px-6 text-center animate-fade-in">
        {/* Animated Brand Logo Container */}
        <div className="relative mb-6">
          {/* Subtle Outer Glow Rings */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-indigo-500/30 to-purple-600/30 blur-lg animate-pulse" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white font-black text-4xl shadow-2xl shadow-indigo-500/30 animate-soft-pulse border border-white/20">
            R
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
          Rent<span className="text-indigo-600 dark:text-indigo-400">Mate</span>
        </h1>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1 mb-8">
          {submessage}
        </p>

        {/* Modern Shimmer Progress Bar */}
        <div className="w-52 h-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
          <div className="h-full w-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full animate-shimmer-bar" />
        </div>

        {/* Loading Message */}
        <p className="text-xs font-medium text-muted-foreground mt-4 tracking-wide animate-pulse">
          {message}
        </p>
      </div>

      {/* Modern Footer Note */}
      <div className="absolute bottom-8 text-center">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-600 tracking-wider uppercase">
          Powered by AI Smart Assistant
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;
