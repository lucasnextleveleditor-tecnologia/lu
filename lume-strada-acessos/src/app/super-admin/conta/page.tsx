import { requireSuperAdminOuRedirect } from "@/lib/auth/requireAdmin";
import type { ProfileRow } from "@/lib/types/database";
import { ContaSuperAdminForm } from "@/components/super-admin/ContaSuperAdminForm";

export const dynamic = "force-dynamic";

/**
 * Conta do dono do SaaS.
 *
 * Existe porque `/admin/configuracoes?aba=conta` — onde todo mundo troca a
 * própria senha — é inalcançável para o `super_admin`: o middleware devolve
 * quem não é admin/funcionário para a própria home. Sem esta tela, a única
 * pessoa sem como trocar a senha dentro do sistema era justamente a que tem
 * mais poder nele.
 */
export default async function ContaSuperAdminPage() {
  const { supabase, user } = await requireSuperAdminOuRedirect();

  const { data: perfil } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "full_name" | "email">, { merge: false }>();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Minha Conta</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Seus dados de acesso ao painel do SaaS. Esta é a conta com mais poder no sistema — use uma senha longa e que você não
          use em nenhum outro lugar.
        </p>
      </div>
      <ContaSuperAdminForm nomeInicial={perfil?.full_name ?? ""} email={perfil?.email ?? user.email ?? ""} />
    </div>
  );
}
