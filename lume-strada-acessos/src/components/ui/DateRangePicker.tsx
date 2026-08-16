"use client";

import { fmtDataCurta, todayISO, addDaysISO } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { IconCalendar } from "@/components/ui/icons";

interface DateRangePickerProps {
  inicio: string; // ISO date
  fim: string; // ISO date
  onChange: (inicio: string, fim: string) => void;
  className?: string;
}

interface Preset {
  label: string;
  calcular: () => { inicio: string; fim: string };
}

/** Início do mês corrente (ISO), sem depender de `limitesDoMes` (que trabalha com `Date`, não string) — evita import cruzado só por causa disso. */
function inicioDoMesISO(): string {
  const hoje = todayISO();
  return `${hoje.slice(0, 7)}-01`;
}

function inicioDoAnoISO(): string {
  return `${todayISO().slice(0, 4)}-01-01`;
}

const PRESETS: Preset[] = [
  { label: "Hoje", calcular: () => ({ inicio: todayISO(), fim: todayISO() }) },
  { label: "7 dias", calcular: () => ({ inicio: addDaysISO(todayISO(), -6), fim: todayISO() }) },
  { label: "30 dias", calcular: () => ({ inicio: addDaysISO(todayISO(), -29), fim: todayISO() }) },
  { label: "Este mês", calcular: () => ({ inicio: inicioDoMesISO(), fim: todayISO() }) },
  { label: "Este ano", calcular: () => ({ inicio: inicioDoAnoISO(), fim: todayISO() }) },
];

/**
 * Seletor global de período — usado no topo do Hub de Relatórios pra
 * filtrar TODOS os gráficos de uma vez (nenhum módulo tem seletor de data
 * próprio dentro do Hub, de propósito: um único período pro Comercial, pro
 * Financeiro, pro Tráfego etc., pra dar pra comparar os números todos
 * olhando pra mesma janela de tempo). Presets rápidos + dois campos de data
 * nativos (`<input type="date">`, sem dependência de biblioteca de
 * calendário) pro período customizado.
 */
export function DateRangePicker({ inicio, fim, onChange, className }: DateRangePickerProps) {
  const presetAtivo = PRESETS.find((p) => {
    const { inicio: pi, fim: pf } = p.calcular();
    return pi === inicio && pf === fim;
  });

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-base-700 bg-base-900/80 p-3 backdrop-blur-sm",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_20px_40px_-28px_rgba(255,255,255,0.35)]",
        className
      )}
    >
      <div className="flex items-center gap-1.5 pl-1 text-ink-muted">
        <IconCalendar className="h-4 w-4" />
        <span className="hidden text-xs font-semibold uppercase tracking-wide sm:inline">Período</span>
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded-lg border border-base-700 bg-base-950/60 p-1">
        {PRESETS.map((p) => {
          const { inicio: pi, fim: pf } = p.calcular();
          const ativo = presetAtivo?.label === p.label;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(pi, pf)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-semibold transition",
                ativo ? "bg-accent text-base-950" : "text-ink-muted hover:bg-base-800 hover:text-ink-secondary"
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={inicio}
          max={fim}
          onChange={(e) => onChange(e.target.value, fim)}
          aria-label="Data inicial"
          className="rounded-lg border border-base-700 bg-base-950/60 px-2.5 py-1.5 text-xs text-ink-primary [color-scheme:dark] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        />
        <span className="text-xs text-ink-muted">até</span>
        <input
          type="date"
          value={fim}
          min={inicio}
          max={todayISO()}
          onChange={(e) => onChange(inicio, e.target.value)}
          aria-label="Data final"
          className="rounded-lg border border-base-700 bg-base-950/60 px-2.5 py-1.5 text-xs text-ink-primary [color-scheme:dark] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        />
      </div>

      <p className="ml-auto hidden text-xs text-ink-muted md:block">
        {fmtDataCurta(inicio)} — {fmtDataCurta(fim)}
      </p>
    </div>
  );
}
