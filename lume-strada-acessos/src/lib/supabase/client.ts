"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Cliente Supabase para uso em Client Components ("use client"). Usa sempre
 * a chave ANON — nunca importe `lib/supabase/admin.ts` (Service Role) em
 * nada que rode no navegador.
 *
 * Não parametrizamos com `<Database>` — ver o comentário no topo de
 * `lib/types/database.ts` sobre por quê.
 */
export function createClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
