import "server-only";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/database";

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
    .select("role")
    .eq("id", user.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "role">, { merge: false }>();

  if (profile?.role !== "admin") throw new Error("Apenas administradores podem fazer isso.");

  return { supabase, user };
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
export type ModuloChave = "clientes" | "financeiro" | "producao" | "comercial" | "trafego" | "inventario" | "whatsapp";

type ResultadoPermissao = { autorizado: true; supabase: SupabaseClient; user: User } | { autorizado: false };

async function carregarAutorizacao(chave: ModuloChave): Promise<ResultadoPermissao> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { autorizado: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, permissoes")
    .eq("id", user.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "role" | "permissoes">, { merge: false }>();

  if (!profile) return { autorizado: false };
  if (profile.role === "admin") return { autorizado: true, supabase, user };
  if (profile.role === "funcionario" && profile.permissoes?.[chave] === true) return { autorizado: true, supabase, user };
  return { autorizado: false };
}

/** Guarda por permissão pra Server Actions dos módulos operacionais. Lança erro — quem chama já espera capturar em try/catch e devolver `ActionResult`, igual `requireAdmin`. */
export async function requireModulo(chave: ModuloChave) {
  const resultado = await carregarAutorizacao(chave);
  if (!resultado.autorizado) throw new Error("Você não tem permissão para acessar este módulo.");
  return { supabase: resultado.supabase, user: resultado.user };
}

/** Mesma checagem de `requireModulo`, mas pra Server Components de página — redireciona em vez de lançar. */
export async function requireModuloOuRedirect(chave: ModuloChave) {
  const resultado = await carregarAutorizacao(chave);
  if (!resultado.autorizado) redirect("/admin/dashboard");
  return { supabase: resultado.supabase, user: resultado.user };
}
