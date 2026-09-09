import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { verificarAcessoPorToken, type ResultadoAcesso } from "./acesso";
import type { AcessoPublicoMapa, MapaComentarioRow, MapaCompleto, MapaNoRow } from "@/lib/types/mapa-mental";

export type MapaPorToken =
  | { estado: "ok"; dados: MapaCompleto; acesso: AcessoPublicoMapa; nome: string }
  | Exclude<ResultadoAcesso, { estado: "ok" }>;

/**
 * O mapa aberto pelo link — só para quem está logado E é da empresa dona do
 * mapa (ver `acesso.ts`). O token diz QUAL mapa; o cadastro diz SE pode.
 */
export async function buscarMapaPorToken(token: string): Promise<MapaPorToken> {
  const acesso = await verificarAcessoPorToken(token, "ver");
  if (acesso.estado !== "ok") return acesso;

  const admin = createAdminClient();
  const [nosRes, comentariosRes] = await Promise.all([
    admin.from("mapa_nos").select("*").eq("mapa_id", acesso.mapa.id).order("ordem"),
    admin.from("mapa_comentarios").select("*").eq("mapa_id", acesso.mapa.id).order("created_at"),
  ]);

  return {
    estado: "ok",
    acesso: acesso.acesso,
    nome: acesso.nome,
    dados: {
      mapa: acesso.mapa,
      nos: (nosRes.data ?? []) as MapaNoRow[],
      comentarios: (comentariosRes.data ?? []) as MapaComentarioRow[],
    },
  };
}
