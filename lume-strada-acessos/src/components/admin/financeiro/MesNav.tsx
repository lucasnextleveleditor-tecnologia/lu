import Link from "next/link";
import { addMeses, fmtMesAno, mesParam } from "@/lib/utils/financeiro";

/** Navegação de mês — mesmo padrão de `DateNav` (lume-strada-acessos): pura navegação por link, sem JS no cliente. */
export function MesNav({ referencia, contexto }: { referencia: Date; contexto: string }) {
  const anterior = addMeses(referencia, -1);
  const proximo = addMeses(referencia, 1);
  const hoje = new Date();
  const mesAtual = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1));
  const isMesAtual = mesParam(referencia) === mesParam(mesAtual);

  const sufixoContexto = contexto !== "todos" ? `&contexto=${contexto}` : "";
  const hrefFor = (ref: Date) => `/admin/financeiro?mes=${mesParam(ref)}${sufixoContexto}`;

  return (
    <div className="flex items-center gap-2">
      <Link
        href={hrefFor(anterior)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
        aria-label="Mês anterior"
      >
        ‹
      </Link>
      <div className="w-40 text-center">
        <p className="text-sm font-medium capitalize">{fmtMesAno(referencia)}</p>
        {!isMesAtual && (
          <Link
            href={`/admin/financeiro${contexto !== "todos" ? `?contexto=${contexto}` : ""}`}
            className="text-xs text-accent hover:underline"
          >
            Voltar para hoje
          </Link>
        )}
      </div>
      <Link
        href={hrefFor(proximo)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
        aria-label="Próximo mês"
      >
        ›
      </Link>
    </div>
  );
}
