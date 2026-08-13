"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Busca a Meta Diária do cliente+dia; cria uma (com investimento-meta = 0) se ainda não existir. */
async function getOuCriarMeta(
  supabase: SupabaseClient,
  clienteId: string,
  data: string
): Promise<{ id: string } | { erro: string }> {
  const { data: existente } = await supabase
    .from("metas_diarias")
    .select("id")
    .eq("cliente_id", clienteId)
    .eq("data", data)
    .maybeSingle();

  if (existente) return { id: existente.id as string };

  const { data: nova, error } = await supabase
    .from("metas_diarias")
    .insert({ cliente_id: clienteId, data })
    .select("id")
    .single();

  if (error) return { erro: error.message };
  return { id: nova.id as string };
}

export async function salvarMeta(
  clienteId: string,
  data: string,
  valores: { valorInvestidoMeta: number; leadsMeta: number | null; objetivo: string | null }
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("metas_diarias").upsert(
      {
        cliente_id: clienteId,
        data,
        valor_investido_meta: valores.valorInvestidoMeta,
        leads_meta: valores.leadsMeta,
        objetivo: valores.objetivo,
      },
      { onConflict: "cliente_id,data" }
    );

    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/trafego");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function adicionarRegistro(
  clienteId: string,
  data: string,
  registro: { nomeCampanha: string | null; valorInvestido: number; leadsGerados: number }
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const meta = await getOuCriarMeta(supabase, clienteId, data);
    if ("erro" in meta) return { ok: false, error: meta.erro };

    const { error } = await supabase.from("trafego_registros").insert({
      meta_id: meta.id,
      nome_campanha: registro.nomeCampanha,
      valor_investido: registro.valorInvestido,
      leads_gerados: registro.leadsGerados,
    });

    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/trafego");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerRegistro(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("trafego_registros").delete().eq("id", id);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/trafego");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
