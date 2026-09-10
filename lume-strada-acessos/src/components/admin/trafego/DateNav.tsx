"use client";

import Link from "next/link";
import { addDaysISO, fmtDataExtensa, todayISO } from "@/lib/utils/format";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Navegação de dia — pura navegação por link (?data=yyyy-mm-dd), sem JS no
 * cliente. O `?fluxo=` viaja junto: sem ele, avançar um dia devolveria a
 * pessoa para a tela de escolha, como se ela nunca tivesse escolhido.
 */
export function DateNav({ data, fluxo = "leads" }: { data: string; fluxo?: string }) {
  const { dict } = useLocale();
  const anterior = addDaysISO(data, -1);
  const proximo = addDaysISO(data, 1);
  const isHoje = data === todayISO();

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/trafego?fluxo=${fluxo}&data=${anterior}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
        aria-label={dict.trafego.diaAnterior}
      >
        ‹
      </Link>
      <div className="w-56 text-center">
        <p className="text-sm font-medium">{fmtDataExtensa(data)}</p>
        {!isHoje && (
          <Link href={`/admin/trafego?fluxo=${fluxo}`} className="text-xs text-accent hover:underline">
            {dict.trafego.voltarParaHoje}
          </Link>
        )}
      </div>
      <Link
        href={`/admin/trafego?fluxo=${fluxo}&data=${proximo}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
        aria-label={dict.trafego.proximoDia}
      >
        ›
      </Link>
    </div>
  );
}
