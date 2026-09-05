/**
 * URL pública e ESTÁVEL do painel (ex.: "https://lu-xi.vercel.app") — usada
 * em todo link mostrado/copiado pra fora dele: credenciais de acesso geradas
 * e "reenviar link" (`CredenciaisAcessoGerado`, `AcessosEmpresaModal`,
 * `CompaniesManager`) e o webhook do WhatsApp (`lib/whatsapp/provider.ts`).
 *
 * Esse pedacinho de código já mordeu o produto com DOIS bugs opostos:
 *
 * 1) Confiar cegamente em `NEXT_PUBLIC_SITE_URL` — se ela ficar mal
 *    configurada na Vercel (ex.: esquecida como "http://localhost:3000", o
 *    valor padrão de `.env.local.example`), todo link gerado em produção
 *    quebra pra qualquer pessoa, sempre (ver `MIGRACAO-MULTI-TENANT.md` §8.1).
 * 2) A correção anterior — trocar por `window.location.origin` — resolveu o
 *    bug 1, mas criou outro: cada deployment da Vercel também tem uma URL
 *    própria e fixa (tipo `lu-c9ev8hflq-...vercel.app`, que nunca muda,
 *    mesmo quando outro deployment vira "Production"). Se quem gera o acesso
 *    estiver navegando por uma URL dessas (um link antigo salvo nos
 *    favoritos, por exemplo), o link enviado pro cliente/funcionário sai
 *    errado — apontando pra aquele build congelado no tempo.
 *
 * Solução: usar `NEXT_PUBLIC_SITE_URL` como fonte da verdade sempre que ela
 * parecer uma URL de verdade (não vazia, não localhost) — só cai pra
 * `window.location.origin` como rede de segurança se a env var estiver
 * ausente. Configure `NEXT_PUBLIC_SITE_URL` na Vercel (Production) com o
 * domínio "oficial" do app (o mesmo dos "Assigned Domains" do deployment de
 * Production — ex.: `https://lu-xi.vercel.app`) pra garantir o link certo
 * sempre, não importa por qual URL você esteja navegando no momento.
 */
export function getSiteUrl(): string {
  const env = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
  const pareceUrlValida = /^https?:\/\//i.test(env) && !/localhost|127\.0\.0\.1/i.test(env);
  if (pareceUrlValida) return env;

  if (typeof window !== "undefined") return window.location.origin;

  return env;
}
