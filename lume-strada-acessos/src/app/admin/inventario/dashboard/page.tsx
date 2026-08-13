import { createClient } from "@/lib/supabase/server";
import type { ItemInventarioRow } from "@/lib/types/database";
import { DashboardPatrimonio, type DistribuicaoCategoria } from "@/components/admin/inventario/DashboardPatrimonio";

export const dynamic = "force-dynamic";

type ItemComCategoriaNome = Pick<ItemInventarioRow, "id" | "categoria_id" | "status" | "valor_pago" | "valor_atual"> & {
  categorias_inventario: { nome: string } | null;
};

export default async function InventarioDashboardPage() {
  const supabase = await createClient();

  // Só o mínimo de colunas pra essa página — os totais são calculados aqui
  // mesmo (em memória), sem precisar de uma VIEW dedicada no banco: o
  // volume de itens de patrimônio de uma agência é pequeno o bastante pra
  // isso ser instantâneo (mesmo padrão já usado no layout do módulo, que
  // soma status pra virar KPI).
  //
  // Escopo (mesma decisão de sempre): sem `company_id`/multi-tenant ainda —
  // os totais somam TODOS os itens ativos do sistema, não por empresa.
  const { data: itensRaw, error } = await supabase
    .from("itens_inventario")
    .select("id, categoria_id, status, valor_pago, valor_atual, categorias_inventario(nome)")
    .overrideTypes<ItemComCategoriaNome[], { merge: false }>();

  if (error) {
    return <p className="text-sm text-danger">Erro ao carregar o dashboard: {error.message}</p>;
  }

  const itens = itensRaw ?? [];
  const ativos = itens.filter((i) => i.status === "ativo");
  const comDados = ativos.filter((i) => i.valor_pago != null && i.valor_atual != null);
  const itensExcluidos = ativos.length - comDados.length;

  const totalInvestido = comDados.reduce((soma, i) => soma + (i.valor_pago ?? 0), 0);
  const patrimonioAtual = comDados.reduce((soma, i) => soma + (i.valor_atual ?? 0), 0);
  const depreciacaoTotal = totalInvestido - patrimonioAtual;
  const percentualMedio = totalInvestido !== 0 ? depreciacaoTotal / totalInvestido : 0;

  const somaPorCategoria = new Map<string, { nome: string; valor: number }>();
  for (const item of comDados) {
    const nome = item.categorias_inventario?.nome ?? "Sem categoria";
    const atual = somaPorCategoria.get(item.categoria_id);
    if (atual) atual.valor += item.valor_atual ?? 0;
    else somaPorCategoria.set(item.categoria_id, { nome, valor: item.valor_atual ?? 0 });
  }

  const distribuicao: DistribuicaoCategoria[] = Array.from(somaPorCategoria.entries())
    .map(([categoriaId, { nome, valor }]) => ({ categoriaId, categoriaNome: nome, valorAtual: valor }))
    .sort((a, b) => b.valorAtual - a.valorAtual);

  return (
    <DashboardPatrimonio
      totalInvestido={totalInvestido}
      patrimonioAtual={patrimonioAtual}
      depreciacaoTotal={depreciacaoTotal}
      percentualMedio={percentualMedio}
      itensConsiderados={comDados.length}
      itensExcluidos={itensExcluidos}
      distribuicao={distribuicao}
    />
  );
}
