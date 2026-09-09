import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Uma seção da folha: o número da seção na cor da marca, o título em
 * versalete e um filete que atravessa a página até a margem direita.
 *
 * O número é o que dá autoridade editorial ao documento — quem lê no papel
 * acha "03 QUEM VAI ESTAR" de relance, sem precisar varrer a página. E o
 * filete correndo até a borda amarra as seções numa página só, em vez de
 * picotar a leitura em seis cartõezinhos empilhados.
 */
export function BlocoFolha({
  numero,
  titulo,
  auxiliar,
  acao,
  children,
  className,
}: {
  /** "01", "02"... — a numeração é do documento, não do banco. */
  numero: string;
  titulo: string;
  /** Contagem ou resumo curto à direita do título (ex.: "3 locais"). */
  auxiliar?: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("break-inside-avoid", className)}>
      <div className="mb-4 flex items-center gap-3">
        <span
          className="text-[11px] font-bold tabular-nums leading-none tracking-[0.1em] text-accent papel:text-black"
          aria-hidden
        >
          {numero}
        </span>
        <h2 className="whitespace-nowrap text-[11px] font-semibold uppercase leading-none tracking-[0.2em] text-ink-primary papel:text-black">
          {titulo}
        </h2>
        {auxiliar && (
          <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.12em] text-ink-muted papel:text-black/50">
            {auxiliar}
          </span>
        )}
        {/* O filete come todo o espaço que sobra: é ele que leva o olho da
            esquerda até a margem direita da folha. */}
        <span className="h-px min-w-4 flex-1 bg-base-700 papel:bg-black/25" aria-hidden />
        {/* Botões de edição nunca vão pro papel. */}
        {acao && <div className="shrink-0 print:hidden">{acao}</div>}
      </div>
      {children}
    </section>
  );
}
