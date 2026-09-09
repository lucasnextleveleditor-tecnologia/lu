"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { IconBuilding, IconPalette } from "@/components/ui/icons";

const ITENS = [
  { href: "/super-admin", label: "Empresas", icon: IconBuilding, exato: true },
  { href: "/super-admin/tela-login", label: "Tela de Login", icon: IconPalette, exato: false },
] as const;

/**
 * Navegação do painel do dono do SaaS. Nasceu com dois destinos: as empresas
 * licenciadas e a tela de login pública — que veio da Aparência das agências
 * porque é uma tela só, compartilhada por todas elas (ver
 * `app/super-admin/tela-login/page.tsx`).
 *
 * Sem i18n, como o resto de `/super-admin`.
 */
export function SuperAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {ITENS.map((item) => {
        const ativo = item.exato ? pathname === item.href : pathname?.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition",
              ativo ? "bg-base-800 font-semibold text-ink-primary" : "font-medium text-ink-muted hover:bg-base-800 hover:text-ink-secondary"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
