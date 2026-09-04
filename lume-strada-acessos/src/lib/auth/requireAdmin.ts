import "server-only";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { PapelUsuario, PermissoesFuncionario, PreferenciasDashboard, ProfileRow } from "@/lib/types/database";

export interface PerfilComPermissoes {
  role: PapelUsuario;
  full_name: string | null;
  email: string;
  permissoes: PermissoesFuncionario;
  dashboard_config: PreferenciasDashboard;
}

/**
 * Busca o profile já com `permissoes`/`dashboard_config` — COM FALLBACK pra
 * quando essas colunas ainda não existem no banco (`supabase/cadastros.sql`/
 * `supabase/dashboard-config.sql` não foram rodados, ou rodaram só até a
 * metade). Sem esse fallback, um `select` pedindo uma coluna que não existe
 * falha por INTEIRO — `data` vem `null` mesmo o usuário existindo — e isso
 * expulsa TODO MUNDO de `/admin` (inclusive o admin, porque o profile
 * "parece" não existir). Com o fallback, quem ainda não rodou a migração
 * continua entrando normalmente — só sem RBAC por funcionário até rodar o SQL.
 */
export async function buscarPerfilComPermissoes(supabase: SupabaseClient, userId: string): Promise<PerfilComPermissoes | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, full_name, email, permissoes, dashboard_config")
    .eq("id", userId)
    .single()
    .overrideTypes<PerfilComPermissoes, { merge: false }>();

  if (!error && data) return data;

  // Fallback: pede só as colunas que existem desde sempre — `permissoes`
  // vira `{}` (equivalente a "nenhuma permissão de funcionário liberada",
  // o que é seguro: admin passa igual, funcionário só perde acesso extra) e
  // `dashboard_config` também vira `{}` (equivalente a "todos os cards
  // visíveis" — ver comentário em `DashboardCardChave`, é o padrão oposto
  // de propósito).
  const { data: basico } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", userId)
    .single()
    .overrideTypes<Pick<ProfileRow, "role" | "full_name" | "email">, { merge: false }>();

  if (!basico) return null;
  return { ...basico, permissoes: {}, dashboard_config: {} };
}

/**
 * Guarda compartilhada por TODA Server Action estritamente administrativa
 * (Equipe & permissões, Gerar Acesso, Aparência). Chamada antes de qualquer
 * escrita — mesmo já existindo RLS admin nas tabelas, essa checagem barra
 * ANTES de tentar, o que importa sobretudo pra ações que usam a Service
 * Role (que ignora RLS). Nunca delegável por permissão: só `role = 'admin'`
 * passa, mesmo um funcionário com todas as permissões ligadas.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "role" | "company_id">, { merge: false }>();

  if (profile?.role !== "admin") throw new Error("Apenas administradores podem fazer isso.");

  // `companyId` nunca é null aqui — todo `role = 'admin'` tem empresa
  // (invariante garantida em `supabase/multitenant-migration.sql`). Exposto
  // pra quem convida gente nova (`gerarAcessoCliente`/`gerarAcessoFuncionario`
  // em `src/app/admin/actions.ts`) poder carimbar o convite com a MESMA
  // empresa de quem está convidando, sem precisar buscar de novo.
  return { supabase, user, companyId: profile.company_id };
}

/** Mesma checagem de `requireAdmin`, mas pra Server Components de página — redireciona em vez de lançar (uma página não tem try/catch pra virar mensagem inline). Usado só em Equipe/Aparência. */
export async function requireAdminOuRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "role">, { merge: false }>();

  if (profile?.role !== "admin") redirect("/admin/dashboard");
  return { supabase, user };
}

// ----------------------------------------------------------------------------
// Super Admin (multi-tenant) — dono do SaaS, gerencia as empresas
// compradoras em `/super-admin`. Papel completamente à parte de
// `admin`/`funcionario`/`cliente`: um super_admin NUNCA tem `company_id`
// (ver invariante em `supabase/multitenant-migration.sql`), então nunca
// passa em `requireAdmin`/`requireModulo*` (que checam `role = 'admin'` ou
// `'funcionario'`) — e vice-versa, um `admin`/`funcionario` normal nunca
// passa aqui. Os dois mundos não se cruzam de propósito.
// ----------------------------------------------------------------------------

/** Guarda de Server Action para `/super-admin` — mesmo padrão de `requireAdmin`. */
export async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "role">, { merge: false }>();

  if (profile?.role !== "super_admin") throw new Error("Apenas o Super Admin pode fazer isso.");

  return { supabase, user };
}

