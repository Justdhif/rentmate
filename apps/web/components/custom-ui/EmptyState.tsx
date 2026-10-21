'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type EmptyStateColor =
  | 'rose'
  | 'crimson'
  | 'amber'
  | 'emerald'
  | 'slate';

export type EmptyStateVariant = 'card' | 'dashed' | 'ghost';
export type EmptyStateSize = 'sm' | 'md' | 'lg';

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
}

export interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode;
  iconColor?: EmptyStateColor;
  title: string;
  description?: string | React.ReactNode;
  action?: EmptyStateAction | React.ReactNode;
  secondaryAction?: EmptyStateAction | React.ReactNode;
  variant?: EmptyStateVariant;
  size?: EmptyStateSize;
  className?: string;
  children?: React.ReactNode;
}

const colorStyles: Record<EmptyStateColor, { bg: string; icon: string }> = {
  rose: {
    bg: 'bg-primary50 dark:bg-primary950/40 border-border200 dark:border-border900/50',
    icon: 'text-primary600 dark:text-primary400',
  },
  crimson: {
    bg: 'bg-primary100 dark:bg-primary950/60 border-border200 dark:border-border900/60',
    icon: 'text-primary700 dark:text-primary300',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50',
    icon: 'text-amber-500 dark:text-amber-400',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/80 dark:border-border/60',
    icon: 'text-slate-400 dark:text-slate-500',
  },
};

const variantStyles: Record<EmptyStateVariant, string> = {
  card: 'rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-2xs',
  dashed: 'rounded-3xl border border-dashed border-slate-200 dark:border-border/60 bg-white/50 dark:bg-card/50',
  ghost: 'bg-transparent',
};

const sizeStyles: Record<EmptyStateSize, { container: string; iconBox: string; iconSize: string; title: string; desc: string }> = {
  sm: {
    container: 'p-6',
    iconBox: 'w-11 h-11 rounded-xl mb-2.5',
    iconSize: 'w-5 h-5',
    title: 'text-sm font-bold',
    desc: 'text-xs mt-1 max-w-xs',
  },
  md: {
    container: 'p-8 sm:p-12',
    iconBox: 'w-14 h-14 rounded-2xl mb-3.5',
    iconSize: 'w-7 h-7',
    title: 'text-base sm:text-lg font-bold',
    desc: 'text-xs sm:text-sm mt-1.5 max-w-sm',
  },
  lg: {
    container: 'p-12 sm:p-16',
    iconBox: 'w-16 h-16 rounded-3xl mb-4',
    iconSize: 'w-8 h-8',
    title: 'text-lg sm:text-xl font-bold',
    desc: 'text-sm sm:text-base mt-2 max-w-md',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: IconComponent,
  iconColor = 'rose',
  title,
  description,
  action,
  secondaryAction,
  variant = 'card',
  size = 'md',
  className = '',
  children,
}) => {
  const currentSize = sizeStyles[size];
  const currentColor = (iconColor && colorStyles[iconColor]) || colorStyles.rose;
  const currentVariant = variantStyles[variant];

  const renderAction = (act: EmptyStateAction | React.ReactNode, isPrimary = true) => {
    if (!act) return null;

    if (React.isValidElement(act)) {
      return act;
    }

    const actionObj = act as EmptyStateAction;
    const ActionIcon = actionObj.icon;
    const buttonVariant = actionObj.variant || (isPrimary ? 'default' : 'outline');

    const defaultBtnClass = isPrimary
      ? 'rounded-xl text-xs font-semibold px-4 h-9.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5 cursor-pointer'
      : 'rounded-xl text-xs font-semibold px-4 h-9.5 border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 gap-1.5 cursor-pointer';

    const appliedClass = actionObj.className || defaultBtnClass;

    if (actionObj.href) {
      return (
        <Button asChild variant={buttonVariant} className={appliedClass}>
          <Link href={actionObj.href}>
            {ActionIcon &&
              (React.isValidElement(ActionIcon)
                ? ActionIcon
                : React.createElement(ActionIcon as any, {
                    className: 'w-3.5 h-3.5',
                  }))}
            <span>{actionObj.label}</span>
          </Link>
        </Button>
      );
    }

    return (
      <Button
        type="button"
        variant={buttonVariant}
        onClick={actionObj.onClick}
        className={appliedClass}
      >
        {ActionIcon &&
          (React.isValidElement(ActionIcon)
            ? ActionIcon
            : React.createElement(ActionIcon as any, {
                className: 'w-3.5 h-3.5',
              }))}
        <span>{actionObj.label}</span>
      </Button>
    );
  };

  return (
    <div
      className={`w-full flex flex-col items-center justify-center text-center ${currentVariant} ${currentSize.container} ${className}`}
    >
      {/* Icon Container */}
      {IconComponent && (
        <div
          className={`flex items-center justify-center border shadow-2xs transition-transform hover:scale-105 ${currentSize.iconBox} ${currentColor.bg} ${currentColor.icon}`}
        >
          {React.isValidElement(IconComponent)
            ? IconComponent
            : React.createElement(IconComponent as any, {
                className: currentSize.iconSize,
              })}
        </div>
      )}

      {/* Title */}
      <h3 className={`text-slate-900 dark:text-foreground tracking-tight ${currentSize.title}`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`text-slate-500 dark:text-muted-foreground mx-auto leading-relaxed ${currentSize.desc}`}>
          {description}
        </p>
      )}

      {/* Children or Custom Area */}
      {children}

      {/* Action Buttons */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {renderAction(action, true)}
          {renderAction(secondaryAction, false)}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
