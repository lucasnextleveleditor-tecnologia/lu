"use client";

import { useState } from "react";
import type { DadosObjetivos } from "@/app/admin/objetivos/data";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { fmtMesAno } from "@/lib/utils/financeiro";
import { TONE_META, type Tone } from "@/lib/utils/tone";
import { ProgressRing } from "@/components/admin/financeiro/caixinhas/ProgressRing";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { OlhoValoresToggle } from "@/components/ui/OlhoValoresToggle";
import { Button } from "@/components/ui/Button";
import { IconFlag, IconTrendingUp, IconBarChart2 } from "@/components/ui/icons";
import { ConfigurarMetasModal } from "@/components/admin/objetivos/ConfigurarMetasModal";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ObjetivosDict } from "@/lib/i18n/dictionaries/pt/objetivos";

interface ObjetivosViewProps {
  dados: DadosObjetivos;
}

interface StatusRitmo {
  tone: Tone;
  labelKey: keyof Pick<ObjetivosDict, "statusAcimaRitmo" | "statusNoRitmo" | "statusAbaixoRitmo" | "statusSemMeta">;
}

/**
 * Classifica o ritmo comparando "quanto da meta já foi atingido" com "quanto
 * do período já passou" — se você já fez 60% da meta com só 40% do mês
 * decorrido, está adiantado; o contrário, atrasado. Pura razão entre duas
 * frações, nada de estimativa "de IA" fingindo saber o futuro.
 */
function classificarRitmo(pct: number, fracaoTempo: number, temMeta: boolean): StatusRitmo {
  if (!temMeta) return { tone: "neutral", labelKey: "statusSemMeta" };
  if (fracaoTempo <= 0) return { tone: "neutral", labelKey: "statusNoRitmo" };
  const razao = pct / fracaoTempo;
  if (razao >= 1.05) return { tone: "good", labelKey: "statusAcimaRitmo" };
  if (razao >= 0.9) return { tone: "neutral", labelKey: "statusNoRitmo" };
  if (razao >= 0.7) return { tone: "warning", labelKey: "statusAbaixoRitmo" };
  return { tone: "critical", labelKey: "statusAbaixoRitmo" };
}

function Badge({ tone, texto }: { tone: Tone; texto: string }) {
  return <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium", TONE_META[tone].badgeClassName)}>{texto}</span>;
}

