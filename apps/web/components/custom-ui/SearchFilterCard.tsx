'use client';

import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  ArrowUpDown,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FilterSortConfig {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
}

export interface FilterSearchConfig {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface FilterSelectConfig {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FilterPillGroupConfig {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  gridCols?: 2 | 3 | 4;
}

export interface FilterPriceRangeConfig {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (val: number) => string;
  minLabel?: string;
  maxLabel?: string;
}

export interface FilterCheckboxOption {
  id: string;
  label: string;
  badge?: string;
}

export interface FilterCheckboxGroupConfig {
  id?: string;
  label?: string;
  options: FilterCheckboxOption[];
  selected: string[];
  onToggle: (id: string) => void;
  layout?: 'grid' | 'list';
  gridCols?: 2 | 3;
  selectedCountLabel?: string;
}

export interface FilterActionButtonConfig {
  label?: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'outline' | 'secondary';
  disabled?: boolean;
}

export interface SearchFilterCardProps {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  hasActiveFilters?: boolean;
  onReset?: () => void;
  resetLabel?: string;

  sort?: FilterSortConfig;
  search?: FilterSearchConfig;
  selects?: FilterSelectConfig[];
  pillGroups?: FilterPillGroupConfig[];
  priceRange?: FilterPriceRangeConfig;
  checkboxGroups?: FilterCheckboxGroupConfig[];

  applyButton?: FilterActionButtonConfig;
  bottomResetButton?: boolean | FilterActionButtonConfig;

