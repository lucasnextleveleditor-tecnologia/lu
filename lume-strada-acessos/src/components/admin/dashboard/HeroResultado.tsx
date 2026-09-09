import { fmtBRL } from "@/lib/utils/format";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { getDictionary } from "@/lib/i18n/getDictionary";

/**
 * O ÚNICO número grande da tela.
 *
 * Um painel só tem um herói: se tudo é grande, nada é. Antes a Visão Geral
 * abria com quatorze cartões do mesmo tamanho, todos com número em `text-3xl`
 * e ícone colorido — o olho não tinha por onde começar, e a leitura virava
 * varredura. Aqui um valor manda (o resultado do mês), e todo o resto desce
 * de peso.
 *
 * A barra abaixo compara entradas e saídas na mesma linha, com um vão de 2px
 * entre as duas faixas separando-as sem precisar de borda. Sem eixo, sem
 * legenda solta: os dois rótulos estão logo abaixo, com a bolinha da cor ao
 * lado — a cor nunca é a única pista.
 */
export async function HeroResultado({ receitas, despesas }: { receitas: number; despesas: number }) {
  const { dict } = await getDictionary();
  const t = dict.dashboard;

  const resultado = receitas - despesas;
  const total = receitas + despesas;
  // Sem movimento no mês, as duas faixas ficariam com largura indefinida
  // (0/0) — melhor mostrar a trilha vazia do que uma barra quebrada.
  const pctReceitas = total > 0 ? (receitas / total) * 100 : 0;
  const pctDespesas = total > 0 ? (despesas / total) * 100 : 0;
  const positivo = resultado >= 0;

  return (
    <div className="rounded-2xl border border-base-700 bg-base-900/80 p-6 backdrop-blur-sm sm:p-7">
      <p className="text-xs font-medium text-ink-muted">{t.heroResultadoLabel}</p>

      {/* >= 48px: é a figura-herói do painel. Fonte da casa, nunca uma
          display — número grande já chama atenção sozinho. */}
      <p className="mt-2 text-[44px] font-semibold leading-none tracking-tight text-ink-primary sm:text-5xl">
        <ValorPrivado valor={fmtBRL(resultado)} />
      </p>
      <p className="mt-2 text-xs text-ink-muted">{t.heroResultadoHint}</p>

      <div className="mt-6">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-base-800" role="presentation">
          {pctReceitas > 0 && <div className="h-full rounded-full bg-status-good" style={{ width: `${pctReceitas}%` }} />}
          {/* O vão de 2px em cor de superfície é o que separa as duas faixas
              — não uma borda, que só adicionaria tinta sem dado. */}
          {pctReceitas > 0 && pctDespesas > 0 && <div className="h-full w-[2px] shrink-0 bg-base-900" />}
          {pctDespesas > 0 && <div className="h-full rounded-full bg-status-critical" style={{ width: `${pctDespesas}%` }} />}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-2 text-xs text-ink-secondary">
            <span className="h-2 w-2 rounded-full bg-status-good" />
            {t.heroEntradas}
            <span className="font-medium text-ink-primary">
              <ValorPrivado valor={fmtBRL(receitas)} />
            </span>
          </span>
          <span className="flex items-center gap-2 text-xs text-ink-secondary">
            <span className="h-2 w-2 rounded-full bg-status-critical" />
            {t.heroSaidas}
            <span className="font-medium text-ink-primary">
              <ValorPrivado valor={fmtBRL(despesas)} />
            </span>
          </span>
          {!positivo && (
            // Um resultado negativo é informação, não decoração: vem escrito,
            // não só em vermelho.
            <span className="text-xs font-medium text-danger">{fmtBRL(Math.abs(resultado))} no vermelho</span>
          )}
        </div>
      </div>
    </div>
  );
}
