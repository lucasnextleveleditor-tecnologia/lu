import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback do fluxo de convite (e também de login por magic link, se algum
 * dia for adicionado). O link de convite gerado por `gerarLinkConvite`
 * (`auth.admin.generateLink({ type: "invite" })`, ver `lib/supabase/admin.ts`
 * — usado em `app/admin/actions.ts`, `app/super-admin/actions.ts` e
 * `app/admin/comercial/actions.ts`) aponta para esta rota com um
 * `?code=...` depois de verificado pelo Supabase — trocamos o código pela
 * sessão e mandamos o cliente direto para definir a própria senha, já
 * autenticado. Mesmo formato de link que `inviteUserByEmail` mandava por
 * e-mail antes (o e-mail automático só embrulhava esse mesmo link) — só
 * muda quem entrega o link pro destinatário.
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
