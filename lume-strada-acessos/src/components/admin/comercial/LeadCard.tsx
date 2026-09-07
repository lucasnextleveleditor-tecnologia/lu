"use client";

import type { LeadComRelacoes } from "@/lib/types/comercial";
import { isFollowUpAtrasado } from "@/lib/utils/comercial";
import { fmtBRL } from "@/lib/utils/format";
import { fmtData } from "@/lib/utils/status";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface LeadCardProps {
  lead: LeadComRelacoes;
  onClick: () => void;
  className?: string;
}

export function LeadCard({ lead, onClick, className }: LeadCardProps) {
  const { dict } = useLocale();
  const atrasado = isFollowUpAtrasado(lead);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border border-base-700 bg-base-900/80 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-base-600",
        "shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.04)]",
        className
      )}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium text-ink-primary">{lead.nome}</p>
        {lead.contrato_assinado && <Badge tone="good" label={dict.comercial.badgeContrato} className="shrink-0" />}
      </div>

      {lead.tipo_servico_nome && <p className="mb-1 truncate text-xs text-ink-secondary">{lead.tipo_servico_nome}</p>}

      {lead.valor_estimado != null && <p className="text-sm font-semibold text-ink-primary">{fmtBRL(lead.valor_estimado)}</p>}

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        {lead.proximo_contato_em && (
          <span className={atrasado ? "font-medium text-danger" : ""}>
            {atrasado ? dict.comercial.atrasadoPrefixo : dict.comercial.proximoContatoPrefixo}
            {fmtData(lead.proximo_contato_em)}
          </span>
        )}
      </div>
    </button>
  );
}
