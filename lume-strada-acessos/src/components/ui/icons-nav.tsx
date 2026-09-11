import type { SVGProps } from "react";

/**
 * O conjunto de ícones do MENU LATERAL — e só dele.
 *
 * Por que um conjunto separado de `icons.tsx`: o menu é a única superfície do
 * app onde o ícone aparece sozinho, sempre no mesmo tamanho e sempre lido de
 * relance. Ali vale um desenho mais encorpado, com uma peça sólida em cada um
 * — é o que dá a "silhueta" que se reconhece sem ler o rótulo. Nas telas, o
 * ícone aparece do lado de texto e de outros elementos, e o traço fino de
 * `icons.tsx` continua sendo o certo lá. Misturar os dois estilos numa tela só
 * é que ficaria estranho, então eles não se misturam.
 *
 * A gramática é sempre a mesma, e é ela que faz os treze parecerem um
 * conjunto e não treze desenhos:
 *
 *   - grade de 24, traço de 1.6, pontas e junções redondas;
 *   - raio de canto generoso (nada de quina viva);
 *   - UMA peça sólida por ícone, em `currentColor` com opacidade — é ela que
 *     acende junto quando o menu ganha a cor da marca no hover;
 *   - `currentColor` em tudo, nunca cor fixa: a cor quem manda é quem usa.
 *
 * Os desenhos são próprios. Assunto de ícone de painel é o que é (calendário
 * é calendário), mas a composição de cada um aqui foi montada do zero.
 */

type Props = SVGProps<SVGSVGElement>;

/** Base comum: tudo que se repete nos treze mora aqui, uma vez só. */
function Svg({ children, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** A peça sólida de cada ícone — sempre a mesma opacidade, para o conjunto ter um peso só. */
const SOLIDO = { fill: "currentColor", fillOpacity: 0.24, stroke: "none" } as const;

/** Visão geral — três blocos de tamanhos diferentes, o menor sólido. */
export function IconNavVisaoGeral(props: Props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="8.5" height="8.5" rx="2.6" />
      <rect x="14.5" y="3" width="6.5" height="5" rx="2" {...SOLIDO} />
      <rect x="14.5" y="3" width="6.5" height="5" rx="2" />
      <rect x="3" y="14.5" width="8.5" height="6.5" rx="2.2" />
      <rect x="14.5" y="11" width="6.5" height="10" rx="2.6" />
    </Svg>
  );
}

/** Relatórios — três colunas subindo, a do meio sólida. */
export function IconNavRelatorios(props: Props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <rect x="7" y="13" width="2.8" height="4.5" rx="1.4" />
      <rect x="10.6" y="9.8" width="2.8" height="7.7" rx="1.4" {...SOLIDO} />
      <rect x="10.6" y="9.8" width="2.8" height="7.7" rx="1.4" />
      <rect x="14.2" y="6.6" width="2.8" height="10.9" rx="1.4" />
    </Svg>
  );
}

/** Comercial — alvo de cantos arredondados, centro sólido. */
export function IconNavComercial(props: Props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="6" />
      <rect x="7.8" y="7.8" width="8.4" height="8.4" rx="3" />
      <circle cx="12" cy="12" r="2.1" {...SOLIDO} />
      <circle cx="12" cy="12" r="2.1" />
    </Svg>
  );
}

/** Contratos — folha com a ponta dobrada, e a dobra é a peça sólida. */
export function IconNavContratos(props: Props) {
  return (
    <Svg {...props}>
      <path d="M6.2 3h6.6l6.2 6.2v11.3a2.5 2.5 0 0 1-2.5 2.5H6.2a2.5 2.5 0 0 1-2.5-2.5V5.5A2.5 2.5 0 0 1 6.2 3Z" />
      <path d="M12.8 3v4a2.2 2.2 0 0 0 2.2 2.2h4" {...SOLIDO} />
      <path d="M12.8 3v4a2.2 2.2 0 0 0 2.2 2.2h4" />
      <path d="M8 14h8" />
      <path d="M8 17.6h5" />
    </Svg>
  );
}

/** Clientes — duas figuras, a de trás sólida. */
export function IconNavClientes(props: Props) {
  return (
    <Svg {...props}>
      <circle cx="16.4" cy="9" r="2.6" {...SOLIDO} />
      <circle cx="16.4" cy="9" r="2.6" />
      <path d="M20.8 19.2a4.6 4.6 0 0 0-3.2-4.6" />
      <circle cx="9.6" cy="8.4" r="3.6" />
      <path d="M3.4 19.6a6.2 6.2 0 0 1 12.4 0" />
    </Svg>
  );
}

/** Agenda — um dia marcado em sólido dentro da folhinha. */
export function IconNavAgenda(props: Props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="4.5" />
      <path d="M3.4 9.8h17.2" />
      <path d="M8.2 2.8v3.6" />
      <path d="M15.8 2.8v3.6" />
      <rect x="7" y="12.6" width="4.4" height="4.4" rx="1.6" {...SOLIDO} />
      <rect x="7" y="12.6" width="4.4" height="4.4" rx="1.6" />
    </Svg>
  );
}

/** Produção — três colunas de um quadro, a do meio sólida. */
export function IconNavProducao(props: Props) {
  return (
    <Svg {...props}>
      <rect x="2.8" y="3.6" width="5.4" height="16.8" rx="2.2" />
      <rect x="9.3" y="3.6" width="5.4" height="10.4" rx="2.2" {...SOLIDO} />
      <rect x="9.3" y="3.6" width="5.4" height="10.4" rx="2.2" />
      <rect x="15.8" y="3.6" width="5.4" height="13.6" rx="2.2" />
    </Svg>
  );
}

