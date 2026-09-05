"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { WhatsappDict } from "@/lib/i18n/dictionaries/pt/whatsapp";

const TABS = [
  { href: "/admin/whatsapp", labelKey: "abaInbox" },
  { href: "/admin/whatsapp/conexao", labelKey: "abaConexao" },
] as const satisfies ReadonlyArray<{ href: string; labelKey: keyof WhatsappDict }>;

export function WhatsappNav() {
  const pathname = usePathname();
  const { dict } = useLocale();

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
            {dict.whatsapp[tab.labelKey]}
          </Link>
        );
      })}
    </div>
  );
}
