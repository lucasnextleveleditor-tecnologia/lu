"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContatoWhatsappRow, MensagemWhatsappRow } from "@/lib/types/whatsapp";
import { criarLeadDoContato, enviarMensagem, listarMensagens } from "@/app/admin/whatsapp/actions";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { ListaConversas } from "@/components/admin/whatsapp/ListaConversas";
import { JanelaChat } from "@/components/admin/whatsapp/JanelaChat";

interface InboxWorkspaceProps {
  contatosIniciais: ContatoWhatsappRow[];
}

function ordenarPorUltimaMensagem(contatos: ContatoWhatsappRow[]): ContatoWhatsappRow[] {
  return [...contatos].sort((a, b) => {
    const dataA = a.ultima_mensagem_em ?? a.created_at;
    const dataB = b.ultima_mensagem_em ?? b.created_at;
    return new Date(dataB).getTime() - new Date(dataA).getTime();
  });
}

/**
 * Workspace do Inbox — split-screen (lista de conversas + chat ativo).
 * Puxa mensagens de UM contato por vez, sob demanda (`listarMensagens`),
 * em vez do histórico inteiro de todo mundo de uma vez só — importante
 * porque um inbox de agência acumula muita mensagem com o tempo.
 *
 * Realtime (Supabase Postgres Changes, ligado em `supabase/whatsapp.sql`
 * seção 5) mantém a tela viva sem F5: mensagem nova (do webhook ou de outro
 * atendente) aparece na hora, e a lista de conversas se reordena sozinha.
 */
export function InboxWorkspace({ contatosIniciais }: InboxWorkspaceProps) {
  const [contatos, setContatos] = useState(() => ordenarPorUltimaMensagem(contatosIniciais));
  const [contatoSelecionadoId, setContatoSelecionadoId] = useState<string | null>(contatosIniciais[0]?.id ?? null);
  const [mensagensPorContato, setMensagensPorContato] = useState<Record<string, MensagemWhatsappRow[]>>({});
  const [carregandoContatoId, setCarregandoContatoId] = useState<string | null>(null);

  const carregarMensagens = useCallback(async (contatoId: string) => {
    setCarregandoContatoId(contatoId);
    const mensagens = await listarMensagens(contatoId);
    setMensagensPorContato((atual) => ({ ...atual, [contatoId]: mensagens }));
    setCarregandoContatoId(null);
  }, []);

  useEffect(() => {
    if (contatoSelecionadoId && !mensagensPorContato[contatoSelecionadoId]) {
      carregarMensagens(contatoSelecionadoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só recarrega ao trocar de contato, não a cada mudança do cache
  }, [contatoSelecionadoId]);

  useEffect(() => {
    const supabase = createClient();
    const canal = supabase
      .channel("whatsapp-inbox")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "whatsapp_mensagens" }, (payload) => {
        const nova = payload.new as MensagemWhatsappRow;
        setMensagensPorContato((atual) => {
          const existentes = atual[nova.contato_id];
          if (!existentes) return atual; // conversa ainda não foi aberta nesta sessão — não precisa cachear agora
          return { ...atual, [nova.contato_id]: [...existentes, nova] };
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_contatos" }, (payload) => {
        if (payload.eventType === "DELETE") return;
        const atualizado = payload.new as ContatoWhatsappRow;
        setContatos((atual) => {
          const semEsse = atual.filter((c) => c.id !== atualizado.id);
          return ordenarPorUltimaMensagem([atualizado, ...semEsse]);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  async function handleEnviar(conteudo: string): Promise<{ ok: boolean; error?: string }> {
    if (!contatoSelecionadoId) return { ok: false, error: "Nenhuma conversa selecionada." };
    const result = await enviarMensagem(contatoSelecionadoId, conteudo);
    if (result.ok) await carregarMensagens(contatoSelecionadoId); // garante consistência mesmo se o Realtime atrasar/falhar
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  async function handleAdicionarAoCrm(): Promise<{ ok: boolean; error?: string }> {
    if (!contatoSelecionadoId) return { ok: false, error: "Nenhuma conversa selecionada." };
    const result = await criarLeadDoContato(contatoSelecionadoId);
    if (result.ok) {
      setContatos((atual) => atual.map((c) => (c.id === contatoSelecionadoId ? { ...c, lead_id: result.id } : c)));
    }
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  const contatoSelecionado = contatos.find((c) => c.id === contatoSelecionadoId) ?? null;
  const mensagens = contatoSelecionadoId ? (mensagensPorContato[contatoSelecionadoId] ?? []) : [];

  return (
    <Card className="grid h-[75vh] grid-cols-[320px_1fr] overflow-hidden p-0">
      <ListaConversas contatos={contatos} contatoSelecionadoId={contatoSelecionadoId} onSelecionar={setContatoSelecionadoId} />
      <JanelaChat
        contato={contatoSelecionado}
        mensagens={mensagens}
        carregandoMensagens={carregandoContatoId === contatoSelecionadoId && mensagens.length === 0}
        onEnviar={handleEnviar}
        onAdicionarAoCrm={handleAdicionarAoCrm}
      />
    </Card>
  );
}
