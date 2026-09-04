import { DashboardNav } from "@/components/admin/dashboard/DashboardNav";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { dict } = await getDictionary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{dict.dashboard.tituloPagina}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{dict.dashboard.subtituloPagina}</p>
      </div>

      <DashboardNav />
      {children}
    </div>
  );
}
