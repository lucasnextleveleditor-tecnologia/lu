"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { href: "/admin/inventario", label: "Categorias" },
  { href: "/admin/inventario/itens", label: "Itens & Etiquetas" },
];

export function InventarioNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 border-b border-base-800">
      {TABS.map((tab) => {
        const active = tab.href === "/admin/inventario" ? pathname === "/admin/inventario" : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition",
              active ? "border-accent text-ink-primary" : "border-transparent text-ink-muted hover:text-ink-secondary"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
