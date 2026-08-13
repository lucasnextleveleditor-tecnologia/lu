"use client";

import { useState, useTransition } from "react";
import type { AnotacaoRow } from "@/lib/types/comercial";
import { criarAnotacao } from "@/app/admin/comercial/actions";
import { fmtDataHora } from "@/lib/utils/status";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function FollowUpLog({ leadId, anotacoes }: { leadId: string; anotacoes: AnotacaoRow[] }) {
  const [nota, setNota] = useState("");
  const [proximoContato, setProximoContato] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAdicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!nota.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await criarAnotacao(leadId, nota, proximoContato || null);
      if (!result.ok) setError(result.error);
      else {
        setNota("");
        setProximoContato("");
      }
    });
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Anotações &amp; Histórico</p>

      <form onSubmit={handleAdicionar} className="mb-3 space-y-2 rounded-lg border border-base-700 bg-base-950/40 p-3">
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Resumo da reunião/contato..."
          rows={3}
          className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition"
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-[11px] text-ink-muted">Agendar próximo contato (opcional)</label>
            <Input type="date" value={proximoContato} onChange={(e) => setProximoContato(e.target.value)} className="text-xs" />
          </div>
          <Button type="submit" disabled={pending} className="shrink-0 self-end px-3 py-2 text-xs">
            {pending ? "Salvando..." : "Registrar"}
          </Button>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </form>

      {anotacoes.length === 0 ? (
        <p className="text-xs text-ink-muted">Nenhum contato registrado ainda.</p>
      ) : (
        <div className="space-y-2">
          {anotacoes.map((a) => (
            <div key={a.id} className="rounded-lg border border-base-800 px-3 py-2">
              <p className="text-sm text-ink-primary">{a.nota}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                <span>{fmtDataHora(a.created_at)}</span>
                {a.proximo_contato_em && <span className="text-ink-secondary">Próx. contato agendado: {a.proximo_contato_em.split("-").reverse().join("/")}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
