"use client"

import * as React from "react"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value?: string | Date
  onChange?: (dateString: string, date?: Date) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  required?: boolean
  displayFormat?: string
  showClear?: boolean
  showToday?: boolean
  clearLabel?: string
  todayLabel?: string
}

function parseISODate(value?: string | Date): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value
  if (typeof value === "string") {
    const parts = value.split("-")
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const d = new Date(year, month, day)
      return isNaN(d.getTime()) ? undefined : d
    }
    const d = new Date(value)
    return isNaN(d.getTime()) ? undefined : d
  }
  return undefined
}

function formatToISO(date?: Date): string {
  if (!date || isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled = false,
  className,
  id,
  name,
  required,
  displayFormat = "dd/MM/yyyy",
  showClear = true,
  showToday = true,
  clearLabel = "Clear",
  todayLabel = "Today",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = React.useMemo(() => parseISODate(value), [value])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const isoStr = formatToISO(date)
      onChange?.(isoStr, date)
      setOpen(false)
    } else {
      onChange?.("", undefined)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.("", undefined)
    setOpen(false)
  }

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    onChange?.(formatToISO(today), today)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-border bg-background px-3 py-2 text-xs font-medium ring-offset-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedDate ? format(selectedDate, displayFormat) : placeholder}
          </span>
          <div className="flex items-center gap-1 ml-2 text-slate-400">
            {showClear && selectedDate && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleClear(e as any)
                  }
                }}
                className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title={clearLabel}
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
          </div>
        </button>
      </PopoverTrigger>

      {/* Hidden input to support standard HTML form submissions and 'required' validations */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedDate ? formatToISO(selectedDate) : ""}
          required={required}
        />
      )}

      <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-border bg-card" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate || new Date()}
          autoFocus
        />
        {(showClear || showToday) && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/60 bg-muted/20">
            {showClear ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs h-7 px-2 text-slate-500 hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
              >
                {clearLabel}
              </Button>
            ) : <div />}
            {showToday && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleToday}
                className="text-xs h-7 px-2 text-primary font-medium hover:bg-primary/10 rounded-lg cursor-pointer"
              >
                {todayLabel}
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
