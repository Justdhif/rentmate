'use client';

import { useEffect } from 'react';
import { ErrorView } from '@/components/ui/ErrorView';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error:', error);
  }, [error]);

  return <ErrorView type="500" reset={reset} />;
}
