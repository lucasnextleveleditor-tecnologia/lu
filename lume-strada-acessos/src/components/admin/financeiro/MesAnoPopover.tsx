"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconCalendar, IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface MesAnoPopoverProps {
  /** Mês/ano atualmente selecionado na tela (UTC, dia 1) — mesmo formato usado no resto do `MesNav`. */
  referencia: Date;
  contexto: string;
  basePath: string;
}

/** Nomes curtos dos 12 meses — SEMPRE em pt-BR, mesma decisão já tomada em `fmtMesAno`/`DatePicker`: só o texto estático da interface (rótulos, botões) muda de idioma, os VALORES de data em si (nomes de mês/dia) não. */
const MESES_ABREV = Array.from({ length: 12 }, (_, i) =>
  new Date(Date.UTC(2000, i, 1))
    .toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" })
    .replace(".", "")
);

/**
 * Popover de calendário pro rótulo "Mês de Ano" do `MesNav` — clicar no
 * texto abre um mini-calendário com navegação por ANO + grade dos 12
 * meses, pra pular direto pra qualquer mês/ano sem precisar clicar em ‹ ›
 * repetidas vezes. Mesmo padrão de popover do `DatePicker`/
 * `LanguageSwitcher` (outside-click + Esc fecham). Navegação continua
 * sendo por `<Link>` (troca a URL — `mes=yyyy-MM`), preservando o padrão
 * de "sem estado próprio pros dados" do resto do `MesNav`.
 */
export function MesAnoPopover({ referencia, contexto, basePath }: MesAnoPopoverProps) {
  const { dict } = useLocale();
  const [aberto, setAberto] = useState(false);
  const [anoExibido, setAnoExibido] = useState(referencia.getUTCFullYear());
  const wrapperRef = useRef<HTMLDivElement>(null);

  function abrir() {
    setAnoExibido(referencia.getUTCFullYear());
    setAberto(true);
  }

  useEffect(() => {
    if (!aberto) return;
    function handlePointerDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setAberto(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [aberto]);

  const sufixoContexto = contexto !== "todos" ? `&contexto=${contexto}` : "";
  const mesSelecionado = referencia.getUTCMonth();
  const anoSelecionado = referencia.getUTCFullYear();
  const hoje = new Date();

  const label = referencia
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })
    .replace(/^./, (c) => c.toUpperCase());

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => (aberto ? setAberto(false) : abrir())}
        className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm font-medium capitalize text-ink-primary transition hover:bg-base-800"
        aria-label={dict.financeiro.abrirCalendarioMesAria}
      >
        <IconCalendar className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
        {label}
      </button>

      {aberto && (
        <div className="absolute left-1/2 top-[calc(100%+6px)] z-50 w-[260px] -translate-x-1/2 rounded-xl border border-base-700 bg-base-900 p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAnoExibido((a) => a - 1)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition hover:bg-base-800 hover:text-ink-primary"
              aria-label={dict.financeiro.anoAnteriorAria}
            >
              <IconChevronLeft className="h-3.5 w-3.5" />
            </button>
            <p className="text-xs font-semibold text-ink-primary">{anoExibido}</p>
            <button
              type="button"
              onClick={() => setAnoExibido((a) => a + 1)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition hover:bg-base-800 hover:text-ink-primary"
              aria-label={dict.financeiro.proximoAnoAria}
            >
              <IconChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MESES_ABREV.map((nomeMes, indiceMes) => {
              const isSelecionado = anoExibido === anoSelecionado && indiceMes === mesSelecionado;
              const isMesAtual = anoExibido === hoje.getFullYear() && indiceMes === hoje.getMonth();
              return (
                <Link
                  key={nomeMes}
                  href={`${basePath}?mes=${anoExibido}-${String(indiceMes + 1).padStart(2, "0")}${sufixoContexto}`}
                  onClick={() => setAberto(false)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-md text-xs capitalize transition",
                    isSelecionado
                      ? "bg-accent font-semibold text-base-950"
                      : isMesAtual
                        ? "border border-accent/50 text-ink-primary hover:bg-base-800"
                        : "text-ink-secondary hover:bg-base-800 hover:text-ink-primary"
                  )}
                >
                  {nomeMes}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
