import Link from "next/link";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { listarOrdensDoDia } from "./data";
import { NovaOrdemBotao } from "@/components/admin/producao/ordem-do-dia/NovaOrdemBotao";
import { AcoesDaOrdem } from "@/components/admin/producao/ordem-do-dia/AcoesDaOrdem";
import { IconCalendar, IconBox, IconGlobe } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function OrdemDoDiaListaPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  await requireModuloOuRedirect("producao");
  const { dict, locale } = await getDictionary();
  const t = dict.ordemDoDia;
  const { aba } = await searchParams;
  const vendoArquivadas = aba === "arquivadas";
  const ordens = await listarOrdensDoDia(vendoArquivadas);

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

      {/* Duas abas, não um filtro escondido: arquivar só é útil se for
          igualmente fácil achar o que foi arquivado. */}
      <div className="mb-4 flex items-center gap-1 border-b border-base-800">
        {[
          { chave: "", rotulo: t.ativas },
          { chave: "arquivadas", rotulo: t.arquivadas },
        ].map((item) => {
          const ativa = (item.chave === "arquivadas") === vendoArquivadas;
          return (
            <Link
              key={item.chave || "ativas"}
              href={item.chave ? `/admin/producao/ordem-do-dia?aba=${item.chave}` : "/admin/producao/ordem-do-dia"}
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

      {ordens.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-700 p-12 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-base-800">
            {vendoArquivadas ? <IconBox className="h-5 w-5 text-ink-muted" /> : <IconCalendar className="h-5 w-5 text-ink-muted" />}
          </span>
          <p className="text-sm font-medium text-ink-primary">
            {vendoArquivadas ? t.semArquivadasTitulo : t.semOrdensTitulo}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">
            {vendoArquivadas ? t.semArquivadasDescricao : t.semOrdensDescricao}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-base-800 overflow-hidden rounded-2xl border border-base-700 bg-base-900/60">
          {ordens.map((o) => (
            <li key={o.id} className="relative">
              <Link
                href={`/admin/producao/ordem-do-dia/${o.id}`}
                className="group flex items-center gap-4 px-5 py-4 pr-3 transition hover:bg-base-800/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-medium text-ink-primary">
                    {o.projeto || t.semProjeto}
                    {/* O globo só aparece com o link ligado: numa lista longa,
                        é o que precisa saltar aos olhos. */}
                    {o.compartilhado && <IconGlobe className="h-3.5 w-3.5 shrink-0 text-accent" />}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 truncate text-xs text-ink-muted">
                    {/* O tipo de dia vem primeiro e colorido: numa lista de
                        vinte folhas, "Ensaio fotográfico" identifica o
                        trabalho mais rápido que o nome do cliente. */}
                    {o.tipo && <span className="font-medium text-accent">{o.tipo}</span>}
                    {o.tipo && <span aria-hidden>·</span>}
                    <span>{o.cliente_nome ?? t.semCliente}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {t.diaria} {o.diaria_numero} {t.de} {o.diaria_total}
                    </span>
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
                <AcoesDaOrdem ordemId={o.id} arquivado={o.arquivado} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
