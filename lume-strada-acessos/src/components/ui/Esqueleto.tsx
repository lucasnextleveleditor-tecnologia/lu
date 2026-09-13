import { cn } from "@/lib/utils/cn";

/**
 * Os blocos cinzas que aparecem enquanto a tela seguinte ainda está sendo
 * montada no servidor.
 *
 * Existem por um motivo específico do App Router: sem um `loading.tsx`, o
 * clique num link do menu não muda NADA na tela até o servidor terminar de
 * renderizar a página inteira — a pessoa clica, não acontece nada por meio
 * segundo, e a conclusão é "o sistema travou". Com o esqueleto, a troca de
 * tela é imediata e o que falta é só o conteúdo chegar.
 *
 * O componente é PROPOSITALMENTE burro: sem dicionário, sem consulta, sem
 * `await`. Qualquer espera aqui dentro derrotaria o objetivo, que é aparecer
 * no mesmo instante do clique.
 *
 * `animate-pulse` é do próprio Tailwind e já respeita `prefers-reduced-motion`
 * pela configuração do projeto.
 */

export function Esqueleto({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-base-800", className)} />;
}

/** Cabeçalho de página: o título e a linha de apoio embaixo. */
export function EsqueletoDeCabecalho() {
  return (
    <div className="mb-5">
      <Esqueleto className="h-5 w-44" />
      <Esqueleto className="mt-2 h-3 w-80 max-w-full" />
    </div>
  );
}

/** Fileira de cartões de número — o começo de quase toda tela do painel. */
export function EsqueletoDeTiles({ quantos = 4 }: { quantos?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: quantos }).map((_, i) => (
        <div key={i} className="rounded-xl border border-base-800 bg-base-900/60 p-4">
          <Esqueleto className="h-3 w-24" />
          <Esqueleto className="mt-3 h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Bloco de lista/tabela. `linhas` controla a altura aparente do bloco. */
export function EsqueletoDeLista({ linhas = 6 }: { linhas?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-base-800 bg-base-900/60">
      <div className="border-b border-base-800 px-4 py-3">
        <Esqueleto className="h-3 w-32" />
      </div>
      <div className="divide-y divide-base-800">
        {Array.from({ length: linhas }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Esqueleto className="h-3 flex-1" />
            <Esqueleto className="hidden h-3 w-24 sm:block" />
            <Esqueleto className="hidden h-3 w-20 md:block" />
            <Esqueleto className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Quadro de colunas — Produção e qualquer kanban.
 *
 * O esqueleto imita a FORMA da tela que vem, não uma forma genérica. É a
 * diferença entre "carregando" e "sua tela está chegando": quando o conteúdo
 * entra, nada salta de lugar, porque os blocos cinzas já estavam onde os
 * cartões ficam.
 */
export function EsqueletoDeQuadro({ colunas = 4 }: { colunas?: number }) {
  // Alturas fixas por posição, não aleatórias: `Math.random()` no corpo de um
  // componente dá valores diferentes no servidor e no cliente e quebra a
  // hidratação — num esqueleto, justamente na tela em que ninguém está
  // olhando o console.
  const alturas = ["h-20", "h-16", "h-24", "h-16", "h-20"];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: colunas }).map((_, c) => (
        <div key={c} className="rounded-xl border border-base-800 bg-base-900/60 p-3">
          <div className="flex items-center justify-between">
            <Esqueleto className="h-3 w-20" />
            <Esqueleto className="h-3 w-5" />
          </div>
          <div className="mt-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Esqueleto key={i} className={cn("w-full rounded-lg", alturas[(c + i) % alturas.length])} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** A grade do evento: régua de horas e as faixas dos ambientes. */
export function EsqueletoDeConsole() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-base-800 bg-base-900/60 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Esqueleto className="h-6 w-56 max-w-full" />
            <Esqueleto className="mt-2 h-3 w-32" />
          </div>
          <Esqueleto className="h-8 w-28" />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Esqueleto key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-base-800 bg-base-900/60 p-5">
        <Esqueleto className="h-3 w-full" />
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Esqueleto className="h-3 w-[148px] shrink-0" />
              <Esqueleto className="h-14 flex-1 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Formulário/editor de tela cheia — orçamento, contrato, tarefa. */
export function EsqueletoDeFormulario() {
  return (
    <div className="space-y-4">
      <EsqueletoDeCabecalho />
      <div className="rounded-xl border border-base-800 bg-base-900/60 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Esqueleto className="h-3 w-24" />
              <Esqueleto className="mt-2 h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <Esqueleto className="mt-5 h-28 w-full rounded-lg" />
      </div>
    </div>
  );
}
