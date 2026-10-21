"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";

// Helper: Format price to readable Indonesian short format (e.g., Rp 1.8 Jt)
export function formatShortPrice(price: number): string {
  if (price >= 1000000) {
    const inMillions = price / 1000000;
    const formatted =
      inMillions % 1 === 0 ? inMillions.toFixed(0) : inMillions.toFixed(1);
    return `Rp ${formatted} Jt`;
  }
  return `Rp ${(price / 1000).toFixed(0)} Rb`;
}

interface BudgetRangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  label?: string;
  showPresets?: boolean;
}

export function BudgetRangeSlider({
  value,
  onChange,
  min = 500000,
  max = 5000000,
  step = 100000,
  className = "",
  label = "Rentang Budget",
  showPresets = true,
}: BudgetRangeSliderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header: Label & Live Price Values */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-300">
          {label}
        </span>
        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
          {formatShortPrice(value[0])} - {formatShortPrice(value[1])}{" "}
          <span className="text-[10px] text-slate-400 font-normal">/bln</span>
        </span>
      </div>

      {/* 2-Way Volume Bar Dual Slider */}
      <div className="py-2 px-1">
        <Slider
          min={min}
          max={max}
          step={step}
          value={value}
          onValueChange={(val: number[]) => {
            if (Array.isArray(val) && val.length === 2) {
              onChange([val[0], val[1]]);
            }
          }}
          className="w-full"
        />
      </div>

      {/* Range Min/Max Footers & Quick Presets */}
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>{formatShortPrice(min)}</span>

        {showPresets && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChange([min, 1500000])}
              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 cursor-pointer text-[10px] font-medium transition"
            >
              &lt; 1.5 Jt
            </button>
            <button
              type="button"
              onClick={() => onChange([1500000, 3000000])}
              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 cursor-pointer text-[10px] font-medium transition"
            >
              1.5 - 3 Jt
            </button>
            <button
              type="button"
              onClick={() => onChange([min, max])}
              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 cursor-pointer text-[10px] font-medium transition"
            >
              Semua
            </button>
          </div>
        )}

        <span>{formatShortPrice(max)}</span>
      </div>
    </div>
  );
}
