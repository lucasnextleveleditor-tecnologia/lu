import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a SERVICE ROLE KEY — ignora RLS e tem acesso à API
 * admin de Auth (`auth.admin.*`). Uso EXCLUSIVO em código server-only
 * (Server Actions / Route Handlers), nunca em Client Components.
 *
 * O `import "server-only"` no topo faz o build do Next.js FALHAR se este
 * arquivo for importado, direta ou indiretamente, por qualquer código que
 * também rode no navegador — é a rede de segurança contra vazar a Service
 * Role Key no bundle do cliente.
 *
 * Usado neste projeto pra: (1) gerar o link de acesso de clientes/
 * funcionários/donos de empresa (`auth.admin.generateLink`, ver
 * `gerarLinkConvite` abaixo) e (2) o Dashboard do CLIENTE
 * (`src/app/dashboard/actions.ts`) ler/aprovar entregas de Produção — a RLS
 * dessas tabelas (`is_staff()`) bloqueia um cliente por completo, então a
 * checagem de posse (`tarefa.cliente_id === user.id`) é feita na aplicação
 * ANTES de qualquer leitura/escrita, nunca confiando em RLS pra isso (mesma
 * filosofia de segurança documentada em `lib/auth/requireAdmin.ts`). As
 * demais ações administrativas (editar data de expiração, suspender/
 * reativar) usam o cliente comum de `lib/supabase/server.ts` autenticado
 * como o próprio admin logado — RLS já garante que só um admin consegue
 * alterar o perfil de terceiros.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_SUPABASE_URL) não configurada. Veja o .env.local.example."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Gera um link de acesso (convite) via Admin API — `generateLink({ type:
 * "invite" })` — SEM disparar e-mail nenhum. É a função usada por TODA ação
 * de "Gerar acesso" do sistema (`gerarAcessoCliente`, `gerarAcessoFuncionario`,
 * `gerarAcessoCompanyAdmin`, `converterLeadEmCliente`).
 *
 * Substituiu `inviteUserByEmail` de propósito: aquele método soma duas
 * coisas numa chamada só — criar o usuário E mandar o e-mail pelo serviço
 * embutido do Supabase, que tem um rate limit baixíssimo (pensado só pra
 * teste, ver `MIGRACAO-MULTI-TENANT.md`) e depende de "Redirect URLs"
 * configurada certinho no dashboard; qualquer um dos dois quebrando (limite
 * batido, link caindo em localhost, token de uso único queimado num clique
 * que falhou) derrubava o convite inteiro. `generateLink` faz só a metade
 * que realmente precisa da Service Role (criar o usuário) e devolve os
 * dados pra quem chamou montar o próprio link e entregar como quiser —
 * copiar e mandar no WhatsApp do cliente, colar num e-mail manual, etc. Sem
 * e-mail automático não existe rate limit, então essa chamada nunca falha
 * por causa disso.
 *
 * IMPORTANTE: o link devolvido NÃO é o `action_link` pronto que o Supabase
 * gera (esse aponta pro `/auth/v1/verify` DELES, que devolve a sessão em
 * fragmento de URL — `#access_token=...` — algo que um Route Handler nunca
 * consegue ler, porque fragmento não sai do navegador; foi exatamente esse
 * o bug real encontrado em produção que fazia TODO convite, mesmo o antigo
 * por e-mail, cair de volta no `/login` sem explicação nenhuma, sempre).
 * Em vez disso, montamos aqui um link pra NOSSA PRÓPRIA rota
 * (`/auth/callback`, ver `app/auth/callback/route.ts`) com `token_hash` +
 * `type` — o padrão que a própria documentação do Supabase recomenda pra
 * SSR — e lá a verificação roda via `verifyOtp({ token_hash, type })`, que
 * devolve a sessão no CORPO da resposta, servidor consegue ler numa boa.
 *
 * `type: "invite"` funciona tanto pra criar um usuário novo quanto pra gerar
 * um link novo pra um usuário que já existe mas ainda não confirmou o
 * primeiro (reenvio) — não precisa de um caminho separado pra "reenviar".
 */
export async function gerarLinkConvite(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  options: { data?: Record<string, unknown>; redirectTo: string }
): Promise<{ ok: true; link: string; userId: string } | { ok: false; error: string }> {
  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { data: options.data, redirectTo: options.redirectTo },
  });
  if (error) return { ok: false, error: error.message };
  if (!data.user) return { ok: false, error: "Geração de link não retornou um usuário." };

  const link = `${options.redirectTo}?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=${encodeURIComponent(
    data.properties.verification_type
  )}`;
  return { ok: true, link, userId: data.user.id };
}
