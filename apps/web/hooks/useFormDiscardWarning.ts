'use client';

import { useEffect, useCallback } from 'react';
import { useConfirm } from '@/contexts/ConfirmContext';

export interface UseFormDiscardWarningOptions {
  isDirty: boolean;
  title?: string;
  description?: string;
}

export function useFormDiscardWarning({
  isDirty,
  title,
  description,
}: UseFormDiscardWarningOptions) {
  const confirm = useConfirm();

  // Protect against accidental browser tab close / refresh
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Required for modern browsers to show the native leave page dialog
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  /**
   * Prompts user with confirm discard modal if form is dirty before executing callback.
   * If not dirty, immediately executes proceedFn.
   */
  const confirmDiscard = useCallback(
    async (proceedFn?: () => void): Promise<boolean> => {
      if (!isDirty) {
        proceedFn?.();
        return true;
      }

      const ok = await confirm.discard({
        title,
        description,
      });

      if (ok) {
        proceedFn?.();
        return true;
      }

      return false;
    },
    [isDirty, confirm, title, description]
  );

  /**
   * Convenience wrapper that only runs the callback if discard is confirmed or form is clean.
   */
  const guard = useCallback(
    async (proceedFn: () => void) => {
      await confirmDiscard(proceedFn);
    },
    [confirmDiscard]
  );

  return {
    confirmDiscard,
    guard,
  };
}
