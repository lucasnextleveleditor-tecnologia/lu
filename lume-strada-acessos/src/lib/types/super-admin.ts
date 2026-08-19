export type StatusEmpresa = "ativo" | "suspenso";

/** Uma licença/empresa compradora do SaaS — ver `supabase/multitenant-migration.sql`. */
export interface CompanyRow {
  id: string; // uuid
  nome: string;
  status: StatusEmpresa;
  expires_at: string | null; // ISO timestamp — null = sem expiração definida
  created_by: string | null; // uuid -> profiles.id (qual super_admin cadastrou)
  created_at: string;
  updated_at: string;
}
