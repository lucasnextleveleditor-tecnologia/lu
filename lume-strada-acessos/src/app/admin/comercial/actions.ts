"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireModulo } from "@/lib/auth/requireAdmin";
import { createAdminClient, criarAcessoComSenhaPadrao } from "@/lib/supabase/admin";
import type { OrigemLead, StatusLead } from "@/lib/types/comercial";
import type { AcessoGeradoResult } from "@/lib/types/acesso";
import { MOTIVOS_PERDA, normalizarInstagram, type MotivoPerda } from "@/lib/utils/comercial";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };

const PATH = "/admin/comercial";

// ----------------------------------------------------------------------------
// Leads
// ----------------------------------------------------------------------------
export interface LeadInput {
  nome: string;
  email: string | null;
  whatsapp: string | null;
  /** Como a pessoa digitou — "@loja", "loja" ou a URL colada. `normalizarInstagram` resolve. */
  instagram: string | null;
  origem: OrigemLead | null;
  tipoServicoId: string | null;
  valorEstimado: number | null;
  dataPrevistaFechamento: string | null;
  contratoAssinado: boolean;
}

/**
 * `null` pro campo em branco, o handle limpo pro @ válido, e `false` pro que
 * a pessoa digitou mas não é um @ — que vira erro na tela, não uma linha
 * torta no banco.
 */
function instagramParaGravar(bruto: string | null): string | null | false {
  if (!bruto || !bruto.trim()) return null;
  return normalizarInstagram(bruto) ?? false;
}

