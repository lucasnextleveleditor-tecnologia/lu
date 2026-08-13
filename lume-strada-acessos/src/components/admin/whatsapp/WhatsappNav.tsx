"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { href: "/admin/whatsapp", label: "Inbox" },
  { href: "/admin/whatsapp/conexao", label: "Conexão" },
];

export function WhatsappNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 border-b border-base-800">
      {TABS.map((tab) => {
        const active = tab.href === "/admin/whatsapp" ? pathname === "/admin/whatsapp" : pathname?.startsWith(tab.href);
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
