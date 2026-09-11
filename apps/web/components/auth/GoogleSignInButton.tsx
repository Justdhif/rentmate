'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Script from 'next/script';

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError?: (error: string) => void;
  text?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [initFailed, setInitFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef<number>(0);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '581532718638-uolj9kjo1adubei8k19p8vs3p0hd0bs5.apps.googleusercontent.com';

  const callbackRef = useRef(onSuccess);
  callbackRef.current = onSuccess;

  const errorCallbackRef = useRef(onError);
  errorCallbackRef.current = onError;

  const ensureInitialized = useCallback(() => {
    if (!window.google?.accounts?.id) return false;

    // Pastikan google.accounts.id.initialize() HANYA dipanggil satu kali per clientId
    if ((window as any).__rentmate_gsi_initialized === clientId) {
      return true;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response?.credential) {
            callbackRef.current(response.credential);
          } else {
            errorCallbackRef.current?.('Tidak ada kredensial yang diterima dari Google.');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      (window as any).__rentmate_gsi_initialized = clientId;
      return true;
    } catch (err: any) {
      console.error('Failed to initialize Google Sign In:', err);
      setInitFailed(true);
      return false;
    }
  }, [clientId]);

  const renderGoogleButton = useCallback((targetWidth: number) => {
    if (!window.google?.accounts?.id || !googleBtnRef.current) return;

    const initialized = ensureInitialized();
    if (!initialized) return;

    try {
      // Google renderButton width range is 200 - 400 px
      const btnWidth = Math.min(Math.max(Math.floor(targetWidth), 200), 400);
      lastWidthRef.current = btnWidth;

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: btnWidth,
      });
    } catch (err: any) {
      console.error('Failed to render Google Sign In button:', err);
      setInitFailed(true);
    }
  }, [ensureInitialized]);

  const updateButtonDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const measuredWidth = containerRef.current.clientWidth || 360;
    renderGoogleButton(measuredWidth);
  }, [renderGoogleButton]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded) {
      updateButtonDimensions();
    }
  }, [scriptLoaded, updateButtonDimensions]);

  // Dynamic ResizeObserver to adapt to mobile screens, orientations, and window resizing
  useEffect(() => {
    if (!containerRef.current || !scriptLoaded) return;

    let timeoutId: NodeJS.Timeout;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = Math.floor(entry.contentRect.width);
        if (newWidth > 0 && Math.abs(newWidth - lastWidthRef.current) > 15) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            renderGoogleButton(newWidth);
          }, 120);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [scriptLoaded, renderGoogleButton]);

  return (
    <div className="w-full">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true);
        }}
      />

      <div
        ref={containerRef}
        className="w-full flex justify-center items-center min-h-[44px] overflow-hidden"
      >
        <div
          ref={googleBtnRef}
          className="w-full flex justify-center [&>div]:!w-full [&>div]:max-w-[400px] [&_iframe]:!w-full [&_iframe]:max-w-[400px]"
        />
      </div>

      {initFailed && (
        <p className="text-xs text-rose-500 text-center mt-2">
          Gagal memuat tombol Google. Pastikan Client ID valid dan domain diizinkan di Google Cloud Console.
        </p>
      )}
    </div>
  );
};
