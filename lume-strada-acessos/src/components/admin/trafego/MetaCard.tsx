"use client";

import React, { useState, useTransition } from "react";
import type { MetaDiariaRow, TipoResultadoTrafego, TrafegoRegistroRow } from "@/lib/types/database";
import type { ClienteRow } from "@/lib/types/cadastros";
import { calcularResumoTrafego, STATUS_TRAFEGO_META } from "@/lib/utils/trafego";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { salvarMeta, adicionarRegistro, removerRegistro } from "@/app/admin/trafego/actions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Meter } from "@/components/ui/Meter";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { TONE_GLOW } from "@/components/admin/trafego/tone-glow";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface MetaCardProps {
  cliente: Pick<ClienteRow, "id" | "nome" | "email" | "cor">;
  data: string; // yyyy-mm-dd selecionado
  meta: MetaDiariaRow | null;
  registros: TrafegoRegistroRow[];
}

const EMPTY_REGISTRO = {
  nomeCampanha: "",
  valorInvestido: "",
  cliques: "",
  visualizacoes: "",
  tipoResultado: "leads" as TipoResultadoTrafego,
  quantidade: "",
};

export function MetaCard({ cliente, data, meta, registros }: MetaCardProps) {
  const { dict } = useLocale();
  const [valorMeta, setValorMeta] = useState(String(meta?.valor_investido_meta ?? 0));
  const [leadsMeta, setLeadsMeta] = useState(meta?.leads_meta != null ? String(meta.leads_meta) : "");
  const [objetivo, setObjetivo] = useState(meta?.objetivo ?? "");
  const [novoRegistro, setNovoRegistro] = useState(EMPTY_REGISTRO);

  const [pendingMeta, startMetaTransition] = useTransition();
  const [pendingRegistro, startRegistroTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const resumo = calcularResumoTrafego(meta ? { valor_investido_meta: meta.valor_investido_meta } : null, registros);
  const statusMeta = STATUS_TRAFEGO_META[resumo.status];

  function salvarMetaAtual() {
    setError(null);
    startMetaTransition(async () => {
      const result = await salvarMeta(cliente.id, data, {
        valorInvestidoMeta: Number(valorMeta) || 0,
        leadsMeta: leadsMeta.trim() === "" ? null : Number(leadsMeta),
        objetivo: objetivo.trim() || null,
      });
      if (!result.ok) setError(result.error);
    });
  }

  function handleAdicionarRegistro(e: React.FormEvent) {
    e.preventDefault();
    if (!novoRegistro.valorInvestido && !novoRegistro.quantidade && !novoRegistro.cliques && !novoRegistro.visualizacoes) return;
    setError(null);
    startRegistroTransition(async () => {
      const result = await adicionarRegistro(cliente.id, data, {
        nomeCampanha: novoRegistro.nomeCampanha.trim() || null,
        valorInvestido: Number(novoRegistro.valorInvestido) || 0,
        tipoResultado: novoRegistro.tipoResultado,
        quantidadeResultado: Number(novoRegistro.quantidade) || 0,
        cliques: Number(novoRegistro.cliques) || 0,
        visualizacoes: Number(novoRegistro.visualizacoes) || 0,
      });
      if (!result.ok) setError(result.error);
      else setNovoRegistro(EMPTY_REGISTRO);
    });
  }

  function handleRemoverRegistro(id: string) {
    setError(null);
    startRegistroTransition(async () => {
      const result = await removerRegistro(id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    // O glow por tone fica num wrapper FORA do `Card` de propósito: o
    // `Card` compartilhado já tem seu próprio `shadow-[...]` de reflexo
    // interno (usado em todos os outros módulos) — duas classes
    // `shadow-[...]` no MESMO elemento não somam, só uma vence. Em
    // elementos diferentes (wrapper + Card) os dois efeitos aparecem juntos
    // sem conflito.
    <div className={cn("rounded-2xl transition-all duration-300 hover:-translate-y-0.5", TONE_GLOW[statusMeta.tone])}>
      <Card className="overflow-hidden bg-gradient-to-br from-base-800/30 via-transparent to-transparent">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            {cliente.cor && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cliente.cor }} />}
            {cliente.nome || dict.trafego.semNome}
          </p>
          {cliente.email && <p className="text-xs text-ink-muted">{cliente.email}</p>}
        </div>
        <Badge tone={statusMeta.tone} label={statusMeta.label} />
      </div>

      {/* Meta do dia — editável pelo admin */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.metaInvestimentoLabel}</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={valorMeta}
            onChange={(e) => setValorMeta(e.target.value)}
            onBlur={salvarMetaAtual}
            disabled={pendingMeta}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.metaLeadsLabel}</label>
          <Input
            type="number"
            min="0"
            step="1"
            value={leadsMeta}
            onChange={(e) => setLeadsMeta(e.target.value)}
            onBlur={salvarMetaAtual}
            disabled={pendingMeta}
            placeholder="—"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.objetivoDiaLabel}</label>
          <Input
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            onBlur={salvarMetaAtual}
            disabled={pendingMeta}
            placeholder={dict.trafego.objetivoDiaPlaceholder}
          />
        </div>
      </div>

      {/* Status atual do tráfego — a razão contra o limite (Meter) */}
      <div className="mb-5 rounded-xl border border-base-700/70 bg-gradient-to-b from-base-800/40 to-base-950/60 p-4 shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.05)]">
        <div className="flex items-center justify-between mb-2 text-xs text-ink-secondary">
          <span>
            {dict.trafego.investidoLabel} <span className="font-medium text-ink-primary">{fmtBRL(resumo.totalInvestido)}</span>
            {meta && meta.valor_investido_meta > 0 && (
              <>
                {" "}
                {dict.trafego.deTexto} {fmtBRL(meta.valor_investido_meta)}
              </>
            )}
          </span>
          {resumo.pctInvestido !== null && <span className="font-medium text-ink-primary">{fmtPercent(resumo.pctInvestido)}</span>}
        </div>
        <div className={cn("rounded-full", TONE_GLOW[statusMeta.tone === "neutral" ? "neutral" : statusMeta.tone])}>
          <Meter pct={resumo.pctInvestido ?? 0} tone={statusMeta.tone === "neutral" ? "neutral" : statusMeta.tone} />
        </div>
        {/* Resultados do dia — só mostra cada estatística se ela tiver algo
            lançado (evita mostrar "Vendas: 0" ou "Custo/Lead: —" pra quem só
            trabalha com um dos dois tipos de resultado). */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-secondary">
          {(resumo.totalLeads > 0 || meta?.leads_meta != null) && (
            <span>
              {dict.trafego.leadsLabel} <span className="font-medium text-ink-primary">{resumo.totalLeads}</span>
              {meta?.leads_meta != null && (
                <>
                  {" "}
                  {dict.trafego.deTexto} {meta.leads_meta}
                </>
              )}
            </span>
          )}
          {resumo.totalVendas > 0 && (
            <span>
              {dict.trafego.vendasLabel} <span className="font-medium text-ink-primary">{resumo.totalVendas}</span>
            </span>
          )}
          {resumo.totalCliques > 0 && (
            <span>
              {dict.trafego.cliquesAbrevLabel} <span className="font-medium text-ink-primary">{resumo.totalCliques}</span>
            </span>
          )}
          {resumo.totalVisualizacoes > 0 && (
            <span>
              {dict.trafego.viewsAbrevLabel} <span className="font-medium text-ink-primary">{resumo.totalVisualizacoes}</span>
            </span>
          )}
          {resumo.custoPorLead !== null && (
            <span>
              {dict.trafego.custoPorLeadLabel} <span className="font-medium text-ink-primary">{fmtBRL(resumo.custoPorLead)}</span>
            </span>
          )}
          {resumo.custoPorVenda !== null && (
            <span>
              {dict.trafego.custoPorVendaLabel} <span className="font-medium text-ink-primary">{fmtBRL(resumo.custoPorVenda)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Campanhas / lançamentos do dia */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.trafego.lancamentosDoDia}</p>
        {registros.length > 0 && (
          <div className="mb-3 space-y-2">
            {registros.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-base-700/70 bg-gradient-to-r from-base-800/40 to-base-950/40 px-3 py-2 text-sm transition-colors hover:border-base-600"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.nome_campanha || dict.trafego.lancamentoSemNome}</p>
                  <p className="text-xs text-ink-muted">
                    {fmtBRL(r.valor_investido)} · {r.quantidade_resultado}{" "}
                    {r.tipo_resultado === "vendas" ? dict.trafego.vendasSufixo : dict.trafego.leadsSufixo}
                    {(r.cliques > 0 || r.visualizacoes > 0) && " · "}
                    {r.cliques > 0 && `${r.cliques} ${dict.trafego.cliquesAbrevLabel.replace(":", "").toLowerCase()}`}
                    {r.cliques > 0 && r.visualizacoes > 0 && " · "}
                    {r.visualizacoes > 0 && `${r.visualizacoes} ${dict.trafego.viewsAbrevLabel.replace(":", "").toLowerCase()}`}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoverRegistro(r.id)}
                  disabled={pendingRegistro}
                  className="shrink-0 text-ink-muted transition hover:text-danger"
                  aria-label={dict.trafego.removerLancamento}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAdicionarRegistro} className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Input
              value={novoRegistro.nomeCampanha}
              onChange={(e) => setNovoRegistro((f) => ({ ...f, nomeCampanha: e.target.value }))}
              placeholder={dict.trafego.campanhaPlaceholder}
              className="flex-1 min-w-[140px]"
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={novoRegistro.valorInvestido}
              onChange={(e) => setNovoRegistro((f) => ({ ...f, valorInvestido: e.target.value }))}
              placeholder={dict.trafego.valorInvestidoPlaceholder}
              className="w-32"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="number"
              min="0"
              step="1"
              value={novoRegistro.cliques}
              onChange={(e) => setNovoRegistro((f) => ({ ...f, cliques: e.target.value }))}
              placeholder={dict.trafego.cliquesLabel}
              className="w-24"
            />
            <Input
              type="number"
              min="0"
              step="1"
              value={novoRegistro.visualizacoes}
              onChange={(e) => setNovoRegistro((f) => ({ ...f, visualizacoes: e.target.value }))}
              placeholder={dict.trafego.visualizacoesLabel}
              className="w-28"
            />
            {/* Escolhe o QUE a quantidade abaixo está contando — nem toda
                campanha gera lead, algumas (ex: link direto de checkout)
                geram venda sem passar por um lead antes. */}
            <div className="flex shrink-0 rounded-lg border border-base-600 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setNovoRegistro((f) => ({ ...f, tipoResultado: "leads" }))}
                className={cn(
                  "rounded-md px-2 py-1 font-medium transition",
                  novoRegistro.tipoResultado === "leads" ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
                )}
              >
                {dict.trafego.tipoResultadoLeadsOpcao}
              </button>
              <button
                type="button"
                onClick={() => setNovoRegistro((f) => ({ ...f, tipoResultado: "vendas" }))}
                className={cn(
                  "rounded-md px-2 py-1 font-medium transition",
                  novoRegistro.tipoResultado === "vendas" ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
                )}
              >
                {dict.trafego.tipoResultadoVendasOpcao}
              </button>
            </div>
            <Input
              type="number"
              min="0"
              step="1"
              value={novoRegistro.quantidade}
              onChange={(e) => setNovoRegistro((f) => ({ ...f, quantidade: e.target.value }))}
              placeholder={dict.trafego.quantidadePlaceholder}
              className="w-20"
            />
            <Button type="submit" variant="ghost" disabled={pendingRegistro} className="shrink-0">
              {pendingRegistro ? "..." : `+ ${dict.trafego.lancarBotao}`}
            </Button>
          </div>
        </form>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </div>
      </Card>
    </div>
  );
}
