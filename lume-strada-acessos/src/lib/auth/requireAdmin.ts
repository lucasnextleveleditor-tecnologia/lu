import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { PapelUsuario, PermissoesFuncionario, PreferenciasDashboard, ProfileRow } from "@/lib/types/database";

export interface PerfilComPermissoes {
  role: PapelUsuario;
  /** Empresa do usuário — `null` só para `super_admin`. Usada para prefixar TODO caminho de upload no Storage com a empresa dona do arquivo (ver `requireModulo`). */
  company_id: string | null;
  full_name: string | null;
  /** Foto de perfil — `null` cai nas iniciais do nome (ver `Avatar`). */
  avatar_url: string | null;
  email: string;
  permissoes: PermissoesFuncionario;
  dashboard_config: PreferenciasDashboard;
}

/**
 * UMA IDA AO BANCO POR REQUISIÇÃO, NÃO QUATRO.
 *
 * Abrir /admin/producao custava, antes disto: o middleware confere a sessão e
 * o perfil; o `layout.tsx` do /admin confere DE NOVO; a página chama
 * `requireModuloOuRedirect`, que confere OUTRA VEZ. Três `getUser()` — que é
 * uma chamada HTTP ao Auth, não uma leitura de cookie — e três `select` em
 * `profiles`, todos com o mesmo id, na mesma requisição, para a mesma
 * resposta. Como as funções rodam em iad1 e o banco em ca-central-1, cada par
 * desses é ida e volta de rede antes de a página começar a existir.
 *
 * O `cache()` do React memoiza **por requisição** (não entre requisições, não
 * entre usuários): a primeira chamada busca, as outras recebem a mesma
 * promessa. O middleware continua fora — ele roda antes do React, e é o único
 * lugar onde a consulta se justifica de novo, porque é ele que barra acesso
 * expirado.
 *
 * A chave do cache é o `userId`, e ele vem sempre de um `getUser()` — ou seja,
 * do token verificado, nunca de algo que o navegador escreveu. Duas pessoas
 * diferentes nunca compartilham entrada porque nunca compartilham requisição.
 */
export const usuarioAtual = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  // AQUI, e SÓ aqui, a sessão é buscada de verdade. Todo o resto do arquivo
  // chama `usuarioAtual()`; esta função não pode chamar a si mesma.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** O perfil desta requisição. Ver `usuarioAtual` — mesma memoização, mesmo motivo. */
const perfilDaRequisicao = cache(
  async (userId: string): Promise<PerfilComPermissoes | null> => {
    const supabase = await createClient();
    return carregarPerfil(supabase, userId);
  }
);

/**
 * O perfil de quem está pedindo esta página — sem precisar de cliente na mão.
 *
 * É a porta de entrada para tela que só quer saber "quem é e o que pode".
 * `buscarPerfilComPermissoes` continua existindo para quem já tem o cliente
 * ali do lado, mas pedir um cliente só para jogá-lo fora obrigava cada página
 * a um `createClient()` que não servia para mais nada.
 *
 * Devolve `null` quando não há sessão — quem precisa redirecionar decide o
 * destino, que não é o mesmo em toda tela.
 */
