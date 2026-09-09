import { createClient } from "@/lib/supabase/server";
import { buscarPerfilComPermissoes } from "@/lib/auth/requireAdmin";
import { CabecalhoDashboard } from "@/components/admin/dashboard/CabecalhoDashboard";
import { DashboardNav } from "@/components/admin/dashboard/DashboardNav";

export const dynamic = "force-dynamic";

/**
 * O cabeçalho vive no layout (e não na página) porque o Dashboard tem
 * sub-rotas — Visão Geral e Calendário — e as duas compartilham a mesma
 * saudação e o mesmo título. Repetir isso em cada página só criaria duas
 * cópias para desencontrar.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const perfil = user ? await buscarPerfilComPermissoes(supabase, user.id) : null;

  return (
    <div className="space-y-7">
      <CabecalhoDashboard nomeCompleto={perfil?.full_name ?? null} />
      <DashboardNav />
      {children}
    </div>
  );
}
