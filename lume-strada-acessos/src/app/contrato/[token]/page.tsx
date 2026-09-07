import { ContratoPublicoView } from "@/components/cliente/ContratoPublicoView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarContratoPublicoPorToken } from "@/app/contrato/data";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

/**
 * Página pública do contrato — SEM LOGIN, acessada só de posse do token na
 * URL (mesmo aviso de segurança de `app/orcamento/[token]/page.tsx`). Fora
 * de `/admin`, não herda a sidebar nem passa por `requireModulo`.
 */
export default async function ContratoPublicoPage({ params }: PageProps) {
  const { token } = await params;
  const { dict } = await getDictionary();
  const contrato = await buscarContratoPublicoPorToken(token);

  if (!contrato) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="fixed right-4 top-4 z-30">
          <ThemeToggle />
        </div>
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-ink-primary">{dict.orcamentos.linkInvalidoTitulo}</p>
          <p className="mt-2 text-sm text-ink-muted">{dict.contratos.linkInvalidoDescricao}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6">
      <div className="fixed right-4 top-4 z-30">
        <ThemeToggle />
      </div>
      <ContratoPublicoView contrato={contrato} token={token} />
    </div>
  );
}
