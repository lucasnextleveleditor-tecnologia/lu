"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { IconSettings, IconFileText, IconImage, IconLayers } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Menu de configurações do módulo Orçamentos (Tipos de orçamento/Portfólio/
 * Catálogo de serviços) — antes eram 3 botões soltos na régua principal do
 * hub Comercial (`/admin/comercial`), que somados a Contratos e Novo
 * Orçamento deixavam a régua com 6 botões espremidos numa fileira só.
 * Viraram um menu (mesmo padrão visual/comportamental — glassmorphism,
 * fecha ao clicar fora/Esc — de `ExportMenuButton.tsx`), separado das ações
 * do dia a dia porque são telas de configuração/cadastro de apoio, não
 * coisa que se abre toda hora.
 */
export function ConfiguracoesOrcamentoMenu() {
  const { dict } = useLocale();
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAberto(false);
    }
    function aoPressionarEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarEsc);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarEsc);
    };
  }, []);

  const itens = [
    { href: "/admin/orcamentos/tipos", label: dict.orcamentos.tiposBtn, icon: IconFileText },
    { href: "/admin/orcamentos/portfolio", label: dict.orcamentos.portfolioBtn, icon: IconImage },
    { href: "/admin/orcamentos/catalogo", label: dict.orcamentos.catalogoBtn, icon: IconLayers },
  ];

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-lg border border-base-700 px-3 text-xs font-semibold text-ink-muted transition",
          "hover:border-ink-muted hover:bg-base-800 hover:text-ink-primary",
          aberto && "border-ink-muted bg-base-800 text-ink-primary"
        )}
      >
        <IconSettings className="h-4 w-4" />
        {dict.orcamentos.configuracoesBtn}
      </button>

      {aberto && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-base-700/80 bg-base-900/75 py-1.5 backdrop-blur-xl",
            "shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.06),0_24px_48px_-16px_rgba(0,0,0,0.85),0_0_40px_-12px_rgb(var(--glow-rgb) / 0.12)]"
          )}
        >
          {itens.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setAberto(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink-secondary transition hover:bg-white/5 hover:text-ink-primary"
            >
              <item.icon className="h-4 w-4 shrink-0 text-ink-muted" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
