"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { calcularStatusExibicao } from "@/lib/types/orcamentos";
import type { OrcamentoRow } from "@/lib/types/orcamentos";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Toda ação aqui é chamada SEM LOGIN, a partir da página pública
 * `/orcamento/[token]` — o token (não uma sessão) é a única credencial.
 * Cada função REFAZ a checagem de posse/estado no servidor (nunca confia
 * que o cliente só vai mandar um `itemId` que realmente pertence àquele
 * `token`, ou que só vai tentar aprovar um orçamento que ainda pode ser
 * aprovado) — mesma filosofia de "nunca confiar no request" documentada em
 * `lib/supabase/admin.ts` pro Dashboard do cliente.
 */
async function buscarOrcamentoAtivoPorToken(token: string): Promise<{ ok: true; admin: ReturnType<typeof createAdminClient>; orcamento: OrcamentoRow } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const { data: orcamento } = await admin.from("orcamentos").select("*").eq("token", token).single<OrcamentoRow>();
  if (!orcamento) return { ok: false, error: "Orçamento não encontrado." };

  const status = calcularStatusExibicao(orcamento);
  if (status !== "enviado" && status !== "visualizado") {
    return { ok: false, error: "Este orçamento não está mais disponível pra alterações." };
  }
  return { ok: true, admin, orcamento };
}

/** Marca/desmarca um item OPCIONAL — recusa de cara qualquer tentativa de mexer num item obrigatório (o form nem deveria oferecer esse controle, mas a ação reforça server-side). */
export async function alternarItemPublico(token: string, itemId: string, selecionado: boolean): Promise<ActionResult> {
  try {
    const contexto = await buscarOrcamentoAtivoPorToken(token);
    if (!contexto.ok) return contexto;
    const { admin, orcamento } = contexto;

    const { data: item } = await admin.from("orc_itens").select("id, orcamento_id, opcional").eq("id", itemId).single();
    if (!item || item.orcamento_id !== orcamento.id) return { ok: false, error: "Item não encontrado neste orçamento." };
    if (!item.opcional) return { ok: false, error: "Este item é obrigatório e não pode ser removido." };

    const { error } = await admin.from("orc_itens").update({ selecionado }).eq("id", itemId);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/orcamento/${token}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function aprovarOrcamentoPublico(token: string, nomeAprovador: string): Promise<ActionResult> {
  try {
    if (!nomeAprovador.trim()) return { ok: false, error: "Informe seu nome pra confirmar a aprovação." };

    const contexto = await buscarOrcamentoAtivoPorToken(token);
    if (!contexto.ok) return contexto;
    const { admin, orcamento } = contexto;

    const { error } = await admin
      .from("orcamentos")
      .update({ status: "aprovado", aprovado_em: new Date().toISOString(), aprovado_por_nome: nomeAprovador.trim() })
      .eq("id", orcamento.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/orcamento/${token}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function recusarOrcamentoPublico(token: string, motivo: string | null): Promise<ActionResult> {
  try {
    const contexto = await buscarOrcamentoAtivoPorToken(token);
    if (!contexto.ok) return contexto;
    const { admin, orcamento } = contexto;

    const { error } = await admin
      .from("orcamentos")
      .update({ status: "recusado", recusado_em: new Date().toISOString(), motivo_recusa: motivo?.trim() || null })
      .eq("id", orcamento.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/orcamento/${token}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
