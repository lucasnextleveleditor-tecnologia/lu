import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/database";

/**
 * Guarda compartilhada por TODA Server Action administrativa (usuários,
 * metas, tráfego). Chamada antes de qualquer escrita — mesmo já existindo
 * RLS admin nas tabelas, essa checagem barra ANTES de tentar, o que importa
 * sobretudo pra ações que usam a Service Role (que ignora RLS).
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
