import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils/cn";
import { IconArrowRight } from "@/components/ui/icons";

/**
 * Um cartão da vitrine de Ferramentas.
 *
 * A cor é por ferramenta, e não uma só para todas: numa grade de cartões
 * parecidos, é a cor do ícone que a pessoa memoriza e passa a mirar sem ler
 * — depois da segunda semana ninguém lê "Ordem de Externa", só procura o
 * âmbar. Ela entra em três lugares (fundo do badge, borda e o próprio
 * ícone) por `style` inline, porque é valor dinâmico: classe do Tailwind não
 * se monta em tempo de execução.
 *
 * O rodapé mostra o que está esperando lá dentro, e não um selo de
 * "Disponível". Selo repete o que a pessoa já sabe só de estar vendo o
 * cartão; número diz se vale a pena entrar agora.
 */
export function CartaoDeFerramenta({
  href,
  icone: Icone,
  cor,
  titulo,
  descricao,
  meta,
  destaque,
}: {
  href: string;
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  /** Hex da ferramenta, ex.: "#f59e0b". */
  cor: string;
  titulo: string;
  descricao: string;
  /** Linha de estado: "3 ordens ativas", "nenhum mapa ainda". */
  meta: string;
  /** `true` quando há algo esperando — acende o ponto e realça o texto. */
  destaque?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-base-700 bg-base-900/70 p-5",
        "transition duration-200 hover:-translate-y-0.5 hover:border-base-600 hover:bg-base-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-950"
      )}
    >
      {/*
        Fio de luz no topo, na cor da ferramenta. Nasce invisível e só
        aparece no hover: aceso o tempo todo em seis cartões viraria uma
        fileira de neon, e nenhum deles se destacaria de nada.
      */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: `linear-gradient(to right, transparent, ${cor}, transparent)` }}
      />

      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-xl border transition duration-200 group-hover:scale-105"
          style={{ backgroundColor: `${cor}1f`, borderColor: `${cor}40`, color: cor }}
        >
          <Icone className="h-[22px] w-[22px]" strokeWidth={1.9} />
        </span>
        <IconArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-muted transition duration-200 group-hover:translate-x-0.5 group-hover:text-ink-secondary" />
      </div>

      <p className="text-base font-semibold tracking-tight text-ink-primary">{titulo}</p>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-muted">{descricao}</p>

      <p className="mt-4 flex items-center gap-1.5 text-[11px] font-medium">
        <span
          aria-hidden
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", !destaque && "bg-base-600")}
          style={destaque ? { backgroundColor: cor } : undefined}
        />
        <span className={destaque ? "text-ink-secondary" : "text-ink-muted"}>{meta}</span>
      </p>
    </Link>
  );
}
