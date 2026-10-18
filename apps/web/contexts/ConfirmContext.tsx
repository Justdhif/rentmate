'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useMemo } from 'react';
import { ConfirmDialog, ConfirmVariant } from '@/components/ui/confirm-dialog';
import { useTranslation } from '@/contexts/LanguageContext';

export interface ConfirmOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export interface ConfirmService {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  danger: (options: ConfirmOptions) => Promise<boolean>;
  logout: (options?: Partial<ConfirmOptions>) => Promise<boolean>;
  discard: (options?: Partial<ConfirmOptions>) => Promise<boolean>;
}

interface DialogState extends ConfirmOptions {
  isOpen: boolean;
}

const ConfirmContext = createContext<ConfirmService | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'default',
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      if (resolverRef.current) {
        resolverRef.current(false);
      }
      resolverRef.current = resolve;
      setDialogState({
        ...options,
        isOpen: true,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  const danger = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return confirm({
        variant: 'destructive',
        confirmText: options.confirmText || t('common.delete'),
        cancelText: options.cancelText || t('common.cancel'),
        ...options,
      });
    },
    [confirm, t]
  );

  const logout = useCallback(
    (options?: Partial<ConfirmOptions>): Promise<boolean> => {
      return confirm({
        variant: 'logout',
        title: options?.title || t('common.confirmLogoutTitle'),
        description: options?.description || t('common.confirmLogoutDesc'),
        confirmText: options?.confirmText || t('common.confirmLogoutButton'),
        cancelText: options?.cancelText || t('common.cancel'),
        ...options,
      });
    },
    [confirm, t]
  );

  const discard = useCallback(
    (options?: Partial<ConfirmOptions>): Promise<boolean> => {
      return confirm({
        variant: 'warning',
        title: options?.title || t('common.confirmDiscardTitle'),
        description: options?.description || t('common.confirmDiscardDesc'),
        confirmText: options?.confirmText || t('common.confirmDiscardButton'),
        cancelText: options?.cancelText || t('common.confirmKeepEditing'),
        ...options,
      });
    },
    [confirm, t]
  );

  const contextValue = useMemo<ConfirmService>(
    () => ({
      confirm,
      danger,
      logout,
      discard,
    }),
    [confirm, danger, logout, discard]
  );

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
        icon={dialogState.icon}
      >
        {dialogState.children}
      </ConfirmDialog>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmService => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
