"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { MapaMentalRow, MapaNoRow } from "@/lib/types/mapa-mental";

export type Resultado = { ok: true } | { ok: false; error: string };
export type ResultadoNo = { ok: true; no: MapaNoRow } | { ok: false; error: string };

/**
 * Ações do link público.
 *
 * Rodam com Service Role — que ignora RLS por completo — então o controle de
 * acesso é TODO explícito e mora aqui, em `abrir()`: o token tem de existir,
 * e o nível de acesso do mapa tem de bastar para a operação pedida. Nada
 * disso é delegado a uma policy, porque não há sessão nem empresa para uma
 * policy usar. Nenhuma outra função deste arquivo toca o banco sem passar
 * por `abrir()` primeiro.
 *
 * O `mapa_id` NUNCA vem do navegador: ele é lido do mapa que o token abriu.
 * Se viesse de fora, quem tivesse um token de leitura de um mapa poderia
 * escrever no mapa de outra empresa mandando outro id.
 */
async function abrir(token: string, precisa: "ver" | "comentar" | "editar") {
  const admin = createAdminClient();
  const { data: mapa } = await admin
    .from("mapas_mentais")
    .select("id, company_id, acesso_publico")
    .eq("token", token)
    .maybeSingle<Pick<MapaMentalRow, "id" | "company_id" | "acesso_publico">>();

  if (!mapa || mapa.acesso_publico === "privado") return null;

  // "editar" também comenta e vê; "comentar" também vê.
  const escada = { ver: 0, comentar: 1, editar: 2 } as const;
  const temNivel = escada[mapa.acesso_publico as "ver" | "comentar" | "editar"] ?? -1;
  if (temNivel < escada[precisa]) return null;

  return { admin, mapa };
}

const CAMPOS_NO = ["texto", "cor", "colapsado", "desloc_x", "desloc_y", "lado", "ordem", "link", "fonte", "tamanho", "negrito", "italico"] as const;

export async function adicionarNoPublico(token: string, paiId: string, valores: Record<string, unknown> = {}): Promise<ResultadoNo> {
  const aberto = await abrir(token, "editar");
  if (!aberto) return { ok: false, error: "Este link não permite editar o mapa." };
  const { admin, mapa } = aberto;

  // O pai tem de ser deste mapa — senão um link de edição viraria permissão
  // de pendurar balões em qualquer mapa do sistema.
  const { data: pai } = await admin.from("mapa_nos").select("id").eq("id", paiId).eq("mapa_id", mapa.id).maybeSingle();
  if (!pai) return { ok: false, error: "Balão não encontrado neste mapa." };

  const { count } = await admin
    .from("mapa_nos")
    .select("id", { count: "exact", head: true })
    .eq("mapa_id", mapa.id)
    .eq("pai_id", paiId);

  const permitidos = Object.fromEntries(
    Object.entries(valores).filter(([chave]) => (CAMPOS_NO as readonly string[]).includes(chave))
  );

  const { data, error } = await admin
    .from("mapa_nos")
    .insert({ mapa_id: mapa.id, company_id: mapa.company_id, pai_id: paiId, ordem: count ?? 0, ...permitidos })
    .select("*")
    .single<MapaNoRow>();
  if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível adicionar o balão." };

  return { ok: true, no: data };
}

export async function salvarNoPublico(token: string, noId: string, valores: Record<string, unknown>): Promise<Resultado> {
  const aberto = await abrir(token, "editar");
  if (!aberto) return { ok: false, error: "Este link não permite editar o mapa." };
  const { admin, mapa } = aberto;

  const permitidos = Object.fromEntries(
    Object.entries(valores).filter(([chave]) => (CAMPOS_NO as readonly string[]).includes(chave))
  );
  if (Object.keys(permitidos).length === 0) return { ok: true };

  const { error } = await admin.from("mapa_nos").update(permitidos).eq("id", noId).eq("mapa_id", mapa.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function removerNoPublico(token: string, noId: string): Promise<Resultado> {
  const aberto = await abrir(token, "editar");
  if (!aberto) return { ok: false, error: "Este link não permite editar o mapa." };
  const { admin, mapa } = aberto;

  // `pai_id not null`: nem pelo link de edição se apaga o balão do meio, que
  // levaria o mapa inteiro junto na cascata.
  const { error } = await admin.from("mapa_nos").delete().eq("id", noId).eq("mapa_id", mapa.id).not("pai_id", "is", null);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reorganizarMapaPublico(token: string): Promise<Resultado> {
  const aberto = await abrir(token, "editar");
  if (!aberto) return { ok: false, error: "Este link não permite editar o mapa." };
  const { admin, mapa } = aberto;

  const { error } = await admin.from("mapa_nos").update({ desloc_x: null, desloc_y: null, lado: null }).eq("mapa_id", mapa.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function comentarPublico(token: string, noId: string, autor: string, texto: string): Promise<Resultado> {
  const aberto = await abrir(token, "comentar");
  if (!aberto) return { ok: false, error: "Este link não permite comentar." };
  const { admin, mapa } = aberto;

  if (!texto.trim()) return { ok: true };

  const { data: no } = await admin.from("mapa_nos").select("id").eq("id", noId).eq("mapa_id", mapa.id).maybeSingle();
  if (!no) return { ok: false, error: "Balão não encontrado neste mapa." };

  const { error } = await admin.from("mapa_comentarios").insert({
    company_id: mapa.company_id,
    mapa_id: mapa.id,
    no_id: noId,
    // Corta o nome digitado: é texto de quem não tem conta, e vai aparecer
    // para a equipe dentro do painel.
    autor: (autor.trim() || "Visitante").slice(0, 60),
    texto: texto.trim().slice(0, 2000),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Desfazer também vale para quem edita pelo link — mesmas regras, mesmo cuidado com o `mapa_id`. */
export async function restaurarNosPublico(token: string, nos: Record<string, unknown>[]): Promise<Resultado> {
  const aberto = await abrir(token, "editar");
  if (!aberto) return { ok: false, error: "Este link não permite editar o mapa." };
  const { admin, mapa } = aberto;
  if (nos.length === 0) return { ok: true };

  for (const no of nos) {
    const permitidos = Object.fromEntries(
      Object.entries(no).filter(([chave]) => (CAMPOS_NO as readonly string[]).includes(chave))
    );
    const { error } = await admin.from("mapa_nos").insert({
      id: no.id,
      mapa_id: mapa.id,
      company_id: mapa.company_id,
      pai_id: no.pai_id ?? null,
      ...permitidos,
    });
    if (error && error.code !== "23505") return { ok: false, error: error.message };
  }
  return { ok: true };
}
