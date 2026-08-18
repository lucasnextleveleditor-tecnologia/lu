"use client";

import { useMemo, useState } from "react";
import type { ContatoWhatsappRow } from "@/lib/types/whatsapp";
import { fmtHoraOuData, fmtTelefoneExibicao, iniciaisContato } from "@/lib/utils/whatsapp";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Input } from "@/components/ui/Input";
import { IconSearch } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface ListaConversasProps {
  contatos: ContatoWhatsappRow[];
  contatoSelecionadoId: string | null;
  onSelecionar: (id: string) => void;
}

/**
 * Lado esquerdo do Inbox — lista de conversas. Foto de perfil vira um
 * placeholder cinza sólido com iniciais quando o contato não tem
 * `foto_url` (a grande maioria: o provedor raramente manda foto).
 */
export function ListaConversas({ contatos, contatoSelecionadoId, onSelecionar }: ListaConversasProps) {
  const { dict } = useLocale();
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return contatos;
    return contatos.filter((c) => `${c.nome ?? ""} ${c.telefone}`.toLowerCase().includes(termo));
  }, [contatos, busca]);

  return (
    <div className="flex h-full flex-col border-r border-base-800">
      <div className="border-b border-base-800 p-3">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={dict.whatsapp.buscarConversaPlaceholder}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtrados.length === 0 ? (
          <p className="p-6 text-center text-xs text-ink-muted">
            {contatos.length === 0 ? dict.whatsapp.nenhumaConversaAinda : dict.whatsapp.nenhumaConversaBusca}
          </p>
        ) : (
          filtrados.map((contato) => {
            const ativo = contato.id === contatoSelecionadoId;
            return (
              <button
                key={contato.id}
                onClick={() => onSelecionar(contato.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-base-800/60 px-3 py-3 text-left transition",
                  ativo ? "bg-base-800" : "hover:bg-base-800/50"
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-base-700 text-xs font-semibold text-ink-secondary">
                  {contato.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- foto do provedor, url dinâmica
                    <img src={contato.foto_url} alt={contato.nome ?? contato.telefone} className="h-full w-full object-cover" />
                  ) : (
                    iniciaisContato(contato.nome, contato.telefone)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-ink-primary">
                      {contato.nome || fmtTelefoneExibicao(contato.telefone)}
                    </p>
                    {contato.ultima_mensagem_em && (
                      <span className="shrink-0 text-[11px] text-ink-muted">{fmtHoraOuData(contato.ultima_mensagem_em)}</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-ink-muted">{contato.ultima_mensagem_preview || dict.whatsapp.semMensagensAinda}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
