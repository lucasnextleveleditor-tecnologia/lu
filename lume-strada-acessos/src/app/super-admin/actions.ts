"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, criarAcessoComSenhaPadrao, gerarSenhaProvisoria } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/requireAdmin";
import type { AcessoEmpresaRow, StatusEmpresa } from "@/lib/types/super-admin";
import type { AcessoGeradoResult } from "@/lib/types/acesso";
import type { LoginBgPreset, LoginBoxPosition } from "@/lib/types/database";
import { ehImagemPermitida } from "@/lib/utils/upload";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };
export type ActionResultAcessos = { ok: true; acessos: AcessoEmpresaRow[] } | { ok: false; error: string };
export type ActionResultSenha = { ok: true; email: string; senhaPadrao: string } | { ok: false; error: string };

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
  /**
   * Teto de armazenamento em GB. `null` deixa a empresa no padrão do sistema
   * — e é assim que ela CONTINUA acompanhando o padrão se ele mudar um dia.
   * Gravar o número atual em todo mundo congelaria cada empresa no valor que
   * valia no dia do cadastro.
   */
  limiteGb: number | null;
}

/** GB do formulário -> MB da coluna. Fora da faixa vira `null` (usa o padrão). */
function limiteEmMb(limiteGb: number | null): number | null {
  if (limiteGb === null || !Number.isFinite(limiteGb) || limiteGb <= 0) return null;
  return Math.round(Math.min(limiteGb, 2048) * 1024);
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
        limite_armazenamento_mb: limiteEmMb(input.limiteGb),
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
      .update({
        nome,
        expires_at: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
        limite_armazenamento_mb: limiteEmMb(input.limiteGb),
      })
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

// ----------------------------------------------------------------------------
// Acessos de uma empresa (modal "Acessos" na lista de Empresas licenciadas) —
// aqui o Super Admin vê/edita/apaga QUALQUER login de QUALQUER empresa,
// independente de papel (admin/funcionário/cliente). Diferente do resto
// deste arquivo (que só mexe em `companies`), essas três ações mexem direto
// em `profiles`/`auth.users` de terceiros — por isso `atualizarEmailAcesso`
// e `excluirAcessoEmpresa` usam a Service Role (a RLS de update de
// `profiles` nem cobriria mudar o e-mail em `auth.users`, que é uma tabela
// separada só acessível pela API admin do Supabase Auth).
// ----------------------------------------------------------------------------

/** Lista todo login já gerado pra essa empresa — `profiles_select_admin` (RLS) já deixa `is_super_admin()` ler perfis de qualquer empresa, então um select comum (sem Service Role) basta aqui. */
export async function listarAcessosEmpresa(companyId: string): Promise<ActionResultAcessos> {
  try {
    const { supabase } = await requireSuperAdmin();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, active, senha_provisoria, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true })
      .overrideTypes<AcessoEmpresaRow[], { merge: false }>();
    if (error) return { ok: false, error: error.message };

    return { ok: true, acessos: data ?? [] };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Troca o e-mail de login de um acesso já existente. Usa
 * `auth.admin.updateUserById` (Service Role) — é o único jeito de mudar
 * `auth.users.email` de verdade (mexe também em `auth.identities`, o
 * Supabase cuida disso sozinho); `email_confirm: true` evita reabrir
 * qualquer fluxo de confirmação por e-mail, consistente com a decisão de
 * §9 de `MIGRACAO-MULTI-TENANT.md` (sem token/link/e-mail automático em
 * nenhum ponto do sistema). `profiles.email` é só uma cópia de leitura (não
 * existe trigger de sync em UPDATE, só em INSERT via `handle_new_user`), por
 * isso precisa ser atualizada aqui também, na mesma ação, pra não desalinhar.
 */
export async function atualizarEmailAcesso(profileId: string, companyId: string, novoEmail: string): Promise<ActionResult> {
  try {
    await requireSuperAdmin();

    const email = novoEmail.trim().toLowerCase();
    if (!email) return { ok: false, error: "Informe um e-mail." };

    const admin = createAdminClient();

    // Confere que esse login é mesmo dessa empresa antes de mexer em nada —
    // defesa extra (o modal já só chama isso com IDs da própria empresa que
    // está aberta, mas uma Server Action nunca deve confiar só no que o
    // client mandou).
    const { data: perfil, error: erroPerfil } = await admin.from("profiles").select("id, company_id").eq("id", profileId).single();
    if (erroPerfil || !perfil || perfil.company_id !== companyId) return { ok: false, error: "Acesso não encontrado nessa empresa." };

    const { error: erroAuth } = await admin.auth.admin.updateUserById(profileId, { email, email_confirm: true });
    if (erroAuth) return { ok: false, error: erroAuth.message };

    const { error: erroProfile } = await admin.from("profiles").update({ email }).eq("id", profileId);
    if (erroProfile) return { ok: false, error: erroProfile.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Devolve o acesso a quem perdeu a senha, SEM criar login nenhum.
 *
 * Era o buraco do painel: existiam "Gerar acesso", "Editar e-mail" e
 * "Excluir", e nada no meio. Quem esquecia a senha só tinha duas saídas, as
 * duas ruins — gerar um SEGUNDO login (o antigo fica órfão, e tudo que aponta
 * pro id da pessoa, como o vínculo com o cadastro de equipe e as tarefas onde
 * ela é responsável, continua apontando pro login velho) ou apagar e recriar,
 * que é a mesma coisa com um passo destrutivo na frente.
 *
 * Aqui é só uma senha nova na conta que já existe: `updateUserById` com uma
 * senha aleatória (`gerarSenhaProvisoria`, o mesmo gerador de todo acesso
 * novo) e `senha_provisoria = true` de volta no perfil, que é o que faz o
 * `src/middleware.ts` empurrar a pessoa pra `/definir-senha` antes de liberar
 * qualquer outra tela. O id, o e-mail, o papel e TODO o histórico dela
 * continuam os mesmos.
 *
 * A senha volta pra tela uma vez, pro Super Admin mandar por WhatsApp — sem
 * e-mail e sem link, a mesma decisão de `criarAcessoComSenhaPadrao`. Ela não
 * fica guardada em lugar nenhum: o que o Postgres tem é o hash.
 *
 * O que esta ação NÃO faz: derrubar as sessões que já estavam abertas. Se a
 * pessoa ainda tiver o painel logado em outro navegador, aquela aba continua
 * viva até o refresh token vencer. Para o caso real disto aqui — a dona da
 * conta perdeu a senha e quer voltar — isso é o certo; se um dia a ação for
 * usada pra EXPULSAR alguém, o caminho é "Suspender" (`active = false`), que
 * o middleware checa a cada requisição.
 */
export async function redefinirSenhaAcesso(profileId: string, companyId: string): Promise<ActionResultSenha> {
  try {
    await requireSuperAdmin();

    const admin = createAdminClient();

    // Mesma defesa extra de `atualizarEmailAcesso`: confere que esse login é
    // mesmo dessa empresa antes de mexer em nada. Uma Server Action nunca
    // deve confiar só no id que o client mandou.
    const { data: perfil, error: erroPerfil } = await admin
      .from("profiles")
      .select("id, email, company_id")
      .eq("id", profileId)
      .maybeSingle<{ id: string; email: string; company_id: string | null }>();
    if (erroPerfil) return { ok: false, error: erroPerfil.message };
    if (!perfil || perfil.company_id !== companyId) {
      return { ok: false, error: "Acesso não encontrado nessa empresa." };
    }

    const senhaPadrao = gerarSenhaProvisoria();

    const { error: erroAuth } = await admin.auth.admin.updateUserById(profileId, { password: senhaPadrao });
    if (erroAuth) return { ok: false, error: erroAuth.message };

    const { error: erroFlag } = await admin.from("profiles").update({ senha_provisoria: true }).eq("id", profileId);
    if (erroFlag) return { ok: false, error: erroFlag.message };

    revalidatePath(PATH);
    return { ok: true, email: perfil.email, senhaPadrao };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Apaga o login por completo (`auth.admin.deleteUser`) — o `profiles`
 * correspondente vai junto sozinho (`profiles_id_fkey ... ON DELETE
 * CASCADE`, ver `supabase/multitenant-migration.sql`). Igual à exclusão de
 * empresa (`removerEmpresa` acima): ação definitiva, sem meio-termo — quem
 * chama já mostra a confirmação antes (ver `AcessosEmpresaModal`).
 */
export async function excluirAcessoEmpresa(profileId: string, companyId: string): Promise<ActionResult> {
  try {
    await requireSuperAdmin();

    const admin = createAdminClient();

    const { data: perfil, error: erroPerfil } = await admin.from("profiles").select("id, company_id").eq("id", profileId).single();
    if (erroPerfil || !perfil || perfil.company_id !== companyId) return { ok: false, error: "Acesso não encontrado nessa empresa." };

    const { error } = await admin.auth.admin.deleteUser(profileId);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Tela de Login (pública)
// ----------------------------------------------------------------------------
// A tela de login é renderizada ANTES de qualquer autenticação, então o
// sistema não sabe de qual empresa é quem chegou: ela sempre mostra a marca
// da empresa dona do SaaS (policy `branding_config_select_publico`, ver
// `supabase/branding-por-empresa.sql`). Como é uma tela só, compartilhada por
// TODAS as agências, quem edita é o dono do SaaS — não a agência.
//
// Por isso estas ações usam Service Role em vez do cliente da sessão: o
// `super_admin` não tem `company_id`, então o RLS de `branding_config` não
// devolve nenhuma linha pra ele. O alvo é sempre resolvido no servidor por
// `saas_owner_company_id()`, nunca vem do cliente — mesmo padrão de
// `atualizarEmailAcesso` acima.

const BUCKET_BRANDING = "branding";
const TAMANHO_MAX_LOGIN_BG = 3 * 1024 * 1024; // mesmo limite dos uploads de Aparência

/** Id da empresa dona do SaaS — a mais antiga da tabela (ver a função SQL de mesmo nome). */
async function idEmpresaDonaDoSaas(): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("saas_owner_company_id");
  if (error || !data) throw new Error("Não foi possível identificar a empresa dona do SaaS.");
  return data as string;
}

export interface TelaLoginInput {
  loginTitle: string;
  loginSubtitle: string;
  loginBoxPosition: LoginBoxPosition;
  loginBgPreset: LoginBgPreset;
  bannerAtivoLogin: boolean;
}

export async function salvarTelaLogin(input: TelaLoginInput): Promise<ActionResult> {
  try {
    await requireSuperAdmin();

    if (!input.loginTitle.trim()) return { ok: false, error: "Informe o título da tela de login." };

    const admin = createAdminClient();
    const { error } = await admin
      .from("branding_config")
      .update({
        login_title: input.loginTitle.trim(),
        login_subtitle: input.loginSubtitle.trim(),
        login_box_position: input.loginBoxPosition,
        login_bg_preset: input.loginBgPreset,
        banner_ativo_login: input.bannerAtivoLogin,
      })
      .eq("company_id", await idEmpresaDonaDoSaas());

    if (error) return { ok: false, error: error.message };

    // A tela de login é estática por request, mas o `<title>` e o favicon do
    // layout raiz vêm da mesma linha — invalidação ampla, igual `salvarBranding`.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function uploadFundoLogin(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await requireSuperAdmin();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Selecione um arquivo." };
    if (file.size > TAMANHO_MAX_LOGIN_BG) return { ok: false, error: "Arquivo muito grande (máximo 3MB)." };
    if (!ehImagemPermitida(file.type)) return { ok: false, error: "Envie um arquivo de imagem (PNG, JPG, WEBP ou GIF). SVG não é permitido." };

    const companyId = await idEmpresaDonaDoSaas();
    const admin = createAdminClient();
    const extensao = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const caminho = `${companyId}/login_bg_url/${Date.now()}.${extensao}`;

    const { error: erroUpload } = await admin.storage.from(BUCKET_BRANDING).upload(caminho, file, { upsert: true, contentType: file.type });
    if (erroUpload) return { ok: false, error: erroUpload.message };

    const { data: urlData } = admin.storage.from(BUCKET_BRANDING).getPublicUrl(caminho);
    const { error } = await admin.from("branding_config").update({ login_bg_url: urlData.publicUrl }).eq("company_id", companyId);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/", "layout");
    return { ok: true, url: urlData.publicUrl };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Qual das duas versões da logo do login está sendo mexida. */
export type VarianteLogoLogin = "escuro" | "claro";

const COLUNA_LOGO: Record<VarianteLogoLogin, "login_logo_url" | "login_logo_light_url"> = {
  escuro: "login_logo_url",
  claro: "login_logo_light_url",
};

/**
 * A logo da PLATAFORMA na tela de login.
 *
 * Colunas próprias (`login_logo_*`), nunca `logo_url` — aquela é a logo da
 * agência dentro do painel dela. Se fossem a mesma, trocar a marca da
 * própria agência mudaria a porta de entrada de todos os clientes junto.
 *
 * SVG continua barrado como no resto do sistema: é um documento executável,
 * e um arquivo enviado ao bucket público não deve poder rodar script.
 */
export async function uploadLogoLogin(
  formData: FormData,
  variante: VarianteLogoLogin
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await requireSuperAdmin();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Selecione um arquivo." };
    if (file.size > TAMANHO_MAX_LOGIN_BG) return { ok: false, error: "Arquivo muito grande (máximo 3MB)." };
    if (!ehImagemPermitida(file.type)) return { ok: false, error: "Envie um arquivo de imagem (PNG, JPG, WEBP ou GIF). SVG não é permitido." };

    const coluna = COLUNA_LOGO[variante];
    const companyId = await idEmpresaDonaDoSaas();
    const admin = createAdminClient();
    const extensao = file.name.split(".").pop()?.toLowerCase() || "png";
    const caminho = `${companyId}/${coluna}/${Date.now()}.${extensao}`;

    const { error: erroUpload } = await admin.storage.from(BUCKET_BRANDING).upload(caminho, file, { upsert: true, contentType: file.type });
    if (erroUpload) return { ok: false, error: erroUpload.message };

    const { data: urlData } = admin.storage.from(BUCKET_BRANDING).getPublicUrl(caminho);
    const { error } = await admin.from("branding_config").update({ [coluna]: urlData.publicUrl }).eq("company_id", companyId);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/", "layout");
    return { ok: true, url: urlData.publicUrl };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerLogoLogin(variante: VarianteLogoLogin): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("branding_config")
      .update({ [COLUNA_LOGO[variante]]: null })
      .eq("company_id", await idEmpresaDonaDoSaas());
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerFundoLogin(): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const admin = createAdminClient();
    const { error } = await admin.from("branding_config").update({ login_bg_url: null }).eq("company_id", await idEmpresaDonaDoSaas());
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
