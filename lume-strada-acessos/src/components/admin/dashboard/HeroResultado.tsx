import { fmtBRL } from "@/lib/utils/format";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { OlhoValoresToggle } from "@/components/ui/OlhoValoresToggle";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { BalancoDoMes } from "./BalancoDoMes";

/**
 * O ÚNICO número grande da tela.
 *
 * Um painel só tem um herói: se tudo é grande, nada é. Antes a Visão Geral
 * abria com quatorze cartões do mesmo tamanho, todos com número em `text-3xl`
 * e ícone colorido — o olho não tinha por onde começar, e a leitura virava
 * varredura. Aqui um valor manda (o resultado do mês), e todo o resto desce
 * de peso.
 *
 * O botão de olho fica AQUI, ao lado do número que ele esconde. Antes vivia
 * lá embaixo, no cabeçalho de "Mais números" — perto dos cartõezinhos, longe
 * do dado mais sensível da tela, e por isso ninguém achava.
 */
export async function HeroResultado({ receitas, despesas }: { receitas: number; despesas: number }) {
  const { dict } = await getDictionary();
  const t = dict.dashboard;

  const resultado = receitas - despesas;

  return (
    <div className="rounded-2xl border border-base-700 bg-base-900/80 p-6 backdrop-blur-sm sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-ink-muted">{t.heroResultadoLabel}</p>
        <OlhoValoresToggle className="-mr-1 -mt-1" />
      </div>

      {/* Continua sendo o maior número da tela, mas não um outdoor: a 48px
          um valor como "-R$ 1.678,96" atravessava o cartão inteiro e virava
          a única coisa visível na página. O que dá a hierarquia aqui não é
          só o corpo da fonte — é o cartão maior, o espaço em volta e o fato
          de os outros números viverem atrás de um divisor. */}
      <p className="mt-2 text-[30px] font-semibold leading-none tracking-tight text-ink-primary sm:text-4xl">
        <ValorPrivado valor={fmtBRL(resultado)} />
      </p>
      <p className="mt-2 text-xs text-ink-muted">{t.heroResultadoHint}</p>

      <BalancoDoMes
        receitas={receitas}
        despesas={despesas}
        labelEntradas={t.heroEntradas}
        labelSaidas={t.heroSaidas}
        labelNoVermelho={t.heroNoVermelho}
      />
    </div>
  );
}
