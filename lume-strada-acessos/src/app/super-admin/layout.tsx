import { requireSuperAdminOuRedirect } from "@/lib/auth/requireAdmin";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { IconBuilding } from "@/components/ui/icons";

/**
 * Shell PROPOSITALMENTE mais simples que `AdminShell` (usado em `/admin`):
 * sem sidebar de módulos, sem branding customizado, sem i18n — este painel
 * é visto por UMA pessoa só (o dono do SaaS), então não precisa da mesma
 * infraestrutura construída pra dezenas de agências/clientes diferentes
 * usando o painel operacional. `requireSuperAdminOuRedirect` é a SEGUNDA
 * camada de proteção (a primeira é o middleware, ver `src/middleware.ts`) —
 * mesma dupla-checagem que `AdminLayout` faz pra `/admin`.
 */
export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdminOuRedirect();

  return (
    <div className="min-h-screen bg-base-950 text-ink-primary">
      <header className="border-b border-base-800 bg-base-900/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
              <IconBuilding className="h-5 w-5 text-base-950" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Super Admin</p>
              <p className="text-xs leading-tight text-ink-muted">Gestão de licenças do SaaS</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
