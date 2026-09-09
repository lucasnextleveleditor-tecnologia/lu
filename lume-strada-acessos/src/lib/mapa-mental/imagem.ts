import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * URL pública da imagem de um balão.
 *
 * Montada na LEITURA a partir do caminho guardado, nunca gravada no banco:
 * assim trocar de projeto ou de domínio no Supabase não deixa para trás uma
 * porção de URLs mortas dentro dos mapas (mesmo critério de orcamentos-midia).
 */
export function urlImagemMapa(caminho: string | null): string | null {
  if (!caminho) return null;
  const { url } = getSupabasePublicEnv();
  return `${url.replace(/\/$/, "")}/storage/v1/object/public/mapas/${caminho}`;
}