export async function perfilAtual(): Promise<PerfilComPermissoes | null> {
  const user = await usuarioAtual();
  return user ? perfilDaRequisicao(user.id) : null;
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
export async function buscarPerfilComPermissoes(
  // O cliente continua no contrato por compatibilidade — todos os chamadores
  // passam o MESMO cliente autenticado, do MESMO usuário, então a memoização
  // por `userId` não muda o que cada um enxerga. O parâmetro segue aqui para
  // não mexer em treze arquivos de uma vez.
  _supabase: SupabaseClient,
  userId: string
): Promise<PerfilComPermissoes | null> {
  return perfilDaRequisicao(userId);
}

async function carregarPerfil(supabase: SupabaseClient, userId: string): Promise<PerfilComPermissoes | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url, email, company_id, permissoes, dashboard_config")
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
    .select("role, full_name, email, company_id")
    .eq("id", userId)
    .single()
    .overrideTypes<Pick<ProfileRow, "role" | "full_name" | "email" | "company_id">, { merge: false }>();

  if (!basico) return null;
  // `avatar_url` entra como `null` no fallback pelo mesmo motivo das outras:
  // banco ainda sem a coluna não pode derrubar o login, só perde o enfeite.
  return { ...basico, avatar_url: null, permissoes: {}, dashboard_config: {} };
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
  const user = await usuarioAtual();

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
  const user = await usuarioAtual();
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
  const user = await usuarioAtual();

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
  const user = await usuarioAtual();
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
export type ModuloChave = "clientes" | "financeiro" | "producao" | "comercial" | "orcamentos" | "trafego" | "inventario" | "whatsapp" | "agenda" | "eventos";

type ResultadoPermissao = { autorizado: true; supabase: SupabaseClient; user: User; companyId: string | null } | { autorizado: false };

async function carregarAutorizacaoQualquer(chaves: ModuloChave[]): Promise<ResultadoPermissao> {
  const supabase = await createClient();
  const user = await usuarioAtual();
  if (!user) return { autorizado: false };

  const profile = await buscarPerfilComPermissoes(supabase, user.id);

  if (!profile) return { autorizado: false };
  if (profile.role === "admin") return { autorizado: true, supabase, user, companyId: profile.company_id };
  if (profile.role === "funcionario" && chaves.some((chave) => profile.permissoes?.[chave] === true)) {
    return { autorizado: true, supabase, user, companyId: profile.company_id };
  }
  return { autorizado: false };
}

/**
 * Guarda para o que TODA a equipe usa, sem permissão de módulo.
 *
 * Alguns recursos não são de um módulo — o mapa mental é de quem trabalha na
 * empresa, do mesmo jeito que o Dashboard. Criar uma `ModuloChave` só para
 * ele obrigaria o admin a ligar mais uma chavinha para cada funcionário
 * antes de qualquer um poder abrir um mapa, sem proteger nada em troca: o
 * RLS já limita tudo à própria empresa.
 */
export async function requireEquipe() {
  const supabase = await createClient();
  const user = await usuarioAtual();
  if (!user) throw new Error("Não autenticado.");

  const profile = await buscarPerfilComPermissoes(supabase, user.id);
  if (!profile || (profile.role !== "admin" && profile.role !== "funcionario")) {
    throw new Error("Você não tem acesso a esta área.");
  }
  return { supabase, user, companyId: profile.company_id, nome: profile.full_name ?? profile.email };
}

/** Mesma checagem de `requireEquipe`, mas para Server Components de página — redireciona em vez de lançar. */
export async function requireEquipeOuRedirect() {
  const supabase = await createClient();
  const user = await usuarioAtual();
  if (!user) redirect("/login");

  const profile = await buscarPerfilComPermissoes(supabase, user.id);
  if (!profile || (profile.role !== "admin" && profile.role !== "funcionario")) redirect("/");
  return { supabase, user, companyId: profile.company_id, nome: profile.full_name ?? profile.email };
}

/** Guarda por permissão pra Server Actions dos módulos operacionais. Lança erro — quem chama já espera capturar em try/catch e devolver `ActionResult`, igual `requireAdmin`. */
export async function requireModulo(chave: ModuloChave) {
  const resultado = await carregarAutorizacaoQualquer([chave]);
  if (!resultado.autorizado) throw new Error("Você não tem permissão para acessar este módulo.");
  // `companyId` vem daqui, do SERVIDOR, e nunca do cliente: é ele que prefixa
  // todo caminho de upload no Storage (`${companyId}/...`), e as políticas dos
  // buckets exigem que esse primeiro segmento bata com a empresa de quem está
  // chamando. Se o caminho viesse do navegador, bastaria trocar o prefixo pra
  // escrever na pasta de outra empresa.
  return { supabase: resultado.supabase, user: resultado.user, companyId: resultado.companyId };
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
  return { supabase: resultado.supabase, user: resultado.user, companyId: resultado.companyId };
}

/** Mesma checagem de `requireModulo`, mas pra Server Components de página — redireciona em vez de lançar. */
export async function requireModuloOuRedirect(chave: ModuloChave) {
  const resultado = await carregarAutorizacaoQualquer([chave]);
  if (!resultado.autorizado) redirect("/admin/dashboard");
  return { supabase: resultado.supabase, user: resultado.user, companyId: resultado.companyId };
}

/**
 * Mesma ideia de `requireQualquerModulo`, mas pra Server Components de
 * página — redireciona em vez de lançar. Usada pelo hub Comercial
 * (`/admin/comercial`, ver `page.tsx`), que junta Leads (chave "comercial")
 * e Funil/Calculadora/Propostas (chave "orcamentos") numa tela só: em vez de
 * só {supabase, user}, devolve também `chavesAutorizadas` — o `Set` das
 * chaves pedidas que o usuário REALMENTE tem — pra página decidir quais
 * abas mostrar (ex: funcionário só com "orcamentos" ligado não vê a aba
 * Leads, mesmo caindo na mesma URL do hub). Admin sempre recebe todas as
 * chaves pedidas.
 */
export async function requireQualquerModuloOuRedirect(chaves: ModuloChave[]): Promise<{ supabase: SupabaseClient; user: User; chavesAutorizadas: Set<ModuloChave> }> {
  const supabase = await createClient();
  const user = await usuarioAtual();
  if (!user) redirect("/login");

  const profile = await buscarPerfilComPermissoes(supabase, user.id);
  if (!profile) redirect("/admin/dashboard");

  if (profile.role === "admin") {
    return { supabase, user, chavesAutorizadas: new Set(chaves) };
  }
  if (profile.role === "funcionario") {
    const chavesAutorizadas = new Set(chaves.filter((chave) => profile.permissoes?.[chave] === true));
    if (chavesAutorizadas.size === 0) redirect("/admin/dashboard");
    return { supabase, user, chavesAutorizadas };
  }
  redirect("/admin/dashboard");
}
