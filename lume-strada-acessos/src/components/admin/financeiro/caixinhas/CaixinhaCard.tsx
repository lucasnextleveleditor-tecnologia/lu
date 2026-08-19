"use client";

import Link from "next/link";
import type { CaixinhaComSaldo } from "@/lib/types/financeiro";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { ProgressRing } from "@/components/admin/financeiro/caixinhas/ProgressRing";
import { IconPiggyBank, IconTarget } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const RISCO_LABEL: Record<string, string> = { baixo: "riscoBaixo", medio: "riscoMedio", alto: "riscoAlto" };
const LIQUIDEZ_LABEL: Record<string, string> = { imediata: "liquidezImediata", curto_prazo: "liquidezCurtoPrazo", longo_prazo: "liquidezLongoPrazo" };

interface CaixinhaCardProps {
  caixinha: CaixinhaComSaldo;
}

/**
 * Card "premium" da caixinha — gradiente `zinc-900 -> black` pedido
 * explicitamente (ver histórico da conversa), anel de progresso circular
 * brilhante (`ProgressRing`) quando existe meta, clique inteiro leva pro
 * histórico isolado da caixinha (`/admin/financeiro/caixinhas/[id]`).
 */
export function CaixinhaCard({ caixinha }: CaixinhaCardProps) {
  const { dict } = useLocale();
  const t = dict.financeiro.caixinhas;
  const temMeta = caixinha.valor_meta != null && caixinha.valor_meta > 0;
  const pct = temMeta ? caixinha.saldo_atual / (caixinha.valor_meta as number) : 0;
  const atingida = temMeta && pct >= 1;

  return (
    <Link
      href={`/admin/financeiro/caixinhas/${caixinha.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-base-700/70 bg-gradient-to-br from-zinc-900 to-black p-5",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-base-600"
      )}
    >
      {/* Barra de destaque no topo — mesmo glow fixo do StatTile, nunca colorido por branding. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-ink-primary">
            {caixinha.emoji ? `${caixinha.emoji} ` : ""}
            {caixinha.nome}
          </p>
          {caixinha.objetivo && <p className="mt-0.5 truncate text-xs text-ink-muted">{caixinha.objetivo}</p>}
        </div>

        <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
          {temMeta ? (
            <>
              <ProgressRing pct={pct} size={64} strokeWidth={5} atingida={atingida} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold text-ink-primary">{fmtPercent(Math.min(1, pct))}</span>
              </div>
            </>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
              <IconPiggyBank className="h-6 w-6 text-ink-secondary" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.saldoAtualLabel}</p>
        <ValorPrivado valor={fmtBRL(caixinha.saldo_atual)} className="mt-1 block text-2xl font-bold tracking-tight text-ink-primary" />
      </div>

      {temMeta && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-secondary">
          <IconTarget className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
          {t.metaLabel} <ValorPrivado valor={fmtBRL(caixinha.valor_meta as number)} className="font-medium text-ink-primary" />
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {caixinha.taxa_rendimento > 0 && (
          <span className="rounded-full border border-status-good/30 bg-status-good/10 px-2 py-0.5 text-[10px] font-medium text-ink-primary">
            {caixinha.taxa_rendimento.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% {caixinha.taxa_rendimento_periodo === "mensal" ? t.aoMes : t.aoAno}
          </span>
        )}
        <span className="rounded-full border border-base-600 bg-base-950/60 px-2 py-0.5 text-[10px] font-medium text-ink-secondary">
          {t[RISCO_LABEL[caixinha.nivel_risco] as keyof typeof t] as string}
        </span>
        <span className="rounded-full border border-base-600 bg-base-950/60 px-2 py-0.5 text-[10px] font-medium text-ink-secondary">
          {t[LIQUIDEZ_LABEL[caixinha.liquidez] as keyof typeof t] as string}
        </span>
      </div>
    </Link>
  );
}
