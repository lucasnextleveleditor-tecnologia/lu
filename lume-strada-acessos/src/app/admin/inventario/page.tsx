import { createClient } from "@/lib/supabase/server";
import type { CategoriaInventarioRow } from "@/lib/types/database";
import { CategoriasManager } from "@/components/admin/inventario/CategoriasManager";

export const dynamic = "force-dynamic";

export default async function InventarioCategoriasPage() {
  const supabase = await createClient();

  const { data: categorias, error } = await supabase
    .from("categorias_inventario")
    .select("*")
    .order("nome", { ascending: true })
    .overrideTypes<CategoriaInventarioRow[], { merge: false }>();

  if (error) {
    return <p className="text-sm text-danger">Erro ao carregar categorias: {error.message}</p>;
  }

  // Contagem de itens por categoria — só pra mostrar na tabela; busca
  // mínima (só a coluna de FK) pra não pesar a query.
  const { data: itensCategoriaIds } = await supabase
    .from("itens_inventario")
    .select("categoria_id")
    .overrideTypes<{ categoria_id: string }[], { merge: false }>();

  const totalItensPorCategoria: Record<string, number> = {};
  (itensCategoriaIds ?? []).forEach((item) => {
    totalItensPorCategoria[item.categoria_id] = (totalItensPorCategoria[item.categoria_id] ?? 0) + 1;
  });

  return <CategoriasManager categorias={categorias ?? []} totalItensPorCategoria={totalItensPorCategoria} />;
}
