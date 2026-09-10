import Link from "next/link";
import { requireEquipeOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { GeradorLinkWhatsapp } from "@/components/admin/ferramentas/GeradorLinkWhatsapp";
import { IconMessageCircle, IconChevronLeft } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

/**
 * Gerador de link do WhatsApp.
 *
 * Não tem action, não tem tabela, não guarda nada: o link é montado no
 * navegador a partir do que está nos campos (ver
 * `src/lib/ferramentas/whatsapp.ts`). É a ferramenta mais simples da casa, e
 * é exatamente por isso que ela vale — hoje se resolve isso num site
 * aleatório de terceiro, colando o número do cliente numa página que ninguém
 * sabe quem mantém.
 *
 * `chave: null` como o Mapa Mental: é de quem trabalha na empresa, não de um
 * módulo específico.
 */
export default async function LinkWhatsappPage() {
  await requireEquipeOuRedirect();
  const { dict } = await getDictionary();
  const t = dict.ferramentas;
  const w = t.linkWhatsapp;

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
          <IconMessageCircle className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.linkWhatsappTitulo}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{w.subtitulo}</p>
        </div>
      </div>

      <GeradorLinkWhatsapp />

      <div className="mt-8 rounded-2xl border border-base-700 bg-base-900/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{w.comoUsarTitulo}</p>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-secondary">
          <li>{w.comoUsar1}</li>
          <li>{w.comoUsar2}</li>
          <li>{w.comoUsar3}</li>
        </ul>
      </div>
    </div>
  );
}
