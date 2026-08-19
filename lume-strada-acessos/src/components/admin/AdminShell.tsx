"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { PapelUsuario, PermissoesFuncionario } from "@/lib/types/database";
import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { AnnouncementBanner } from "@/components/branding/AnnouncementBanner";
import type { BannerConfig } from "@/components/branding/AnnouncementBanner";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ValoresVisiveisProvider } from "@/lib/valores-visiveis/ValoresVisiveisProvider";
import type { NavDict } from "@/lib/i18n/dictionaries/pt/nav";
import {
  IconUsers,
  IconActivity,
  IconBox,
  IconPalette,
  IconWallet,
  IconColumns,
  IconTarget,
  IconMessageCircle,
  IconLayoutGrid,
  IconBarChart2,
  IconChevronsLeft,
  IconChevronsRight,
} from "@/components/ui/icons";

// Menu separado em grupos — "Visão Geral" (o Dashboard, que junta Produção +
// Comercial + Financeiro numa tela só) no topo, "Comercial" (pré-vendas/CRM
// + clientes convertidos + Inbox do WhatsApp) depois, e o resto da operação
// da agência por último. Cada grupo pode crescer independente sem bagunçar
// a leitura do menu inteiro.
//
// `chave` é a mesma `ModuloChave` usada por `requireModulo`/`requireModuloOuRedirect`
// no servidor — o item some do menu de um funcionário sem aquela permissão
// ligada. Item sem `chave` (Dashboard) é visível pra qualquer membro da
// equipe. `adminOnly` (Aparência) nunca aparece pra funcionário, mesmo com
// todas as outras permissões ligadas — mesma regra do guard no servidor.
const NAV_GRUPOS = [
  {
    tituloKey: "grupoVisaoGeral",
    itens: [
      { href: "/admin/dashboard", labelKey: "dashboard", icon: IconLayoutGrid, chave: null },
      // Mesmo espírito do Dashboard (chave: null — visível pra qualquer
      // membro da equipe, sem checagem de módulo aqui no menu): a checagem
      // FINA de quais relatórios cada um vê mora dentro da própria página
      // (`/admin/relatorios/page.tsx`, mesmo padrão de `cardVisivel` já
      // usado no Dashboard) — um funcionário sem nenhuma permissão extra
      // simplesmente vê o Hub vazio, com uma orientação pra falar com o
      // admin, em vez do link sumir do menu.
      { href: "/admin/relatorios", labelKey: "relatorios", icon: IconBarChart2, chave: null },
    ],
  },
  {
    tituloKey: "grupoComercial",
    itens: [
      { href: "/admin/comercial", labelKey: "crmVendas", icon: IconTarget, chave: "comercial" },
      { href: "/admin/whatsapp", labelKey: "whatsapp", icon: IconMessageCircle, chave: "whatsapp" },
      { href: "/admin", labelKey: "cadastros", icon: IconUsers, chave: "clientes" },
    ],
  },
  {
    tituloKey: "grupoGestao",
    itens: [
      { href: "/admin/financeiro", labelKey: "financeiro", icon: IconWallet, chave: "financeiro" },
      { href: "/admin/producao", labelKey: "producaoTarefas", icon: IconColumns, chave: "producao" },
      { href: "/admin/trafego", labelKey: "trafegoMetas", icon: IconActivity, chave: "trafego" },
      { href: "/admin/inventario", labelKey: "inventarioPatrimonio", icon: IconBox, chave: "inventario" },
      { href: "/admin/aparencia", labelKey: "aparencia", icon: IconPalette, chave: null, adminOnly: true },
    ],
  },
] as const satisfies ReadonlyArray<{
  tituloKey: keyof NavDict;
  itens: ReadonlyArray<{
    href: string;
    labelKey: keyof NavDict;
    icon: typeof IconUsers;
    chave: string | null;
    adminOnly?: boolean;
  }>;
}>;

/** Preferência é por navegador (localStorage), não por conta — o valor salvo no branding é só o PADRÃO inicial de cada sessão nova. */
const STORAGE_KEY = "lsf_admin_sidebar_colapsada";

interface AdminShellProps {
  logoUrl: string | null;
  /** Nome do APP mostrado no topo da sidebar (`companies.nome_app`, editável em Aparência) — nunca o nome literal de uma empresa específica. Default "App Gestão". */
  nomeApp: string;
  nome: string;
  email: string;
  colapsadoPadrao: boolean;
  papel: PapelUsuario;
  permissoes: PermissoesFuncionario;
  /** Já resolvido pelo `admin/layout.tsx` (`null` quando `banner_ativo_admin` está desligado ou o título está vazio) — aparece no topo de TODA página admin/funcionário, dashboards inclusos, porque este é o único wrapper compartilhado por todas elas. */
  banner: BannerConfig | null;
  children: React.ReactNode;
}

