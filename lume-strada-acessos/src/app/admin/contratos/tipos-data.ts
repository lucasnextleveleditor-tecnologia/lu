import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { ContratoTipoRow } from "@/lib/types/contratos";
import type { PerfilOrcamento } from "@/lib/types/orcamentos";
import { CATEGORIAS_PORTFOLIO } from "@/lib/utils/orcamentos";

/**
 * Sempre retorna os 7 perfis, mesmo os que ainda não têm modelo salvo
 * (`null`) — mesmo padrão de `buscarTiposOrcamento` (Fase 2). A tela de
 * edição decide o rascunho inicial a mostrar (`montarClausulasPadrao`)
 * quando o valor vier `null`.
 */
export async function buscarTiposContrato(): Promise<Record<PerfilOrcamento, ContratoTipoRow | null>> {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const { data: tipos } = await supabase.from("contratos_tipos").select("*").overrideTypes<ContratoTipoRow[], { merge: false }>();

  const resultado = {} as Record<PerfilOrcamento, ContratoTipoRow | null>;
  for (const perfil of CATEGORIAS_PORTFOLIO) {
    resultado[perfil] = (tipos ?? []).find((t) => t.perfil === perfil) ?? null;
  }
  return resultado;
}
