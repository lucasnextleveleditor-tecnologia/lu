import { createClient } from "@/lib/supabase/server";
import type { CategoriaInventarioRow, ItemInventarioComCategoria, ItemInventarioRow } from "@/lib/types/database";
import { ItensManager } from "@/components/admin/inventario/ItensManager";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";

type ItemComRelacao = ItemInventarioRow & { categorias_inventario: { nome: string } | null };

export default async function InventarioItensPage() {
  const supabase = await createClient();
  const { dict } = await getDictionary();

  const { data: categorias, error: erroCategorias } = await supabase
    .from("categorias_inventario")
    .select("*")
    .order("nome", { ascending: true })
    .overrideTypes<CategoriaInventarioRow[], { merge: false }>();

  if (erroCategorias) {
    return (
      <p className="text-sm text-danger">
        {dict.inventario.erroCarregarCategorias}
        {erroCategorias.message}
      </p>
    );
  }

  // Join com a categoria já resolvido na própria query (evita cruzar
  // tabelas em tela — o card/linha só lê `categoria_nome` pronto).
  const { data: itensRaw, error: erroItens } = await supabase
    .from("itens_inventario")
    .select("*, categorias_inventario(nome)")
    .order("created_at", { ascending: false })
    .overrideTypes<ItemComRelacao[], { merge: false }>();

  if (erroItens) {
    return (
      <p className="text-sm text-danger">
        {dict.inventario.erroCarregarItens}
        {erroItens.message}
      </p>
    );
  }

  const itens: ItemInventarioComCategoria[] = (itensRaw ?? []).map(({ categorias_inventario, ...item }) => ({
    ...item,
    categoria_nome: categorias_inventario?.nome ?? dict.common.semCategoria,
  }));

  return <ItensManager itens={itens} categorias={categorias ?? []} />;
}
