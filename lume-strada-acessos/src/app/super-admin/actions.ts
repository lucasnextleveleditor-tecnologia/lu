"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, criarAcessoComSenhaPadrao } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/requireAdmin";
import type { StatusEmpresa } from "@/lib/types/super-admin";
import type { AcessoGeradoResult } from "@/lib/types/acesso";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };

const PATH = "/super-admin";

// ----------------------------------------------------------------------------
// Empresas (licenças) — CRUD básico. Só `requireSuperAdmin` chama isso: são
// as únicas Server Actions do sistema que mexem na tabela `companies`, e o
// RLS dela (`companies_super_admin_all`, ver
// `supabase/multitenant-migration.sql`) já bloqueia qualquer coisa que não
// seja o dono do SaaS de qualquer forma — a checagem aqui é a mesma
// defesa-em-camadas de `requireAdmin` (barra ANTES de tentar, o que importa
// principalmente pra ação abaixo que usa a Service Role e ignora RLS).
// ----------------------------------------------------------------------------
export interface EmpresaInput {
  nome: string;
  expiresAt: string | null;
}

export async function criarEmpresa(input: EmpresaInput): Promise<ActionResultId> {
  try {
    const { supabase, user } = await requireSuperAdmin();

    const nome = input.nome.trim();
    if (!nome) return { ok: false, error: "Informe o nome da empresa." };

    const { data, error } = await supabase
      .from("companies")
      .insert({
        nome,
        expires_at: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
        created_by: user.id,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarEmpresa(id: string, input: EmpresaInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireSuperAdmin();

    const nome = input.nome.trim();
    if (!nome) return { ok: false, error: "Informe o nome da empresa." };

    const { error } = await supabase
      .from("companies")
      .update({ nome, expires_at: input.expiresAt ? new Date(input.expiresAt).toISOString() : null })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Suspender barra TODO MUNDO da empresa na próxima requisição (ver middleware) — sem precisar suspender perfil por perfil. Reativar libera de novo. */
export async function alternarStatusEmpresa(id: string, status: StatusEmpresa): Promise<ActionResult> {
  try {
    const { supabase } = await requireSuperAdmin();
    const { error } = await supabase.from("companies").update({ status }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Excluir uma empresa arrasta TUDO junto (`on delete cascade` em toda FK
 * `company_id`, ver `supabase/multitenant-migration.sql`) — inclusive os
 * `profiles` dela, o que na prática apaga os logins de todo mundo daquela
 * empresa. Ação deliberadamente sem meio-termo (não existe "arquivar"):
 * suspender (acima) é o caminho reversível; excluir é definitivo.
 */
export async function removerEmpresa(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireSuperAdmin();
    const { error } = await supabase.from("companies").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Gera o login do dono da empresa compradora (`role = 'admin'` DENTRO
 * daquela empresa — é o `COMPANY_ADMIN` do pedido original, ver o
 * comentário em `src/lib/types/database.ts` sobre por que o valor no banco
 * continua sendo `'admin'`). Mesmo padrão de `gerarAcessoCliente`/
 * `gerarAcessoFuncionario` em `src/app/admin/actions.ts`: convite via
 * Service Role, `company_id` vai nos metadados pro trigger `handle_new_user`
 * gravar o perfil já na empresa certa, depois promovemos o profile recém-
 * criado pra `role = 'admin'` (o trigger cria todo mundo como 'cliente' por
 * padrão). SEM campo de expiração individual aqui de propósito — a licença
 * já expira no nível da EMPRESA (`companies.expires_at`, editado no modal de
 * Empresa); dar um segundo `expires_at` pro dono junto criaria dois
 * relógios pra mesma coisa e confundiria qual vence primeiro.
 */
export async function gerarAcessoCompanyAdmin(companyId: string, input: { email: string; nome: string }): Promise<AcessoGeradoResult> {
  try {
    await requireSuperAdmin();

    const email = input.email.trim().toLowerCase();
    if (!email) return { ok: false, error: "Informe um e-mail para o acesso." };
    const nome = input.nome.trim();
    if (!nome) return { ok: false, error: "Informe o nome do responsável." };

    const admin = createAdminClient();

    const { data: empresa, error: erroEmpresa } = await admin.from("companies").select("id, nome").eq("id", companyId).single();
    if (erroEmpresa || !empresa) return { ok: false, error: "Empresa não encontrada." };

    // Ver `criarAcessoComSenhaPadrao` (lib/supabase/admin.ts) — cria o login
    // já com e-mail confirmado e senha provisória, sem token nem link.
    const gerado = await criarAcessoComSenhaPadrao(admin, email, {
      data: { full_name: nome, company_id: companyId },
    });
    if (!gerado.ok) return gerado;

    // Promove pra 'admin' DAQUELA empresa — sem isso o convidado nasceria
    // como 'cliente' (padrão do trigger) e não conseguiria nem entrar no
    // próprio painel recém-comprado.
    const { error: erroPromocao } = await admin.from("profiles").update({ role: "admin" }).eq("id", gerado.userId);
    if (erroPromocao) return { ok: false, error: erroPromocao.message };

    revalidatePath(PATH);
    return { ok: true, email, senhaPadrao: gerado.senhaPadrao };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
