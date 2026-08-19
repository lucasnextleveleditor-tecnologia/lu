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

/** Ícones do módulo WhatsApp (Omnichannel / Inbox). */

export function IconMessageCircle(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3.5 12a8.5 8.5 0 1 1 3.5 6.9L3.5 20l1.2-3.6A8.4 8.4 0 0 1 3.5 12z" />
    </svg>
  );
}

export function IconQrCode(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
      <path d="M14.5 14.5h3v3h-3z" />
      <path d="M20.5 14.5v3" />
      <path d="M14.5 20.5h3" />
      <path d="M20.5 20.5h.01" />
    </svg>
  );
}

export function IconBattery(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="2.5" y="8" width="16" height="8" rx="2" />
      <path d="M21.5 10.5v3" />
      <path d="M5.5 11v2" />
      <path d="M9 11v2" />
    </svg>
  );
}

export function IconSend(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M21 3L3 10.5l7.5 3L14 21l7-18z" />
      <path d="M10.5 13.5L21 3" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.35-4.35" />
    </svg>
  );
}

/** Ícones do módulo Dashboard Geral & Calendário. */

export function IconLayoutGrid(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.2" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.2" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.2" />
    </svg>
  );
}

export function IconCamera(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h1.2l.9-1.5h4.8l.9 1.5h1.2A1.5 1.5 0 0 1 16 8.5v8A1.5 1.5 0 0 1 14.5 18h-9A1.5 1.5 0 0 1 4 16.5v-8z" />
      <circle cx="10" cy="12.2" r="3" />
      <path d="M18 9.5l3-1.5v9l-3-1.5" />
    </svg>
  );
}

/** Ícones do Módulo Central de Cadastros (Clientes / Equipe / Gerar Acesso / Permissões). */

export function IconKey(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="7.5" cy="15.5" r="4" />
      <path d="M10.5 12.5L19 4" />
      <path d="M15.5 8L18 10.5" />
      <path d="M18.5 5L21 7.5" />
    </svg>
  );
}

export function IconShieldCheck(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 3.5l7 2.7v5.3c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6.2l7-2.7z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export function IconClipboardList(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="5" y="4.5" width="14" height="16" rx="1.6" />
      <path d="M9 4.5V3.7a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 3.7v.8" />
      <path d="M8.5 11h1.2M8.5 14.5h1.2M8.5 18h1.2" />
      <path d="M12 11h3.5M12 14.5h3.5M12 18h3.5" />
    </svg>
  );
}

export function IconUserPlus(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c.7-3 3-4.8 6-4.8s5.3 1.8 6 4.8" />
      <path d="M18 8v5.5" />
      <path d="M15.3 10.75h5.4" />
    </svg>
  );
}

export function IconBriefcase(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3" y="7.5" width="18" height="12" rx="1.8" />
      <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
      <path d="M10.5 12.5h3v1.6h-3z" />
    </svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.8" />
      <path d="M4 6.5l8 6.5 8-6.5" />
    </svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4.5 7h15" />
      <path d="M9 7V5.2a1.2 1.2 0 0 1 1.2-1.2h3.6A1.2 1.2 0 0 1 15 5.2V7" />
      <path d="M6.5 7l.7 12a1.8 1.8 0 0 0 1.8 1.7h6a1.8 1.8 0 0 0 1.8-1.7l.7-12" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 20l.9-4 10.6-10.6a2 2 0 0 1 2.8 0l.3.3a2 2 0 0 1 0 2.8L8 19l-4 1z" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="5" y="3.5" width="10" height="17" rx="1" />
      <rect x="15.5" y="9.5" width="4.5" height="11" rx="1" />
      <path d="M8 7.5h1M8 11h1M8 14.5h1M11.5 7.5h1M11.5 11h1M11.5 14.5h1" />
    </svg>
  );
}

/** Ícones do módulo Info-Produtos (dentro de Tráfego & Metas). */

