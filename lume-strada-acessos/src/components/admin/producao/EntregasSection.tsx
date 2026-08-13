"use client";

import { useRef, useState, useTransition } from "react";
import type { EntregaComVersoes } from "@/lib/types/producao";
import {
  aprovarVersao,
  criarEntrega,
  enviarVersaoArquivo,
  enviarVersaoLink,
  getUrlDownload,
  removerEntrega,
  solicitarAlteracaoVersao,
} from "@/app/admin/producao/actions";
import { STATUS_APROVACAO_META, fmtTamanhoArquivo } from "@/lib/utils/producao";
import { fmtDataHora } from "@/lib/utils/status";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconCheck, IconExternalLink, IconPaperclip, IconRotateCcw } from "@/components/ui/icons";

interface EntregasSectionProps {
  tarefaId: string;
  entregas: EntregaComVersoes[];
}

export function EntregasSection({ tarefaId, entregas }: EntregasSectionProps) {
  const [novoNome, setNovoNome] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCriarEntrega(e: React.FormEvent) {
    e.preventDefault();
    if (!novoNome.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await criarEntrega(tarefaId, novoNome);
      if (!result.ok) setError(result.error);
      else setNovoNome("");
    });
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Entregas &amp; Aprovação</p>

      {entregas.length === 0 && <p className="mb-3 text-xs text-ink-muted">Nenhuma entrega criada ainda — crie um slot pra enviar arquivos ou links (ex: &quot;Vídeo Final&quot;).</p>}

      <div className="mb-3 space-y-3">
        {entregas.map((entrega) => (
          <EntregaCard key={entrega.id} tarefaId={tarefaId} entrega={entrega} />
        ))}
      </div>

      <form onSubmit={handleCriarEntrega} className="flex gap-2">
        <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome da entrega (ex: Vídeo Final)" className="flex-1" />
        <Button type="submit" variant="ghost" disabled={pending} className="shrink-0 px-3 py-2 text-xs">
          + Nova Entrega
        </Button>
      </form>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

function EntregaCard({ tarefaId, entrega }: { tarefaId: string; entrega: EntregaComVersoes }) {
  const [modoEnvio, setModoEnvio] = useState<"nenhum" | "arquivo" | "link">("nenhum");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkRotulo, setLinkRotulo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const versaoAtual = entrega.versoes[0] ?? null; // já vem ordenado por versão desc (ver page.tsx)
  const historico = entrega.versoes.slice(1);

  function handleArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const result = await enviarVersaoArquivo(tarefaId, entrega.id, formData);
      if (!result.ok) setError(result.error);
      else setModoEnvio("nenhum");
    });
  }

  function handleEnviarLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await enviarVersaoLink(tarefaId, entrega.id, { url: linkUrl, rotulo: linkRotulo });
      if (!result.ok) setError(result.error);
      else {
        setLinkUrl("");
        setLinkRotulo("");
        setModoEnvio("nenhum");
      }
    });
  }

  function handleAprovar() {
    if (!versaoAtual) return;
    setError(null);
    startTransition(async () => {
      const result = await aprovarVersao(tarefaId, versaoAtual.id);
      if (!result.ok) setError(result.error);
    });
  }

  function handleSolicitarAlteracao(e: React.FormEvent) {
    e.preventDefault();
    if (!versaoAtual) return;
    setError(null);
    startTransition(async () => {
      const result = await solicitarAlteracaoVersao(tarefaId, versaoAtual.id, observacao);
      if (!result.ok) setError(result.error);
      else setObservacao("");
    });
  }

  async function handleAbrirArquivo(storagePath: string) {
    setError(null);
    const result = await getUrlDownload(storagePath);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  function handleRemoverEntrega() {
    setError(null);
    startTransition(async () => {
      const result = await removerEntrega(entrega.id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="rounded-lg border border-base-700 bg-base-950/40 p-3.5">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink-primary">{entrega.nome}</p>
        <button onClick={handleRemoverEntrega} disabled={pending} className="shrink-0 text-ink-muted transition hover:text-danger" aria-label="Excluir entrega" title="Excluir entrega (todas as versões)">
          ×
        </button>
      </div>

      {versaoAtual ? (
        <div className="mb-2.5 rounded-md border border-base-700 bg-base-900/60 p-2.5">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-base-800 px-1.5 py-0.5 text-[11px] font-semibold text-ink-secondary">V{versaoAtual.versao}</span>
              {versaoAtual.tipo === "arquivo" ? (
                <button onClick={() => versaoAtual.storage_path && handleAbrirArquivo(versaoAtual.storage_path)} className="flex items-center gap-1 text-xs text-ink-primary hover:underline">
                  <IconPaperclip className="h-3.5 w-3.5" />
                  {versaoAtual.nome_arquivo}
                </button>
              ) : (
                <a href={versaoAtual.link_url ?? "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ink-primary hover:underline">
                  <IconExternalLink className="h-3.5 w-3.5" />
                  {versaoAtual.nome_arquivo}
                </a>
              )}
            </div>
            <Badge tone={STATUS_APROVACAO_META[versaoAtual.status_aprovacao].tone} label={STATUS_APROVACAO_META[versaoAtual.status_aprovacao].label} />
          </div>
          <p className="text-[11px] text-ink-muted">
            {versaoAtual.tipo === "arquivo" && `${fmtTamanhoArquivo(versaoAtual.tamanho_bytes)} · `}
            Enviado em {fmtDataHora(versaoAtual.created_at)}
          </p>
          {versaoAtual.observacao_aprovacao && (
            <p className="mt-1.5 rounded bg-status-critical/10 px-2 py-1 text-[11px] text-ink-secondary">
              &quot;{versaoAtual.observacao_aprovacao}&quot;
            </p>
          )}

          {versaoAtual.status_aprovacao === "pendente" && (
            <div className="mt-2.5 space-y-2">
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleAprovar} disabled={pending} className="flex-1 px-2.5 py-1.5 text-xs">
                  <IconCheck className="h-3.5 w-3.5" />
                  Aprovar
                </Button>
              </div>
              <form onSubmit={handleSolicitarAlteracao} className="flex gap-1.5">
                <Input
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="O que precisa mudar?"
                  className="flex-1 py-1.5 text-xs"
                />
                <Button type="submit" variant="danger" disabled={pending} className="shrink-0 px-2.5 py-1.5 text-xs">
                  <IconRotateCcw className="h-3.5 w-3.5" />
                  Solicitar Alteração
                </Button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <p className="mb-2.5 text-xs text-ink-muted">Nenhum arquivo/link enviado ainda.</p>
      )}

      {historico.length > 0 && (
        <button onClick={() => setMostrarHistorico((v) => !v)} className="mb-2 text-[11px] text-ink-muted hover:text-ink-primary">
          {mostrarHistorico ? "Ocultar" : "Ver"} histórico de versões ({historico.length})
        </button>
      )}
      {mostrarHistorico && (
        <div className="mb-2.5 space-y-1.5">
          {historico.map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-2 rounded border border-base-800 px-2 py-1.5 text-[11px] text-ink-muted">
              <span>
                V{v.versao} · {v.nome_arquivo}
              </span>
              <Badge tone={STATUS_APROVACAO_META[v.status_aprovacao].tone} label={STATUS_APROVACAO_META[v.status_aprovacao].label} />
            </div>
          ))}
        </div>
      )}

      {modoEnvio === "nenhum" && (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setModoEnvio("arquivo")} className="flex-1 px-2.5 py-1.5 text-xs">
            + Enviar Arquivo
          </Button>
          <Button variant="ghost" onClick={() => setModoEnvio("link")} className="flex-1 px-2.5 py-1.5 text-xs">
            + Enviar Link
          </Button>
        </div>
      )}
      {modoEnvio === "arquivo" && (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => inputRef.current?.click()} disabled={pending} className="flex-1 px-2.5 py-1.5 text-xs">
            {pending ? "Enviando..." : "Escolher arquivo"}
          </Button>
          <Button variant="ghost" onClick={() => setModoEnvio("nenhum")} className="px-2.5 py-1.5 text-xs">
            Cancelar
          </Button>
          <input ref={inputRef} type="file" className="hidden" onChange={handleArquivoSelecionado} />
        </div>
      )}
      {modoEnvio === "link" && (
        <form onSubmit={handleEnviarLink} className="space-y-1.5">
          <Input value={linkRotulo} onChange={(e) => setLinkRotulo(e.target.value)} placeholder="Rótulo (ex: Preview Vimeo)" className="text-xs" />
          <div className="flex gap-1.5">
            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="flex-1 text-xs" />
            <Button type="submit" disabled={pending} className="shrink-0 px-2.5 py-1.5 text-xs">
              Enviar
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModoEnvio("nenhum")} className="px-2.5 py-1.5 text-xs">
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
