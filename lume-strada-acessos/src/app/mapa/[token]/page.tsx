import Link from "next/link";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { buscarMapaPorToken } from "@/app/mapa/data";
import { MapaPublicoView } from "@/components/admin/mapas/MapaPublicoView";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IconLock } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

/**
 * O mapa aberto pelo link.
 *
 * Fora de `/admin`, sem sidebar — mas NÃO é uma página anônima: quem abre
 * precisa estar logado e ter cadastro na mesma agência dona do mapa (ver
 * `app/mapa/acesso.ts`). O `middleware` já manda quem não tem sessão para o
 * login com `redirectTo`; as duas telas abaixo cobrem os casos que sobram —
 * link desligado e conta de fora da agência.
 */
export default async function MapaPorLinkPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [{ dict }, nomeApp, resultado] = await Promise.all([getDictionary(), getNomeApp(), buscarMapaPorToken(token)]);
  const t = dict.mapaMental;

  if (resultado.estado !== "ok") {
    const semAcesso = resultado.estado === "sem-acesso";
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="fixed right-4 top-4 z-30">
          <ThemeToggle />
        </div>
        <div className="max-w-sm text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-base-800">
            <IconLock className="h-5 w-5 text-ink-muted" />
          </span>
          <p className="text-lg font-semibold text-ink-primary">
            {semAcesso ? t.semAcessoTitulo : t.linkInvalidoTitulo}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            {semAcesso ? t.semAcessoDescricao : t.linkInvalidoDescricao}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center rounded-lg border border-base-600 px-3 py-2 text-xs text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
          >
            {t.irParaInicio}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col px-4 py-5 sm:px-6">
      <div className="fixed right-4 top-4 z-30">
        <ThemeToggle />
      </div>
      <div className="min-h-0 flex-1">
        <MapaPublicoView
          dados={resultado.dados}
          token={token}
          acesso={resultado.acesso}
          nomeApp={nomeApp}
          meuNome={resultado.nome}
        />
      </div>
    </div>
  );
}
