import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { OrcTipoOrcamentoRow, OrcTipoOrcamentoItemRow, TipoOrcamentoComItens, PerfilOrcamento } from "@/lib/types/orcamentos";
import { CATEGORIAS_PORTFOLIO } from "@/lib/utils/orcamentos";

/**
 * Sempre retorna os 7 perfis, mesmo os que ainda não têm modelo salvo
 * (`null`) — a tela de edição não precisa saber se já existe linha no banco
 * ou não, `salvarTipoOrcamento` sempre faz upsert.
 */
export async function buscarTiposOrcamento(): Promise<Record<PerfilOrcamento, TipoOrcamentoComItens | null>> {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const { data: tipos } = await supabase.from("orc_tipos_orcamento").select("*").overrideTypes<OrcTipoOrcamentoRow[], { merge: false }>();

  const ids = (tipos ?? []).map((t) => t.id);
  const { data: itens } =
    ids.length > 0
      ? await supabase
          .from("orc_tipos_orcamento_itens")
          .select("*")
          .in("tipo_orcamento_id", ids)
          .order("ordem")
          .overrideTypes<OrcTipoOrcamentoItemRow[], { merge: false }>()
      : { data: [] as OrcTipoOrcamentoItemRow[] };

  const itensPorTipo = new Map<string, OrcTipoOrcamentoItemRow[]>();
  for (const item of itens ?? []) {
    const lista = itensPorTipo.get(item.tipo_orcamento_id) ?? [];
    lista.push(item);
    itensPorTipo.set(item.tipo_orcamento_id, lista);
  }

  const resultado = {} as Record<PerfilOrcamento, TipoOrcamentoComItens | null>;
  for (const perfil of CATEGORIAS_PORTFOLIO) {
    const tipo = (tipos ?? []).find((t) => t.perfil === perfil) ?? null;
    resultado[perfil] = tipo ? { ...tipo, itens: itensPorTipo.get(tipo.id) ?? [] } : null;
  }
  return resultado;
}
