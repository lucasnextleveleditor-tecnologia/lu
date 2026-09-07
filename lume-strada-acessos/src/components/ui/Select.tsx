import { cn } from "@/lib/utils/cn";
import type { SelectHTMLAttributes } from "react";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-primary",
        "focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
