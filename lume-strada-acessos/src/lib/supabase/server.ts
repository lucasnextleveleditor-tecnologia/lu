import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Cliente Supabase para uso em Server Components, Server Actions e Route
 * Handlers. Usa a chave ANON + os cookies de sessão do usuário logado —
 * todas as queries respeitam as políticas de RLS de `supabase/schema.sql`
 * (um cliente comum só lê o próprio perfil; um admin lê todos porque a
 * policy "profiles_select_admin" libera com base em `is_admin()`).
 *
 * Não confundir com `lib/supabase/admin.ts` (Service Role) — este aqui
 * NUNCA ignora RLS. Também não é parametrizado com `<Database>` — ver o
 * comentário no topo de `lib/types/database.ts`.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // `setAll` é chamado a partir de um Server Component em algumas
          // rotas (ex: páginas que só leem dados) — nesses casos o Next não
          // permite escrever cookies, e tudo bem: o middleware já cuida de
          // manter a sessão atualizada a cada requisição.
        }
      },
    },
  });
}
