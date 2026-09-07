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
      <g clipPath={`url(#${clipId})`}>
        <rect width="20" height="14" fill="#0C7A3C" />
        <path d="M10 2.2 L18 7 L10 11.8 L2 7 Z" fill="#F7CE3E" />
        <circle cx="10" cy="7" r="3.1" fill="#1A3D8F" />
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
