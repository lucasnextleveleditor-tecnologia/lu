"use client";

import { useState, useTransition } from "react";
import type { AprovacaoPendente } from "@/app/dashboard/actions";
import { aprovarVersaoCliente, getUrlDownloadCliente, solicitarAlteracaoVersaoCliente } from "@/app/dashboard/actions";
import { STATUS_APROVACAO_META, fmtTamanhoArquivo } from "@/lib/utils/producao";
import { fmtDataHora } from "@/lib/utils/status";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconCheck, IconExternalLink, IconPaperclip, IconRotateCcw } from "@/components/ui/icons";

interface AprovacoesPendentesProps {
  aprovacoes: AprovacaoPendente[];
}

/**
 * Único conteúdo do Dashboard do cliente (ver `src/app/dashboard/page.tsx`)
 * — a lista de materiais que a Produção enviou e ainda esperam a decisão
 * dele (Aprovar / Solicitar Alteração). Mesmo par de ações e mesmo texto
 * de `EntregasSection.tsx` (admin), só que chamando as Server Actions
 * "Cliente" (`src/app/dashboard/actions.ts`), que verificam posse antes de
 * mexer em qualquer linha.
 */
export function AprovacoesPendentes({ aprovacoes }: AprovacoesPendentesProps) {
  if (aprovacoes.length === 0) {
    return (
      <Card>
        <div className="rounded-xl border border-dashed border-base-700 py-14 text-center text-sm text-ink-muted">
          Nada esperando sua aprovação no momento.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {aprovacoes.map((item) => (
        <VersaoCard key={item.versaoId} item={item} />
      ))}
    </div>
  );
}

function VersaoCard({ item }: { item: AprovacaoPendente }) {
  const [observacao, setObservacao] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAprovar() {
    setError(null);
    startTransition(async () => {
      const result = await aprovarVersaoCliente(item.versaoId);
      if (!result.ok) setError(result.error);
    });
  }

  function handleSolicitarAlteracao(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await solicitarAlteracaoVersaoCliente(item.versaoId, observacao);
      if (!result.ok) setError(result.error);
      else setObservacao("");
    });
  }

  async function handleAbrirArquivo() {
    setError(null);
    const result = await getUrlDownloadCliente(item.versaoId);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  return (
    <Card>
      <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-primary">{item.tarefaTitulo}</p>
          <p className="truncate text-xs text-ink-muted">{item.entregaNome}</p>
        </div>
        <Badge tone={STATUS_APROVACAO_META.pendente.tone} label={STATUS_APROVACAO_META.pendente.label} />
      </div>

      <div className="mb-3 rounded-lg border border-base-700 bg-base-950/40 p-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded bg-base-800 px-1.5 py-0.5 text-[11px] font-semibold text-ink-secondary">V{item.versao}</span>
          {item.temArquivo ? (
            <button onClick={handleAbrirArquivo} className="flex items-center gap-1 text-sm text-ink-primary hover:underline">
              <IconPaperclip className="h-3.5 w-3.5" />
              {item.nomeArquivo}
            </button>
          ) : (
            <a href={item.linkUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-ink-primary hover:underline">
              <IconExternalLink className="h-3.5 w-3.5" />
              {item.nomeArquivo}
            </a>
          )}
        </div>
        <p className="text-xs text-ink-muted">
          {item.temArquivo && item.tamanhoBytes != null && `${fmtTamanhoArquivo(item.tamanhoBytes)} · `}
          Enviado em {fmtDataHora(item.criadoEm)}
        </p>
      </div>

      <div className="space-y-2">
        <Button onClick={handleAprovar} disabled={pending} className="w-full">
          <IconCheck className="h-4 w-4" />
          Aprovar
        </Button>
        <form onSubmit={handleSolicitarAlteracao} className="flex gap-1.5">
          <Input value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="O que precisa mudar?" className="flex-1 text-sm" />
          <Button type="submit" variant="danger" disabled={pending} className="shrink-0 px-3 text-sm">
            <IconRotateCcw className="h-3.5 w-3.5" />
            Solicitar Alteração
          </Button>
        </form>
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </Card>
  );
}