function MetaCard({
  titulo,
  subtitulo,
  meta,
  faturado,
  restante,
  pct,
  dict,
  onConfigurar,
}: {
  titulo: string;
  subtitulo: string;
  meta: number | null;
  faturado: number;
  restante: number | null;
  pct: number;
  dict: ObjetivosDict;
  onConfigurar: () => void;
}) {
  const temMeta = meta != null && meta > 0;
  const atingida = temMeta && pct >= 1;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-base-700/70 bg-gradient-to-br from-zinc-900 to-black p-5 shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb)_/_0.05)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-primary">{titulo}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{subtitulo}</p>
        </div>
        <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
          {temMeta ? (
            <>
              <ProgressRing pct={pct} size={72} strokeWidth={6} atingida={atingida} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-ink-primary">{fmtPercent(Math.min(1, pct))}</span>
              </div>
            </>
          ) : (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
              <IconFlag className="h-6 w-6 text-ink-secondary" />
            </div>
          )}
        </div>
      </div>

      {temMeta ? (
        <div className="mt-5 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">{dict.metaLabel}</span>
            <ValorPrivado valor={fmtBRL(meta)} className="font-medium text-ink-primary" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">{dict.faturadoLabel}</span>
            <ValorPrivado valor={fmtBRL(faturado)} className="font-medium text-status-good" />
          </div>
          <div className="flex items-center justify-between border-t border-base-800 pt-2">
            <span className="text-ink-muted">{atingida ? dict.metaBatidaLabel : dict.faltaLabel}</span>
            {!atingida && <ValorPrivado valor={fmtBRL(restante ?? 0)} className="font-semibold text-ink-primary" />}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-base-700 p-4 text-center">
          <p className="text-xs text-ink-muted">{dict.semMetaDescricao}</p>
          <Button type="button" variant="ghost" className="mt-2" onClick={onConfigurar}>
            {dict.definirMetaBtn}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Gráfico "Ritmo do Ano" — diferente da fileira de marcadores uniformes que
 * a inspiração usava (todos com a mesma altura, só o mês atual destacado),
 * aqui cada barra tem ALTURA PROPORCIONAL ao faturamento real daquele mês, e
 * meses futuros aparecem tracejados/vazios em vez de "zerados" (zero
 * pareceria meta perdida, quando na verdade o mês simplesmente não chegou).
 * A linha tracejada marca a média mensal necessária pra bater a meta anual
 * — dá pra ver de cara quais meses ficaram acima ou abaixo dela.
 */
function RitmoAnoCard({ dados, dict }: { dados: DadosObjetivos; dict: ObjetivosDict }) {
  const { mesesDoAno, metaMensalPorMes } = dados;
  const maiorValor = Math.max(...mesesDoAno.map((m) => m.receita), metaMensalPorMes ?? 0, 1);

  return (
    <div className="rounded-2xl border border-base-700 bg-base-900/80 p-5 shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb)_/_0.04)]">
      <div className="mb-1 flex items-center gap-1.5 text-ink-muted">
        <IconBarChart2 className="h-3.5 w-3.5" />
        <p className="text-xs font-semibold uppercase tracking-wide">{dict.ritmoTitulo}</p>
      </div>
      <p className="text-xs text-ink-muted">{dict.ritmoSubtitulo}</p>

      <div className="relative mt-6 h-36">
        {metaMensalPorMes != null && (
          <div
            className="absolute inset-x-0 border-t border-dashed border-ink-muted/50"
            style={{ bottom: `${Math.min(100, (metaMensalPorMes / maiorValor) * 100)}%` }}
          />
        )}
        <div className="absolute inset-0 flex items-end gap-1.5 sm:gap-2">
          {mesesDoAno.map((ponto, idx) => {
            const bateuMedia = metaMensalPorMes != null && ponto.receita >= metaMensalPorMes;
            const alturaPct = ponto.futuro ? 5 : Math.max(3, (ponto.receita / maiorValor) * 100);
            return (
              <div key={idx} className="flex h-full flex-1 flex-col items-center justify-end">
                <div
                  title={ponto.futuro ? dict.ritmoMesFuturoHint : fmtBRL(ponto.receita)}
                  className={cn(
                    "w-full rounded-t-md transition-[height]",
                    ponto.futuro ? "border border-dashed border-base-600 bg-transparent" : bateuMedia ? "bg-status-good" : "bg-accent",
                    ponto.atual && !ponto.futuro && "ring-2 ring-white/50"
                  )}
                  style={{ height: `${alturaPct}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {dict.mesesAbreviados.map((label: string, idx: number) => (
          <p key={idx} className={cn("flex-1 text-center text-[10px]", mesesDoAno[idx]!.atual ? "font-semibold text-ink-primary" : "text-ink-muted")}>
            {label}
          </p>
        ))}
      </div>

      {metaMensalPorMes != null ? (
        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-muted">
          <span className="inline-block h-0 w-3 border-t border-dashed border-ink-muted/70" />
          {dict.ritmoLegendaMedia}: <ValorPrivado valor={fmtBRL(metaMensalPorMes)} className="font-medium text-ink-secondary" />
        </p>
      ) : (
        <p className="mt-4 text-[11px] text-ink-muted">{dict.ritmoSemDados}</p>
      )}
    </div>
  );
}

function TendenciaCard({ dados, dict }: { dados: DadosObjetivos; dict: ObjetivosDict }) {
  const { mesesDoAno, mesAtualIdx, ano, projecaoMes, projecaoAno, metaMensal, metaAnual, pctMes, pctAno, diaDoMes, totalDiasMes, diaDoAno, totalDiasAno } = dados;

  const nomeMes = mesesDoAno[mesAtualIdx]!.mes.toLocaleDateString("pt-BR", { month: "long", timeZone: "UTC" });
  const statusMes = classificarRitmo(pctMes, diaDoMes / totalDiasMes, metaMensal != null && metaMensal > 0);
  const statusAno = classificarRitmo(pctAno, diaDoAno / totalDiasAno, metaAnual != null && metaAnual > 0);

  return (
    <div className="rounded-2xl border border-base-700 bg-base-900/80 p-5 shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb)_/_0.04)]">
      <div className="mb-1 flex items-center gap-1.5 text-ink-muted">
        <IconTrendingUp className="h-3.5 w-3.5" />
        <p className="text-xs font-semibold uppercase tracking-wide">{dict.tendenciaTitulo}</p>
      </div>
      <p className="text-xs text-ink-muted">{dict.tendenciaSubtitulo}</p>

      <div className="mt-4 space-y-4">
        <div className="flex items-start justify-between gap-3 border-t border-base-800 pt-3">
          <p className="text-sm text-ink-secondary">
            {dict.tendenciaMesTexto.replace("{mes}", nomeMes).replace("{valor}", fmtBRL(projecaoMes))}
            {metaMensal != null && metaMensal > 0 && (
              <span className="ml-1.5 text-ink-muted">— {dict.tendenciaPctMeta.replace("{pct}", fmtPercent(projecaoMes / metaMensal))}</span>
            )}
          </p>
          <Badge tone={statusMes.tone} texto={dict[statusMes.labelKey]} />
        </div>
        <div className="flex items-start justify-between gap-3 border-t border-base-800 pt-3">
          <p className="text-sm text-ink-secondary">
            {dict.tendenciaAnoTexto.replace("{ano}", String(ano)).replace("{valor}", fmtBRL(projecaoAno))}
            {metaAnual != null && metaAnual > 0 && (
              <span className="ml-1.5 text-ink-muted">— {dict.tendenciaPctMeta.replace("{pct}", fmtPercent(projecaoAno / metaAnual))}</span>
            )}
          </p>
          <Badge tone={statusAno.tone} texto={dict[statusAno.labelKey]} />
        </div>
      </div>
    </div>
  );
}

export function ObjetivosView({ dados }: ObjetivosViewProps) {
  const { dict } = useLocale();
  const [modalAberto, setModalAberto] = useState(false);
  const mesReferencia = dados.mesesDoAno[dados.mesAtualIdx]!.mes;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{dict.objetivos.tituloPagina}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{dict.objetivos.subtituloPagina}</p>
        </div>
        <div className="flex items-center gap-2">
          <OlhoValoresToggle />
          <Button type="button" variant="ghost" className="gap-1.5" onClick={() => setModalAberto(true)}>
            <IconFlag className="h-3.5 w-3.5" />
            {dict.objetivos.configurarMetasBtn}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetaCard
          titulo={dict.objetivos.metaMesTitulo}
          subtitulo={fmtMesAno(mesReferencia)}
          meta={dados.metaMensal}
          faturado={dados.faturadoMes}
          restante={dados.restanteMes}
          pct={dados.pctMes}
          dict={dict.objetivos}
          onConfigurar={() => setModalAberto(true)}
        />
        <MetaCard
          titulo={dict.objetivos.metaAnoTitulo}
          subtitulo={String(dados.ano)}
          meta={dados.metaAnual}
          faturado={dados.faturadoAno}
          restante={dados.restanteAno}
          pct={dados.pctAno}
          dict={dict.objetivos}
          onConfigurar={() => setModalAberto(true)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <RitmoAnoCard dados={dados} dict={dict.objetivos} />
        <TendenciaCard dados={dados} dict={dict.objetivos} />
      </div>

      {modalAberto && (
        <ConfigurarMetasModal metaMensalAtual={dados.metaMensal} metaAnualAtual={dados.metaAnual} onClose={() => setModalAberto(false)} />
      )}
    </div>
  );
}
