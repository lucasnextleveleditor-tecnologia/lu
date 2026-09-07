import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted",
        "focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition",
        className
      )}
      {...props}
    />
  );
}
