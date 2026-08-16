"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireModulo } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrigemLead, StatusLead } from "@/lib/types/comercial";

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
  origem: OrigemLead | null;
  tipoServicoId: string | null;
  valorEstimado: number | null;
  dataPrevistaFechamento: string | null;
  contratoAssinado: boolean;
}

export async function criarLead(input: LeadInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("comercial");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome da empresa/pessoa." };

    const { data, error } = await supabase
      .from("crm_leads")
      .insert({
        nome: input.nome.trim(),
        email: input.email?.trim() || null,
        whatsapp: input.whatsapp?.trim() || null,
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

    const { error } = await supabase
      .from("crm_leads")
      .update({
        nome: input.nome.trim(),
        email: input.email?.trim() || null,
        whatsapp: input.whatsapp?.trim() || null,
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
export async function criarAnotacao(leadId: string, nota: string, proximoContatoEm: string | null): Promise<ActionResult> {
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
    if (proximoContatoEm) {
      const { error: erroLead } = await supabase.from("crm_leads").update({ proximo_contato_em: proximoContatoEm }).eq("id", leadId);
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
export async function converterLeadEmCliente(leadId: string): Promise<ActionResult> {
  try {
    // Admin-only de propósito (igual Equipe/Aparência em requireAdmin.ts) —
    // essa ação cria uma conta de acesso de verdade via Service Role
    // (`admin.auth.admin.inviteUserByEmail`), não é só um CRUD dentro do
    // módulo Comercial. Antes usava `requireModulo("comercial")`, que
    // deixava qualquer funcionário com a permissão "Comercial" ligada capaz
    // de criar contas de login — a mesma ação sensível que só admin pode
    // fazer em Equipe/Gerar Acesso.
    const { supabase } = await requireAdmin();

    const { data: lead, error: erroLead } = await supabase.from("crm_leads").select("nome, email, cliente_id").eq("id", leadId).single();
    if (erroLead || !lead) return { ok: false, error: erroLead?.message ?? "Lead não encontrado." };
    if (lead.cliente_id) return { ok: false, error: "Este lead já foi convertido em cliente." };
    if (!lead.email) return { ok: false, error: "O lead precisa de um e-mail cadastrado pra virar cliente." };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const admin = createAdminClient();

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(lead.email, {
      data: { full_name: lead.nome },
      redirectTo: `${siteUrl}/auth/callback`,
    });
    if (inviteError) return { ok: false, error: inviteError.message };
    if (!invited.user) return { ok: false, error: "Convite não retornou um usuário." };

    // O trigger `handle_new_user` já criou o profile (role 'cliente'). Só
    // vinculamos o lead a esse profile e registramos quando converteu.
    const { error: erroVinculo } = await supabase
      .from("crm_leads")
      .update({ cliente_id: invited.user.id, convertido_em: new Date().toISOString(), status: "fechado_ganha" })
      .eq("id", leadId);
    if (erroVinculo) return { ok: false, error: erroVinculo.message };

    revalidatePath(PATH);
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
