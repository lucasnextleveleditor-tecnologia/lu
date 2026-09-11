import { useId, type SVGProps } from "react";

/**
 * Bandeiras simplificadas (só pro seletor de idioma) — únicas cores "de
 * marca" do sistema fora dos 3 tons de status fixos, e de propósito: aqui a
 * cor É o identificador (ninguém reconhece "PT/EN/ES" tão rápido quanto a
 * bandeira), não decoração. `viewBox` 20×14 (proporção 10:7, padrão de
 * bandeira) pra todas ficarem do mesmo tamanho lado a lado. Cada instância
 * gera seu próprio `clipPath` id (via `useId`) pra recortar o conteúdo nos
 * cantos arredondados sem quebrar se a mesma bandeira aparecer mais de uma
 * vez na mesma página (ids de SVG duplicados no DOM seriam inválidos).
 */

export function FlagBR(props: SVGProps<SVGSVGElement>) {
  const clipId = `flag-br-${useId()}`;
  return (
    <svg viewBox="0 0 20 14" {...props}>
      <clipPath id={clipId}>
        <rect width="20" height="14" rx="2" />
      </clipPath>
      {/* Desenhada pra ser reconhecida a 20x14 px, que e o tamanho real em
          tela. A versao anterior tinha losango pequeno e azul quase preto: no
          tamanho de verdade sobrava um retangulo verde com um circulo escuro
          no meio -- a mesma silhueta da bandeira de Portugal. Aqui o losango
          vai ate perto da borda (proporcao oficial), o azul e mais claro e a
          faixa branca entra: sao os tres sinais que o olho usa pra ler
          "Brasil" num icone minusculo. */}
      <g clipPath={`url(#${clipId})`}>
        <rect width="20" height="14" fill="#00923F" />
        <path d="M10 1.5 L18.6 7 L10 12.5 L1.4 7 Z" fill="#FFDA1F" />
        <circle cx="10" cy="7" r="3.3" fill="#2B4FB8" />
        <path d="M6.7 8.5 Q10 6.1 13.3 8.5" stroke="#FFFFFF" strokeWidth="1.05" fill="none" />
      </g>
    </svg>
  );
}

export function FlagUS(props: SVGProps<SVGSVGElement>) {
  const clipId = `flag-us-${useId()}`;
  return (
    <svg viewBox="0 0 20 14" {...props}>
      <clipPath id={clipId}>
        <rect width="20" height="14" rx="2" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="20" height="14" fill="#B22234" />
        {[1, 3, 5, 7, 9, 11].map((y) => (
          <rect key={y} x="0" y={y} width="20" height="1" fill="white" />
        ))}
        <rect width="9" height="7.5" fill="#3C3B6E" />
      </g>
    </svg>
  );
}

export function FlagES(props: SVGProps<SVGSVGElement>) {
  const clipId = `flag-es-${useId()}`;
  return (
    <svg viewBox="0 0 20 14" {...props}>
      <clipPath id={clipId}>
        <rect width="20" height="14" rx="2" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="20" height="14" fill="#AA151B" />
        <rect y="3.5" width="20" height="7" fill="#F1BF00" />
      </g>
    </svg>
  );
}
