"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireModulo } from "@/lib/auth/requireAdmin";
import type { PermissoesFuncionario } from "@/lib/types/database";
import type { ClienteAtividadeRow, TipoAtividadeCliente } from "@/lib/types/cadastros";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };

const PATH = "/admin";

function mensagemAmigavelCliente(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "Já existe um cliente cadastrado com esse CNPJ/CPF.";
  return error.message;
}

// ----------------------------------------------------------------------------
// Clientes — cadastro
// ----------------------------------------------------------------------------
export interface ClienteInput {
  nome: string; // Razão Social / Nome Completo
  documento: string | null; // CNPJ / CPF
  email: string | null;
  telefone: string | null;
  nomeResponsavel: string | null;
  endereco: string | null;
}

export async function criarCliente(input: ClienteInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("clientes");
    if (!input.nome.trim()) return { ok: false, error: "Informe a razão social / nome completo." };

    const { data, error } = await supabase
      .from("clientes")
      .insert({
        nome: input.nome.trim(),
        documento: input.documento?.trim() || null,
        email: input.email?.trim() || null,
        telefone: input.telefone?.trim() || null,
        nome_responsavel: input.nomeResponsavel?.trim() || null,
        endereco: input.endereco?.trim() || null,
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: mensagemAmigavelCliente(error) };
    revalidatePath(PATH);
    return { ok: true, id: data!.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarCliente(id: string, input: ClienteInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("clientes");
    if (!input.nome.trim()) return { ok: false, error: "Informe a razão social / nome completo." };

    const { error } = await supabase
      .from("clientes")
      .update({
        nome: input.nome.trim(),
        documento: input.documento?.trim() || null,
        email: input.email?.trim() || null,
        telefone: input.telefone?.trim() || null,
        nome_responsavel: input.nomeResponsavel?.trim() || null,
        endereco: input.endereco?.trim() || null,
      })
      .eq("id", id);

    if (error) return { ok: false, error: mensagemAmigavelCliente(error) };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Remove só o CADASTRO — se o cliente já tem acesso gerado (`profile_id`), o login em si não é revogado aqui; suspenda o acesso primeiro (botão de status) se quiser bloquear o login também. */
export async function removerCliente(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("clientes");
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Equipe (Funcionários) — cadastro. Sempre admin-only, nunca delegável por
// permissão (ver nota em lib/auth/requireAdmin.ts).
// ----------------------------------------------------------------------------
export interface EquipeInput {
  nome: string;
  cargo: string | null;
  email: string | null;
  telefone: string | null;
}

export async function criarMembroEquipe(input: EquipeInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireAdmin();
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do membro." };

    const { data, error } = await supabase
      .from("equipe_membros")
      .insert({
        nome: input.nome.trim(),
        cargo: input.cargo?.trim() || null,
        email: input.email?.trim() || null,
        telefone: input.telefone?.trim() || null,
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

export async function atualizarMembroEquipe(id: string, input: EquipeInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do membro." };

    const { error } = await supabase
      .from("equipe_membros")
      .update({
        nome: input.nome.trim(),
        cargo: input.cargo?.trim() || null,
        email: input.email?.trim() || null,
        telefone: input.telefone?.trim() || null,
      })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerMembroEquipe(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("equipe_membros").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Gerar Acesso — substitui o antigo botão solto "Convidar Cliente". Agora é
// uma ação embutida em CADA registro (Cliente ou Funcionário). Sempre
// admin-only: liberar login é um efeito de segurança demais pra ser
// delegável por toggle.
// ----------------------------------------------------------------------------

/** Cliente: acesso simples — só data de expiração opcional. O `role` continua 'cliente' (o padrão do trigger `handle_new_user`), então não precisa promover nada depois do convite. */
export async function gerarAcessoCliente(clienteId: string, input: { email: string; expiresAt: string | null }): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const email = input.email.trim().toLowerCase();
    if (!email) return { ok: false, error: "Informe um e-mail para o acesso." };

    const { data: cliente, error: erroCliente } = await supabase
      .from("clientes")
      .select("id, nome, profile_id")
      .eq("id", clienteId)
      .single();
    if (erroCliente || !cliente) return { ok: false, error: "Cliente não encontrado." };
    if (cliente.profile_id) return { ok: false, error: "Este cliente já tem acesso gerado." };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const admin = createAdminClient();

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: cliente.nome },
      redirectTo: `${siteUrl}/auth/callback`,
    });
    if (inviteError) return { ok: false, error: inviteError.message };
    if (!invited.user) return { ok: false, error: "Convite não retornou um usuário." };

    if (input.expiresAt) {
      const { error: erroExpiracao } = await admin
        .from("profiles")
        .update({ expires_at: new Date(input.expiresAt).toISOString() })
        .eq("id", invited.user.id);
      if (erroExpiracao) return { ok: false, error: erroExpiracao.message };
    }

    const { error: erroVinculo } = await admin.from("clientes").update({ profile_id: invited.user.id }).eq("id", clienteId);
    if (erroVinculo) return { ok: false, error: erroVinculo.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Funcionário: além do convite, precisa PROMOVER o profile recém-criado pra
 * `role = 'funcionario'` (o trigger `handle_new_user` cria todo mundo como
 * 'cliente' por padrão) e já gravar as permissões escolhidas no modal —
 * senão o convidado vira um "cliente" sem acesso nenhum ao painel.
 */
export async function gerarAcessoFuncionario(
  membroId: string,
  input: { email: string; permissoes: PermissoesFuncionario; expiresAt: string | null }
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const email = input.email.trim().toLowerCase();
    if (!email) return { ok: false, error: "Informe um e-mail para o acesso." };

    const { data: membro, error: erroMembro } = await supabase
      .from("equipe_membros")
      .select("id, nome, profile_id")
      .eq("id", membroId)
      .single();
    if (erroMembro || !membro) return { ok: false, error: "Membro da equipe não encontrado." };
    if (membro.profile_id) return { ok: false, error: "Este membro já tem acesso gerado." };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const admin = createAdminClient();

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: membro.nome },
      redirectTo: `${siteUrl}/auth/callback`,
    });
    if (inviteError) return { ok: false, error: inviteError.message };
    if (!invited.user) return { ok: false, error: "Convite não retornou um usuário." };

    const updates: { role: string; permissoes: PermissoesFuncionario; expires_at?: string } = {
      role: "funcionario",
      permissoes: input.permissoes,
    };
    if (input.expiresAt) updates.expires_at = new Date(input.expiresAt).toISOString();

    const { error: erroPromocao } = await admin.from("profiles").update(updates).eq("id", invited.user.id);
    if (erroPromocao) return { ok: false, error: erroPromocao.message };

    const { error: erroVinculo } = await admin.from("equipe_membros").update({ profile_id: invited.user.id }).eq("id", membroId);
    if (erroVinculo) return { ok: false, error: erroVinculo.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Edita as permissões de um funcionário que JÁ tem acesso gerado — mesmo modal de toggles, chamado de novo em cima de um `profile_id` existente. */
export async function atualizarPermissoes(profileId: string, permissoes: PermissoesFuncionario): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("profiles").update({ permissoes }).eq("id", profileId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Acesso genérico — reaproveitado tanto pra linha de Cliente quanto de
// Funcionário (ambas operam em cima de `profiles`, pelo `profile_id`
// vinculado). Mesma lógica que já existia antes desta refatoração.
// ----------------------------------------------------------------------------
export async function atualizarExpiracao(userId: string, expiresAt: string | null): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("profiles")
      .update({ expires_at: expiresAt ? new Date(expiresAt).toISOString() : null })
      .eq("id", userId);

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function alternarAtivo(userId: string, active: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("profiles").update({ active }).eq("id", userId);

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Atividades & Tarefas — checklist leve DENTRO do cadastro de um cliente
// (ver nota em supabase/cadastros.sql seção 5 — não é o board de Produção).
// ----------------------------------------------------------------------------
export interface AtividadeInput {
  tipo: TipoAtividadeCliente;
  titulo: string;
  descricao: string | null;
  dataPrevista: string | null; // ISO date (yyyy-mm-dd)
}

/** Busca sob demanda — chamada pelo painel de detalhe do cliente quando ele é aberto, igual ao padrão já usado no Inbox do WhatsApp (`listarMensagens`). */
export async function listarAtividades(clienteId: string): Promise<ClienteAtividadeRow[]> {
  const { supabase } = await requireModulo("clientes");
  const { data } = await supabase
    .from("cliente_atividades")
    .select("id, cliente_id, tipo, titulo, descricao, concluida, data_prevista, criado_por, created_at, updated_at")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false })
    .overrideTypes<ClienteAtividadeRow[], { merge: false }>();
  return data ?? [];
}

export async function criarAtividade(clienteId: string, input: AtividadeInput): Promise<ActionResultId> {
  try {
    const { supabase, user } = await requireModulo("clientes");
    if (!input.titulo.trim()) return { ok: false, error: "Informe um título." };

    const { data, error } = await supabase
      .from("cliente_atividades")
      .insert({
        cliente_id: clienteId,
        tipo: input.tipo,
        titulo: input.titulo.trim(),
        descricao: input.descricao?.trim() || null,
        data_prevista: input.dataPrevista || null,
        criado_por: user.id,
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

export async function alternarConcluida(id: string, concluida: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("clientes");
    const { error } = await supabase.from("cliente_atividades").update({ concluida }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerAtividade(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("clientes");
    const { error } = await supabase.from("cliente_atividades").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