/** Mesma checagem de `requireSuperAdmin`, mas pra Server Components de página — redireciona em vez de lançar. Usado em `/super-admin`. */
export async function requireSuperAdminOuRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "role">, { merge: false }>();

  // Redireciona pra Home de cada papel (mesma árvore de decisão do
  // middleware) em vez de sempre mandar pra /login — um admin/funcionario/
  // cliente que tenta abrir /super-admin na marra cai no painel dele, não
  // numa tela de erro.
  if (profile?.role !== "super_admin") {
    const home = profile?.role === "admin" || profile?.role === "funcionario" ? "/admin" : "/dashboard";
    redirect(home);
  }
  return { supabase, user };
}

// ----------------------------------------------------------------------------
// RBAC por módulo — Financeiro, Produção, Comercial, Tráfego, Inventário,
// WhatsApp e o cadastro de Clientes (dentro de Cadastros) podem ser
// liberados/bloqueados por funcionário via `profiles.permissoes` (jsonb,
// ver `supabase/cadastros.sql`). Admin sempre passa em tudo, incondicional.
// "Equipe" (a aba de funcionários dentro de Cadastros) e "Aparência" NÃO
// entram aqui de propósito — ver `requireAdmin`/`requireAdminOuRedirect`
// acima: gerenciar quem tem acesso ao quê, e a identidade visual do site,
// são ações sensíveis demais pra serem delegáveis por toggle.
//
// Modelo de segurança (documentado pra ficar claro, não é um acidente): o
// RLS do banco (`public.is_staff()`) só garante "é admin OU funcionário" —
// ele não sabe qual permissão específica cada funcionário tem. A checagem
// FINA por módulo mora aqui, na aplicação (chamada em toda Server Action e
// no topo de toda página de módulo). Isso é suficiente pro caso de uso real
// (ferramenta interna da agência, sem acesso de terceiros) e evita duplicar
// a lógica de permissão em SQL pra cada tabela de cada módulo.
// ----------------------------------------------------------------------------
export type ModuloChave = "clientes" | "financeiro" | "producao" | "comercial" | "orcamentos" | "trafego" | "inventario" | "whatsapp";

type ResultadoPermissao = { autorizado: true; supabase: SupabaseClient; user: User } | { autorizado: false };

async function carregarAutorizacaoQualquer(chaves: ModuloChave[]): Promise<ResultadoPermissao> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { autorizado: false };

  const profile = await buscarPerfilComPermissoes(supabase, user.id);

  if (!profile) return { autorizado: false };
  if (profile.role === "admin") return { autorizado: true, supabase, user };
  if (profile.role === "funcionario" && chaves.some((chave) => profile.permissoes?.[chave] === true)) {
    return { autorizado: true, supabase, user };
  }
  return { autorizado: false };
}

/** Guarda por permissão pra Server Actions dos módulos operacionais. Lança erro — quem chama já espera capturar em try/catch e devolver `ActionResult`, igual `requireAdmin`. */
export async function requireModulo(chave: ModuloChave) {
  const resultado = await carregarAutorizacaoQualquer([chave]);
  if (!resultado.autorizado) throw new Error("Você não tem permissão para acessar este módulo.");
  return { supabase: resultado.supabase, user: resultado.user };
}

/**
 * Mesma ideia de `requireModulo`, mas libera quem tem QUALQUER UMA das
 * permissões dadas — pra cadastro de apoio compartilhado entre módulos (ex:
 * "Tipos de Serviço", usado tanto em Produção quanto em Comercial). Sem
 * isso, um funcionário com só a permissão "Comercial" ligada não conseguia
 * cadastrar um novo serviço a partir do lead — a ação exigia "Produção",
 * módulo que ele nem precisa acessar pra vender.
 */
export async function requireQualquerModulo(chaves: ModuloChave[]) {
  const resultado = await carregarAutorizacaoQualquer(chaves);
  if (!resultado.autorizado) throw new Error("Você não tem permissão para acessar este módulo.");
  return { supabase: resultado.supabase, user: resultado.user };
}

/** Mesma checagem de `requireModulo`, mas pra Server Components de página — redireciona em vez de lançar. */
export async function requireModuloOuRedirect(chave: ModuloChave) {
  const resultado = await carregarAutorizacaoQualquer([chave]);
  if (!resultado.autorizado) redirect("/admin/dashboard");
  return { supabase: resultado.supabase, user: resultado.user };
}
