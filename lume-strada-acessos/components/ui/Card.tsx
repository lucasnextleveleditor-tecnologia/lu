import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Realce interno sutil no topo (1px, quase imperceptível) — o único
        // "glow" fixo da identidade visual, nunca colorido por branding.
        "rounded-2xl border border-base-700 bg-base-900/80 p-6 backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        className
      )}
      {...props}
    />
  );
}
