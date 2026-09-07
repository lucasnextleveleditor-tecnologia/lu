"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { PerfilOrcamento } from "@/lib/types/orcamentos";

export type ActionResult = { ok: true } | { ok: false; error: string };

const PATH = "/admin/contratos/tipos";

/** Salva (upsert por `company_id, perfil`) o modelo de cláusulas de um perfil — mesmo princípio de `salvarTipoOrcamento` (Fase 2). */
export async function salvarTipoContrato(perfil: PerfilOrcamento, clausulasPadrao: string, condicoesPagamentoPadrao: string | null): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    if (!clausulasPadrao.trim()) return { ok: false, error: "O modelo de cláusulas não pode ficar vazio." };

    const { error } = await supabase
      .from("contratos_tipos")
      .upsert(
        {
          perfil,
          clausulas_padrao: clausulasPadrao,
          condicoes_pagamento_padrao: condicoesPagamentoPadrao?.trim() || null,
        },
        { onConflict: "company_id,perfil" }
      );
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    revalidatePath("/admin/contratos/novo");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
