import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Uma seção da folha: um filete na cor da marca, o rótulo em versalete, e o
 * conteúdo.
 *
 * O filete é o que dá ritmo ao documento — em vez de encaixotar cada seção
 * num cartão (o que picotaria a leitura em seis retângulos), as seções ficam
 * separadas por espaço e ancoradas por essa marca à esquerda. É a diferença
 * entre uma página e um painel.
 */
export function BlocoFolha({
  titulo,
  acao,
  children,
  className,
}: {
  titulo: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("break-inside-avoid", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-secondary print:text-black">
          <span className="h-3.5 w-[3px] rounded-full bg-accent print:bg-black" aria-hidden />
          {titulo}
        </h2>
        {/* Botões de edição nunca vão pro papel. */}
        {acao && <div className="print:hidden">{acao}</div>}
      </div>
      {children}
    </section>
  );
}
