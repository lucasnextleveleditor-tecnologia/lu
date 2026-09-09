import Link from "next/link";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { listarOrdensDoDia } from "./data";
import { NovaOrdemBotao } from "@/components/admin/producao/ordem-do-dia/NovaOrdemBotao";
import { IconCalendar, IconChevronRight } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function OrdemDoDiaListaPage() {
  await requireModuloOuRedirect("producao");
  const { dict, locale } = await getDictionary();
  const t = dict.ordemDoDia;
  const ordens = await listarOrdensDoDia();

  const mapaLocale: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.tituloPagina}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{t.subtituloPagina}</p>
        </div>
        <NovaOrdemBotao rotulo={t.novaOrdem} />
      </div>

      {ordens.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-700 p-12 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-base-800">
            <IconCalendar className="h-5 w-5 text-ink-muted" />
          </span>
          <p className="text-sm font-medium text-ink-primary">{t.semOrdensTitulo}</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">{t.semOrdensDescricao}</p>
        </div>
      ) : (
        <ul className="divide-y divide-base-800 overflow-hidden rounded-2xl border border-base-700 bg-base-900/60">
          {ordens.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/producao/ordem-do-dia/${o.id}`} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-base-800/50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-primary">{o.projeto || t.semProjeto}</p>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">
                    {o.cliente_nome ?? t.semCliente} · {t.diaria} {o.diaria_numero} {t.de} {o.diaria_total}
                  </p>
                </div>
                <p className="shrink-0 text-xs tabular-nums text-ink-secondary">
                  {o.data
                    ? new Date(`${o.data}T12:00:00`).toLocaleDateString(mapaLocale[locale] ?? "pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : t.semData}
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
