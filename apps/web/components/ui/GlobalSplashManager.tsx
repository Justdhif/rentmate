'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SplashScreen } from './SplashScreen';

export const GlobalSplashManager: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Berikan waktu minimal agar splash screen terlihat halus dan tidak berkedip
    if (!isLoading) {
      const minDurationTimer = setTimeout(() => {
        setIsFading(true);
        const unmountTimer = setTimeout(() => {
          setShowSplash(false);
        }, 600); // Sinkron dengan durasi transisi CSS

        return () => clearTimeout(unmountTimer);
      }, 500);

      return () => clearTimeout(minDurationTimer);
    }
  }, [isLoading]);

  return (
    <>
      {showSplash && <SplashScreen isFading={isFading} message="Menyiapkan data aplikasi..." />}
      {children}
    </>
  );
};

export default GlobalSplashManager;