  children?: React.ReactNode;
  className?: string;
}

export const SearchFilterCard: React.FC<SearchFilterCardProps> = ({
  title = 'Filter Pencarian',
  icon: HeaderIcon = SlidersHorizontal,
  hasActiveFilters = false,
  onReset,
  resetLabel = 'Reset',

  sort,
  search,
  selects,
  pillGroups,
  priceRange,
  checkboxGroups,

  applyButton,
  bottomResetButton,

  children,
  className,
}) => {
  return (
    <aside
      className={cn(
        'sticky top-20 rounded-2xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card p-5 shadow-2xs space-y-5',
        className
      )}
    >
      {/* Header: Title, Icon & Quick Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border/60">
        <div className="flex items-center gap-2">
          <HeaderIcon className="w-4 h-4 text-primary shrink-0" />
          <h3 className="font-bold text-slate-900 dark:text-foreground text-sm truncate">
            {title}
          </h3>
        </div>
        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-primary hover:text-primary hover:underline cursor-pointer flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{resetLabel}</span>
          </button>
        )}
      </div>

      {/* 1. Sort By Dropdown */}
      {sort && (
        <div className="space-y-1.5">
          {sort.label && (
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {sort.label}
            </label>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted/40 text-xs text-left flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  {sort.icon ? (
                    <sort.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate">
                    {sort.options.find((o) => o.value === sort.value)?.label ||
                      sort.placeholder ||
                      'Urutkan'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-xl">
              {sort.options.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => sort.onChange(opt.value)}
                  className="cursor-pointer text-xs flex items-center justify-between"
                >
                  <span className="truncate">{opt.label}</span>
                  {sort.value === opt.value && (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* 2. Search Input */}
      {search && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-border/60">
          {search.label && (
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {search.label}
            </label>
          )}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder || 'Cari...'}
              className="h-9 pl-8 text-xs rounded-xl bg-slate-50 dark:bg-muted/40 border-slate-200 dark:border-border"
            />
          </div>
        </div>
      )}

      {/* 3. Dropdown Selects (e.g. City, Property, Kost) */}
      {selects &&
        selects.map((sel, idx) => {
          const selectedOption = sel.options.find((o) => o.value === sel.value);
          const IconComponent = sel.icon;

          return (
            <div
              key={sel.id || idx}
              className="space-y-2 pt-2 border-t border-slate-100 dark:border-border/60"
            >
              {sel.label && (
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {sel.label}
                </label>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted/40 text-xs text-left flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-muted/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {IconComponent && (
                        <IconComponent className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">
                        {selectedOption?.label || sel.placeholder || 'Pilih...'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-xl max-h-64 overflow-y-auto">
                  {sel.options.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => sel.onChange(opt.value)}
                      className="cursor-pointer text-xs flex items-center justify-between"
                    >
                      <span className="truncate">{opt.label}</span>
                      {sel.value === opt.value && (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

      {/* 4. Segmented Pill Groups (e.g. Type, Status) */}
      {pillGroups &&
        pillGroups.map((group, gIdx) => {
          const colsClass =
            group.gridCols === 4
              ? 'grid-cols-4'
              : group.gridCols === 3
              ? 'grid-cols-3'
              : 'grid-cols-2';

          return (
            <div
              key={group.id || gIdx}
              className="space-y-2 pt-2 border-t border-slate-100 dark:border-border/60"
            >
              {group.label && (
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {group.label}
                </label>
              )}
              <div
                className={cn(
                  'grid gap-1.5 p-1 bg-slate-100/80 dark:bg-muted/60 rounded-xl border border-slate-200/60 dark:border-border/60',
                  colsClass
                )}
              >
                {group.options.map((tab) => {
                  const isActive = group.value === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => group.onChange(tab.value)}
                      className={cn(
                        'py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center truncate',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

      {/* 5. Price Range Slider */}
      {priceRange && (
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-border/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {priceRange.label || 'Rentang Harga'}
            </label>
            <span className="text-xs font-semibold text-primary">
              {priceRange.formatValue
                ? priceRange.formatValue(priceRange.value)
                : `≤ Rp ${priceRange.value.toLocaleString('id-ID')}`}
            </span>
          </div>
          <Slider
            min={priceRange.min ?? 500000}
            max={priceRange.max ?? 5000000}
            step={priceRange.step ?? 100000}
            value={[priceRange.value]}
            onValueChange={(val) => priceRange.onChange(val[0])}
            className="py-1 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>{priceRange.minLabel || 'Rp 500rb'}</span>
            <span>{priceRange.maxLabel || 'Rp 5jt'}</span>
          </div>
        </div>
      )}

      {/* 6. Checkbox Groups (e.g. Facilities) */}
      {checkboxGroups &&
        checkboxGroups.map((group, cIdx) => {
          const isGrid = group.layout !== 'list';
          const selectedCount = group.selected.length;

          return (
            <div
              key={group.id || cIdx}
              className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-border/60"
            >
              <div className="flex items-center justify-between">
                {group.label && (
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {group.label}
                  </label>
                )}
                {selectedCount > 0 && (
                  <span className="text-[10px] text-primary font-semibold">
                    {selectedCount} {group.selectedCountLabel || 'dipilih'}
                  </span>
                )}
              </div>

              {isGrid ? (
                <div className="grid grid-cols-2 gap-2">
                  {group.options.map((item) => {
                    const isChecked = group.selected.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => group.onToggle(item.id)}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-all',
                          isChecked
                            ? 'bg-secondary text-secondary-foreground border-border font-semibold'
                            : 'border-slate-200/80 dark:border-border/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-accent/40'
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => group.onToggle(item.id)}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {group.options.map((item) => {
                    const isChecked = group.selected.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:text-primary transition-colors"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => group.onToggle(item.id)}
                          className="rounded-md"
                        />
                        <span className="truncate">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      {/* 7. Additional custom slots/children if passed */}
      {children && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-border/60">
          {children}
        </div>
      )}

      {/* 8. Apply Button */}
      {applyButton && (
        <div className="pt-2">
          <Button
            onClick={applyButton.onClick}
            disabled={applyButton.disabled}
            className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm cursor-pointer gap-2"
          >
            {applyButton.icon ? (
              <applyButton.icon className="w-3.5 h-3.5" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>{applyButton.label || 'Terapkan Filter'}</span>
          </Button>
        </div>
      )}

      {/* 9. Bottom Reset Button (Alternative or Secondary Action) */}
      {bottomResetButton && hasActiveFilters && (
        <div className="pt-2 border-t border-slate-100 dark:border-border/60">
          <Button
            onClick={
              typeof bottomResetButton === 'object' && bottomResetButton.onClick
                ? bottomResetButton.onClick
                : onReset
            }
            variant="outline"
            className="w-full h-8 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {typeof bottomResetButton === 'object' && bottomResetButton.label
                ? bottomResetButton.label
                : resetLabel}
            </span>
          </Button>
        </div>
      )}
    </aside>
  );
};
