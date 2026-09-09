"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { MapaNoRow } from "@/lib/types/mapa-mental";

/**
 * Edição simultânea do mapa.
 *
 * O que viaja pela rede é UM BALÃO por vez, não o mapa inteiro. É essa
 * granularidade que faz duas pessoas trabalharem juntas sem se atropelar:
 * quem está escrevendo no ramo da esquerda nunca sobrescreve o ramo da
 * direita, porque as duas mensagens tocam balões diferentes. Mandar o mapa
 * todo a cada tecla seria mais simples de escrever e transformaria cada
 * salvamento numa disputa em que o último a digitar apaga o trabalho do
 * outro.
 *
 * O banco continua sendo a verdade: quem chega depois lê tudo de lá. O canal
 * só serve para quem JÁ está com o mapa aberto não precisar recarregar.
 *
 * Sobre o nome do canal: é o id do mapa, um uuid. Quem não conhece o id não
 * entra — o mesmo grau de segredo do token do link público. Não é sigilo
 * criptográfico, e por isso nada sensível trafega aqui: só o texto dos
 * balões, que qualquer um com acesso ao mapa já pode ler.
 */

export type EventoMapa =
  | { tipo: "no"; no: MapaNoRow }
  | { tipo: "remover"; ids: string[] }
  | { tipo: "reorganizar" };

export interface PessoaNoMapa {
  id: string;
  nome: string;
  cor: string;
}

/** Sete tons para os avatares — os mesmos sete dos ramos, para a tela ter uma paleta só. */
const CORES_PESSOA = ["#4F7CFF", "#22B8CF", "#37B24D", "#F59F00", "#F76707", "#E64980", "#845EF7"];

function corDoNome(nome: string): string {
  let soma = 0;
  for (let i = 0; i < nome.length; i++) soma = (soma + nome.charCodeAt(i) * (i + 1)) % 9973;
  return CORES_PESSOA[soma % CORES_PESSOA.length] as string;
}

export function useMapaAoVivo({
  mapaId,
  meuNome,
  aoReceber,
}: {
  mapaId: string;
  meuNome: string;
  aoReceber: (evento: EventoMapa) => void;
}) {
  const [pessoas, setPessoas] = useState<PessoaNoMapa[]>([]);
  const canalRef = useRef<RealtimeChannel | null>(null);
  // O callback muda a cada render (fecha sobre o estado atual); guardá-lo
  // numa ref evita reinscrever o canal a cada tecla digitada.
  const aoReceberRef = useRef(aoReceber);
  aoReceberRef.current = aoReceber;

  useEffect(() => {
    const supabase = createClient();
    // Um id por ABA, não por pessoa: a mesma pessoa com o mapa aberto no
    // celular e no computador aparece uma vez só, mas duas abas do mesmo
    // navegador não brigam pelo mesmo lugar na presença.
    const meuId = `${meuNome}::${Math.random().toString(36).slice(2, 8)}`;

    const canal = supabase.channel(`mapa:${mapaId}`, { config: { presence: { key: meuId } } });
    canalRef.current = canal;

    canal
      .on("broadcast", { event: "mapa" }, ({ payload }) => {
        aoReceberRef.current(payload as EventoMapa);
      })
      .on("presence", { event: "sync" }, () => {
        const estado = canal.presenceState<{ nome: string }>();
        const lista: PessoaNoMapa[] = [];
        const vistos = new Set<string>();
        for (const [chave, entradas] of Object.entries(estado)) {
          const nome = entradas[0]?.nome ?? "Alguém";
          if (vistos.has(nome)) continue;
          vistos.add(nome);
          lista.push({ id: chave, nome, cor: corDoNome(nome) });
        }
        setPessoas(lista);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void canal.track({ nome: meuNome });
      });

    return () => {
      canalRef.current = null;
      void supabase.removeChannel(canal);
    };
  }, [mapaId, meuNome]);

  /** Avisa quem está com o mapa aberto. Nunca substitui a gravação no banco. */
  function avisar(evento: EventoMapa) {
    void canalRef.current?.send({ type: "broadcast", event: "mapa", payload: evento });
  }

  return { pessoas, avisar };
}
