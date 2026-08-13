import { InventarioNav } from "@/components/admin/inventario/InventarioNav";

export default function InventarioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Inventário & Patrimônio</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Categorias de bens e etiquetas do patrimônio da agência.</p>
      </div>
      <InventarioNav />
      {children}
    </div>
  );
}
