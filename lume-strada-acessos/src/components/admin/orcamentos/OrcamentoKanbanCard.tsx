"use client";

import type { OrcamentoRow, StatusOrcamento } from "@/lib/types/orcamentos";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export type OrcamentoDoKanban = OrcamentoRow & { cliente_nome: string | null; total: number; statusExibicao: StatusOrcamento };

interface OrcamentoKanbanCardProps {
  orcamento: OrcamentoDoKanban;
  onClick: () => void;
  className?: string;
}

/** Mesmo visual/densidade do `LeadCard.tsx` (Comercial) — card de arrastar no Funil de Propostas, com o essencial pra reconhecer o orçamento sem abrir o detalhe: título, destinatário, valor e validade. */
export function OrcamentoKanbanCard({ orcamento, onClick, className }: OrcamentoKanbanCardProps) {
  const { dict } = useLocale();

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border border-base-700 bg-base-900/80 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-base-600",
        "shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.04)]",
        className
      )}
    >
      <p className="truncate text-sm font-medium text-ink-primary">{orcamento.titulo}</p>
      <p className="mt-0.5 truncate text-xs text-ink-secondary">{orcamento.cliente_nome ?? orcamento.nome_destinatario}</p>
      <p className="mt-2 text-sm font-semibold text-ink-primary">{fmtBRL(orcamento.total)}</p>
      {orcamento.data_expiracao && (
        <p className={cn("mt-2 text-xs", orcamento.statusExibicao === "expirado" ? "font-medium text-danger" : "text-ink-muted")}>
          {orcamento.statusExibicao === "expirado" ? dict.orcamentos.statusExpirado : dict.orcamentos.validoAte.replace("{data}", fmtDataCurta(orcamento.data_expiracao))}
        </p>
      )}
    </button>
  );
}
