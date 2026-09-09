"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { ok: true } | { ok: false; error: string };

const PATH = "/admin/objetivos";

/**
 * Salva as duas metas de faturamento da empresa — mesmo padrão de
 * `salvarInstitucionalOrcamento` (`admin/orcamentos/portfolio-actions.ts`):
 * `requireAdmin()` (só admin, nunca funcionário, mesmo com o módulo
 * Financeiro liberado) + Service Role pra gravar em `companies`, que só tem
 * policy de UPDATE pra `super_admin`. `null` apaga a meta (volta pro estado
 * "ainda não configurada"), nunca vira `0` sem querer.
 */
export async function salvarMetasFinanceiras(input: { metaMensal: number | null; metaAnual: number | null }): Promise<ActionResult> {
  try {
    const { companyId } = await requireAdmin();
    const admin = createAdminClient();

    const { error } = await admin
      .from("companies")
      .update({
        obj_meta_faturamento_mensal: input.metaMensal != null && input.metaMensal > 0 ? input.metaMensal : null,
        obj_meta_faturamento_anual: input.metaAnual != null && input.metaAnual > 0 ? input.metaAnual : null,
      })
      .eq("id", companyId);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
