import Link from "next/link";
import { requireEquipeOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { listarMapas } from "./data";
import { NovoMapaBotao } from "@/components/admin/mapas/NovoMapaBotao";
import { IconSitemap, IconChevronRight, IconGlobe } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function MapasPage() {
  await requireEquipeOuRedirect();
  const { dict, locale } = await getDictionary();
  const t = dict.mapaMental;
  const mapas = await listarMapas();

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

      {mapas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-700 p-12 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-base-800">
            <IconSitemap className="h-5 w-5 text-ink-muted" />
          </span>
          <p className="text-sm font-medium text-ink-primary">{t.semMapasTitulo}</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">{t.semMapasDescricao}</p>
        </div>
      ) : (
        <ul className="divide-y divide-base-800 overflow-hidden rounded-2xl border border-base-700 bg-base-900/60">
          {mapas.map((m) => (
            <li key={m.id}>
              <Link href={`/admin/mapas/${m.id}`} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-base-800/50">
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
                <IconChevronRight className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:text-ink-secondary" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