export function AdminShell({ logoUrl, nomeApp, nome, email, colapsadoPadrao, papel, permissoes, banner, children }: AdminShellProps) {
  const pathname = usePathname();
  const { dict } = useLocale();
  const [colapsado, setColapsado] = useState(colapsadoPadrao);

  // Mesma regra de autorização do servidor (`requireModulo`/`requireAdmin`),
  // só que aqui é pra decidir o que MOSTRAR no menu — a permissão de
  // verdade continua sendo sempre reforçada no servidor (Server Action +
  // RLS), o filtro aqui é só pra não deixar o funcionário nem ver um link
  // que vai barrar.
  function itemVisivel(item: { chave: string | null; adminOnly?: boolean }): boolean {
    if (papel === "admin") return true;
    if (item.adminOnly) return false;
    if (!item.chave) return true;
    return permissoes?.[item.chave as keyof PermissoesFuncionario] === true;
  }

  const gruposVisiveis = NAV_GRUPOS.map((grupo) => ({
    ...grupo,
    itens: grupo.itens.filter(itemVisivel),
  })).filter((grupo) => grupo.itens.length > 0);

  // Sincroniza com a preferência pessoal salva no navegador DEPOIS da
  // primeira renderização — evita mismatch de hidratação (servidor não tem
  // acesso ao localStorage, então o primeiro render em ambos os lados usa
  // sempre `colapsadoPadrao`, vindo do branding_config).
  useEffect(() => {
    const salvo = window.localStorage.getItem(STORAGE_KEY);
    if (salvo !== null) setColapsado(salvo === "1");
  }, []);

  function alternar() {
    setColapsado((atual) => {
      const novo = !atual;
      window.localStorage.setItem(STORAGE_KEY, novo ? "1" : "0");
      return novo;
    });
  }

  return (
    <ValoresVisiveisProvider>
    <div className="min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-base-800 bg-base-900/70 backdrop-blur-sm transition-[width] duration-200",
          colapsado ? "w-[72px]" : "w-64"
        )}
      >
        <div className={cn("flex items-center gap-2.5 border-b border-base-800 px-4 py-4", colapsado && "justify-center px-2")}>
          <BrandingLogo logoUrl={logoUrl} sizeClassName="h-8" />
          {!colapsado && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">{nomeApp}</p>
              <p className="truncate text-[11px] text-ink-muted">{dict.nav.painelAdministrativo}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {gruposVisiveis.map((grupo, i) => (
            <div key={grupo.tituloKey} className={cn(i > 0 && colapsado && "border-t border-base-800 pt-3")}>
              {!colapsado && (
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  {dict.nav[grupo.tituloKey]}
                </p>
              )}
              <div className="space-y-1">
                {grupo.itens.map((item) => {
                  const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
                  const Icon = item.icon;
                  const label = dict.nav[item.labelKey];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={colapsado ? label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                        colapsado && "justify-center px-0",
                        active
                          ? // Item ativo vira um "pill" sólido branco (mesmos tokens do botão
                            // primário: `bg-accent` + `text-base-950`) — bem mais contrastado
                            // que um simples highlight sutil, igual ao destaque forte do item
                            // ativo em dashboards de referência, sem sair do preto/branco fixo.
                            "bg-accent text-base-950 shadow-[0_8px_20px_-8px_rgba(255,255,255,0.45)]"
                          : "font-medium text-ink-muted hover:bg-base-800 hover:text-ink-secondary"
                      )}
                    >
                      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-base-950" : undefined)} />
                      {!colapsado && <span className="truncate">{label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={cn("border-t border-base-800 p-3", colapsado && "px-2")}>
          {!colapsado && (
            <p className="mb-2 truncate px-1 text-xs text-ink-muted" title={email}>
              {nome || email}
            </p>
          )}
          <div className={cn("flex items-center gap-2", colapsado && "flex-col")}>
            <LogoutButton iconOnly={colapsado} className={colapsado ? undefined : "flex-1"} />
            <button
              onClick={alternar}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-base-600 text-ink-muted transition hover:border-ink-muted hover:text-ink-primary"
              aria-label={colapsado ? dict.nav.expandirMenu : dict.nav.recolherMenu}
              title={colapsado ? dict.nav.expandirMenu : dict.nav.recolherMenu}
            >
              {colapsado ? <IconChevronsRight className="h-4 w-4" /> : <IconChevronsLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Fixo no canto superior direito da VIEWPORT (não da sidebar/main), pra
          ficar sempre no mesmo lugar em toda tela do painel — mesmo padrão de
          posição usado na tela de login e no portal do cliente. */}
      <div className="fixed right-4 top-4 z-30">
        <LanguageSwitcher />
      </div>

      <main className={cn("min-h-screen transition-[padding] duration-200", colapsado ? "pl-[72px]" : "pl-64")}>
        <div className="mx-auto max-w-6xl px-6 py-8">
          {banner && <AnnouncementBanner {...banner} className="mb-6" />}
          {children}
        </div>
      </main>
    </div>
    </ValoresVisiveisProvider>
  );
}
