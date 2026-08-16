import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { ProfileRow } from "@/lib/types/database";
import { calcularStatus } from "@/lib/utils/status";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

const ROTAS_PUBLICAS = ["/login", "/acesso-expirado", "/definir-senha", "/auth/callback"];

/**
 * Página de erro autocontida (sem CSS/imagens externas, sem depender de
 * nenhuma rota do Next) usada quando o middleware não consegue nem começar
 * a validar a sessão — ex: variável de ambiente ausente ou o próprio
 * Supabase inacessível. Existe pra substituir a página genérica
 * "MIDDLEWARE_INVOCATION_FAILED" da Vercel (que não diz o que fazer) por
 * uma mensagem acionável, direto no navegador.
 */
function respostaErroConfiguracao(mensagem: string): NextResponse {
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Configuração pendente</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; background: #050505; color: #f5f4f2; display: flex; min-height: 100vh; align-items: center; justify-content: center; padding: 24px; }
  main { max-width: 560px; }
  h1 { font-size: 18px; margin: 0 0 12px; }
  p { color: #a6a3a0; font-size: 14px; line-height: 1.6; }
  code { background: #161616; padding: 2px 6px; border-radius: 4px; color: #f5f4f2; font-size: 13px; }
</style>
</head>
<body>
<main>
<h1>Configuração do Supabase pendente</h1>
<p>${mensagem}</p>
<p>Configure as variáveis em <b>Vercel → Project → Settings → Environment Variables</b> (veja <code>.env.local.example</code> no repositório) e depois refaça o deploy — a Vercel não reaplica variáveis novas em um deploy que já existe.</p>
</main>
</body>
</html>`;
  return new NextResponse(html, { status: 500, headers: { "content-type": "text/html; charset=utf-8" } });
}

/**
 * Middleware — roda em toda requisição (ver `matcher` no fim do arquivo) e é
 * a ÚNICA linha de defesa que garante duas coisas ao mesmo tempo:
 *   1. Proteção de rotas: só usuário autenticado acessa /admin e /dashboard.
 *   2. Lógica de expiração: em toda requisição (não só no login) comparamos
 *      `expires_at`/`active` do perfil com o relógio atual — se o acesso
 *      expirou ou foi suspenso enquanto o usuário já estava logado, a
 *      PRÓXIMA requisição dele já cai em /acesso-expirado, sem precisar
 *      esperar o token expirar ou o usuário deslogar.
 *
 * A consulta ao perfil roda a cada request. Para o volume de um painel
 * interno de agência isso é desprezível; se um dia o tráfego justificar,
 * dá para cachear o resultado por alguns segundos (ex: em um cookie
 * assinado) — deixado de fora aqui para manter a lógica simples e óbvia.
 *
 * Tudo abaixo roda dentro de um try/catch de propósito: como o middleware
 * é invocado em TODA requisição, qualquer exceção não tratada aqui derruba
 * o site inteiro com a página genérica "MIDDLEWARE_INVOCATION_FAILED" da
 * Vercel — capturar o erro e responder com uma mensagem clara é
 * estritamente melhor pra diagnosticar em produção.
 */
export async function middleware(request: NextRequest) {
  // Rotas de API (ex: webhook do WhatsApp) fazem sua PRÓPRIA autenticação
  // (segredo compartilhado, ver src/app/api/whatsapp/webhook/route.ts) e não
  // devem passar pela checagem de sessão/cookie daqui — um provedor externo
  // batendo em /api/whatsapp/webhook não tem (nem deveria ter) cookie de
  // sessão do painel. Sem esse escape, o middleware redirecionava a própria
  // chamada do provedor pra /login antes do handler da rota sequer rodar,
  // deixando o webhook inoperante em produção sem nenhum erro visível.
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  let supabaseUrl: string;
  let supabaseAnonKey: string;

  try {
    ({ url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabasePublicEnv());
  } catch (err) {
    console.error("[middleware] variáveis de ambiente do Supabase ausentes:", err);
    return respostaErroConfiguracao(
      "As variáveis <code>NEXT_PUBLIC_SUPABASE_URL</code> e/ou <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> não estão definidas neste ambiente."
    );
  }

  try {
    let response = NextResponse.next({ request: { headers: request.headers } });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isRotaPublica = ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota));

    // Ninguém logado tentando abrir uma rota protegida -> /login
    if (!user && !isRotaPublica) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, active, expires_at")
        .eq("id", user.id)
        .single()
        .overrideTypes<Pick<ProfileRow, "role" | "active" | "expires_at">, { merge: false }>();

      // Perfil deveria sempre existir (trigger `handle_new_user` cria na hora
      // do cadastro — ver supabase/schema.sql). Se por algum motivo não
      // existir ainda, tratamos como "sem acesso liberado" por segurança.
      const status = profile ? calcularStatus(profile) : "inativo";
      const role = profile?.role ?? "cliente";

      if (status !== "ativo" && pathname !== "/acesso-expirado") {
        const url = request.nextUrl.clone();
        url.pathname = "/acesso-expirado";
        return NextResponse.redirect(url);
      }

      if (status === "ativo") {
        // Admin cai na Home do painel (Cadastros); funcionário cai direto no
        // Dashboard (Visão Geral — o único módulo aberto a qualquer membro
        // da equipe, sem depender de permissão); cliente vai pro portal dele.
        const home = role === "admin" ? "/admin" : role === "funcionario" ? "/admin/dashboard" : "/dashboard";

        if (pathname === "/login" || pathname === "/") {
          const url = request.nextUrl.clone();
          url.pathname = home;
          return NextResponse.redirect(url);
        }

        if (pathname.startsWith("/admin") && role !== "admin" && role !== "funcionario") {
          const url = request.nextUrl.clone();
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      }
    } else if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return response;
  } catch (err) {
    // Ex: projeto Supabase pausado/inacessível, URL mal formada, etc. O
    // erro completo vai pro log da função (Vercel → Deployments → Logs);
    // quem visita o site vê uma mensagem clara em vez da página genérica.
    console.error("[middleware] erro inesperado ao validar a sessão:", err);
    return respostaErroConfiguracao("Ocorreu um erro inesperado ao validar a sessão. Veja os logs da função na Vercel para o detalhe.");
  }
}

export const config = {
  matcher: [
    /*
     * Roda em tudo, exceto assets estáticos do Next e arquivos com extensão
     * (favicon, imagens, etc.) — evita gastar uma query de auth por asset.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif)$).*)",
  ],
};
