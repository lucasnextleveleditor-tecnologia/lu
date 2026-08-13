"use client";

import React, { useState, useTransition } from "react";
import type { MetaDiariaRow, ProfileRow, TrafegoRegistroRow } from "@/lib/types/database";
import { calcularResumoTrafego, STATUS_TRAFEGO_META } from "@/lib/utils/trafego";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { salvarMeta, adicionarRegistro, removerRegistro } from "@/app/admin/trafego/actions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Meter } from "@/components/ui/Meter";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface MetaCardProps {
  cliente: Pick<ProfileRow, "id" | "full_name" | "email">;
  data: string; // yyyy-mm-dd selecionado
  meta: MetaDiariaRow | null;
  registros: TrafegoRegistroRow[];
}

const EMPTY_REGISTRO = { nomeCampanha: "", valorInvestido: "", leadsGerados: "" };

export function MetaCard({ cliente, data, meta, registros }: MetaCardProps) {
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
    if (!novoRegistro.valorInvestido && !novoRegistro.leadsGerados) return;
    setError(null);
    startRegistroTransition(async () => {
      const result = await adicionarRegistro(cliente.id, data, {
        nomeCampanha: novoRegistro.nomeCampanha.trim() || null,
        valorInvestido: Number(novoRegistro.valorInvestido) || 0,
        leadsGerados: Number(novoRegistro.leadsGerados) || 0,
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
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <p className="text-sm font-semibold text-ink-primary">{cliente.full_name || "Sem nome"}</p>
          <p className="text-xs text-ink-muted">{cliente.email}</p>
        </div>
        <Badge tone={statusMeta.tone} label={statusMeta.label} />
      </div>

      {/* Meta do dia — editável pelo admin */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Meta de investimento (R$/dia)</label>
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
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Meta de leads (opcional)</label>
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
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Objetivo do dia (opcional)</label>
          <Input
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            onBlur={salvarMetaAtual}
            disabled={pendingMeta}
            placeholder="Ex: Lançamento da campanha X"
          />
        </div>
      </div>

      {/* Status atual do tráfego — a razão contra o limite (Meter) */}
      <div className="mb-5 rounded-xl border border-base-700 bg-base-950/60 p-4">
        <div className="flex items-center justify-between mb-2 text-xs text-ink-secondary">
          <span>
            Investido: <span className="font-medium text-ink-primary">{fmtBRL(resumo.totalInvestido)}</span>
            {meta && meta.valor_investido_meta > 0 && <> de {fmtBRL(meta.valor_investido_meta)}</>}
          </span>
          {resumo.pctInvestido !== null && <span className="font-medium text-ink-primary">{fmtPercent(resumo.pctInvestido)}</span>}
        </div>
        <Meter pct={resumo.pctInvestido ?? 0} tone={statusMeta.tone === "neutral" ? "neutral" : statusMeta.tone} />
        <p className="mt-2 text-xs text-ink-secondary">
          Leads: <span className="font-medium text-ink-primary">{resumo.totalLeads}</span>
          {meta?.leads_meta != null && <> de {meta.leads_meta}</>}
        </p>
      </div>

      {/* Campanhas / lançamentos do dia */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Lançamentos do dia</p>
        {registros.length > 0 && (
          <div className="mb-3 space-y-2">
            {registros.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-base-700 bg-base-950/40 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.nome_campanha || "Lançamento sem nome"}</p>
                  <p className="text-xs text-ink-muted">
                    {fmtBRL(r.valor_investido)} · {r.leads_gerados} lead(s)
                  </p>
                </div>
                <button
                  onClick={() => handleRemoverRegistro(r.id)}
                  disabled={pendingRegistro}
                  className="shrink-0 text-ink-muted transition hover:text-danger"
                  aria-label="Remover lançamento"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAdicionarRegistro} className="flex flex-wrap gap-2">
          <Input
            value={novoRegistro.nomeCampanha}
            onChange={(e) => setNovoRegistro((f) => ({ ...f, nomeCampanha: e.target.value }))}
            placeholder="Campanha (opcional)"
            className="flex-1 min-w-[140px]"
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            value={novoRegistro.valorInvestido}
            onChange={(e) => setNovoRegistro((f) => ({ ...f, valorInvestido: e.target.value }))}
            placeholder="R$ investido"
            className="w-32"
          />
          <Input
            type="number"
            min="0"
            step="1"
            value={novoRegistro.leadsGerados}
            onChange={(e) => setNovoRegistro((f) => ({ ...f, leadsGerados: e.target.value }))}
            placeholder="Leads"
            className="w-24"
          />
          <Button type="submit" variant="ghost" disabled={pendingRegistro} className="shrink-0">
            {pendingRegistro ? "..." : "+ Lançar"}
          </Button>
        </form>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </div>
    </Card>
  );
}
