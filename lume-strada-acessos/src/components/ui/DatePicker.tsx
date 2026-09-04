"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { fmtDataCurta } from "@/lib/utils/format";
import { IconCalendar, IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const LARGURA_POPOVER = 280;
const ALTURA_POPOVER_ESTIMADA = 320; // usado só na 1ª medição, antes do popover ter layout real
const MARGEM_VIEWPORT = 8;

interface DatePickerProps {
  /** ISO yyyy-mm-dd, ou "" quando vazio. */
  value: string;
  onChange: (iso: string) => void;
  /** ISO yyyy-mm-dd — dias fora do intervalo aparecem esmaecidos e não clicáveis. */
  min?: string;
  max?: string;
  placeholder?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  /** Mostra um "×" pra limpar o valor quando preenchido — usado em filtros opcionais (não em campos obrigatórios de formulário). */
  clearable?: boolean;
  /**
   * Disparado quando o popover fecha (clique fora, Esc, seleção de um dia ou
   * clique no próprio campo pra fechar) — equivalente mais próximo do
   * `onBlur` do `<input type="date">` nativo que este componente substitui,
   * já que o calendário não tem foco de campo de texto tradicional.
   */
  onBlur?: () => void;
  "aria-label"?: string;
}

/** Matriz de semanas do mês de `referencia` (cada dia como ISO, ou null fora do mês) — mesmo algoritmo usado no Calendário Geral/Metas, duplicado aqui de propósito: este é um componente `ui/` compartilhado por TODOS os módulos, então não pode depender do util interno de nenhum um deles. */
function gradeDoMes(referencia: Date): (string | null)[][] {
  const ano = referencia.getUTCFullYear();
  const mes = referencia.getUTCMonth();
  const primeiroDiaSemana = new Date(Date.UTC(ano, mes, 1)).getUTCDay();
  const totalDias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();

  const celulas: (string | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => {
      const dia = i + 1;
      return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    }),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  const semanas: (string | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  return semanas;
}

function addMeses(referencia: Date, delta: number): Date {
  return new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth() + delta, 1));
}

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * "Mês/ano" pro cabeçalho do calendário — SEMPRE em pt-BR, igual a todo o
 * resto de formatação de data/número/moeda do sistema (`fmtData`, `fmtBRL`
 * etc.): só o TEXTO estático da interface (rótulos/botões) muda com o
 * idioma escolhido, não o jeito de exibir datas — mesma decisão já tomada
 * na entrega de i18n.
 */
