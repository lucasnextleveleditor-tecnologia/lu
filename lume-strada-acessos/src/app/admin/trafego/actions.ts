"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * `metas_diarias` guarda o vínculo do cliente nas MESMAS duas colunas de
 * `prod_tarefas` (ver `resolverVinculoCliente` em
 * `app/admin/producao/actions.ts`, migração `clientes_cor_e_vinculo_sem_login`):
 * `cliente_cadastro_id -> clientes.id` é o vínculo "de verdade" (sempre
 * preenchido, com ou sem login) — os parâmetros `clienteId` desta arquivo
 * SEMPRE se referem a esse id agora, não mais a `profiles.id`. `cliente_id
 * -> profiles.id` é preenchido em paralelo só quando o cliente escolhido TEM
 * acesso gerado, pra não quebrar a RLS `metas_diarias_select_own`/
 * `trafego_registros_select_own` (dependem de `cliente_id = auth.uid()` pro
 * portal do próprio cliente ver a própria meta/tráfego).
 */
async function resolverVinculoCliente(
  supabase: SupabaseClient,
  clienteCadastroId: string
): Promise<{ cliente_cadastro_id: string; cliente_id: string | null } | { erro: string }> {
  const { data, error } = await supabase.from("clientes").select("profile_id").eq("id", clienteCadastroId).maybeSingle<{ profile_id: string | null }>();
  if (error) return { erro: error.message };
  if (!data) return { erro: "Cliente não encontrado." };
  return { cliente_cadastro_id: clienteCadastroId, cliente_id: data.profile_id };
}

/** Busca a Meta Diária do cliente+dia; cria uma (com investimento-meta = 0) se ainda não existir. */
async function getOuCriarMeta(supabase: SupabaseClient, clienteCadastroId: string, data: string): Promise<{ id: string } | { erro: string }> {
  const vinculo = await resolverVinculoCliente(supabase, clienteCadastroId);
  if ("erro" in vinculo) return vinculo;

  const { data: existente } = await supabase
    .from("metas_diarias")
    .select("id")
    .eq("cliente_cadastro_id", vinculo.cliente_cadastro_id)
    .eq("data", data)
    .maybeSingle();

  if (existente) return { id: existente.id as string };

  const { data: nova, error } = await supabase
    .from("metas_diarias")
    .insert({ ...vinculo, data })
    .select("id")
    .single();

  if (error) return { erro: error.message };
  return { id: nova.id as string };
}

export async function salvarMeta(
  clienteCadastroId: string,
  data: string,
  valores: { valorInvestidoMeta: number; leadsMeta: number | null; objetivo: string | null }
): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    const vinculo = await resolverVinculoCliente(supabase, clienteCadastroId);
    if ("erro" in vinculo) return { ok: false, error: vinculo.erro };

    const { error } = await supabase.from("metas_diarias").upsert(
      {
        ...vinculo,
        data,
        valor_investido_meta: valores.valorInvestidoMeta,
        leads_meta: valores.leadsMeta,
        objetivo: valores.objetivo,
      },
      { onConflict: "cliente_cadastro_id,data" }
    );

    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/trafego");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function adicionarRegistro(
  clienteCadastroId: string,
  data: string,
  registro: {
    nomeCampanha: string | null;
    valorInvestido: number;
    tipoResultado: "leads" | "vendas";
    quantidadeResultado: number;
    cliques: number;
    visualizacoes: number;
  }
): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");

    const meta = await getOuCriarMeta(supabase, clienteCadastroId, data);
    if ("erro" in meta) return { ok: false, error: meta.erro };

    const { error } = await supabase.from("trafego_registros").insert({
      meta_id: meta.id,
      nome_campanha: registro.nomeCampanha,
      valor_investido: registro.valorInvestido,
      tipo_resultado: registro.tipoResultado,
      quantidade_resultado: registro.quantidadeResultado,
      cliques: registro.cliques,
      visualizacoes: registro.visualizacoes,
    });

    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/trafego");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerRegistro(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("trafego");
    const { error } = await supabase.from("trafego_registros").delete().eq("id", id);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/trafego");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
