import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { StatusItemInventario } from "@/lib/types/database";
import { InventarioNav } from "@/components/admin/inventario/InventarioNav";
import { StatTile } from "@/components/ui/StatTile";
import { IconLayers, IconTag, IconAlertTriangle, IconPauseCircle } from "@/components/ui/icons";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";

export default async function InventarioLayout({ children }: { children: React.ReactNode }) {
  // KPIs do topo, compartilhados pelas duas abas (Categorias / Itens &
  // Etiquetas) — busca mínima (só `status`) só pra contar, sem duplicar a
  // query completa que cada aba já faz pra sua própria tabela.
  const { supabase } = await requireModuloOuRedirect("inventario");
  const { dict } = await getDictionary();

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
        <h1 className="text-lg font-semibold tracking-tight">{dict.inventario.titulo}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{dict.inventario.subtitulo}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={IconLayers} label={dict.inventario.statCategorias} value={totalCategorias ?? 0} hint={dict.inventario.statCategoriasHint} />
        <StatTile icon={IconTag} label={dict.inventario.statItensTotal} value={totalItens} hint={dict.inventario.statItensTotalHint} />
        <StatTile
          icon={IconAlertTriangle}
          label={dict.inventario.statEmManutencao}
          value={emManutencao}
          tone="warning"
          hint={dict.inventario.statEmManutencaoHint}
        />
        <StatTile
          icon={IconPauseCircle}
          label={dict.inventario.statBaixados}
          value={baixados}
          tone="critical"
          hint={dict.inventario.statBaixadosHint}
        />
      </div>

      <InventarioNav />
      {children}
    </div>
  );
}
