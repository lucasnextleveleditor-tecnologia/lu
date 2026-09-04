import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Nome genérico usado enquanto ninguém personalizou nada em Aparência (mesmo default de `companies.nome_app`, ver `supabase/companies-nome-app.sql`) — nunca o nome de uma empresa específica. */
export const NOME_APP_PADRAO = "App Gestão";

/**
 * Lê `companies.nome_app` da empresa de quem está logado — usado pela
 * sidebar do admin (`AdminShell`) e pelo header do portal do cliente
 * (`dashboard/layout.tsx`). `cache()` do React dedupe dentro do mesmo
 * request, igual `getBrandingConfig`.
 *
 * RLS (`companies_select_own`, ver `multitenant-migration.sql`) já restringe
 * a UMA linha só — a própria empresa de quem chama — então não precisa
 * filtrar por id: qualquer admin/funcionário/cliente autenticado só enxerga
 * a própria empresa aqui, nunca a de outra.
 *
 * Nunca lança: super_admin não tem `company_id` (RLS não devolve nenhuma
 * linha pra ele — não que ele chame isso, mas por segurança); coluna ainda
 * não existente (SQL não rodado) ou qualquer outra falha também caem no
 * nome genérico — branding ausente não pode derrubar o app nem, pior,
 * vazar um nome de empresa que não devia aparecer.
 */
export const getNomeApp = cache(async (): Promise<string> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("companies").select("nome_app").maybeSingle<{ nome_app: string | null }>();
    return data?.nome_app?.trim() || NOME_APP_PADRAO;
  } catch {
    return NOME_APP_PADRAO;
  }
});
