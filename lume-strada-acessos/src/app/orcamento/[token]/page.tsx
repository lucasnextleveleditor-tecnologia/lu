import { OrcamentoPublicoView } from "@/components/cliente/OrcamentoPublicoView";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarOrcamentoPublicoPorToken } from "@/app/orcamento/data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

/**
 * Página pública do orçamento — SEM LOGIN, acessada só de posse do token na
 * URL (ver aviso de segurança em `app/orcamento/data.ts`). Renderizada fora
 * de `/admin`, então não herda a sidebar nem passa por `requireModulo` — só
 * o layout raiz (`app/layout.tsx`) por causa do `LocaleProvider`.
 */
export default async function OrcamentoPublicoPage({ params }: PageProps) {
  const { token } = await params;
  const { dict } = await getDictionary();
  const orcamento = await buscarOrcamentoPublicoPorToken(token);

  if (!orcamento) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-ink-primary">{dict.orcamentos.linkInvalidoTitulo}</p>
          <p className="mt-2 text-sm text-ink-muted">{dict.orcamentos.linkInvalidoDescricao}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6">
      <OrcamentoPublicoView orcamento={orcamento} token={token} />
    </div>
  );
}
