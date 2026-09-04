"use client";

import type { CaixinhaTransacaoRow } from "@/lib/types/financeiro";
import { fmtBRL } from "@/lib/utils/format";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { IconArrowRightLeft, IconTrendingUp } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const TIPO_META: Record<CaixinhaTransacaoRow["tipo"], { sinal: "+" | "-"; corTexto: string; corBadge: string }> = {
  aporte: { sinal: "+", corTexto: "text-ink-primary", corBadge: "bg-white/10 text-ink-secondary" },
  rendimento: { sinal: "+", corTexto: "text-status-good", corBadge: "bg-status-good/15 text-status-good" },
  resgate: { sinal: "-", corTexto: "text-ink-primary", corBadge: "bg-white/10 text-ink-secondary" },
};

function fmtDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Histórico isolado da caixinha (ledger completo) — página de detalhe. */
export function CaixinhaHistorico({ historico }: { historico: CaixinhaTransacaoRow[] }) {
  const { dict } = useLocale();
  const t = dict.financeiro.caixinhas;

  if (historico.length === 0) {
    return <p className="rounded-lg border border-dashed border-base-700 bg-base-950/40 p-6 text-center text-xs text-ink-muted">{t.historicoVazio}</p>;
  }

  return (
    <div className="space-y-2">
      {historico.map((mov) => {
        const meta = TIPO_META[mov.tipo];
        const rotuloTipo = mov.tipo === "aporte" ? t.aporteLabel : mov.tipo === "resgate" ? t.resgateLabel : t.rendimentoLabel;
        return (
          <div key={mov.id} className="flex items-center justify-between gap-3 rounded-lg border border-base-700 bg-base-950/40 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", meta.corBadge)}>
                {mov.tipo === "rendimento" ? <IconTrendingUp className="h-4 w-4" /> : <IconArrowRightLeft className="h-4 w-4" />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-primary">{mov.descricao || rotuloTipo}</p>
                <p className="text-xs text-ink-muted">
                  {rotuloTipo} · {fmtDataHora(mov.data)}
                </p>
              </div>
            </div>
            <ValorPrivado
              valor={`${meta.sinal} ${fmtBRL(mov.valor)}`}
              className={cn("shrink-0 text-sm font-semibold", meta.corTexto)}
            />
          </div>
        );
      })}
    </div>
  );
}
