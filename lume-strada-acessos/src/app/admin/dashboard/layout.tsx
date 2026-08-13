import { DashboardNav } from "@/components/admin/dashboard/DashboardNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Visão geral da agência e agenda de captações e entregas.</p>
      </div>

      <DashboardNav />
      {children}
    </div>
  );
}
