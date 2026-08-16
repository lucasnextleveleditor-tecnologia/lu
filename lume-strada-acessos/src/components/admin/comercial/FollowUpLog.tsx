"use client";

import { useEffect, useState, useTransition } from "react";
import type { AnotacaoRow } from "@/lib/types/comercial";
import { criarAnotacao } from "@/app/admin/comercial/actions";
import { CADENCIA_FOLLOWUP_DIAS, sugerirProximoContato } from "@/lib/utils/comercial";
import { fmtDataHora } from "@/lib/utils/status";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function FollowUpLog({ leadId, anotacoes }: { leadId: string; anotacoes: AnotacaoRow[] }) {
  const [nota, setNota] = useState("");
  // Pré-preenchido com a sugestão da cadência (ver `sugerirProximoContato`)
  // pra não depender de ninguém lembrar de calcular/digitar a data — mas
  // continua um campo de data normal, editável/limpável como sempre foi.
  const [proximoContato, setProximoContato] = useState(() => sugerirProximoContato(anotacoes.length));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Recalcula a sugestão quando o histórico muda de verdade (depois de
  // registrar uma anotação e a página revalidar) — nunca enquanto a pessoa
  // ainda está digitando/editando o rascunho atual.
  useEffect(() => {
    setProximoContato(sugerirProximoContato(anotacoes.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anotacoes.length]);

  const numeroContato = anotacoes.length + 1;
  const indiceCadencia = Math.min(anotacoes.length, CADENCIA_FOLLOWUP_DIAS.length - 1);
  const diasSugeridos = CADENCIA_FOLLOWUP_DIAS[indiceCadencia] ?? CADENCIA_FOLLOWUP_DIAS[CADENCIA_FOLLOWUP_DIAS.length - 1]!;

  function handleAdicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!nota.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await criarAnotacao(leadId, nota, proximoContato || null);
      if (!result.ok) setError(result.error);
      else setNota("");
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
            <label className="mb-1 block text-[11px] text-ink-muted">
              Próximo contato <span className="text-ink-muted/70">(sugestão: {numeroContato}º contato, +{diasSugeridos}d)</span>
            </label>
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
