"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function convidarCliente(input: {
  email: string;
  fullName: string;
  expiresAt: string | null; // ISO date (yyyy-mm-dd) ou null
}): Promise<ActionResult> {
  try {
    await requireAdmin();

    const email = input.email.trim().toLowerCase();
    if (!email) return { ok: false, error: "Informe um e-mail." };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const admin = createAdminClient();

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: input.fullName.trim() || null },
      redirectTo: `${siteUrl}/auth/callback`,
    });

    if (inviteError) return { ok: false, error: inviteError.message };
    if (!invited.user) return { ok: false, error: "Convite não retornou um usuário." };

    // O trigger `handle_new_user` (supabase/schema.sql) já criou o perfil
    // com role 'cliente' e active = true. Se uma data de expiração foi
    // definida no momento do convite, gravamos aqui em seguida — ainda com
    // o cliente Service Role, já que é a mesma chamada/contexto do convite.
    if (input.expiresAt) {
      const { error: updateError } = await admin
        .from("profiles")
        .update({ expires_at: new Date(input.expiresAt).toISOString() })
        .eq("id", invited.user.id);
      if (updateError) return { ok: false, error: updateError.message };
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarExpiracao(userId: string, expiresAt: string | null): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("profiles")
      .update({ expires_at: expiresAt ? new Date(expiresAt).toISOString() : null })
      .eq("id", userId);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin");
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
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
