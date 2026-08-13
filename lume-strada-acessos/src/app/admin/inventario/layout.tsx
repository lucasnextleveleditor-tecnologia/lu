import { createClient } from "@/lib/supabase/server";
import type { StatusItemInventario } from "@/lib/types/database";
import { InventarioNav } from "@/components/admin/inventario/InventarioNav";
import { StatTile } from "@/components/ui/StatTile";
import { IconLayers, IconTag, IconAlertTriangle, IconPauseCircle } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function InventarioLayout({ children }: { children: React.ReactNode }) {
  // KPIs do topo, compartilhados pelas duas abas (Categorias / Itens &
  // Etiquetas) — busca mínima (só `status`) só pra contar, sem duplicar a
  // query completa que cada aba já faz pra sua própria tabela.
  const supabase = await createClient();

  const { count: totalCategorias } = await supabase.from("categorias_inventario").select("*", { count: "exact", head: true });

  const { data: itensStatus } = await supabase
    .from("itens_inventario")
    .select("status")
    .overrideTypes<Pick<{ status: StatusItemInventario }, "status">[], { merge: false }>();

  const totalItens = itensStatus?.length ?? 0;
  const emManutencao = itensStatus?.filter((i) => i.status === "manutencao").length ?? 0;
  const baixados = itensStatus?.filter((i) => i.status === "baixado").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Inventário & Patrimônio</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Categorias de bens e etiquetas do patrimônio da agência.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={IconLayers} label="Categorias" value={totalCategorias ?? 0} hint="Grupos de bens cadastrados" />
        <StatTile icon={IconTag} label="Itens no Total" value={totalItens} hint="Etiquetas ativas no sistema" />
        <StatTile icon={IconAlertTriangle} label="Em Manutenção" value={emManutencao} tone="warning" hint="Fora de uso temporariamente" />
        <StatTile icon={IconPauseCircle} label="Baixados" value={baixados} tone="critical" hint="Descartados/fora de operação" />
      </div>

      <InventarioNav />
      {children}
    </div>
  );
}
