import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_BRANDING } from "@/lib/branding/constants";
import type { BrandingConfigRow } from "@/lib/types/database";
import { TelaLoginForm } from "@/components/super-admin/TelaLoginForm";

export const dynamic = "force-dynamic";

/**
 * Tela de Login pública — editada aqui, e só aqui.
 *
 * O login é renderizado antes de qualquer autenticação, então o sistema não
 * sabe de qual empresa é quem chegou: ele sempre mostra a marca da empresa
 * dona do SaaS (policy `branding_config_select_publico`, ver
 * `supabase/branding-por-empresa.sql`). É UMA tela para todas as agências —
 * se cada uma pudesse editá-la, a última a salvar sobrescreveria as outras.
 * Por isso saiu de `/admin/configuracoes?aba=aparencia` e veio para cá.
 *
 * Service Role na leitura pelo mesmo motivo das ações: `super_admin` não tem
 * `company_id`, então o RLS de `branding_config` não devolveria linha nenhuma
 * para ele. A empresa alvo é resolvida no servidor por
 * `saas_owner_company_id()`, nunca vem do cliente.
 */
export default async function TelaLoginPage() {
  const admin = createAdminClient();

  const { data: companyId } = await admin.rpc("saas_owner_company_id");

  const { data } = await admin
    .from("branding_config")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle<BrandingConfigRow>();

  // Mesmo fallback de `getBrandingConfig`: branding ausente nunca derruba a
  // tela, só volta pro visual padrão.
  const branding = { ...DEFAULT_BRANDING, ...(data ?? {}) };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Tela de Login</h1>
        <p className="mt-1 text-sm text-ink-muted">
          É a porta de entrada de todas as empresas — existe uma só, e ela mostra a sua marca. As agências customizam logo, cores
          e banner por dentro do sistema, cada uma na sua conta, mas esta tela é sua.
        </p>
      </div>
      <TelaLoginForm initialBranding={branding} />
    </div>
  );
}
