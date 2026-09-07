"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { PerfilOrcamento } from "@/lib/types/orcamentos";
import type { StatusContrato } from "@/lib/types/contratos";

const PATH = "/admin/contratos";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };

export interface ContratoItemInput {
  nome: string;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number;
}

export interface ContratoHeaderInput {
  orcamentoId: string | null;
  tipoPerfil: PerfilOrcamento | null;
  titulo: string;
  clienteId: string | null;
  nomeCliente: string;
  emailCliente: string | null;
  whatsappCliente: string | null;
  /** Texto já com os placeholders do modelo substituídos (ver `substituirPlaceholders`) — gravado como está, edição livre depois nunca reaplica a substituição. */
  clausulas: string;
  condicoesPagamento: string | null;
  observacoes: string | null;
}

function normalizarItens(itens: ContratoItemInput[]) {
  return itens.map((item, index) => ({
    nome: item.nome.trim(),
    descricao: item.descricao?.trim() || null,
    quantidade: item.quantidade > 0 ? item.quantidade : 1,
    valor_unitario: item.valorUnitario,
    ordem: index,
  }));
}

export async function criarContratoCompleto(header: ContratoHeaderInput, itens: ContratoItemInput[]): Promise<ActionResultId> {
  try {
    const { supabase, user } = await requireModulo("orcamentos");
    if (!header.titulo.trim()) return { ok: false, error: "Informe um título pro contrato." };
    if (!header.nomeCliente.trim()) return { ok: false, error: "Informe o nome do cliente." };
    if (!header.clausulas.trim()) return { ok: false, error: "O contrato precisa ter um texto de cláusulas." };

    const { data: contrato, error: erroContrato } = await supabase
      .from("contratos")
      .insert({
        orcamento_id: header.orcamentoId,
        tipo_perfil: header.tipoPerfil,
        titulo: header.titulo.trim(),
        cliente_id: header.clienteId,
        nome_cliente: header.nomeCliente.trim(),
        email_cliente: header.emailCliente?.trim() || null,
        whatsapp_cliente: header.whatsappCliente?.trim() || null,
        clausulas: header.clausulas,
        condicoes_pagamento: header.condicoesPagamento?.trim() || null,
        observacoes: header.observacoes?.trim() || null,
        criado_por: user.id,
      })
      .select("id")
      .single();
    if (erroContrato) return { ok: false, error: erroContrato.message };

    if (itens.length > 0) {
      const { error: erroItens } = await supabase.from("contratos_itens").insert(normalizarItens(itens).map((item) => ({ ...item, contrato_id: contrato.id })));
      if (erroItens) return { ok: false, error: erroItens.message };
    }

    revalidatePath(PATH);
    return { ok: true, id: contrato.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarContratoCompleto(id: string, header: ContratoHeaderInput, itens: ContratoItemInput[]): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    if (!header.titulo.trim()) return { ok: false, error: "Informe um título pro contrato." };
    if (!header.nomeCliente.trim()) return { ok: false, error: "Informe o nome do cliente." };
    if (!header.clausulas.trim()) return { ok: false, error: "O contrato precisa ter um texto de cláusulas." };

    const { error: erroContrato } = await supabase
      .from("contratos")
      .update({
        tipo_perfil: header.tipoPerfil,
        titulo: header.titulo.trim(),
        cliente_id: header.clienteId,
        nome_cliente: header.nomeCliente.trim(),
        email_cliente: header.emailCliente?.trim() || null,
        whatsapp_cliente: header.whatsappCliente?.trim() || null,
        clausulas: header.clausulas,
        condicoes_pagamento: header.condicoesPagamento?.trim() || null,
        observacoes: header.observacoes?.trim() || null,
      })
      .eq("id", id);
    if (erroContrato) return { ok: false, error: erroContrato.message };

    const { error: erroLimpar } = await supabase.from("contratos_itens").delete().eq("contrato_id", id);
    if (erroLimpar) return { ok: false, error: erroLimpar.message };

    if (itens.length > 0) {
      const { error: erroItens } = await supabase.from("contratos_itens").insert(normalizarItens(itens).map((item) => ({ ...item, contrato_id: id })));
      if (erroItens) return { ok: false, error: erroItens.message };
    }

    revalidatePath(PATH);
    revalidatePath(`${PATH}/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerContrato(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    const { error } = await supabase.from("contratos").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Marca como enviado (ou reenviado) — bloqueado só pra contrato já assinado (nesse ponto, um contrato NOVO é o caminho certo pra propor de novo). */
export async function enviarContrato(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");

    const { data: contrato, error: erroBusca } = await supabase.from("contratos").select("status").eq("id", id).single();
    if (erroBusca || !contrato) return { ok: false, error: erroBusca?.message ?? "Contrato não encontrado." };
    if (contrato.status === "assinado") return { ok: false, error: "Este contrato já foi assinado — crie um novo pra propor outra versão." };

    const { error } = await supabase.from("contratos").update({ status: "enviado", enviado_em: new Date().toISOString() }).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    revalidatePath(`${PATH}/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Ajuste manual de status pelo admin — cobre "cliente assinou impresso/por fora" sem passar pelo link público. */
export async function marcarStatusManualContrato(id: string, status: Extract<StatusContrato, "rascunho" | "assinado" | "recusado" | "cancelado">): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");

    const patch: Record<string, unknown> = { status };
    if (status === "assinado") patch.assinado_em = new Date().toISOString();
    if (status === "recusado") patch.recusado_em = new Date().toISOString();

    const { error } = await supabase.from("contratos").update(patch).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    revalidatePath(`${PATH}/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
