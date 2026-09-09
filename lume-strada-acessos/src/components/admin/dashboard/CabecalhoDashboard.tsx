import { getDictionary } from "@/lib/i18n/getDictionary";
import { periodoDoDia, primeiroNome } from "@/lib/utils/saudacao";

const CHAVE_SAUDACAO = {
  madrugada: "saudacaoMadrugada",
  manha: "saudacaoManha",
  tarde: "saudacaoTarde",
  noite: "saudacaoNoite",
} as const;

/**
 * Cabeçalho da Visão Geral: sobretítulo pequeno, título e uma linha de
 * saudação pelo horário.
 *
 * Três tamanhos de texto em vez de dois — o sobretítulo dá contexto sem
 * disputar com o título, e a saudação vira a linha "humana" que antes era um
 * subtítulo genérico ("Visão geral da agência e agenda de..."), que ninguém
 * lê duas vezes.
 *
 * A hora é resolvida NO SERVIDOR e no fuso de São Paulo (ver
 * `lib/utils/saudacao.ts`): calcular no navegador criaria diferença entre o
 * HTML servido e o renderizado, e o React reclamaria de hidratação.
 */
export async function CabecalhoDashboard({ nomeCompleto }: { nomeCompleto: string | null }) {
  const { dict } = await getDictionary();
  const t = dict.dashboard;

  const saudacao = t[CHAVE_SAUDACAO[periodoDoDia()]];
  const nome = primeiroNome(nomeCompleto);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{t.kicker}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-primary">{t.tituloPagina}</h1>
      <p className="mt-1.5 text-sm text-ink-secondary">
        {nome ? `${saudacao}, ${nome}, ${t.saudacaoComplemento}` : `${saudacao}, ${t.saudacaoComplemento}`}
      </p>
    </div>
  );
}
