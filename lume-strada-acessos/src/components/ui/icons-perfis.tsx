import type { SVGProps } from "react";
import type { PerfilOrcamento } from "@/lib/types/orcamentos";

/**
 * Um glifo para cada profissão que o sistema orça.
 *
 * Desenhados aqui, do zero, na mesma gramática de `icons-nav.tsx`: grade de
 * 24, traço 1.6, cantos arredondados e UMA peça preenchida por ícone — é a
 * peça cheia que faz o ícone continuar legível a 20px, quando o traço sozinho
 * vira um borrão. Nada de biblioteca: um conjunto de ícones de terceiro
 * traria o desenho de outra marca para dentro do produto.
 *
 * `currentColor` em tudo, então o ícone acende junto com o texto do cartão no
 * hover, na cor de marca da agência.
 */

type P = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Filmmaker — claquete. */
export function IconPerfilFilmmaker(props: P) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="9" width="18" height="11" rx="2" />
      <path d="M3.4 9 L6.6 4.6 L10.6 6 L7.4 10.4 Z" fill="currentColor" stroke="none" />
      <path d="M11 5.4 L15 6.8 L11.8 11.2" />
      <path d="M15.4 6.8 L19.4 8.2 L17.6 10.6" />
    </svg>
  );
}

/** Videomaker — câmera de vídeo com a lente cônica. */
export function IconPerfilVideomaker(props: P) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="7" width="12" height="10" rx="2" />
      <path d="M14.5 11 L21 7.8 V16.2 L14.5 13 Z" fill="currentColor" stroke="none" />
      <circle cx="6" cy="12" r="1.6" />
    </svg>
  );
}

/** Social media — três nós conectados. */
export function IconPerfilSocialMedia(props: P) {
  return (
    <svg {...base} {...props}>
      <circle cx="17.5" cy="6" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="12" r="2.6" />
      <circle cx="17.5" cy="18" r="2.6" />
      <path d="M8 10.8 L15.1 7.2" />
      <path d="M8 13.2 L15.1 16.8" />
    </svg>
  );
}

/** Storymaker — o quadro vertical com o anel em volta. */
export function IconPerfilStorymaker(props: P) {
  return (
    <svg {...base} {...props}>
      <rect x="8" y="2.6" width="8" height="18.8" rx="2.4" />
      <path d="M5 7.4 A8.4 8.4 0 0 0 5 16.6" />
      <path d="M19 7.4 A8.4 8.4 0 0 1 19 16.6" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Designer — o nó vetorial com as alças. */
export function IconPerfilDesigner(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M4 18 C4 10 10 5 20 5" />
      <rect x="2.2" y="16.2" width="3.6" height="3.6" rx="0.8" fill="currentColor" stroke="none" />
      <rect x="18.2" y="3.2" width="3.6" height="3.6" rx="0.8" />
      <path d="M9.5 20 L20 20" />
    </svg>
  );
}

/** Fotógrafo — corpo de câmera com o visor em cima. */
export function IconPerfilFotografo(props: P) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="6.5" width="19" height="13" rx="2.4" />
      <path d="M8.2 6.5 L9.6 4.2 H14.4 L15.8 6.5" />
      <circle cx="12" cy="13" r="3.6" />
      <circle cx="12" cy="13" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Agência de marketing — a curva subindo dentro do quadro. */
export function IconPerfilAgencia(props: P) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2.4" />
      <path d="M7 15.2 L10.4 11.6 L13 14 L17 9.4" />
      <circle cx="17" cy="9.4" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export const ICONE_DO_PERFIL: Record<PerfilOrcamento, (props: P) => JSX.Element> = {
  filmmaker: IconPerfilFilmmaker,
  videomaker: IconPerfilVideomaker,
  social_media: IconPerfilSocialMedia,
  storymaker: IconPerfilStorymaker,
  designer: IconPerfilDesigner,
  fotografo: IconPerfilFotografo,
  agencia_marketing: IconPerfilAgencia,
};
