import Link from "next/link";
import { requireEquipeOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { listarMapas } from "./data";
import { NovoMapaBotao } from "@/components/admin/mapas/NovoMapaBotao";
import { AcoesDoMapa } from "@/components/admin/mapas/AcoesDoMapa";
import { IconSitemap, IconGlobe, IconBox } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function MapasPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  await requireEquipeOuRedirect();
  const { dict, locale } = await getDictionary();
  const t = dict.mapaMental;
  const { aba } = await searchParams;
  const vendoArquivados = aba === "arquivados";
  const mapas = await listarMapas(vendoArquivados);

  const mapaLocale: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };
  const contar = (n: number) => (n === 1 ? t.contagemBaloes.um : t.contagemBaloes.muitos.replace("{n}", String(n)));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.tituloPagina}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{t.subtituloPagina}</p>
        </div>
        <NovoMapaBotao rotulo={t.novoMapa} />
      </div>

      {/* Duas abas, e não um filtro escondido num menu: arquivar só é útil se
          for igualmente fácil achar o que foi arquivado. */}
      <div className="mb-4 flex items-center gap-1 border-b border-base-800">
        {[
          { chave: "", rotulo: t.ativos },
          { chave: "arquivados", rotulo: t.arquivados },
        ].map((item) => {
          const ativa = (item.chave === "arquivados") === vendoArquivados;
          return (
            <Link
              key={item.chave || "ativos"}
              href={item.chave ? `/admin/mapas?aba=${item.chave}` : "/admin/mapas"}
              className={
                ativa
                  ? "-mb-px border-b-2 border-accent px-3 py-2 text-xs font-medium text-ink-primary"
                  : "-mb-px border-b-2 border-transparent px-3 py-2 text-xs text-ink-muted transition hover:text-ink-secondary"
              }
            >
              {item.rotulo}
            </Link>
          );
        })}
      </div>

      {mapas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-700 p-12 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-base-800">
            {vendoArquivados ? <IconBox className="h-5 w-5 text-ink-muted" /> : <IconSitemap className="h-5 w-5 text-ink-muted" />}
          </span>
          <p className="text-sm font-medium text-ink-primary">{vendoArquivados ? t.semArquivadosTitulo : t.semMapasTitulo}</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">
            {vendoArquivados ? t.semArquivadosDescricao : t.semMapasDescricao}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-base-800 overflow-hidden rounded-2xl border border-base-700 bg-base-900/60">
          {mapas.map((m) => (
            <li key={m.id} className="flex items-center transition hover:bg-base-800/50">
              <Link href={`/admin/mapas/${m.id}`} className="group flex min-w-0 flex-1 items-center gap-4 px-5 py-4 pr-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-medium text-ink-primary">
                    {m.titulo || t.semTitulo}
                    {/* O globo só aparece em mapa compartilhado: numa lista de
                        vinte, é o que precisa saltar aos olhos. */}
                    {m.acesso_publico !== "privado" && <IconGlobe className="h-3.5 w-3.5 shrink-0 text-accent" />}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">{contar(m.total_nos)}</p>
                </div>
                <p className="shrink-0 text-xs tabular-nums text-ink-secondary">
                  {new Date(m.atualizado_em).toLocaleDateString(mapaLocale[locale] ?? "pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </Link>
              {/* Fora do <Link> de proposito: botao dentro de ancora e HTML
                  invalido, e o clique em "excluir" acabaria abrindo o mapa. */}
              <div className="pr-4">
                <AcoesDoMapa mapaId={m.id} arquivado={m.arquivado} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
