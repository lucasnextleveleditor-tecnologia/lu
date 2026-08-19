export type StatusEmpresa = "ativo" | "suspenso";

/** Uma licença/empresa compradora do SaaS — ver `supabase/multitenant-migration.sql`. */
export interface CompanyRow {
  id: string; // uuid
  nome: string; // nome da LICENÇA — só o super-admin vê/edita (lista de Empresas em `/super-admin`)
  /**
   * Nome exibido pro time/clientes DENTRO do app (sidebar do admin, header
   * do cliente) — ver `supabase/companies-nome-app.sql`. Independente de
   * `nome`: o admin da empresa compradora edita isso em Aparência, sem
   * tocar no registro da licença. Default "App Gestão".
   */
  nome_app: string;
  status: StatusEmpresa;
  expires_at: string | null; // ISO timestamp — null = sem expiração definida
  created_by: string | null; // uuid -> profiles.id (qual super_admin cadastrou)
  created_at: string;
  updated_at: string;
}

/**
 * Um login (`profiles`) dentro de uma empresa, na visão do Super Admin —
 * usado pelo modal "Acessos" da lista de Empresas licenciadas
 * (`AcessosEmpresaModal`), pra ele ver/editar/excluir qualquer login de
 * qualquer empresa, independente de papel (admin/funcionário/cliente).
 */
export interface AcessoEmpresaRow {
  id: string; // uuid -> auth.users.id / profiles.id
  email: string;
  full_name: string | null;
  role: "admin" | "funcionario" | "cliente"; // super_admin nunca aparece aqui — nunca tem company_id
  active: boolean;
  senha_provisoria: boolean;
  created_at: string;
}
