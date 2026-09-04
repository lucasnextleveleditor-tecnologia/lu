/**
 * Validação central das variáveis de ambiente PÚBLICAS do Supabase — usada
 * por `middleware.ts`, `lib/supabase/server.ts` e `lib/supabase/client.ts`.
 *
 * Lança uma mensagem clara e acionável em vez de deixar o SDK do Supabase
 * lançar um erro genérico (ex: "Invalid URL", "supabaseUrl is required")
 * quando a variável está ausente — foi exatamente esse tipo de erro
 * "cru" que aparecia como `MIDDLEWARE_INVOCATION_FAILED` na Vercel antes
 * desta validação existir: o middleware roda em toda requisição, então uma
 * env var faltando derrubava o site inteiro com uma página genérica.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY não estão definidas neste ambiente. " +
        "Configure-as em .env.local (desenvolvimento) ou nas variáveis de ambiente do provedor de deploy " +
        "(produção — ex: Vercel → Project → Settings → Environment Variables, com um redeploy depois de salvar). " +
        "Veja .env.local.example."
    );
  }

  return { url, anonKey };
}
