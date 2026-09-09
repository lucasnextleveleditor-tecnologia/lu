import { getDictionary } from "@/lib/i18n/getDictionary";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { buscarMapaPublicoPorToken } from "@/app/mapa/data";
import { MapaPublicoView } from "@/components/admin/mapas/MapaPublicoView";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const dynamic = "force-dynamic";

/**
 * Página pública do mapa — SEM LOGIN, acessada só de posse do token na URL
 * (mesmo desenho de `app/contrato/[token]`). Fora de `/admin`, não herda a
 * sidebar nem passa por nenhum guard de permissão: o token é a autorização,
 * e o nível de acesso vem do próprio mapa.
 */
export default async function MapaPublicoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [{ dict }, nomeApp, dados] = await Promise.all([
    getDictionary(),
    getNomeApp(),
    buscarMapaPublicoPorToken((await params).token ?? token),
  ]);
  const t = dict.mapaMental;

  if (!dados) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="fixed right-4 top-4 z-30">
          <ThemeToggle />
        </div>
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-ink-primary">{t.linkInvalidoTitulo}</p>
          <p className="mt-2 text-sm text-ink-muted">{t.linkInvalidoDescricao}</p>
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
        <MapaPublicoView dados={dados} token={token} acesso={dados.acesso} nomeApp={nomeApp} />
      </div>
    </div>
  );
}
