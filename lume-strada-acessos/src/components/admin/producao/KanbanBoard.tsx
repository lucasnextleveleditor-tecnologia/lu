"use client";

import { useEffect, useState, useTransition } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { StatusTarefa, TarefaComRelacoes } from "@/lib/types/producao";
import { STATUS_TAREFA_META, STATUS_TAREFA_ORDEM } from "@/lib/utils/producao";
import { TONE_META } from "@/lib/utils/tone";
import { moverStatusTarefa } from "@/app/admin/producao/actions";
import { TarefaCard } from "@/components/admin/producao/TarefaCard";
import { IconClipboardList, IconColumns, IconLayoutGrid, IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import {
  addDias,
  addMeses,
  diasDaSemanaDe,
  fmtIntervaloSemana,
  fmtMesAno,
  inicioDaSemana,
} from "@/lib/utils/producao";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface KanbanBoardProps {
  tarefas: TarefaComRelacoes[];
  onAbrirTarefa: (id: string) => void;
}

type LayoutKanban = "linha" | "grade";

/**
 * O recorte de tempo do quadro.
 *
 * `semanal` é onde o quadro abre, porque um Kanban com noventa cards não
 * responde "o que a gente entrega esta semana" — ele responde "o que existe",
 * que é outra pergunta, e quase nunca a primeira. `tudo` é o quadro inteiro,
 * sem filtro, a um clique de distância.
 */
type PeriodoKanban = "semanal" | "mensal" | "tudo";

/** Preferência é por navegador (localStorage), não por conta — mesmo padrão do colapso da sidebar em `AdminShell.tsx`. */
const STORAGE_KEY_LAYOUT = "lsf_producao_kanban_layout";
const STORAGE_KEY_PERIODO = "lsf_producao_kanban_periodo";

/**
 * Board com drag-and-drop (`@hello-pangea/dnd`, fork mantido do
 * react-beautiful-dnd) — arrastar um card muda o status na hora, com estado
 * OTIMISTA local (não espera a resposta do servidor pra mostrar o card na
 * coluna nova) e sincroniza de volta com o servidor em segundo plano.
 *
 * Duas opções de layout, alternáveis a qualquer momento: "linha" (todas as
 * colunas lado a lado, rola pro lado — o padrão de sempre) e "grade" (colunas
 * quebram de 3 em 3, empilha pra baixo — pra ver tudo sem rolar
 * horizontalmente). A escolha fica salva no navegador.
 */
export function KanbanBoard({ tarefas, onAbrirTarefa }: KanbanBoardProps) {
  const { dict, locale } = useLocale();
  const [tarefasLocais, setTarefasLocais] = useState(tarefas);
  const [, startTransition] = useTransition();
  const [layout, setLayout] = useState<LayoutKanban>("linha");
  // SEMANAL como estado de entrada: quem abre a Produção está perguntando "o
  // que a gente entrega esta semana", não "o que existe". O quadro inteiro
  // continua a um clique de distância, e a escolha de quem clicar fica salva —
  // então trocar para Mensal ou Tudo uma vez basta para sempre.
  const [periodo, setPeriodo] = useState<PeriodoKanban>("semanal");
  const [referencia, setReferencia] = useState(() => {
    const hoje = new Date();
    return new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
  });

  const statusLabel: Record<StatusTarefa, string> = {
    backlog: dict.producao.statusBacklog,
    a_fazer: dict.producao.statusAFazer,
    em_producao: dict.producao.statusEmProducao,
    revisao_interna: dict.producao.statusRevisaoInterna,
    preview_cliente: dict.producao.statusPreviewCliente,
    concluida: dict.producao.statusConcluida,
  };

  useEffect(() => setTarefasLocais(tarefas), [tarefas]);

  // Sincroniza com a preferência salva DEPOIS da primeira renderização —
  // evita mismatch de hidratação (servidor não tem acesso ao localStorage).
  useEffect(() => {
    const salvo = window.localStorage.getItem(STORAGE_KEY_LAYOUT);
    if (salvo === "linha" || salvo === "grade") setLayout(salvo);
    const periodoSalvo = window.localStorage.getItem(STORAGE_KEY_PERIODO);
    if (periodoSalvo === "semanal" || periodoSalvo === "mensal" || periodoSalvo === "tudo") {
      setPeriodo(periodoSalvo);
    }
  }, []);

  function alternarLayout(novo: LayoutKanban) {
    setLayout(novo);
    window.localStorage.setItem(STORAGE_KEY_LAYOUT, novo);
  }

  function alternarPeriodo(novo: PeriodoKanban) {
    setPeriodo(novo);
    window.localStorage.setItem(STORAGE_KEY_PERIODO, novo);
  }

  function andar(passo: -1 | 1) {
    setReferencia((r) => (periodo === "semanal" ? addDias(r, passo * 7) : addMeses(r, passo)));
  }

  const segundaDaSemana = inicioDaSemana(referencia);
  const primeiroDoMes = new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth(), 1));

  const rotuloPeriodo =
    periodo === "semanal"
      ? fmtIntervaloSemana(segundaDaSemana, addDias(segundaDaSemana, 6), locale)
      : fmtMesAno(primeiroDoMes);

  /**
   * O recorte, aplicado por PRAZO DE ENTREGA.
   *
   * Tarefa SEM prazo aparece em todos os recortes, sempre. Escondê-la seria o
   * erro mais caro possível aqui: um quadro que some com trabalho é pior do
   * que um quadro cheio, e tarefa sem prazo é justamente a que já corre risco
   * de ser esquecida. Ela não pertence a semana nenhuma — então pertence a
   * todas.
   */
  function dentroDoPeriodo(dataEntrega: string | null): boolean {
    if (periodo === "tudo") return true;
    if (!dataEntrega) return true;
    if (periodo === "semanal") {
      const dias = diasDaSemanaDe(segundaDaSemana);
      return dataEntrega >= dias[0]! && dataEntrega <= dias[6]!;
    }
    return dataEntrega.slice(0, 7) === primeiroDoMes.toISOString().slice(0, 7);
  }

  const tarefasNoPeriodo = tarefasLocais.filter((t) => dentroDoPeriodo(t.data_entrega));
  const semPrazo = periodo === "tudo" ? 0 : tarefasNoPeriodo.filter((t) => !t.data_entrega).length;

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const novoStatus = destination.droppableId as StatusTarefa;
    setTarefasLocais((atual) => atual.map((t) => (t.id === draggableId ? { ...t, status: novoStatus } : t)));

    startTransition(async () => {
      await moverStatusTarefa(draggableId, novoStatus);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Navegação de período — só aparece quando há período para navegar.
            Em "Tudo" não existe semana anterior, e um par de setas inertes é
            convite a clicar e não entender por que nada muda. */}
        {periodo !== "tudo" && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => andar(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
              aria-label={periodo === "semanal" ? dict.producao.semanaAnterior : dict.producao.mesAnterior}
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <p className="min-w-[9rem] text-center text-sm font-semibold capitalize">{rotuloPeriodo}</p>
            <button
              onClick={() => andar(1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
              aria-label={periodo === "semanal" ? dict.producao.proximaSemana : dict.producao.proximoMes}
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const hoje = new Date();
                setReferencia(new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())));
              }}
              className="rounded-lg border border-base-600 px-2.5 py-1 text-xs text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            >
              {dict.producao.irParaHoje}
            </button>
          </div>
        )}

        {semPrazo > 0 && (
          <p className="text-[11px] text-ink-muted">
            {dict.producao.kanbanSemPrazo.replace("{n}", String(semPrazo))}
          </p>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-base-700/70 bg-gradient-to-b from-base-900 to-base-950 p-1 shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.05)]">
            {(["semanal", "mensal", "tudo"] as const).map((p) => (
              <button
                key={p}
                onClick={() => alternarPeriodo(p)}
                aria-pressed={periodo === p}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all duration-200",
                  periodo === p ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
                )}
              >
                {p === "semanal"
                  ? dict.producao.visaoSemanal
                  : p === "mensal"
                    ? dict.producao.visaoMensal
                    : dict.producao.visaoTudo}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-lg border border-base-700/70 bg-gradient-to-b from-base-900 to-base-950 p-1 shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.05)]">
          <button
            onClick={() => alternarLayout("linha")}
            title={dict.producao.kanbanLayoutLinha}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all duration-200",
              layout === "linha" ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
            )}
          >
            <IconColumns className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => alternarLayout("grade")}
            title={dict.producao.kanbanLayoutGrade}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all duration-200",
              layout === "grade" ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
            )}
          >
            <IconLayoutGrid className="h-3.5 w-3.5" />
          </button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={layout === "linha" ? "flex gap-4 overflow-x-auto pb-2" : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"}>
          {STATUS_TAREFA_ORDEM.map((status) => {
            const meta = STATUS_TAREFA_META[status];
            const tarefasDaColuna = tarefasNoPeriodo.filter((t) => t.status === status);
            return (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex flex-col rounded-2xl border p-3 backdrop-blur-sm transition-all duration-300",
                      layout === "linha" ? "w-72 shrink-0" : "w-full",
                      snapshot.isDraggingOver
                        ? "border-accent/50 bg-base-900/70 shadow-[0_0_28px_-10px_rgb(var(--glow-rgb) / 0.18)]"
                        : "border-base-800/70 bg-base-950/50"
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", TONE_META[meta.tone].dotClassName)} />
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{statusLabel[status]}</p>
                      </div>
                      <span className="rounded-full border border-base-700/60 bg-gradient-to-b from-base-800 to-base-900 px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                        {tarefasDaColuna.length}
                      </span>
                    </div>

                    <div className="flex min-h-[80px] flex-1 flex-col gap-2.5">
                      {tarefasDaColuna.map((tarefa, index) => (
                        <Draggable draggableId={tarefa.id} index={index} key={tarefa.id}>
                          {(providedDrag, snapshotDrag) => (
                            <div
                              ref={providedDrag.innerRef}
                              {...providedDrag.draggableProps}
                              {...providedDrag.dragHandleProps}
                              className={cn(
                                "transition-transform",
                                snapshotDrag.isDragging && "rotate-1 scale-[1.02] drop-shadow-[0_16px_28px_rgba(0,0,0,0.6)]"
                              )}
                            >
                              <TarefaCard tarefa={tarefa} onClick={() => onAbrirTarefa(tarefa.id)} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {tarefasDaColuna.length === 0 && (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-base-900/40 py-8 text-center">
                          <IconClipboardList className="h-5 w-5 text-ink-muted/60" />
                          <p className="text-xs text-ink-muted">{dict.producao.nenhumaTarefaColuna}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
