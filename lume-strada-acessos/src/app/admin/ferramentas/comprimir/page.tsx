import Link from "next/link";
import { requireEquipeOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { CompressorDeArquivos } from "@/components/admin/ferramentas/CompressorDeArquivos";
import { IconMinimize, IconChevronLeft } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

/**
 * Compressor de arquivos.
 *
 * A página é só a moldura: quem faz o trabalho é o componente de cliente, e
 * ele faz TUDO no navegador de quem está usando (ver
 * `src/lib/ferramentas/comprimir/`). Não há action, não há upload, não há
 * bucket — o arquivo nunca chega ao servidor, o que resolve de uma vez o
 * limite de corpo de requisição da Vercel, o custo de armazenamento e a
 * privacidade de material de cliente que ainda não foi divulgado.
 *
 * `chave: null` como o Mapa Mental: é ferramenta de quem trabalha na
 * empresa, não de um módulo específico — quem entra no painel pode usar.
 */
export default async function ComprimirArquivosPage() {
  await requireEquipeOuRedirect();
  const { dict } = await getDictionary();
  const t = dict.ferramentas;
  const c = t.comprimir;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/ferramentas"
        className="mb-5 inline-flex items-center gap-1 text-xs text-ink-muted transition hover:text-ink-secondary"
      >
        <IconChevronLeft className="h-3.5 w-3.5" />
        {t.voltar}
      </Link>

      <div className="mb-6 flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-base-700 bg-base-900 text-accent">
          <IconMinimize className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.comprimirTitulo}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{c.subtitulo}</p>
        </div>
      </div>

      <CompressorDeArquivos />

      <div className="mt-8 rounded-2xl border border-base-700 bg-base-900/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{c.quandoValeTitulo}</p>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-secondary">
          <li>
            <span className="text-ink-primary">{c.dicaVideoLead}</span> — {c.dicaVideo}
          </li>
          <li>
            <span className="text-ink-primary">{c.dicaPdfEscaneadoLead}</span> — {c.dicaPdfEscaneado}
          </li>
          <li>
            <span className="text-ink-primary">{c.dicaPdfTextoLead}</span> — {c.dicaPdfTexto}
          </li>
          <li>
            <span className="text-ink-primary">{c.dicaImagemLead}</span> — {c.dicaImagem}
          </li>
        </ul>
      </div>
    </div>
  );
}
