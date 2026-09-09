import Link from "next/link";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils/cn";

export type AbaHubComercial = "leads" | "funil" | "calculadora" | "propostas";

export interface ItemAbaHubComercial {
  value: AbaHubComercial;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

/**
 * Barra de abas do hub Comercial (`/admin/comercial`) — Leads, Funil,
 * Calculadora e Propostas, substituindo os dois destinos separados que
 * existiam antes no menu lateral (CRM/Vendas e Orçamentos). Cada aba é uma
 * navegação de verdade (`?aba=...`), não troca de estado local: cada uma
 * busca dados diferentes no servidor (leads vs. orçamentos vs. catálogo),
 * então uma Server Component por aba é mais simples e mais barato do que
 * buscar tudo de uma vez e esconder com CSS. `abas` já vem filtrada pela
 * página com só as que o usuário tem permissão pra ver (ver
 * `requireQualquerModuloOuRedirect` em `requireAdmin.ts`).
 */
export function ComercialHubTabs({ abas, abaAtiva }: { abas: ItemAbaHubComercial[]; abaAtiva: AbaHubComercial }) {
  if (abas.length < 2) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-base-800">
      {abas.map((aba) => (
        <Link
          key={aba.value}
          href={`/admin/comercial?aba=${aba.value}`}
          className={cn(
            "-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition",
            abaAtiva === aba.value ? "border-accent text-ink-primary" : "border-transparent text-ink-muted hover:text-ink-secondary"
          )}
        >
          <aba.icon className="h-4 w-4" />
          {aba.label}
        </Link>
      ))}
    </div>
  );
}
