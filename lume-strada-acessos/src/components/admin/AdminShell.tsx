"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { LogoutButton } from "@/components/auth/LogoutButton";
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
  IconChevronsLeft,
  IconChevronsRight,
} from "@/components/ui/icons";

// Menu separado em grupos — "Visão Geral" (o Dashboard, que junta Produção +
// Comercial + Financeiro numa tela só) no topo, "Comercial" (pré-vendas/CRM
// + clientes convertidos + Inbox do WhatsApp) depois, e o resto da operação
// da agência por último. Cada grupo pode crescer independente sem bagunçar
// a leitura do menu inteiro.
const NAV_GRUPOS = [
  {
    titulo: "Visão Geral",
    itens: [{ href: "/admin/dashboard", label: "Dashboard", icon: IconLayoutGrid }],
  },
  {
    titulo: "Comercial",
    itens: [
      { href: "/admin/comercial", label: "CRM & Vendas", icon: IconTarget },
      { href: "/admin/whatsapp", label: "WhatsApp", icon: IconMessageCircle },
      { href: "/admin", label: "Clientes & Acessos", icon: IconUsers },
    ],
  },
  {
    titulo: "Gestão",
    itens: [
      { href: "/admin/financeiro", label: "Financeiro", icon: IconWallet },
      { href: "/admin/producao", label: "Produção & Tarefas", icon: IconColumns },
      { href: "/admin/trafego", label: "Tráfego & Metas", icon: IconActivity },
      { href: "/admin/inventario", label: "Inventário & Patrimônio", icon: IconBox },
      { href: "/admin/aparencia", label: "Aparência", icon: IconPalette },
    ],
  },
] as const;

/** Preferência é por navegador (localStorage), não por conta — o valor salvo no branding é só o PADRÃO inicial de cada sessão nova. */
const STORAGE_KEY = "lsf_admin_sidebar_colapsada";

interface AdminShellProps {
  logoUrl: string | null;
  nome: string;
  email: string;
  colapsadoPadrao: boolean;
  children: React.ReactNode;
}

export function AdminShell({ logoUrl, nome, email, colapsadoPadrao, children }: AdminShellProps) {
  const pathname = usePathname();
  const [colapsado, setColapsado] = useState(colapsadoPadrao);

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
              <p className="truncate text-sm font-semibold tracking-tight">Lume Strada Filmes</p>
              <p className="truncate text-[11px] text-ink-muted">Painel Administrativo</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {NAV_GRUPOS.map((grupo, i) => (
            <div key={grupo.titulo} className={cn(i > 0 && colapsado && "border-t border-base-800 pt-3")}>
              {!colapsado && <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{grupo.titulo}</p>}
              <div className="space-y-1">
                {grupo.itens.map((item) => {
                  const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={colapsado ? item.label : undefined}
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
                      {!colapsado && <span className="truncate">{item.label}</span>}
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
              aria-label={colapsado ? "Expandir menu" : "Recolher menu"}
              title={colapsado ? "Expandir menu" : "Recolher menu"}
            >
              {colapsado ? <IconChevronsRight className="h-4 w-4" /> : <IconChevronsLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>

      <main className={cn("min-h-screen transition-[padding] duration-200", colapsado ? "pl-[72px]" : "pl-64")}>
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
