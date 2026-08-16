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
 * Usado neste projeto pra: (1) convidar clientes/funcionários por e-mail
 * (`auth.admin.inviteUserByEmail`) e (2) o Dashboard do CLIENTE
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
