"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ContatoWhatsappRow, MensagemWhatsappRow } from "@/lib/types/whatsapp";
import { fmtHoraOuData, fmtPreviewMensagem, fmtTelefoneExibicao, iniciaisContato } from "@/lib/utils/whatsapp";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { IconPaperclip, IconSend, IconTarget } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface JanelaChatProps {
  contato: ContatoWhatsappRow | null;
  mensagens: MensagemWhatsappRow[];
  carregandoMensagens: boolean;
  onEnviar: (conteudo: string) => Promise<{ ok: boolean; error?: string }>;
  onAdicionarAoCrm: () => Promise<{ ok: boolean; error?: string }>;
}

/**
 * Lado direito do Inbox — janela de chat ativa. Bolhas da esquerda
 * (`direcao = 'recebida'`) em `bg-base-800` (o cinza escuro do design
 * system, equivalente ao `bg-zinc-900` pedido); bolhas da direita
 * (`direcao = 'enviada'`) com o mesmo destaque sutil que o resto da
 * plataforma usa pra "item ativo/meu" — branco translúcido, nunca uma cor
 * de marca nova.
 */
export function JanelaChat({ contato, mensagens, carregandoMensagens, onEnviar, onAdicionarAoCrm }: JanelaChatProps) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [convertendo, setConvertendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [mensagens, contato?.id]);

  useEffect(() => setError(null), [contato?.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo || !contato) return;
    setEnviando(true);
    setError(null);
    const result = await onEnviar(conteudo);
    setEnviando(false);
    if (!result.ok) {
      setError(result.error ?? "Falha ao enviar.");
      return;
    }
    setTexto("");
  }

  async function handleAdicionarAoCrm() {
    setConvertendo(true);
    setError(null);
    const result = await onAdicionarAoCrm();
    setConvertendo(false);
    if (!result.ok) setError(result.error ?? "Falha ao criar o lead.");
  }

  if (!contato) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-ink-muted">
        <IconTarget className="h-8 w-8" />
        <p className="text-sm">Selecione uma conversa pra começar.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3 border-b border-base-800 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-base-700 text-xs font-semibold text-ink-secondary">
            {contato.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- foto do provedor, url dinâmica
              <img src={contato.foto_url} alt={contato.nome ?? contato.telefone} className="h-full w-full object-cover" />
            ) : (
              iniciaisContato(contato.nome, contato.telefone)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-primary">{contato.nome || fmtTelefoneExibicao(contato.telefone)}</p>
            <p className="truncate text-xs text-ink-muted">{fmtTelefoneExibicao(contato.telefone)}</p>
          </div>
        </div>

        {contato.lead_id ? (
          <Badge tone="good" label="Já é um Lead" className="shrink-0" />
        ) : (
          <Button onClick={handleAdicionarAoCrm} disabled={convertendo} className="shrink-0 px-3 py-1.5 text-xs">
            {convertendo ? "Adicionando..." : "+ Adicionar ao CRM"}
          </Button>
        )}
      </div>

      {/* Mensagens */}
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {carregandoMensagens ? (
          <p className="text-center text-xs text-ink-muted">Carregando conversa...</p>
        ) : mensagens.length === 0 ? (
          <p className="text-center text-xs text-ink-muted">Nenhuma mensagem nesta conversa ainda.</p>
        ) : (
          mensagens.map((msg) => {
            const enviada = msg.direcao === "enviada";
            return (
              <div key={msg.id} className={cn("flex", enviada ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-3.5 py-2 text-sm",
                    enviada ? "border border-white/15 bg-white/10 text-ink-primary" : "border border-base-700 bg-base-800 text-ink-primary"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{fmtPreviewMensagem(msg)}</p>
                  <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-ink-muted">
                    {enviada && msg.status_entrega === "falhou" && <span className="text-danger">Falhou</span>}
                    {enviada && msg.status_entrega === "enviando" && <span>Enviando...</span>}
                    <span>{fmtHoraOuData(msg.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && <p className="px-4 pb-1 text-xs text-danger">{error}</p>}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-base-800 p-3">
        <button
          type="button"
          disabled
          title="Envio de anexos depende do provedor de mensageria configurado — ver src/lib/whatsapp/provider.ts"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-base-700 text-ink-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconPaperclip className="h-4 w-4" />
        </button>
        <Input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1"
          disabled={enviando}
        />
        <Button type="submit" disabled={enviando || !texto.trim()} className="shrink-0 px-3">
          <IconSend className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
