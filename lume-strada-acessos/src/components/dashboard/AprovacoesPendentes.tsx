"use client";

import { useState, useTransition } from "react";
import type { AprovacaoPendente } from "@/app/dashboard/actions";
import { aprovarVersaoCliente, solicitarAlteracaoVersaoCliente } from "@/app/dashboard/actions";
import { STATUS_APROVACAO_META, fmtTamanhoArquivo } from "@/lib/utils/producao";
import { fmtDataHora } from "@/lib/utils/status";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconCheck, IconRotateCcw } from "@/components/ui/icons";
import { PreviewDaEntrega } from "@/components/dashboard/PreviewDaEntrega";
import { useLocale } from "@/lib/i18n/LocaleProvider";

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
  const { dict } = useLocale();

  if (aprovacoes.length === 0) {
    return (
      <Card>
        <div className="rounded-xl border border-dashed border-base-700 py-14 text-center text-sm text-ink-muted">
          {dict.cliente.nenhumaAprovacaoPendente}
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
  const { dict } = useLocale();
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

  return (
    <Card>
      <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-primary">{item.tarefaTitulo}</p>
          <p className="truncate text-xs text-ink-muted">{item.entregaNome}</p>
        </div>
        <Badge tone={STATUS_APROVACAO_META.pendente.tone} label={STATUS_APROVACAO_META.pendente.label} />
      </div>

      {/* A peça primeiro, o resto depois. O cliente abriu esta tela para VER
          o material — nome de arquivo, tamanho e data são contexto, e contexto
          não vai na frente do que se veio olhar. */}
      <div className="mb-3">
        <PreviewDaEntrega
          linkUrl={item.linkUrl}
          urlArquivo={item.urlArquivo}
          tipoMime={item.tipoMime}
          nomeArquivo={item.nomeArquivo}
        />
      </div>

      {/* A legenda, do jeito que vai ao ar: fonte de leitura, quebras de linha
          preservadas. Aprovar um post é aprovar a peça E o texto — mostrar só
          o vídeo faria o cliente aprovar metade e reclamar da outra. */}
      {item.legenda && (
        <div className="mb-3 rounded-lg border border-base-700 bg-base-950/40 p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            {dict.cliente.legendaTitulo}
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary">{item.legenda}</p>
        </div>
      )}

      <p className="mb-3 flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
        <span className="rounded bg-base-800 px-1.5 py-0.5 text-[11px] font-semibold text-ink-secondary">V{item.versao}</span>
        <span className="truncate">{item.nomeArquivo}</span>
        <span>
          {item.temArquivo && item.tamanhoBytes != null && `${fmtTamanhoArquivo(item.tamanhoBytes)} · `}
          {dict.cliente.enviadoEm.replace("{data}", fmtDataHora(item.criadoEm))}
        </span>
      </p>

      <div className="space-y-2">
        <Button onClick={handleAprovar} disabled={pending} className="w-full">
          <IconCheck className="h-4 w-4" />
          {dict.cliente.aprovar}
        </Button>
        <form onSubmit={handleSolicitarAlteracao} className="flex gap-1.5">
          <Input value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder={dict.cliente.placeholderAlteracao} className="flex-1 text-sm" />
          <Button type="submit" variant="danger" disabled={pending} className="shrink-0 px-3 text-sm">
            <IconRotateCcw className="h-3.5 w-3.5" />
            {dict.cliente.solicitarAlteracao}
          </Button>
        </form>
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </Card>
  );
}
