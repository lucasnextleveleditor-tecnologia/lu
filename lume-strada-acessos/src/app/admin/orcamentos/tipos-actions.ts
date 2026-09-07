"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { PerfilOrcamento } from "@/lib/types/orcamentos";

export type ActionResult = { ok: true } | { ok: false; error: string };

const PATH = "/admin/orcamentos/tipos";

export interface TipoOrcamentoItemInput {
  servicoId: string | null;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number;
  opcional: boolean;
}

export interface TipoOrcamentoInput {
  condicoesPagamentoPadrao: string | null;
  observacoesPadrao: string | null;
  validadeDiasPadrao: number;
  itens: TipoOrcamentoItemInput[];
}

/**
 * Salva o modelo inteiro (cabeçalho + itens) de um perfil — upsert por
 * (company_id, perfil) garante um único modelo por tipo, nunca duplica ao
 * salvar de novo. Itens sempre substituídos por completo (apaga e recria),
 * mesmo padrão de `atualizarOrcamentoCompleto` — um modelo não tem
 * histórico próprio por item que precisasse sobreviver a uma edição.
 */
export async function salvarTipoOrcamento(perfil: PerfilOrcamento, input: TipoOrcamentoInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    if (input.validadeDiasPadrao < 1) return { ok: false, error: "A validade padrão precisa ser de pelo menos 1 dia." };

    const { data: tipo, error: erroUpsert } = await supabase
      .from("orc_tipos_orcamento")
      .upsert(
        {
          perfil,
          condicoes_pagamento_padrao: input.condicoesPagamentoPadrao?.trim() || null,
          observacoes_padrao: input.observacoesPadrao?.trim() || null,
          validade_dias_padrao: input.validadeDiasPadrao,
        },
        { onConflict: "company_id,perfil" }
      )
      .select("id")
      .single();
    if (erroUpsert) return { ok: false, error: erroUpsert.message };

    const { error: erroLimpar } = await supabase.from("orc_tipos_orcamento_itens").delete().eq("tipo_orcamento_id", tipo.id);
    if (erroLimpar) return { ok: false, error: erroLimpar.message };

    const itensValidos = input.itens.filter((i) => i.nome.trim());
    if (itensValidos.length > 0) {
      const { error: erroItens } = await supabase.from("orc_tipos_orcamento_itens").insert(
        itensValidos.map((item, index) => ({
          tipo_orcamento_id: tipo.id,
          servico_id: item.servicoId,
          nome: item.nome.trim(),
          descricao: item.descricao?.trim() || null,
          quantidade: item.quantidade > 0 ? item.quantidade : 1,
          valor_unitario: item.valorUnitario,
          opcional: item.opcional,
          ordem: index,
        }))
      );
      if (erroItens) return { ok: false, error: erroItens.message };
    }

    revalidatePath(PATH);
    revalidatePath("/admin/orcamentos/novo");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
