import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback do fluxo de convite (e também de login por magic link, se algum
 * dia for adicionado).
 *
 * BUG REAL encontrado e corrigido aqui (19/08/2026, depois de nenhum convite
 * — nem no fluxo antigo por e-mail, nem no link copiável novo — conseguir
 * terminar em `/definir-senha`, sempre voltando pro `/login` sem explicação
 * nenhuma): esta rota só sabia ler `?code=...` (fluxo PKCE, via
 * `exchangeCodeForSession`). Só que o link que `auth.admin.generateLink`/
 * `auth.admin.inviteUserByEmail` geram (ver `gerarLinkConvite` em
 * `lib/supabase/admin.ts`) NUNCA usa PKCE — é um convite criado do lado do
 * SERVIDOR (Service Role), não existe "o mesmo navegador que iniciou o
 * fluxo" pra guardar o code_verifier que o PKCE exige. O link do convite
 * aponta primeiro pro endpoint `/auth/v1/verify` do próprio Supabase, que
 * (confirmado na documentação oficial, seção "Redirecting the user to a
 * server-side endpoint") devolve a sessão nos QUERY FRAGMENTS da URL
 * (`#access_token=...&refresh_token=...`) — fragmento (depois do `#`) nunca
 * chega no servidor, só em JS do navegador. Resultado: `code` sempre vinha
 * `null` aqui, a rota caía direto no fallback `/login?erro=convite_invalido`
 * — e como `LoginForm` nunca leu esse `erro`, a pessoa só via a tela de
 * login normal, sem nenhuma pista do que aconteceu (foi exatamente o que
 * apareceu pro Lucas ao testar o link copiável novo).
 *
 * Correção: `gerarLinkConvite` para de usar o `action_link` pronto do
 * Supabase (que passa pelo `/auth/v1/verify` deles) e monta o link
 * apontando direto pra ESTA rota, com `token_hash` + `type` (os dois vêm em
 * `properties.hashed_token`/`properties.verification_type` na resposta do
 * `generateLink`) — igual ao padrão recomendado na doc do Supabase pra SSR.
 * Com isso a verificação roda aqui, via `verifyOtp({ token_hash, type })`,
 * que devolve a sessão no CORPO da resposta (não em fragmento), então o
 * servidor consegue ler e gravar nos cookies normalmente. O ramo `code` /
 * `exchangeCodeForSession` fica como fallback, caso algum dia surja um
 * fluxo PKCE de verdade (ex: magic link disparado pelo próprio navegador do
 * usuário, não por um admin).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/definir-senha";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?erro=convite_invalido`);
}
