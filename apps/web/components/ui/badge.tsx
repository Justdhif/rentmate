import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
        // RentMate Rental & Operational Status Variants
        available: "border-emerald-200 bg-emerald-50 text-emerald-700",
        occupied: "border-blue-200 bg-blue-50 text-blue-700",
        maintenance: "border-amber-200 bg-amber-50 text-amber-700",
        paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
        pending: "border-amber-200 bg-amber-50 text-amber-700",
        failed: "border-rose-200 bg-rose-50 text-rose-700",
        blue: "border-sky-200 bg-sky-50 text-sky-700",
        purple: "border-indigo-200 bg-indigo-50 text-indigo-700",
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
    if (upper === "FAILED" || upper === "OVERDUE") return "failed"
  }
  return variant || "default"
}

function Badge({ className, variant, size, children, ...props }: BadgeProps) {
  const activeVariant = resolveVariant(variant, children)
  return (
    <div
      className={cn(badgeVariants({ variant: activeVariant, size, className }))}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
export default Badge
