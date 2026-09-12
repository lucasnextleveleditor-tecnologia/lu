import Link from "next/link";
import type { SVGProps } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * O grid de escolha que abre um orçamento novo — usado nos dois passos
 * (profissão, depois tipo de trabalho).
 *
 * Por que virou TELA e não mais um campo dentro do formulário: escolher a
 * profissão define o catálogo, os textos e o modelo de contrato do orçamento
 * inteiro. Isso é uma decisão, não um campo — enfiada no meio do formulário,
 * como uma fileira de pílulas, ela tinha o mesmo peso visual de "validade em
 * dias". Uma tela só para ela deixa claro que a partir dali o resto muda.
 *
 * Componente de SERVIDOR, sem `"use client"` e sem estado: são links. Cada
 * passo é uma URL (`?perfil=...`, depois `&servico=...`), então o botão
 * voltar do navegador funciona, o passo dá para compartilhar, e a tela chega
 * pronta sem esperar JavaScript.
 *
 * O visual é nosso: moldura em fio de cabelo, número em mono, o ícone que
 * acende na cor da marca e um fio de luz que atravessa a base do cartão no
 * hover. Nada de caixa colorida atrás do ícone.
 */

export interface OpcaoDeEscolha {
  /** Para onde o cartão leva. */
  href: string;
  titulo: string;
  texto: string;
  Icone: (props: SVGProps<SVGSVGElement>) => JSX.Element;
}

export function CabecalhoDaEscolha({
  etiqueta,
  passo,
  titulo,
  destaque,
  subtitulo,
}: {
  etiqueta: string;
  passo: string;
  titulo: string;
  /** A metade acesa do título — sempre a que carrega a ideia, nunca meia frase. */
  destaque: string;
  subtitulo: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{etiqueta}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">{passo}</p>
      </div>

      <h1 className="mt-3 max-w-[26ch] text-[1.75rem] font-semibold leading-[1.1] tracking-tight text-ink-primary sm:text-[2.25rem]">
        {titulo}{" "}
        <span className="text-accent [text-shadow:0_0_28px_rgb(var(--color-accent)/0.45)]">{destaque}</span>
      </h1>

      <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-ink-muted">{subtitulo}</p>
    </div>
  );
}

export function GradeDeEscolha({ opcoes, rotuloAcao }: { opcoes: OpcaoDeEscolha[]; rotuloAcao: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {opcoes.map((opcao, i) => (
        <CartaoDeEscolha key={opcao.href} opcao={opcao} indice={i + 1} rotuloAcao={rotuloAcao} />
      ))}
    </div>
  );
}

function CartaoDeEscolha({ opcao, indice, rotuloAcao }: { opcao: OpcaoDeEscolha; indice: number; rotuloAcao: string }) {
  const { Icone } = opcao;

  return (
    <Link
      href={opcao.href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-base-800 bg-base-900/60 p-5",
        "transition duration-200 hover:-translate-y-0.5 hover:border-accent/45 focus-visible:-translate-y-0.5 focus-visible:border-accent/45 focus-visible:outline-none"
      )}
    >
      {/* O brilho da marca no canto, só no hover — difuso o bastante para ser
          luz e não mancha. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent opacity-0 blur-[70px] transition-opacity duration-300 group-hover:opacity-25 group-focus-visible:opacity-25"
      />

      {/* O canto do visor: duas linhas que não se fecham. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-3 h-4 w-4 rounded-tl-md border-l border-t border-transparent transition-colors duration-200 group-hover:border-accent/50 group-focus-visible:border-accent/50"
      />

      <div className="relative flex items-start justify-between">
        <Icone className="h-6 w-6 text-ink-secondary transition duration-200 group-hover:text-accent group-hover:drop-shadow-[0_0_10px_rgb(var(--color-accent)/0.75)] group-focus-visible:text-accent" />
        <span className="font-mono text-[10px] tabular-nums tracking-[0.18em] text-ink-muted/70">
          {String(indice).padStart(2, "0")}
        </span>
      </div>

      <p className="relative mt-6 text-[15px] font-medium leading-snug text-ink-primary">{opcao.titulo}</p>
      <p className="relative mt-1.5 line-clamp-3 text-xs leading-relaxed text-ink-muted">{opcao.texto}</p>

      <span className="relative mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted transition-colors duration-200 group-hover:text-accent group-focus-visible:text-accent">
        {rotuloAcao}
        <svg viewBox="0 0 16 16" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8h9" />
          <path d="M8.5 4.5 12 8l-3.5 3.5" />
        </svg>
      </span>

      {/* O fio de luz na base: cresce da esquerda no hover. É a assinatura do
          cartão — o que substitui a caixinha colorida atrás do ícone. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-accent shadow-[0_0_10px_rgb(var(--color-accent)/0.9)] transition-all duration-500 ease-out group-hover:w-full group-focus-visible:w-full"
      />
    </Link>
  );
}