/** Ferramentas — caixa com alça, trinco sólido. */
export function IconNavFerramentas(props: Props) {
  return (
    <Svg {...props}>
      <rect x="2.8" y="7.8" width="18.4" height="12.6" rx="3.6" />
      <path d="M8.8 7.8V6.4a2.4 2.4 0 0 1 2.4-2.4h1.6a2.4 2.4 0 0 1 2.4 2.4v1.4" />
      <rect x="9.9" y="11.4" width="4.2" height="3.4" rx="1.3" {...SOLIDO} />
      <rect x="9.9" y="11.4" width="4.2" height="3.4" rx="1.3" />
    </Svg>
  );
}

/** Tráfego — a linha subindo, com o ponto de chegada sólido. */
export function IconNavTrafego(props: Props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <path d="M7 15.2l3.4-3.6 2.9 2.4L17 8.6" />
      <circle cx="17" cy="8.6" r="1.9" {...SOLIDO} />
      <circle cx="17" cy="8.6" r="1.9" />
    </Svg>
  );
}

/** Inventário — caixa com a tampa sólida. */
export function IconNavInventario(props: Props) {
  return (
    <Svg {...props}>
      <rect x="2.8" y="7.4" width="18.4" height="13.2" rx="3.4" />
      <path d="M2.8 11.8h18.4" />
      <path d="M6 7.4l1.8-3.2a2 2 0 0 1 1.7-1h5a2 2 0 0 1 1.7 1L18 7.4" {...SOLIDO} />
      <path d="M6 7.4l1.8-3.2a2 2 0 0 1 1.7-1h5a2 2 0 0 1 1.7 1L18 7.4" />
      <path d="M10 16.2h4" />
    </Svg>
  );
}

/** Financeiro — carteira com o fecho sólido. */
export function IconNavFinanceiro(props: Props) {
  return (
    <Svg {...props}>
      <rect x="2.8" y="5.4" width="18.4" height="14.4" rx="4" />
      <path d="M2.8 10h18.4" />
      <circle cx="16.8" cy="14.9" r="1.9" {...SOLIDO} />
      <circle cx="16.8" cy="14.9" r="1.9" />
    </Svg>
  );
}

/** Objetivos — bandeira sólida no mastro. */
export function IconNavObjetivos(props: Props) {
  return (
    <Svg {...props}>
      <path d="M6 3.4v17.4" />
      <path d="M6 4.6h11.2l-2.5 3.6 2.5 3.6H6z" {...SOLIDO} />
      <path d="M6 4.6h11.2l-2.5 3.6 2.5 3.6H6z" />
    </Svg>
  );
}

/**
 * Eventos — o estouro.
 *
 * Miolo sólido e seis raios. É o desenho do "boom" que o próprio módulo
 * organiza (CO₂, pirotecnia, confete), e é a silhueta que menos se confunde
 * com as outras do menu: não tem moldura, não tem canto reto e é a única
 * radial do conjunto — dá para achar de relance mesmo sem ler o rótulo.
 */
export function IconNavEventos(props: Props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3.1" {...SOLIDO} />
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.6v2.6" />
      <path d="M12 18.8v2.6" />
      <path d="M2.6 12h2.6" />
      <path d="M18.8 12h2.6" />
      <path d="M5.4 5.4l1.9 1.9" />
      <path d="M16.7 16.7l1.9 1.9" />
      <path d="M18.6 5.4l-1.9 1.9" />
      <path d="M7.3 16.7l-1.9 1.9" />
    </Svg>
  );
}

/** Configurações — engrenagem de cantos macios, miolo sólido. */
export function IconNavConfiguracoes(props: Props) {
  return (
    <Svg {...props}>
      <path d="M12 2.9c.9 0 1.6.7 1.6 1.6v.5c0 .6.4 1.2 1 1.4.6.3 1.3.2 1.7-.3l.4-.3a1.6 1.6 0 0 1 2.3 2.3l-.3.4c-.5.4-.6 1.1-.3 1.7.2.6.8 1 1.4 1h.5a1.6 1.6 0 0 1 0 3.2h-.5c-.6 0-1.2.4-1.4 1-.3.6-.2 1.3.3 1.7l.3.4a1.6 1.6 0 0 1-2.3 2.3l-.4-.3c-.4-.5-1.1-.6-1.7-.3-.6.2-1 .8-1 1.4v.5a1.6 1.6 0 0 1-3.2 0v-.5c0-.6-.4-1.2-1-1.4-.6-.3-1.3-.2-1.7.3l-.4.3a1.6 1.6 0 0 1-2.3-2.3l.3-.4c.5-.4.6-1.1.3-1.7-.2-.6-.8-1-1.4-1h-.5a1.6 1.6 0 0 1 0-3.2h.5c.6 0 1.2-.4 1.4-1 .3-.6.2-1.3-.3-1.7l-.3-.4a1.6 1.6 0 0 1 2.3-2.3l.4.3c.4.5 1.1.6 1.7.3.6-.2 1-.8 1-1.4v-.5c0-.9.7-1.6 1.6-1.6Z" />
      <circle cx="12" cy="12" r="2.9" {...SOLIDO} />
      <circle cx="12" cy="12" r="2.9" />
    </Svg>
  );
}