function fmtMesAno(referencia: Date): string {
  const label = referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const DIA_KEYS = ["diaDom", "diaSeg", "diaTer", "diaQua", "diaQui", "diaSex", "diaSab"] as const;

/**
 * Campo de data customizado (calendário próprio, no visual do sistema) —
 * substitui `<input type="date">` em todo lugar. Guarda/expõe sempre ISO
 * (yyyy-mm-dd), igual ao input nativo que substitui, então nenhum código
 * que já consome esse valor precisa mudar.
 */
export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder,
  id,
  required,
  disabled,
  className,
  clearable = false,
  onBlur,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const { dict } = useLocale();
  const [aberto, setAberto] = useState(false);
  const [referencia, setReferencia] = useState(() => {
    const base = value ? new Date(`${value}T00:00:00Z`) : new Date();
    return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
  });
  /** Coordenadas do popover (portal em `document.body`, `position: fixed`) — `null` até a 1ª medição, ver `useLayoutEffect` abaixo. */
  const [posicao, setPosicao] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  function fechar() {
    setAberto(false);
    setPosicao(null);
    onBlur?.();
  }

  useEffect(() => {
    if (!aberto) return;
    function handlePointerDown(e: MouseEvent) {
      const alvo = e.target as Node;
      if (triggerRef.current?.contains(alvo)) return;
      if (popoverRef.current?.contains(alvo)) return;
      fechar();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  // Calcula onde o popover aparece na VIEWPORT (não relativo ao pai no
  // fluxo do documento) — é isso que faz o calendário escapar de qualquer
  // ancestral com `overflow-hidden/auto` (ex: modais com scroll interno,
  // como o de Novo Lead), que antes cortava o calendário pela metade. Mede
  // a altura real já renderizada (fora da tela na 1ª passada) antes de
  // decidir abrir pra baixo ou pra cima, e recalcula ao rolar/redimensionar
  // enquanto aberto.
  useLayoutEffect(() => {
    if (!aberto || !triggerRef.current) return;

    function posicionar() {
      const gatilho = triggerRef.current;
      if (!gatilho) return;
      const rect = gatilho.getBoundingClientRect();
      const alturaPopover = popoverRef.current?.offsetHeight ?? ALTURA_POPOVER_ESTIMADA;

      let top = rect.bottom + 6;
      if (top + alturaPopover > window.innerHeight - MARGEM_VIEWPORT) {
        top = Math.max(MARGEM_VIEWPORT, rect.top - alturaPopover - 6);
      }

      let left = rect.left;
      if (left + LARGURA_POPOVER > window.innerWidth - MARGEM_VIEWPORT) {
        left = Math.max(MARGEM_VIEWPORT, window.innerWidth - LARGURA_POPOVER - MARGEM_VIEWPORT);
      }

      setPosicao({ top, left });
    }

    posicionar();
    window.addEventListener("scroll", posicionar, true);
    window.addEventListener("resize", posicionar);
    return () => {
      window.removeEventListener("scroll", posicionar, true);
      window.removeEventListener("resize", posicionar);
    };
  }, [aberto, referencia]);

  function abrir() {
    if (disabled) return;
    const base = value ? new Date(`${value}T00:00:00Z`) : new Date();
    setReferencia(new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1)));
    setAberto(true);
  }

  function selecionar(dia: string) {
    onChange(dia);
    fechar();
  }

  function irParaHoje() {
    selecionar(hojeISO());
  }

  const semanas = gradeDoMes(referencia);
  const hoje = hojeISO();

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => (aberto ? fechar() : abrir())}
        aria-label={ariaLabel}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-left text-sm transition",
          "focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30",
          disabled && "opacity-60",
          value ? "text-ink-primary" : "text-ink-muted"
        )}
      >
        <IconCalendar className="h-4 w-4 shrink-0 text-ink-muted" />
        <span className="flex-1 truncate">{value ? fmtDataCurta(value) : (placeholder ?? dict.common.dataPlaceholder)}</span>
        {clearable && value && (
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            aria-label={dict.common.limpar}
            className="shrink-0 text-ink-muted transition hover:text-ink-primary"
          >
            ×
          </span>
        )}
      </button>

      {aberto &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: posicao?.top ?? 0,
              left: posicao?.left ?? 0,
              width: LARGURA_POPOVER,
              visibility: posicao ? "visible" : "hidden",
            }}
            className="z-50 rounded-xl border border-base-700 bg-base-900 p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]"
          >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold capitalize text-ink-primary">{fmtMesAno(referencia)}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setReferencia((r) => addMeses(r, -1))}
                className="flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition hover:bg-base-800 hover:text-ink-primary"
                aria-label={dict.dashboard.mesAnterior}
              >
                <IconChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={irParaHoje}
                className="rounded-md px-1.5 py-0.5 text-[11px] font-medium text-ink-muted transition hover:bg-base-800 hover:text-ink-primary"
              >
                {dict.dashboard.hoje}
              </button>
              <button
                type="button"
                onClick={() => setReferencia((r) => addMeses(r, 1))}
                className="flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition hover:bg-base-800 hover:text-ink-primary"
                aria-label={dict.dashboard.proximoMes}
              >
                <IconChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium uppercase tracking-wide text-ink-muted">
            {DIA_KEYS.map((key) => (
              <div key={key} className="pb-1">
                {dict.dashboard[key]}
              </div>
            ))}
          </div>

          <div className="space-y-0.5">
            {semanas.map((semana, i) => (
              <div key={i} className="grid grid-cols-7 gap-0.5">
                {semana.map((dia, j) => {
                  if (!dia) return <div key={j} className="h-8" />;
                  const foraDoIntervalo = (min && dia < min) || (max && dia > max);
                  const isHoje = dia === hoje;
                  const isSelecionado = dia === value;
                  return (
                    <button
                      key={j}
                      type="button"
                      disabled={!!foraDoIntervalo}
                      onClick={() => selecionar(dia)}
                      className={cn(
                        "flex h-8 w-full items-center justify-center rounded-md text-xs transition",
                        foraDoIntervalo
                          ? "cursor-not-allowed text-ink-muted/30"
                          : isSelecionado
                            ? "bg-accent font-semibold text-base-950"
                            : isHoje
                              ? "border border-accent/50 text-ink-primary hover:bg-base-800"
                              : "text-ink-secondary hover:bg-base-800 hover:text-ink-primary"
                      )}
                    >
                      {Number(dia.slice(-2))}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}
