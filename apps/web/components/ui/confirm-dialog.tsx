'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  AlertTriangle,
  LogOut,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

export type ConfirmVariant = 'destructive' | 'warning' | 'logout' | 'info' | 'default';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const variantConfig: Record<
  ConfirmVariant,
  {
    icon: React.ElementType;
    badgeClass: string;
    buttonClass: string;
  }
> = {
  destructive: {
    icon: Trash2,
    badgeClass:
      'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/50 ring-4 ring-rose-50 dark:ring-rose-950/20',
    buttonClass:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-500/20 focus-visible:ring-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    badgeClass:
      'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/50 ring-4 ring-amber-50 dark:ring-amber-950/20',
    buttonClass:
      'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-sm shadow-amber-500/20 focus-visible:ring-amber-500',
  },
  logout: {
    icon: LogOut,
    badgeClass:
      'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/50 ring-4 ring-rose-50 dark:ring-rose-950/20',
    buttonClass:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-500/20 focus-visible:ring-rose-500',
  },
  info: {
    icon: HelpCircle,
    badgeClass:
      'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-900/50 ring-4 ring-indigo-50 dark:ring-indigo-950/20',
    buttonClass:
      'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-500/20 focus-visible:ring-indigo-500',
  },
  default: {
    icon: HelpCircle,
    badgeClass:
      'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-900/50 ring-4 ring-indigo-50 dark:ring-indigo-950/20',
    buttonClass:
      'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'default',
  icon,
  isLoading = false,
  children,
  className,
}) => {
  const { t } = useTranslation();
  const [internalLoading, setInternalLoading] = React.useState(false);

  const effectiveLoading = isLoading || internalLoading;
  const config = variantConfig[variant] || variantConfig.default;
  const DefaultIcon = config.icon;

  const handleConfirm = async () => {
    try {
      const result = onConfirm();
      if (result instanceof Promise) {
        setInternalLoading(true);
        await result;
      }
    } catch {
      // Errors should be handled by caller
    } finally {
      setInternalLoading(false);
    }
  };

  const defaultConfirmText =
    confirmText ||
    (variant === 'destructive'
      ? t('common.delete')
      : variant === 'logout'
      ? t('common.confirmLogoutButton')
      : variant === 'warning'
      ? t('common.confirmDiscardButton')
      : t('common.confirm'));

  const defaultCancelText = cancelText || t('common.cancel');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !effectiveLoading && onClose()}>
      <DialogContent
        className={cn(
          'max-w-md p-6 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-2xl gap-5',
          className
        )}
      >
        <div className="flex items-start gap-4">
          {/* Variant Icon Badge */}
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200',
              config.badgeClass
            )}
          >
            {icon ? (
              icon
            ) : (
              <DefaultIcon className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>

          {/* Header Content */}
          <DialogHeader className="text-left space-y-1.5 flex-1 min-w-0 pt-0.5">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Optional Custom Content */}
        {children && <div className="mt-1">{children}</div>}

        {/* Footer Actions */}
        <DialogFooter className="flex-row justify-end gap-2.5 sm:gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <Button
            type="button"
            variant="outline"
            disabled={effectiveLoading}
            onClick={onClose}
            className="rounded-xl px-4.5 h-10 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {defaultCancelText}
          </Button>
          <Button
            type="button"
            disabled={effectiveLoading}
            onClick={handleConfirm}
            className={cn(
              'rounded-xl px-5 h-10 font-semibold cursor-pointer transition-all',
              config.buttonClass
            )}
          >
            {effectiveLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>{t('common.processing')}</span>
              </>
            ) : (
              defaultConfirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
