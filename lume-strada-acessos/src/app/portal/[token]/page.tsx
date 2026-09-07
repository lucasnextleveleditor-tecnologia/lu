import { ClientePortalView } from "@/components/cliente/ClientePortalView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarPortalPorToken } from "@/app/portal/data";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

/**
 * Portal do Cliente (Fase 4) — SEM LOGIN, acessado só de posse do
 * `portal_token` na URL (mesmo modelo de segurança de `/orcamento/[token]` e
 * `/contrato/[token]`, ver aviso em `app/portal/data.ts`). Um único link fixo
 * por cliente que agrega todos os orçamentos, contratos, portfólio e
 * histórico dele — nunca muda nada no banco, é só leitura.
 */
export default async function PortalClientePage({ params }: PageProps) {
  const { token } = await params;
  const { dict } = await getDictionary();
  const data = await buscarPortalPorToken(token);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="fixed right-4 top-4 z-30">
          <ThemeToggle />
        </div>
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-ink-primary">{dict.portal.linkInvalidoTitulo}</p>
          <p className="mt-2 text-sm text-ink-muted">{dict.portal.linkInvalidoDescricao}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6">
      <div className="fixed right-4 top-4 z-30">
        <ThemeToggle />
      </div>
      <ClientePortalView data={data} dict={dict} />
    </div>
  );
}