export function IconFilm(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
      <path d="M8 4v16M16 4v16M3.5 9h4.5M16 9h4.5M3.5 15h4.5M16 15h4.5" />
    </svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="1.8" />
      <path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" />
      <circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPercent(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M5 19L19 5" />
      <circle cx="7" cy="7" r="2.3" />
      <circle cx="17" cy="17" r="2.3" />
    </svg>
  );
}

/** Ícones do preview visual do módulo Financeiro (categorias/contas mockadas). */

export function IconHome(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 11.5L12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </svg>
  );
}

export function IconShoppingBag(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M6.5 8h11l1 12h-13l1-12z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

export function IconCar(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4.5 16v-3.2L6.5 8h11l2 4.8V16" />
      <path d="M4.5 16h15M6.5 16v2M17.5 16v2" />
      <circle cx="8" cy="16" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconHeart(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 19.5S4 14.8 4 9.6C4 6.9 6.1 5 8.5 5c1.6 0 3 .8 3.5 2.1C12.5 5.8 13.9 5 15.5 5 17.9 5 20 6.9 20 9.6c0 5.2-8 9.9-8 9.9z" />
    </svg>
  );
}

export function IconCoffee(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z" />
      <path d="M16 10.5h1.5a2.3 2.3 0 0 1 0 4.6H16" />
      <path d="M8 6c0-1 .8-1.2.8-2M11.5 6c0-1 .8-1.2.8-2" />
    </svg>
  );
}

export function IconDollarSign(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 3v18" />
      <path d="M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.2-4.5 3c0 4 9 2.3 9 6.3 0 1.8-2 3.2-4.5 3.2s-4.5-1.3-4.5-3.2" />
    </svg>
  );
}

/** Ícones do módulo Relatórios & Exportação (`ExportMenuButton`, hub de BI). */

export function IconDownload(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 3v12" />
      <path d="M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4 17.5v1.5A2.5 2.5 0 0 0 6.5 21.5h11a2.5 2.5 0 0 0 2.5-2.5v-1.5" />
    </svg>
  );
}

export function IconFileText(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M7 3.5h7l4 4v12.2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M14 3.5V8h4.5" />
      <path d="M9 13h6M9 16.3h6M9 9.7h2.2" />
    </svg>
  );
}

export function IconImage(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M20.5 15.5 15.8 11l-4 4.2-2-1.8-5.3 5.1" />
    </svg>
  );
}

export function IconTable(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function IconLoader(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}

/** Ícone do banner de destaque (`AnnouncementBanner`) — usado quando não há imagem própria configurada. */
export function IconMegaphone(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l8 4V5L6 9H4a1 1 0 0 0-1 1z" />
      <path d="M7 15v3a1.3 1.3 0 0 0 1.3 1.3h.4A1.3 1.3 0 0 0 10 18v-2.4" />
      <path d="M18.5 9a3.3 3.3 0 0 1 0 6" />
    </svg>
  );
}

/** Ícone do seletor de idioma (`LanguageSwitcher`). */
export function IconGlobe(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

/** Olho aberto — valores financeiros visíveis (`OlhoValoresToggle`). */
export function IconEye(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Olho riscado — valores financeiros ocultos (`OlhoValoresToggle`). */
export function IconEyeOff(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a15.4 15.4 0 0 1-3.6 4.5" />
      <path d="M6.6 6.6C4 8.3 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4.4-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

/** Ícone do sub-módulo Caixinhas & Investimentos (Financeiro). */
export function IconPiggyBank(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4.5 12.2c0-3.7 3.2-6.7 7.4-6.7 2.3 0 4.3.9 5.7 2.3h2.4c.5 0 .9.5.7 1l-.9 2c.5.8.8 1.7.8 2.6v1.8c0 .5-.4.9-.9.9h-1.4l-.6 2.1a.9.9 0 0 1-.9.7h-1.8a.9.9 0 0 1-.9-.9v-1.1c-.7.1-1.4.2-2.2.2-4.2 0-7.4-2.2-7.4-4.9z" />
      <path d="M4.5 12.7l-2-1v3.1l2-.6" />
      <circle cx="15.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="M9.5 5.6V4" />
      <path d="M7 6.3l-.9-1.4" />
    </svg>
  );
}
