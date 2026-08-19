import { cn } from "@/lib/utils/cn";
import type { TextareaHTMLAttributes } from "react";

/** Mesmo visual de `Input`, só que multi-linha — usado em campos de texto mais longos (ex: descrição do banner). */
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted",
        "focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition",
        "resize-y",
        className
      )}
      {...props}
    />
  );
}
