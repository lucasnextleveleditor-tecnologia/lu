"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContaEmAtencao, DestaqueVencimento } from "@/app/admin/financeiro/data";
import { fmtDataCurta, todayISO } from "@/lib/utils/format";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { IconAlertTriangle, IconCreditCard, IconX, IconChevronRight } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * O lembrete que abre junto com o Financeiro.
 *
 * Vem do cartão "Precisa de atenção" do Dashboard: lá o número diz QUANTAS
 * contas estão vencidas, e a pergunta seguinte é sempre "quais?". Antes o
 * link só abria o Financeiro no mês corrente e a pessoa tinha que caçar —
 * pior ainda porque conta vencida costuma ser de mês passado, que nem
 * aparece na lista aberta.
 *
 * Por isso cada linha aqui leva ao MÊS DA PRÓPRIA CONTA, com a transação
 * destacada na lista. E o lembrete fecha: é um recado, não um bloco fixo do
 * painel.
 */
export function LembreteVencimentos({
  destaque,
  contas,
  contexto,
}: {
  destaque: DestaqueVencimento;
  contas: ContaEmAtencao[];
  contexto: string;
}) {
  const { dict, fmtMoeda } = useLocale();
  const t = dict.financeiro;
  const [fechado, setFechado] = useState(false);
  if (fechado) return null;

  const vencidas = destaque === "vencidas";
  const Icon = vencidas ? IconCreditCard : IconAlertTriangle;
  const total = contas.reduce((soma, c) => soma + c.valor, 0);
  const hoje = todayISO();

  /** Quantos dias de atraso — em dias de calendário, sem hora, para não errar por causa de fuso. */
  function diasDeAtraso(iso: string): number {
    const de = Date.parse(`${iso}T00:00:00Z`);
    const ate = Date.parse(`${hoje}T00:00:00Z`);
    return Math.max(0, Math.round((ate - de) / 86_400_000));
  }

  return (
    <div
      className={`rounded-2xl border p-5 ${
        vencidas ? "border-status-critical/40 bg-status-critical/10" : "border-status-warning/40 bg-status-warning/10"
      }`}
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            vencidas ? "bg-status-critical/15" : "bg-status-warning/15"
          }`}
        >
          <Icon className={`h-4 w-4 ${vencidas ? "text-status-critical" : "text-status-warning"}`} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-primary">
            {contas.length} · {vencidas ? t.lembreteVencidasTitulo : t.lembreteVencendoHojeTitulo}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {vencidas ? t.lembreteVencidasHint : t.lembreteVencendoHojeHint}
            {contas.length > 0 && (
              <>
                {" · "}
                <ValorPrivado valor={fmtMoeda(total)} />
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFechado(true)}
          title={t.lembreteFechar}
          aria-label={t.lembreteFechar}
          className="shrink-0 rounded-lg border border-base-700 p-1.5 text-ink-muted transition hover:text-ink-primary"
        >
          <IconX className="h-3.5 w-3.5" />
        </button>
      </div>

      {contas.length === 0 ? (
        <p className="text-xs text-ink-muted">{t.lembreteNadaAqui}</p>
      ) : (
        <ul className="divide-y divide-base-800/80 rounded-xl border border-base-800 bg-base-950/40">
          {contas.map((conta) => {
            const dias = vencidas ? diasDeAtraso(conta.data_vencimento) : 0;
            const qs = new URLSearchParams({
              mes: conta.mesParam,
              foco: conta.id,
              ...(contexto !== "todos" ? { contexto } : {}),
            }).toString();
            return (
              <li key={conta.id}>
                <Link
                  href={`/admin/financeiro?${qs}`}
                  className="group flex items-center gap-3 px-3 py-2.5 transition hover:bg-base-800/50"
                  title={t.lembreteVerConta}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink-primary">{conta.descricao}</span>
                    <span className="block truncate text-xs text-ink-muted">
                      {fmtDataCurta(conta.data_vencimento)}
                      {vencidas && dias > 0 && ` · ${dias === 1 ? t.lembreteAtrasoUmDia : t.lembreteAtrasoDias.replace("{n}", String(dias))}`}
                      {conta.origem && ` · ${conta.origem}`}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-primary">
                    <ValorPrivado valor={fmtMoeda(conta.valor)} />
                  </span>
                  <IconChevronRight className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:text-ink-secondary" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
