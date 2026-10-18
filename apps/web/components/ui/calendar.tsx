"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none", className)}
      classNames={{
        root: "w-fit",
        months: "relative flex flex-col sm:flex-row gap-4",
        month: "space-y-3",
        month_caption: "relative flex items-center justify-center pt-1 pb-1",
        caption_label: "text-sm font-semibold text-slate-800 dark:text-slate-100",
        nav: "flex items-center justify-between absolute inset-x-0 top-1 px-1 z-10",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent hover:bg-accent text-slate-600 dark:text-slate-300 border-border/70 p-0 rounded-lg cursor-pointer"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent hover:bg-accent text-slate-600 dark:text-slate-300 border-border/70 p-0 rounded-lg cursor-pointer"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between",
        weekday: "text-muted-foreground w-9 font-medium text-[0.8rem] text-center",
        weeks: "flex flex-col gap-1 mt-1",
        week: "flex w-full justify-between mt-1",
        day: "h-9 w-9 p-0 text-center text-sm relative flex items-center justify-center",
        day_button: cn(
          "h-9 w-9 p-0 font-normal rounded-xl transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-center text-sm cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        ),
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90 [&>button]:font-semibold [&>button]:shadow-sm",
        today: "[&:not(.rdp-selected)>button]:bg-accent/80 [&:not(.rdp-selected)>button]:text-accent-foreground [&:not(.rdp-selected)>button]:font-semibold",
        outside: "opacity-40 [&>button]:text-muted-foreground",
        disabled: "opacity-30 pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", chevronClassName)} {...chevronProps} />
          }
          return <ChevronRight className={cn("h-4 w-4", chevronClassName)} {...chevronProps} />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
