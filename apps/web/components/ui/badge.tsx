import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
        warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
        info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400",
        // RentMate Rental & Operational Status Variants
        available: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
        occupied: "border-border bg-secondary text-secondary-foreground",
        maintenance: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
        paid: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
        pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
        failed: "border-border200 bg-primary50 text-primary700 dark:border-border800 dark:bg-primary950/50 dark:text-primary400",
        blue: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400",
        purple: "border-border200 bg-primary50 text-primary700 dark:border-border800 dark:bg-primary950/50 dark:text-primary400",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Status variants that show a pulsing dot indicator
const LIVE_STATUS_SET = new Set(["OCCUPIED", "IN_PROGRESS", "ASSIGNED", "PENDING"])

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  size?: "default" | "sm" | "md"
}

function resolveVariant(variant: BadgeProps["variant"], children: React.ReactNode): BadgeProps["variant"] {
  if (typeof children === "string") {
    const upper = children.toUpperCase()
    if (upper === "AVAILABLE") return "available"
    if (upper === "OCCUPIED") return "occupied"
    if (upper === "MAINTENANCE") return "maintenance"
    if (upper === "PAID" || upper === "RESOLVED" || upper === "CLOSED") return "paid"
    if (upper === "PENDING" || upper === "REPORTED" || upper === "ASSIGNED") return "pending"
    if (upper === "IN_PROGRESS") return "blue"
    if (upper === "FAILED" || upper === "OVERDUE" || upper === "EXPIRED") return "failed"
  }
  return variant || "default"
}

function resolveDotColor(children: React.ReactNode): string | null {
  if (typeof children !== "string") return null
  const upper = children.toUpperCase()
  if (!LIVE_STATUS_SET.has(upper)) return null
  if (upper === "OCCUPIED") return "bg-primary"
  if (upper === "IN_PROGRESS") return "bg-sky-500"
  if (upper === "ASSIGNED") return "bg-amber-500"
  if (upper === "PENDING") return "bg-amber-500"
  return null
}

function Badge({ className, variant, size, children, ...props }: BadgeProps) {
  const activeVariant = resolveVariant(variant, children)
  const dotColor = resolveDotColor(children)
  return (
    <div
      className={cn(badgeVariants({ variant: activeVariant, size, className }))}
      {...props}
    >
      {dotColor && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", dotColor)} />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
export default Badge
