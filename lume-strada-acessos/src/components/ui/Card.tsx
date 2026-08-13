import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-base-700 bg-base-900/80 backdrop-blur-sm p-6", className)} {...props} />;
}
