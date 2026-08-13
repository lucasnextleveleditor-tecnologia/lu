import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Kit mínimo de ícones em SVG puro (sem dependência externa) usado na sidebar do admin e no painel de Aparência. */

export function IconUsers(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.7-2.8 3-4.5 5.5-4.5s4.8 1.7 5.5 4.5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.8 14.3c1.9.3 3.5 1.7 4 3.9" />
    </svg>
  );
}

export function IconActivity(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <polyline points="3 12 8 12 10 6 14 18 16 12 21 12" />
    </svg>
  );
}

export function IconBox(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3 8l9-4.5L21 8l-9 4.5L3 8z" />
      <path d="M3 8v8l9 4.5V12.5" />
      <path d="M21 8v8l-9 4.5V12.5" />
    </svg>
  );
}

export function IconPalette(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 3a9 8.5 0 1 0 0 17c1.2 0 2-.9 2-2 0-.5-.2-.9-.5-1.3-.3-.4-.4-.7-.1-1.1.3-.4.8-.5 1.4-.5H16a4 4 0 0 0 4-4c0-4.4-3.6-8-8-8z" />
      <circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16.2" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconChevronsLeft(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M11 17l-5-5 5-5" />
      <path d="M18 17l-5-5 5-5" />
    </svg>
  );
}

export function IconChevronsRight(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M13 17l5-5-5-5" />
      <path d="M6 17l5-5-5-5" />
    </svg>
  );
}

export function IconLogOut(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M16 15l4-3-4-3" />
      <path d="M20 12H9" />
    </svg>
  );
}

export function IconUpload(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}
