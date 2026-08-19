import { createClient } from "@/lib/supabase/server";
import type { CompanyRow } from "@/lib/types/super-admin";
import { CompaniesManager } from "@/components/super-admin/CompaniesManager";

export default async function SuperAdminPage() {
  const supabase = await createClient();

  // RLS de `companies` (`companies_super_admin_all`, ver
  // `supabase/multitenant-migration.sql`) já garante que só quem é
  // `super_admin` enxerga TODAS as linhas — pra qualquer outro papel essa
  // query voltaria vazia mesmo sem o guard de `layout.tsx`.
  const { data: companies } = await supabase
    .from("companies")
    .select("id, nome, status, expires_at, created_by, created_at, updated_at")
    .order("created_at", { ascending: false })
    .overrideTypes<CompanyRow[], { merge: false }>();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Empresas licenciadas</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Cadastre cada empresa que comprar o acesso, gere o login do dono dela e controle status/expiração da licença.
        </p>
      </div>
      <CompaniesManager companies={companies ?? []} />
    </div>
  );
}
