"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Chamada por `SetPasswordForm` logo depois que `supabase.auth.updateUser({
 * password })` (client-side) já trocou a senha de verdade — aqui só
 * limpamos a flag `profiles.senha_provisoria` (ver
 * `supabase/senha-provisoria.sql`) que o `src/middleware.ts` usa pra forçar
 * a pessoa a passar por `/definir-senha` antes de qualquer outra tela.
 *
 * Precisa da Service Role: não existe policy de RLS que deixe um usuário
 * comum (cliente/funcionário/admin) atualizar a PRÓPRIA linha em `profiles`
 * (só admin/super_admin atualizam perfil de terceiros — ver
 * `profiles_update_admin` em `multitenant-migration.sql`). Em vez de abrir
 * uma policy de self-update genérica (que deixaria qualquer usuário comum
 * também mudar `role`/`company_id`/`active`/`expires_at` da própria conta
 * via um PATCH forjado — um jeito e tanto de auto-promover), usamos a
 * Service Role aqui, mas só depois de confirmar a identidade via
 * `getUser()` (cookie de sessão) e SÓ tocamos na própria linha do usuário
 * logado — nunca num id vindo do cliente.
 */
export async function concluirTrocaDeSenha(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Sessão expirada. Faça login novamente." };

    const admin = createAdminClient();
    const { error } = await admin.from("profiles").update({ senha_provisoria: false }).eq("id", user.id);
    if (error) return { ok: false, error: error.message };

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
