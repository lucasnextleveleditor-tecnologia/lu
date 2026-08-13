import Link from "next/link";
import { addDaysISO, fmtDataExtensa, todayISO } from "@/lib/utils/format";

/** Navegação de dia — pura navegação por link (?data=yyyy-mm-dd), sem JS no cliente. */
export function DateNav({ data }: { data: string }) {
  const anterior = addDaysISO(data, -1);
  const proximo = addDaysISO(data, 1);
  const isHoje = data === todayISO();

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/trafego?data=${anterior}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
        aria-label="Dia anterior"
      >
        ‹
      </Link>
      <div className="w-56 text-center">
        <p className="text-sm font-medium">{fmtDataExtensa(data)}</p>
        {!isHoje && (
          <Link href={`/admin/trafego`} className="text-xs text-accent hover:underline">
            Voltar para hoje
          </Link>
        )}
      </div>
      <Link
        href={`/admin/trafego?data=${proximo}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
        aria-label="Próximo dia"
      >
        ›
      </Link>
    </div>
  );
}
