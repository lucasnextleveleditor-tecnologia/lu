"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { AvisoParaMim, AvisoRow, NotificacaoRow } from "@/lib/types/notificacoes";

/**
 * A caixa de entrada do sino.
 *
 * Lê direto do banco pelo cliente do navegador, e não por Server Action, por
 * um motivo só: o Realtime precisa de uma conexão viva no navegador de
 * qualquer jeito. Tendo essa conexão, buscar a lista por outro caminho seria
 * manter duas fontes da mesma verdade — e é sempre a segunda que fica velha.
 *
 * O RLS é quem protege: cada pessoa só enxerga as próprias notificações e os
 * avisos endereçados a ela. Nenhum filtro daqui é controle de acesso.
 */

const LIMITE = 30;

export interface CaixaDeNotificacoes {
  notificacoes: NotificacaoRow[];
  avisos: AvisoParaMim[];
  /** Não lidas + avisos ainda não vistos: é este o número do emblema. */
  naoLidas: number;
  carregando: boolean;
  marcarComoLida: (id: string) => Promise<void>;
  marcarTodasComoLidas: () => Promise<void>;
  marcarAvisoComoVisto: (avisoId: string) => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useCaixaDeNotificacoes(): CaixaDeNotificacoes {
  const [notificacoes, setNotificacoes] = useState<NotificacaoRow[]>([]);
  const [avisos, setAvisos] = useState<AvisoParaMim[]>([]);
  const [carregando, setCarregando] = useState(true);
  const usuarioRef = useRef<string | null>(null);
  const canalRef = useRef<RealtimeChannel | null>(null);

  const carregar = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCarregando(false);
      return;
    }
    usuarioRef.current = user.id;

    // As três consultas de uma vez: o sino é a primeira coisa que a pessoa
    // olha ao entrar, e três idas em fila somariam três latências.
    const [notifRes, avisosRes, lidosRes] = await Promise.all([
      supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(LIMITE),
      supabase.from("announcements").select("*").eq("arquivado", false).order("created_at", { ascending: false }).limit(LIMITE),
      supabase.from("announcement_reads").select("announcement_id").eq("user_id", user.id),
    ]);

    const vistos = new Set((lidosRes.data ?? []).map((l: { announcement_id: string }) => l.announcement_id));

    setNotificacoes((notifRes.data ?? []) as NotificacaoRow[]);
    setAvisos(((avisosRes.data ?? []) as AvisoRow[]).map((a) => ({ ...a, visto: vistos.has(a.id) })));
    setCarregando(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  // Assinatura viva. O filtro por `user_id` é para economizar tráfego, não
  // para proteger: o RLS já não deixa chegar aqui evento de linha alheia.
  useEffect(() => {
    const supabase = createClient();
    let cancelado = false;

    async function assinar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelado) return;

      const canal = supabase
        .channel(`notificacoes:${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const nova = payload.new as NotificacaoRow;
            // `some` antes de inserir: um reconexão do canal pode reentregar
            // um evento já recebido, e o sino contaria a mesma coisa duas vezes.
            setNotificacoes((atuais) => (atuais.some((n) => n.id === nova.id) ? atuais : [nova, ...atuais].slice(0, LIMITE)));
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const alterada = payload.new as NotificacaoRow;
            setNotificacoes((atuais) => atuais.map((n) => (n.id === alterada.id ? alterada : n)));
          }
        )
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "announcements" }, () => {
          // Aviso novo chega pela tabela de avisos, mas quem decide se ele é
          // para esta pessoa é o RLS na releitura — mais barato do que repetir
          // aqui a regra de público-alvo.
          void carregar();
        })
        .subscribe();

      canalRef.current = canal;
    }

    void assinar();
    return () => {
      cancelado = true;
      if (canalRef.current) void createClient().removeChannel(canalRef.current);
    };
  }, [carregar]);

  const marcarComoLida = useCallback(async (id: string) => {
    // Marca na tela primeiro. O emblema é a coisa que a pessoa está olhando
    // no momento do clique: esperar a ida ao banco para ele mudar faz a
    // interface parecer travada mesmo quando está tudo certo.
    setNotificacoes((atuais) => atuais.map((n) => (n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n)));
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true, read_at: new Date().toISOString() }).eq("id", id);
  }, []);

  const marcarTodasComoLidas = useCallback(async () => {
    const agora = new Date().toISOString();
    setNotificacoes((atuais) => atuais.map((n) => (n.read ? n : { ...n, read: true, read_at: agora })));
    const supabase = createClient();
    const usuario = usuarioRef.current;
    if (!usuario) return;
    await supabase.from("notifications").update({ read: true, read_at: agora }).eq("user_id", usuario).eq("read", false);
  }, []);

  const marcarAvisoComoVisto = useCallback(async (avisoId: string) => {
    const usuario = usuarioRef.current;
    if (!usuario) return;
    setAvisos((atuais) => atuais.map((a) => (a.id === avisoId ? { ...a, visto: true } : a)));
    const supabase = createClient();
    await supabase.from("announcement_reads").upsert(
      { announcement_id: avisoId, user_id: usuario },
      { onConflict: "announcement_id,user_id" }
    );
    // A notificação que anunciou este aviso também some da conta: são duas
    // linhas contando o mesmo fato, e cobrar duas leituras pelo mesmo aviso
    // seria pedir à pessoa que confirme a mesma coisa duas vezes.
    await supabase
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("user_id", usuario)
      .eq("reference_id", avisoId)
      .eq("read", false);
    setNotificacoes((atuais) => atuais.map((n) => (n.reference_id === avisoId ? { ...n, read: true } : n)));
  }, []);

  const naoLidas = notificacoes.filter((n) => !n.read).length + avisos.filter((a) => !a.visto).length;

  return {
    notificacoes,
    avisos,
    naoLidas,
    carregando,
    marcarComoLida,
    marcarTodasComoLidas,
    marcarAvisoComoVisto,
    recarregar: carregar,
  };
}
