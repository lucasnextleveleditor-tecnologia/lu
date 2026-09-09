"use client";

import { useValoresVisiveis } from "@/lib/valores-visiveis/ValoresVisiveisProvider";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { fmtBRL } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface Props {
  receitas: number;
  despesas: number;
  labelEntradas: string;
  labelSaidas: string;
  labelNoVermelho: string;
}

/**
 * A barra de entradas × saídas — e o borrão que a esconde.
 *
 * Mascarar só os NÚMEROS não bastava. A proporção entre a faixa verde e a
 * vermelha entrega o mês inteiro num relance: dá para ver que a empresa está
 * no vermelho de longe, com um ombro espiando a tela, sem ler um centavo. E
 * a frase "X no vermelho" entrega mais ainda. Então enquanto o olho estiver
 * fechado a barra sai de foco junto com os valores, e a frase some.
 *
 * Borrão e não `display: none`: o cartão mantém a altura, então abrir e
 * fechar o olho não faz a página inteira pular.
 */
export function BalancoDoMes({ receitas, despesas, labelEntradas, labelSaidas, labelNoVermelho }: Props) {
  const { visivel } = useValoresVisiveis();

  const resultado = receitas - despesas;
  const total = receitas + despesas;
  // Sem movimento no mês, as duas faixas ficariam com largura indefinida
  // (0/0) — melhor mostrar a trilha vazia do que uma barra quebrada.
  const pctReceitas = total > 0 ? (receitas / total) * 100 : 0;
  const pctDespesas = total > 0 ? (despesas / total) * 100 : 0;

  // Oculto, as duas faixas ficam do mesmo tamanho: mesmo borrada, uma faixa
  // vermelha ocupando três quartos da barra ainda contaria a história.
  const larguraReceitas = visivel ? pctReceitas : 50;
  const larguraDespesas = visivel ? pctDespesas : 50;

  return (
    <div className="mt-6">
      <div
        className={cn(
          "flex h-2 w-full overflow-hidden rounded-full bg-base-800 transition-[filter,opacity] duration-200",
          !visivel && "select-none opacity-70 blur-[5px]"
        )}
        role="presentation"
        aria-hidden={!visivel}
      >
        {larguraReceitas > 0 && (
          <div className="h-full rounded-full bg-status-good transition-[width] duration-200" style={{ width: `${larguraReceitas}%` }} />
        )}
        {/* O vão de 2px em cor de superfície é o que separa as duas faixas
            — não uma borda, que só adicionaria tinta sem dado. */}
        {larguraReceitas > 0 && larguraDespesas > 0 && <div className="h-full w-[2px] shrink-0 bg-base-900" />}
        {larguraDespesas > 0 && (
          <div className="h-full rounded-full bg-status-critical transition-[width] duration-200" style={{ width: `${larguraDespesas}%` }} />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="flex items-center gap-2 text-xs text-ink-secondary">
          <span className="h-2 w-2 rounded-full bg-status-good" />
          {labelEntradas}
          <span className="font-medium text-ink-primary">
            <ValorPrivado valor={fmtBRL(receitas)} />
          </span>
        </span>
        <span className="flex items-center gap-2 text-xs text-ink-secondary">
          <span className="h-2 w-2 rounded-full bg-status-critical" />
          {labelSaidas}
          <span className="font-medium text-ink-primary">
            <ValorPrivado valor={fmtBRL(despesas)} />
          </span>
        </span>
        {/* Um resultado negativo é informação, não decoração: vem escrito,
            não só em vermelho. Mas só com o olho aberto — escrito é
            justamente o jeito mais rápido de vazar. */}
        {visivel && resultado < 0 && (
          <span className="text-xs font-medium text-danger">
            {fmtBRL(Math.abs(resultado))} {labelNoVermelho}
          </span>
        )}
      </div>
    </div>
  );
}
