"use server";

import { abrirParaEscrita } from "./acesso";
import type { MapaNoRow } from "@/lib/types/mapa-mental";

export type Resultado = { ok: true } | { ok: false; error: string };
export type ResultadoNo = { ok: true; no: MapaNoRow } | { ok: false; error: string };

/**
 * Ações do link.
 *
 * Nenhuma delas toca o banco sem passar por `abrirParaEscrita`, que exige as
 * três condições de `acesso.ts`: token válido, pessoa logada e conta da
 * MESMA empresa dona do mapa. O link é o endereço; o cadastro é a permissão.
 *
 * E o `mapa_id` NUNCA vem do navegador — é lido do mapa que o token abriu.
 * Se viesse de fora, quem tivesse um link de leitura de um mapa poderia
 * escrever em qualquer outro mandando outro id.
 */
const CAMPOS_NO = ["texto", "cor", "colapsado", "desloc_x", "desloc_y", "lado", "ordem", "link", "fonte", "tamanho", "negrito", "italico", "forma", "largura"] as const;

export async function adicionarNoPublico(token: string, paiId: string, valores: Record<string, unknown> = {}): Promise<ResultadoNo> {
  const aberto = await abrirParaEscrita(token, "editar");
  if (!aberto) return { ok: false, error: "Você não tem acesso para editar este mapa." };
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
  const aberto = await abrirParaEscrita(token, "editar");
  if (!aberto) return { ok: false, error: "Você não tem acesso para editar este mapa." };
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
  const aberto = await abrirParaEscrita(token, "editar");
  if (!aberto) return { ok: false, error: "Você não tem acesso para editar este mapa." };
  const { admin, mapa } = aberto;

  // `pai_id not null`: nem pelo link de edição se apaga o balão do meio, que
  // levaria o mapa inteiro junto na cascata.
  const { error } = await admin.from("mapa_nos").delete().eq("id", noId).eq("mapa_id", mapa.id).not("pai_id", "is", null);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reorganizarMapaPublico(token: string): Promise<Resultado> {
  const aberto = await abrirParaEscrita(token, "editar");
  if (!aberto) return { ok: false, error: "Você não tem acesso para editar este mapa." };
  const { admin, mapa } = aberto;

  const { error } = await admin.from("mapa_nos").update({ desloc_x: null, desloc_y: null, lado: null }).eq("mapa_id", mapa.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function comentarPublico(token: string, noId: string, _autor: string, texto: string): Promise<Resultado> {
  const aberto = await abrirParaEscrita(token, "comentar");
  if (!aberto) return { ok: false, error: "Você não tem acesso para comentar neste mapa." };
  const { admin, mapa, nome } = aberto;

  if (!texto.trim()) return { ok: true };

  const { data: no } = await admin.from("mapa_nos").select("id").eq("id", noId).eq("mapa_id", mapa.id).maybeSingle();
  if (!no) return { ok: false, error: "Balão não encontrado neste mapa." };

  const { error } = await admin.from("mapa_comentarios").insert({
    company_id: mapa.company_id,
    mapa_id: mapa.id,
    no_id: noId,
    // O autor vem da CONTA, não de um campo digitado: agora todo mundo que
    // comenta tem cadastro na agência, e um nome que a pessoa escolhe na
    // hora seria só uma chance a mais de se passar por outra.
    autor: nome.slice(0, 60),
    texto: texto.trim().slice(0, 2000),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Desfazer também vale para quem edita pelo link — mesmas regras, mesmo cuidado com o `mapa_id`. */
export async function restaurarNosPublico(token: string, nos: Record<string, unknown>[]): Promise<Resultado> {
  const aberto = await abrirParaEscrita(token, "editar");
  if (!aberto) return { ok: false, error: "Você não tem acesso para editar este mapa." };
  const { admin, mapa } = aberto;
  if (nos.length === 0) return { ok: true };

  // Os pais que o navegador manda precisam ser nós DESTE mapa. As irmãs
  // (`adicionarNoPublico`, `salvarNoPublico`) já conferiam; esta não, e um
  // `pai_id` de outro mapa pendurava o nó restaurado numa árvore alheia —
  // ou servia para sondar quais ids existem, pela diferença de erro.
  const { data: existentes } = await admin.from("mapa_nos").select("id").eq("mapa_id", mapa.id);
  const daCasa = new Set((existentes ?? []).map((n) => n.id as string));
  for (const no of nos) if (typeof no.id === "string") daCasa.add(no.id);

  for (const no of nos) {
    const permitidos = Object.fromEntries(
      Object.entries(no).filter(([chave]) => (CAMPOS_NO as readonly string[]).includes(chave))
    );
    const pai = typeof no.pai_id === "string" && daCasa.has(no.pai_id) ? no.pai_id : null;
    const { error } = await admin.from("mapa_nos").insert({
      id: no.id,
      mapa_id: mapa.id,
      company_id: mapa.company_id,
      pai_id: pai,
      ...permitidos,
    });
    if (error && error.code !== "23505") return { ok: false, error: error.message };
  }
  return { ok: true };
}
