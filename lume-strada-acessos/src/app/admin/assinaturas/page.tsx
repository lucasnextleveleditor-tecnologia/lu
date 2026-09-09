import Link from "next/link";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { listarDocumentos } from "./data";
import { NovoDocumentoBotao } from "@/components/admin/assinaturas/NovoDocumentoBotao";
import { IconFileText, IconChevronRight, IconDownload } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

const ROTULO_STATUS: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Aguardando assinaturas",
  assinado: "Assinado",
  cancelado: "Cancelado",
};

export default async function AssinaturasPage() {
  await requireModuloOuRedirect("orcamentos");
  const documentos = await listarDocumentos();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Assinatura de PDF</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Suba um contrato pronto, marque onde cada pessoa assina e mande por link.
          </p>
        </div>
        <NovoDocumentoBotao />
      </div>

      {documentos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-700 p-12 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-base-800">
            <IconFileText className="h-5 w-5 text-ink-muted" />
          </span>
          <p className="text-sm font-medium text-ink-primary">Nenhum documento ainda</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">
            Envie o primeiro PDF para marcar os campos de assinatura sobre as páginas.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-base-800 overflow-hidden rounded-2xl border border-base-700 bg-base-900/60">
          {documentos.map((d) => (
            // O atalho de download fica FORA do `Link` de propósito: âncora
            // dentro de âncora não é HTML válido, e o navegador desmonta a
            // marcação sozinho quando encontra uma.
            <li key={d.id} className="flex items-center transition hover:bg-base-800/50">
              <Link href={`/admin/assinaturas/${d.id}`} className="group flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-primary">{d.titulo || d.arquivo_nome}</p>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">
                    {ROTULO_STATUS[d.status] ?? d.status} · {d.assinados} de {d.total_signatarios} assinaram ·{" "}
                    {d.paginas} {d.paginas === 1 ? "página" : "páginas"}
                  </p>
                </div>
                <IconChevronRight className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:text-ink-secondary" />
              </Link>
              {d.status === "assinado" && d.arquivo_assinado_path && (
                <a
                  href={`/api/assinaturas/${d.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Baixar PDF assinado"
                  className="mr-4 shrink-0 rounded-lg border border-base-700 p-2 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
                >
                  <IconDownload className="h-3.5 w-3.5" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
