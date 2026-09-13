"use client"

import { Toaster as Sonner, toast } from "sonner"
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-slate-900 group-[.toaster]:border group-[.toaster]:border-slate-200/80 group-[.toaster]:dark:border-slate-800 group-[.toaster]:shadow-xl group-[.toaster]:shadow-slate-900/5 group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:font-sans group-[.toaster]:backdrop-blur-md group-[.toaster]:text-slate-800 group-[.toaster]:dark:text-slate-100",
          title: "group-[.toast]:font-semibold group-[.toast]:text-sm group-[.toast]:leading-snug",
          description: "group-[.toast]:text-slate-500 group-[.toast]:dark:text-slate-400 group-[.toast]:text-xs group-[.toast]:mt-1",
          actionButton:
            "group-[.toast]:bg-indigo-600 group-[.toast]:text-white group-[.toast]:font-medium group-[.toast]:rounded-xl group-[.toast]:text-xs group-[.toast]:px-3.5 group-[.toast]:py-1.5 hover:group-[.toast]:bg-indigo-700 transition-colors",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:dark:bg-slate-800 group-[.toast]:text-slate-600 group-[.toast]:dark:text-slate-300 group-[.toast]:font-medium group-[.toast]:rounded-xl group-[.toast]:text-xs group-[.toast]:px-3.5 group-[.toast]:py-1.5 hover:group-[.toast]:bg-slate-200 transition-colors",
          closeButton:
            "group-[.toast]:bg-white group-[.toast]:dark:bg-slate-900 group-[.toast]:text-slate-400 group-[.toast]:hover:text-slate-700 group-[.toast]:dark:hover:text-slate-200 group-[.toast]:border group-[.toast]:border-slate-200 group-[.toast]:dark:border-slate-800 group-[.toast]:shadow-sm group-[.toast]:rounded-full group-[.toast]:transition-all",
          success:
            "group-[.toaster]:!border-emerald-200 group-[.toaster]:dark:!border-emerald-900/60 group-[.toaster]:!bg-emerald-50/70 group-[.toaster]:dark:!bg-emerald-950/30 group-[.toaster]:!text-emerald-950 group-[.toaster]:dark:!text-emerald-200",
          error:
            "group-[.toaster]:!border-rose-200 group-[.toaster]:dark:!border-rose-900/60 group-[.toaster]:!bg-rose-50/70 group-[.toaster]:dark:!bg-rose-950/30 group-[.toaster]:!text-rose-950 group-[.toaster]:dark:!text-rose-200",
          warning:
            "group-[.toaster]:!border-amber-200 group-[.toaster]:dark:!border-amber-900/60 group-[.toaster]:!bg-amber-50/70 group-[.toaster]:dark:!bg-amber-950/30 group-[.toaster]:!text-amber-950 group-[.toaster]:dark:!text-amber-200",
          info:
            "group-[.toaster]:!border-indigo-200 group-[.toaster]:dark:!border-indigo-900/60 group-[.toaster]:!bg-indigo-50/70 group-[.toaster]:dark:!bg-indigo-950/30 group-[.toaster]:!text-indigo-950 group-[.toaster]:dark:!text-indigo-200",
        },
      }}
      icons={{
        success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
        info: <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />,
        close: <X className="w-3.5 h-3.5" />,
      }}
      closeButton
      position="top-right"
      {...props}
    />
  )
}

export { Toaster, toast }

