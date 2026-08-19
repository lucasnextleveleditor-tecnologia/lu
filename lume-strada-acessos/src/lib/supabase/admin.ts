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
 * Usado neste projeto pra: (1) criar o login de clientes/funcionários/donos
 * de empresa já com senha provisória (`auth.admin.createUser`, ver
 * `criarAcessoComSenhaPadrao` abaixo) e (2) o Dashboard do CLIENTE
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

/** Senha provisória atribuída a TODA conta nova — a pessoa loga com ela e o `senha_provisoria = true` (ver `supabase/senha-provisoria.sql`) força a troca antes de qualquer outra tela. Fixa e curta de propósito: não é segurança de verdade (é só o portão de entrada), a segurança real é obrigar a troca antes de liberar o resto do painel. */
export const SENHA_PADRAO_ACESSO = "123";

/**
 * Cria o login de um cliente/funcionário/dono de empresa já com e-mail
 * confirmado e a senha padrão (`SENHA_PADRAO_ACESSO`) — via
 * `auth.admin.createUser`. É a função usada por TODA ação de "Gerar acesso"
 * do sistema (`gerarAcessoCliente`, `gerarAcessoFuncionario`,
 * `gerarAcessoCompanyAdmin`, `converterLeadEmCliente`).
 *
 * Histórico (por que não é mais convite por e-mail/link): esse fluxo já foi
 * `inviteUserByEmail` (e-mail automático — esbarrou no rate limit baixíssimo
 * do serviço embutido do Supabase) e depois `generateLink` com um link
 * copiável — que por sua vez esbarrou em: link caindo em localhost (env var
 * ausente), token de uso único queimado por pré-visualização de link
 * (WhatsApp/navegador prefetch), e por fim um bug real na rota de callback
 * que fazia QUALQUER convite (nem só o link novo, o e-mail antigo também)
 * nunca terminar em "definir senha" (a sessão vinha em fragmento de URL,
 * que o servidor não consegue ler — ver `MIGRACAO-MULTI-TENANT.md` §8.1).
 * Depois de todas essas voltas, o pedido explícito foi abandonar
 * token/link/e-mail de vez: sem nenhum dos três, nenhum dos bugs acima pode
 * mais acontecer. A pessoa recebe e-mail + senha (por WhatsApp, verbalmente,
 * como for) e loga direto — a troca de senha acontece DENTRO do painel já
 * autenticado, sem depender de mais nenhuma entrega externa.
 *
 * `email_confirm: true` já marca o e-mail como confirmado na criação (sem
 * isso `createUser` cria a conta mas com `email_confirmed_at` nulo, e o
 * login normal por senha ainda funciona — mas confirmar de cara evita
 * qualquer ambiguidade futura). Marca `senha_provisoria = true` no profile
 * logo em seguida (o `handle_new_user` — ver `multitenant-migration.sql` —
 * cria a linha sem essa flag, então precisa desse segundo passo pra ligá-la).
 */
export async function criarAcessoComSenhaPadrao(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  options: { data?: Record<string, unknown> }
): Promise<{ ok: true; userId: string; senhaPadrao: string } | { ok: false; error: string }> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: SENHA_PADRAO_ACESSO,
    email_confirm: true,
    user_metadata: options.data,
  });
  if (error) return { ok: false, error: error.message };
  if (!data.user) return { ok: false, error: "Criação de usuário não retornou um usuário." };

  const { error: erroFlag } = await admin.from("profiles").update({ senha_provisoria: true }).eq("id", data.user.id);
  if (erroFlag) return { ok: false, error: erroFlag.message };

  return { ok: true, userId: data.user.id, senhaPadrao: SENHA_PADRAO_ACESSO };
}
