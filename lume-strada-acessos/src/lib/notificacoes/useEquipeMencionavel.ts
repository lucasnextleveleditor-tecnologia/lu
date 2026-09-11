"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MembroMencionavel } from "@/lib/notificacoes/mencoes";

/**
 * A equipe que aparece quando se digita `@`.
 *
 * Lida no navegador, como o sino: o RLS de `equipe_membros` já restringe à
 * própria empresa, então não há regra de acesso a repetir aqui.
 *
 * O módulo guarda a lista num cache de módulo porque o `@` pode ser digitado
 * em vários campos da mesma tela — briefing, subtarefa, título — e cada
 * campo montado disparar a própria consulta faria a mesma pergunta ao banco
 * três ou quatro vezes por abertura de modal, sempre com a mesma resposta.
 */
let cache: MembroMencionavel[] | null = null;
let emVoo: Promise<MembroMencionavel[]> | null = null;

async function buscar(): Promise<MembroMencionavel[]> {
  if (cache) return cache;
  if (emVoo) return emVoo;

  emVoo = (async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("equipe_membros")
      .select("nome, cargo, profile_id")
      .not("profile_id", "is", null)
      .order("nome");

    cache = ((data ?? []) as { nome: string; cargo: string | null; profile_id: string | null }[]).map((m) => ({
      nome: m.nome,
      cargo: m.cargo,
      profileId: m.profile_id,
    }));
    emVoo = null;
    return cache;
  })();

  return emVoo;
}

/** Esquece a lista — chamar quando a equipe muda, para o `@` não sugerir quem saiu. */
export function esquecerEquipeMencionavel(): void {
  cache = null;
  emVoo = null;
}

export function useEquipeMencionavel(): MembroMencionavel[] {
  const [equipe, setEquipe] = useState<MembroMencionavel[]>(cache ?? []);

  useEffect(() => {
    let vivo = true;
    void buscar().then((lista) => {
      if (vivo) setEquipe(lista);
    });
    return () => {
      vivo = false;
    };
  }, []);

  return equipe;
}
