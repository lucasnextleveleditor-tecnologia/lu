"use client";

import { useMemo, useState } from "react";
import type { TransacaoPreview } from "@/lib/utils/financeiro-preview-mock";
import { categoriaPorId, contaPorId } from "@/lib/utils/financeiro-preview-mock";
import { addMeses, fmtMesAno, limitesDoMes } from "@/lib/utils/financeiro";
import { fmtBRL, todayISO } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import {
  IconAlertTriangle,
  IconCheckCircle,
  IconChevronLeft,
  IconChevronRight,
  IconPauseCircle,
  IconTrendingDown,
  IconTrendingUp,
} from "@/components/ui/icons";

interface TransacoesPreviewProps {
  transacoes: TransacaoPreview[];
  referencia: Date;
  onMudarReferencia: (referencia: Date) => void;
}

type Aba = "despesas" | "receitas";
type SituacaoTransacao = "paga" | "pendente" | "vencida";

function situacaoDe(t: TransacaoPreview): SituacaoTransacao {
  if (t.pago) return "paga";
  return t.data < todayISO() ? "vencida" : "pendente";
}

const SITUACAO_META: Record<SituacaoTransacao, { icon: typeof IconCheckCircle; className: string; label: string }> = {
  paga: { icon: IconCheckCircle, className: "text-status-good", label: "Paga" },
  pendente: { icon: IconPauseCircle, className: "text-status-neutral", label: "Pendente" },
  vencida: { icon: IconAlertTriangle, className: "text-status-critical", label: "Vencida" },
};

function fmtDiaCurto(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function fmtDiaExtenso(iso: string): string {
  const label = new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Página de Transações ao estilo Mobills: toggle Receitas/Despesas, totalizadores e lista agrupada por dia com subtotal. */
export function TransacoesPreview({ transacoes, referencia, onMudarReferencia }: TransacoesPreviewProps) {
  const [aba, setAba] = useState<Aba>("despesas");
  const tipoAba = aba === "despesas" ? "despesa" : "receita";

  const { inicio, fim } = limitesDoMes(referencia);
  const doMes = useMemo(
    () => transacoes.filter((t) => t.tipo === tipoAba && t.data >= inicio && t.data <= fim),
    [transacoes, tipoAba, inicio, fim]
  );

  const pendentes = useMemo(() => doMes.filter((t) => !t.pago).reduce((acc, t) => acc + t.valor, 0), [doMes]);
  const pagas = useMemo(() => doMes.filter((t) => t.pago).reduce((acc, t) => acc + t.valor, 0), [doMes]);
  const totalMes = pendentes + pagas;

  const grupos = useMemo(() => {
    const mapa = new Map<string, TransacaoPreview[]>();
    [...doMes]
      .sort((a, b) => (a.data < b.data ? 1 : -1))
      .forEach((t) => {
        const lista = mapa.get(t.data) ?? [];
        lista.push(t);
        mapa.set(t.data, lista);
      });
    return Array.from(mapa.entries()).map(([data, itens]) => ({
      data,
      itens,
      subtotal: itens.reduce((acc, t) => acc + t.valor, 0),
    }));
  }, [doMes]);

  const verbo = aba === "despesas" ? "gastou" : "recebeu";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1.5 rounded-xl border border-base-800 bg-base-900/50 p-1.5">
          <button
            onClick={() => setAba("receitas")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition",
              aba === "receitas" ? "bg-status-good/15 text-status-good" : "text-ink-muted hover:bg-base-800 hover:text-ink-secondary"
            )}
          >
            <IconTrendingUp className="h-3.5 w-3.5" /> Receitas
          </button>
          <button
            onClick={() => setAba("despesas")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition",
              aba === "despesas" ? "bg-status-critical/15 text-danger" : "text-ink-muted hover:bg-base-800 hover:text-ink-secondary"
            )}
          >
            <IconTrendingDown className="h-3.5 w-3.5" /> Despesas
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onMudarReferencia(addMeses(referencia, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            aria-label="Mês anterior"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <p className="w-36 text-center text-sm font-medium capitalize">{fmtMesAno(referencia)}</p>
          <button
            onClick={() => onMudarReferencia(addMeses(referencia, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            aria-label="Próximo mês"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-ink-muted">{aba === "despesas" ? "Despesas Pendentes" : "Receitas Pendentes"}</p>
          <p className="mt-1 text-xl font-semibold text-status-neutral">{fmtBRL(pendentes)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-muted">{aba === "despesas" ? "Despesas Pagas" : "Receitas Recebidas"}</p>
          <p className="mt-1 text-xl font-semibold text-status-good">{fmtBRL(pagas)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-muted">Total do Mês</p>
          <p className="mt-1 text-xl font-semibold text-ink-primary">{fmtBRL(totalMes)}</p>
        </Card>
      </div>

      {grupos.length === 0 ? (
        <Card className="py-14 text-center text-sm text-ink-muted">Nenhuma {aba === "despesas" ? "despesa" : "receita"} lançada neste mês.</Card>
      ) : (
        <Card className="divide-y divide-base-800 p-0">
          {grupos.map((grupo) => (
            <div key={grupo.data}>
              <div className="flex items-center justify-between bg-base-950/40 px-5 py-2">
                <p className="text-xs font-medium text-ink-secondary">{fmtDiaExtenso(grupo.data)}</p>
                <p className="text-xs text-ink-muted">
                  Neste dia você {verbo} <span className="font-medium text-ink-secondary">{fmtBRL(grupo.subtotal)}</span>
                </p>
              </div>

              <div className="divide-y divide-base-800/60">
                {grupo.itens.map((t) => {
                  const categoria = categoriaPorId(t.categoriaId);
                  const conta = contaPorId(t.contaId);
                  const situacao = situacaoDe(t);
                  const meta = SITUACAO_META[situacao];
                  const SituacaoIcon = meta.icon;
                  const CategoriaIcon = categoria.icon;
                  return (
                    <div key={t.id} className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-3">
                      <SituacaoIcon className={cn("h-4 w-4 shrink-0", meta.className)} aria-label={meta.label} />
                      <p className="w-11 shrink-0 text-xs text-ink-muted">{fmtDiaCurto(t.data)}</p>
                      <p className="truncate text-sm text-ink-primary">{t.descricao}</p>
                      <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                        <CategoriaIcon className="h-3.5 w-3.5 text-ink-muted" />
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: categoria.cor ?? "#8a8783" }}
                        />
                        <span className="whitespace-nowrap text-xs text-ink-secondary">{categoria.nome}</span>
                      </div>
                      <p className="hidden shrink-0 whitespace-nowrap text-xs text-ink-muted md:block">{conta.nome}</p>
                      <p className={cn("shrink-0 text-right text-sm font-semibold", aba === "despesas" ? "text-ink-primary" : "text-status-good")}>
                        {aba === "despesas" ? "-" : "+"}
                        {fmtBRL(t.valor)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
