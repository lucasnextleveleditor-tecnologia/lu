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

/** Ícones adicionais usados nos StatTiles (KPIs) do topo de cada módulo. */

export function IconCheckCircle(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.3l2.4 2.4 4.6-5.2" />
    </svg>
  );
}

export function IconAlertTriangle(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 4.2L21 19.5H3L12 4.2z" />
      <path d="M12 10.2v4" />
      <circle cx="12" cy="16.8" r="0.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPauseCircle(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 9v6" />
      <path d="M14 9v6" />
    </svg>
  );
}

export function IconTrendingUp(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <polyline points="3.5 16 9.5 10 13.5 14 20.5 6.5" />
      <polyline points="14.5 6.5 20.5 6.5 20.5 12.5" />
    </svg>
  );
}

export function IconLayers(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 3.5l8.5 4.5-8.5 4.5-8.5-4.5L12 3.5z" />
      <path d="M3.5 12.5L12 17l8.5-4.5" />
      <path d="M3.5 16.5L12 21l8.5-4.5" />
    </svg>
  );
}

export function IconTag(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M11.5 3.5H4.5v7l9.8 9.8a1.5 1.5 0 0 0 2.1 0l5.2-5.2a1.5 1.5 0 0 0 0-2.1L11.5 3.5z" />
      <circle cx="8.3" cy="7.3" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Ícones do módulo Financeiro. */

export function IconWallet(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3.5 7.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1H5.5a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-3" />
      <path d="M3.5 10.5v7.5a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2H5.5a2 2 0 0 1-2-2z" />
      <circle cx="16.5" cy="14.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCreditCard(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M6.5 14.5h4" />
    </svg>
  );
}

export function IconArrowRightLeft(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M6 4.5v11.5" />
      <path d="M3 12.5l3 3.5 3-3.5" />
      <path d="M18 19.5V8" />
      <path d="M21 11.5l-3-3.5-3 3.5" />
    </svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M14.5 18l-6-6 6-6" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M9.5 18l6-6-6-6" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

/** Ícones do módulo Produção/Tarefas. */

export function IconColumns(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M9.5 4.5v15" />
      <path d="M14.5 4.5v15" />
    </svg>
  );
}

export function IconList(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M8 6.5h12.5" />
      <path d="M8 12h12.5" />
      <path d="M8 17.5h12.5" />
      <circle cx="4" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="4" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

export function IconPaperclip(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M17.5 8.5l-8 8a3 3 0 0 0 4.24 4.24l8-8a5 5 0 0 0-7.07-7.07l-8.5 8.5a7 7 0 0 0 9.9 9.9" />
    </svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.8 6.2l-1.55 1.55M7.75 16.25L6.2 17.8M17.8 17.8l-1.55-1.55M7.75 7.75L6.2 6.2" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M5 12.5l4.5 4.5L19.5 7" />
    </svg>
  );
}

export function IconRotateCcw(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 9.5A8.5 8.5 0 1 1 4.8 15" />
      <path d="M4 4.5v5h5" />
    </svg>
  );
}

export function IconExternalLink(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M9 6.5H5.5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V15" />
      <path d="M13.5 4.5H19.5v6" />
      <path d="M19.5 4.5L11 13" />
    </svg>
  );
}

/** Ícone do módulo Comercial (CRM & Vendas). */
export function IconTarget(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Ícones do Dashboard Financeiro do Patrimônio (depreciação/distribuição por categoria). */

export function IconTrendingDown(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <polyline points="3.5 8 9.5 14 13.5 10 20.5 17.5" />
      <polyline points="20.5 11.5 20.5 17.5 14.5 17.5" />
    </svg>
  );
}

export function IconBarChart2(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3.5" y="13" width="4" height="7.5" rx="1" />
      <rect x="10" y="8" width="4" height="12.5" rx="1" />
      <rect x="16.5" y="3.5" width="4" height="17" rx="1" />
    </svg>
  );
}
