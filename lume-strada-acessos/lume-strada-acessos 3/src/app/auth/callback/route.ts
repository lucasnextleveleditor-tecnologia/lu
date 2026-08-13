import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback do fluxo de convite (e também de login por magic link, se algum
 * dia for adicionado). O e-mail de convite disparado por
 * `auth.admin.inviteUserByEmail` (ver `app/admin/actions.ts`) aponta para
 * esta rota com um `?code=...` — trocamos o código pela sessão e mandamos o
 * cliente direto para definir a própria senha, já autenticado.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/definir-senha";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?erro=convite_invalido`);
}
