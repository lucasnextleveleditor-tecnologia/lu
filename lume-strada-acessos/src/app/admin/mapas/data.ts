import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MapaComentarioRow, MapaCompleto, MapaMentalRow, MapaNoRow } from "@/lib/types/mapa-mental";

/** Todos os mapas da empresa, com a contagem de balões. O RLS já limita à empresa. */
export async function listarMapas(): Promise<(MapaMentalRow & { total_nos: number })[]> {
  const supabase = await createClient();
  const [mapasRes, nosRes] = await Promise.all([
    supabase.from("mapas_mentais").select("*").order("atualizado_em", { ascending: false }),
    supabase.from("mapa_nos").select("mapa_id"),
  ]);

  const porMapa = new Map<string, number>();
  for (const linha of (nosRes.data ?? []) as { mapa_id: string }[]) {
    porMapa.set(linha.mapa_id, (porMapa.get(linha.mapa_id) ?? 0) + 1);
  }

  return ((mapasRes.data ?? []) as MapaMentalRow[]).map((m) => ({ ...m, total_nos: porMapa.get(m.id) ?? 0 }));
}

/** Um mapa inteiro. `null` quando o id não existe ou é de outra empresa (o RLS resolve as duas). */
export async function buscarMapa(id: string): Promise<MapaCompleto | null> {
  const supabase = await createClient();

  const { data: mapa } = await supabase.from("mapas_mentais").select("*").eq("id", id).maybeSingle<MapaMentalRow>();
  if (!mapa) return null;

  const [nosRes, comentariosRes] = await Promise.all([
    supabase.from("mapa_nos").select("*").eq("mapa_id", id).order("ordem"),
    supabase.from("mapa_comentarios").select("*").eq("mapa_id", id).order("created_at"),
  ]);

  return {
    mapa,
    nos: (nosRes.data ?? []) as MapaNoRow[],
    comentarios: (comentariosRes.data ?? []) as MapaComentarioRow[],
  };
}
