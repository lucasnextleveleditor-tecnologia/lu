import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/database";
import { calcularStatus, fmtData } from "@/lib/utils/status";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function AcessoExpiradoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { dict } = await getDictionary();

  let mensagem = dict.login.acessoExpiradoPadrao;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("active, expires_at")
      .eq("id", user.id)
      .single()
      .overrideTypes<Pick<ProfileRow, "active" | "expires_at">, { merge: false }>();

    if (profile) {
      const status = calcularStatus(profile);
      if (status === "expirado") {
        mensagem = dict.login.acessoExpiradoData.replace("{data}", fmtData(profile.expires_at));
      } else if (status === "inativo") {
        mensagem = dict.login.acessoSuspenso;
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-status-critical/30 bg-status-critical/10">
          <div className="h-3 w-3 rotate-45 bg-status-critical" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">{dict.login.acessoExpiradoTitulo}</h1>
        <p className="mt-2 text-sm text-ink-secondary">{mensagem}</p>
        <p className="mt-4 text-xs text-ink-muted">{dict.login.faleComAgencia}</p>
        <div className="mt-6 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
