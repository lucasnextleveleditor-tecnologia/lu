import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de qualquer fluxo de Auth que devolva sessão por link — hoje em
 * dia NENHUM caminho do app gera links assim (ver nota grande em
 * `lib/supabase/admin.ts`: contas novas nascem com e-mail confirmado +
 * senha provisória via `criarAcessoComSenhaPadrao`, sem token/link
 * nenhum), mas a rota fica aqui pronta pra qualquer feature futura que
 * precise disso (ex: "esqueci minha senha" via `resetPasswordForEmail`,
 * magic link).
 *
 * Histórico: esta rota só sabia ler `?code=...` (fluxo PKCE, via
 * `exchangeCodeForSession`) — mas o link de convite que
 * `auth.admin.generateLink`/`inviteUserByEmail` geravam NUNCA usa PKCE (é
 * criado do lado do SERVIDOR, com a Service Role; não existe "o mesmo
 * navegador que iniciou o fluxo" pra guardar o code_verifier que o PKCE
 * exige) — o link deles aponta pro `/auth/v1/verify` do Supabase, que
 * devolve a sessão nos QUERY FRAGMENTS da URL (`#access_token=...`), e
 * fragmento nunca chega no servidor. Resultado: `code` sempre vinha `null`
 * aqui, a rota caía direto no fallback `/login?erro=convite_invalido` — e
 * como `LoginForm` nunca lia esse `erro`, a pessoa só via a tela de login
 * normal, sem nenhuma pista do que tinha acontecido. Isso fazia TODO
 * convite (por e-mail antigo ou link copiável) nunca terminar em
 * "definir senha" — ver `MIGRACAO-MULTI-TENANT.md` §8.1 pro relato
 * completo. Corrigido em duas partes (ambas ainda válidas se essa rota
 * voltar a ser usada): o ramo `token_hash`/`type` abaixo, via
 * `verifyOtp` (devolve a sessão no CORPO da resposta, não em fragmento —
 * o padrão que a documentação do Supabase recomenda pra SSR); e o ramo
 * `code`/`exchangeCodeForSession` como fallback pra um fluxo PKCE de
 * verdade (ex: magic link disparado pelo próprio navegador do usuário).
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
