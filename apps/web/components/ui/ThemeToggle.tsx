'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  className?: string;
  variant?: 'ghost' | 'outline';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'ghost',
  showLabel = false,
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant={variant}
      size={showLabel ? 'sm' : 'icon'}
      onClick={toggleTheme}
      className={`relative rounded-xl cursor-pointer transition-all duration-200 ${
        variant === 'ghost'
          ? 'text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-accent'
          : 'border-slate-200 dark:border-border/60 bg-white dark:bg-card'
      } ${className}`}
      title={isDark ? t('ui.toggleThemeLight') : t('ui.toggleThemeDark')}
      aria-label={t('ui.themeToggleLabel')}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-rose-600 transition-transform duration-300 rotate-0 hover:-rotate-12" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium ml-2">
          {isDark ? t('ui.lightMode') : t('ui.darkMode')}
        </span>
      )}
    </Button>
  );
};
