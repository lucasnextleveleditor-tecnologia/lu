"use client";

import { fmtDataCurta, todayISO, addDaysISO } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { IconCalendar } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { DatePicker } from "@/components/ui/DatePicker";

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

/**
 * Seletor global de período — usado no topo do Hub de Relatórios pra
 * filtrar TODOS os gráficos de uma vez (nenhum módulo tem seletor de data
 * próprio dentro do Hub, de propósito: um único período pro Comercial, pro
 * Financeiro, pro Tráfego etc., pra dar pra comparar os números todos
 * olhando pra mesma janela de tempo). Presets rápidos + dois `DatePicker`
 * (calendário próprio do sistema) pro período customizado.
 */
export function DateRangePicker({ inicio, fim, onChange, className }: DateRangePickerProps) {
  const { dict } = useLocale();

  const PRESETS: Preset[] = [
    { label: dict.relatorios.presetHoje, calcular: () => ({ inicio: todayISO(), fim: todayISO() }) },
    { label: dict.relatorios.preset7Dias, calcular: () => ({ inicio: addDaysISO(todayISO(), -6), fim: todayISO() }) },
    { label: dict.relatorios.preset30Dias, calcular: () => ({ inicio: addDaysISO(todayISO(), -29), fim: todayISO() }) },
    { label: dict.relatorios.presetEsteMes, calcular: () => ({ inicio: inicioDoMesISO(), fim: todayISO() }) },
    { label: dict.relatorios.presetEsteAno, calcular: () => ({ inicio: inicioDoAnoISO(), fim: todayISO() }) },
  ];

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
        <span className="hidden text-xs font-semibold uppercase tracking-wide sm:inline">{dict.relatorios.periodoLabel}</span>
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
        <DatePicker
          value={inicio}
          max={fim}
          onChange={(v) => onChange(v, fim)}
          aria-label={dict.relatorios.dataInicialAria}
          className="w-[136px]"
        />
        <span className="text-xs text-ink-muted">{dict.relatorios.ateLabel}</span>
        <DatePicker
          value={fim}
          min={inicio}
          max={todayISO()}
          onChange={(v) => onChange(inicio, v)}
          aria-label={dict.relatorios.dataFinalAria}
          className="w-[136px]"
        />
      </div>

      <p className="ml-auto hidden text-xs text-ink-muted md:block">
        {fmtDataCurta(inicio)} — {fmtDataCurta(fim)}
      </p>
    </div>
  );
}
