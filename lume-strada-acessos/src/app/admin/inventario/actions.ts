"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { StatusItemInventario } from "@/lib/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Traduz os erros mais comuns do Postgres pra uma mensagem que faz sentido
 * pra quem está usando o painel — em vez de vazar o texto técnico da
 * constraint direto na tela.
 */
function mensagemAmigavel(error: { code?: string; message: string }, contexto: "categoria" | "item"): string {
  if (error.code === "23505") {
    return contexto === "categoria"
      ? "Já existe uma categoria com esse código de identificação."
      : "Já existe um item com esse número de etiqueta / código de barras.";
  }
  if (error.code === "23503") {
    return "Não é possível excluir: existem itens de inventário vinculados a essa categoria. Reclassifique ou dê baixa neles primeiro.";
  }
  return error.message;
}

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

export async function criarCategoria(input: { nome: string; descricao: string | null; codigo: string }): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const nome = input.nome.trim();
    const codigo = input.codigo.trim().toUpperCase();
    if (!nome) return { ok: false, error: "Informe o nome da categoria." };
    if (!codigo) return { ok: false, error: "Informe o código de identificação." };

    const { error } = await supabase.from("categorias_inventario").insert({
      nome,
      codigo,
      descricao: input.descricao?.trim() || null,
    });

    if (error) return { ok: false, error: mensagemAmigavel(error, "categoria") };
    revalidatePath("/admin/inventario");
    revalidatePath("/admin/inventario/itens");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarCategoria(
  id: string,
  input: { nome: string; descricao: string | null; codigo: string }
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const nome = input.nome.trim();
    const codigo = input.codigo.trim().toUpperCase();
    if (!nome) return { ok: false, error: "Informe o nome da categoria." };
    if (!codigo) return { ok: false, error: "Informe o código de identificação." };

    const { error } = await supabase
      .from("categorias_inventario")
      .update({ nome, codigo, descricao: input.descricao?.trim() || null })
      .eq("id", id);

    if (error) return { ok: false, error: mensagemAmigavel(error, "categoria") };
    revalidatePath("/admin/inventario");
    revalidatePath("/admin/inventario/itens");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerCategoria(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("categorias_inventario").delete().eq("id", id);

    if (error) return { ok: false, error: mensagemAmigavel(error, "categoria") };
    revalidatePath("/admin/inventario");
    revalidatePath("/admin/inventario/itens");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ---------------------------------------------------------------------------
// Itens / Etiquetas
// ---------------------------------------------------------------------------

export interface ItemInput {
  codigoEtiqueta: string;
  categoriaId: string;
  nomeItem: string;
  status: StatusItemInventario;
  localizacao: string | null;
  dataAquisicao: string | null; // yyyy-mm-dd
  valorPago: number | null;
  valorAtual: number | null;
  responsavelAtual: string | null;
}

// `valorPago`/`valorAtual`/`dataAquisicao` viraram obrigatórios (pedido do
// módulo de inteligência financeira — sem os dois valores não dá pra
// calcular depreciação individual nem alimentar o Dashboard Financeiro).
// Itens antigos que ainda não têm esses campos preenchidos continuam
// existindo e aparecendo na listagem normalmente — a obrigatoriedade vale
// só pra criar/editar um item daqui pra frente.
function validarItem(input: ItemInput): string | null {
  if (!input.codigoEtiqueta.trim()) return "Informe o número da etiqueta / código de barras.";
  if (!input.categoriaId) return "Selecione a categoria do item.";
  if (!input.nomeItem.trim()) return "Informe o nome do item.";
  if (!input.dataAquisicao) return "Informe a data de aquisição.";
  if (input.valorPago == null) return "Informe o valor pago na aquisição.";
  if (input.valorAtual == null) return "Informe o valor atual de mercado.";
  return null;
}

export async function criarItem(input: ItemInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const erroValidacao = validarItem(input);
    if (erroValidacao) return { ok: false, error: erroValidacao };

    const { error } = await supabase.from("itens_inventario").insert({
      codigo_etiqueta: input.codigoEtiqueta.trim(),
      categoria_id: input.categoriaId,
      nome_item: input.nomeItem.trim(),
      status: input.status,
      localizacao: input.localizacao?.trim() || null,
      data_aquisicao: input.dataAquisicao || null,
      valor_pago: input.valorPago,
      valor_atual: input.valorAtual,
      responsavel_atual: input.responsavelAtual?.trim() || null,
    });

    if (error) return { ok: false, error: mensagemAmigavel(error, "item") };
    revalidatePath("/admin/inventario/itens");
    revalidatePath("/admin/inventario/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarItem(id: string, input: ItemInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const erroValidacao = validarItem(input);
    if (erroValidacao) return { ok: false, error: erroValidacao };

    const { error } = await supabase
      .from("itens_inventario")
      .update({
        codigo_etiqueta: input.codigoEtiqueta.trim(),
        categoria_id: input.categoriaId,
        nome_item: input.nomeItem.trim(),
        status: input.status,
        localizacao: input.localizacao?.trim() || null,
        data_aquisicao: input.dataAquisicao || null,
        valor_pago: input.valorPago,
        valor_atual: input.valorAtual,
        responsavel_atual: input.responsavelAtual?.trim() || null,
      })
      .eq("id", id);

    if (error) return { ok: false, error: mensagemAmigavel(error, "item") };
    revalidatePath("/admin/inventario/itens");
    revalidatePath("/admin/inventario/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerItem(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("itens_inventario").delete().eq("id", id);

    if (error) return { ok: false, error: mensagemAmigavel(error, "item") };
    revalidatePath("/admin/inventario/itens");
    revalidatePath("/admin/inventario/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
