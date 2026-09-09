import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AcessoPublicoMapa, MapaComentarioRow, MapaCompleto, MapaMentalRow, MapaNoRow } from "@/lib/types/mapa-mental";

/**
 * Busca o mapa pelo TOKEN da URL — sempre via Service Role, nunca pelo
 * cliente autenticado: esta página não tem login, não existe sessão nem RLS
 * para filtrar por empresa. A única autorização é conhecer o token (24 bytes
 * aleatórios), e o filtro `.eq("token", token)` é o ÚNICO controle de acesso,
 * feito no código — mesmo desenho de `app/contrato/data.ts`.
 *
 * Um mapa `privado` devolve `null` mesmo com o token certo: desligar o link é
 * o jeito de revogar sem trocar a URL.
 */
export async function buscarMapaPublicoPorToken(token: string): Promise<(MapaCompleto & { acesso: AcessoPublicoMapa }) | null> {
  const admin = createAdminClient();

  const { data: mapa } = await admin.from("mapas_mentais").select("*").eq("token", token).maybeSingle<MapaMentalRow>();
  if (!mapa || mapa.acesso_publico === "privado") return null;

  const [nosRes, comentariosRes] = await Promise.all([
    admin.from("mapa_nos").select("*").eq("mapa_id", mapa.id).order("ordem"),
    admin.from("mapa_comentarios").select("*").eq("mapa_id", mapa.id).order("created_at"),
  ]);

  return {
    mapa,
    nos: (nosRes.data ?? []) as MapaNoRow[],
    comentarios: (comentariosRes.data ?? []) as MapaComentarioRow[],
    acesso: mapa.acesso_publico,
  };
}