export async function criarLead(input: LeadInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("comercial");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome da empresa/pessoa." };

    // `undefined` = campo vazio, grava null. `null` = veio algo que não é um
    // @ válido, e aí é erro em vez de gravar lixo (ver `normalizarInstagram`).
    const instagram = instagramParaGravar(input.instagram);
    if (instagram === false) return { ok: false, error: "INSTAGRAM_INVALIDO" };

    const { data, error } = await supabase
      .from("crm_leads")
      .insert({
        nome: input.nome.trim(),
        email: input.email?.trim() || null,
        whatsapp: input.whatsapp?.trim() || null,
        instagram,
        origem: input.origem,
        tipo_servico_id: input.tipoServicoId,
        valor_estimado: input.valorEstimado,
        data_prevista_fechamento: input.dataPrevistaFechamento || null,
        contrato_assinado: input.contratoAssinado,
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true, id: data!.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarLead(id: string, input: LeadInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("comercial");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome da empresa/pessoa." };

    const instagram = instagramParaGravar(input.instagram);
    if (instagram === false) return { ok: false, error: "INSTAGRAM_INVALIDO" };

    const { error } = await supabase
      .from("crm_leads")
      .update({
        nome: input.nome.trim(),
        email: input.email?.trim() || null,
        whatsapp: input.whatsapp?.trim() || null,
        instagram,
        origem: input.origem,
        tipo_servico_id: input.tipoServicoId,
        valor_estimado: input.valorEstimado,
        data_prevista_fechamento: input.dataPrevistaFechamento || null,
        contrato_assinado: input.contratoAssinado,
      })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Move o card entre colunas do funil — drag-and-drop do Kanban ou seletor no detalhe. */
export async function moverStatusLead(id: string, status: StatusLead): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("comercial");
    const { error } = await supabase.from("crm_leads").update({ status }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerLead(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("comercial");
    const { error } = await supabase.from("crm_leads").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Anotações (histórico de follow-up)
// ----------------------------------------------------------------------------
/**
 * Encerra o lead — com motivo e com a data de tentar de novo.
 *
 * `reabordarEmDias = null` é "nunca mais". Os dois casos são escolha
 * consciente na tela, e por isso o nulo aqui é um valor e não um esquecimento.
 *
 * O status vai para `perdido` e o `proximo_contato_em` é ZERADO: deixar a data
 * antiga faria o Cron continuar cobrando follow-up de um lead encerrado —
 * exatamente o aviso que faz a pessoa parar de confiar no sininho.
 */
export async function encerrarLead(
  leadId: string,
  motivo: MotivoPerda,
  reabordarEmDias: number | null
): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("comercial");
    if (!MOTIVOS_PERDA.includes(motivo)) return { ok: false, error: "Motivo inválido." };

    const reabordar =
      reabordarEmDias === null || !Number.isFinite(reabordarEmDias)
        ? null
        : new Date(Date.now() + reabordarEmDias * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { error } = await supabase
      .from("crm_leads")
      .update({
        status: "perdido",
        motivo_perda: motivo,
        reabordar_em: reabordar,
        encerrado_em: new Date().toISOString(),
        proximo_contato_em: null,
      })
      .eq("id", leadId);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Traz o lead de volta ao funil.
 *
 * Volta para `contato_inicial`, e não para a etapa em que estava: um lead que
 * foi dado como perdido e ressurge meses depois é uma conversa nova, não a
 * continuação da negociação que morreu. Colocá-lo direto em "negociação"
 * inflaria o pipeline com uma expectativa que ninguém confirmou.
 */
export async function reabrirLead(leadId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("comercial");
    const { error } = await supabase
      .from("crm_leads")
      .update({ status: "contato_inicial", reabordar_em: null, encerrado_em: null })
      .eq("id", leadId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function criarAnotacao(
  leadId: string,
  nota: string,
  proximoContatoEm: string | null,
  responsavelId?: string | null
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireModulo("comercial");
    if (!nota.trim()) return { ok: false, error: "Escreva um resumo do contato." };

    const { error: erroAnotacao } = await supabase.from("crm_anotacoes").insert({
      lead_id: leadId,
      nota: nota.trim(),
      proximo_contato_em: proximoContatoEm || null,
      criado_por: user.id,
    });
    if (erroAnotacao) return { ok: false, error: erroAnotacao.message };

    // O campo em `crm_leads` é só um cache do último agendamento — sempre
    // que uma anotação nova traz uma data, ela vira a "próxima" oficial.
    // Quem registrou o contato assume o lead: o aviso do próximo retorno
    // precisa de um destinatário, e o destinatário natural é quem acabou de
    // falar com a pessoa. `undefined` (nada escolhido) não mexe no dono atual —
    // registrar um contato não deve, por descuido, tirar o lead de alguém.
    const mudancas: Record<string, unknown> = {};
    if (proximoContatoEm) mudancas.proximo_contato_em = proximoContatoEm;
    if (responsavelId !== undefined) mudancas.responsavel_id = responsavelId;

    if (Object.keys(mudancas).length > 0) {
      const { error: erroLead } = await supabase.from("crm_leads").update(mudancas).eq("id", leadId);
      if (erroLead) return { ok: false, error: erroLead.message };
    }

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Conversão — Lead vira Cliente de verdade (mesmo fluxo de convite por
// e-mail usado em "Gerar Acesso" na aba Clientes da Central de Cadastros —
// `gerarAcessoCliente`, em `app/admin/actions.ts`), sem duplicar a lógica de
// Auth: chamamos a mesma API do Supabase (Service Role) aqui, e no fim
// vinculamos o lead ao profile recém-criado. Nota: isso cria só o LOGIN
// (`profiles`, role 'cliente') — não cria automaticamente um registro na
// nova tabela `clientes` (cadastro rico); se quiser o cadastro completo
// também, crie-o manualmente na aba Clientes depois.
// ----------------------------------------------------------------------------
export async function converterLeadEmCliente(leadId: string): Promise<AcessoGeradoResult> {
  try {
    // Admin-only de propósito (igual Equipe/Aparência em requireAdmin.ts) —
    // essa ação cria uma conta de acesso de verdade via Service Role
    // (`criarAcessoComSenhaPadrao`), não é só um CRUD dentro do módulo
    // Comercial. Antes usava `requireModulo("comercial")`, que deixava
    // qualquer funcionário com a permissão "Comercial" ligada capaz de
    // criar contas de login — a mesma ação sensível que só admin pode fazer
    // em Equipe/Gerar Acesso.
    const { supabase, companyId } = await requireAdmin();

    const { data: lead, error: erroLead } = await supabase.from("crm_leads").select("nome, email, cliente_id").eq("id", leadId).single();
    if (erroLead || !lead) return { ok: false, error: erroLead?.message ?? "Lead não encontrado." };
    if (lead.cliente_id) return { ok: false, error: "Este lead já foi convertido em cliente." };
    if (!lead.email) return { ok: false, error: "O lead precisa de um e-mail cadastrado pra virar cliente." };

    const admin = createAdminClient();

    // `company_id` nos metadados é OBRIGATÓRIO (mesma nota de
    // `gerarAcessoCliente` em `app/admin/actions.ts`) — antes desta função
    // não passava `company_id` aqui, e o trigger `handle_new_user` recusa
    // (constraint `profiles_company_id_invariante`) criar um perfil
    // não-super_admin sem empresa. Na prática, converter QUALQUER lead
    // quebrava com "Convite não retornou um usuário" depois da migração
    // multi-tenant — bug real corrigido junto com a troca pra
    // `criarAcessoComSenhaPadrao`.
    const gerado = await criarAcessoComSenhaPadrao(admin, lead.email, {
      data: { full_name: lead.nome, company_id: companyId },
    });
    if (!gerado.ok) return gerado;

    // O trigger `handle_new_user` já criou o profile (role 'cliente'). Só
    // vinculamos o lead a esse profile e registramos quando converteu.
    const { error: erroVinculo } = await supabase
      .from("crm_leads")
      .update({ cliente_id: gerado.userId, convertido_em: new Date().toISOString(), status: "fechado_ganha" })
      .eq("id", leadId);
    if (erroVinculo) return { ok: false, error: erroVinculo.message };

    revalidatePath(PATH);
    revalidatePath("/admin");
    return { ok: true, email: lead.email, senhaPadrao: gerado.senhaPadrao };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
