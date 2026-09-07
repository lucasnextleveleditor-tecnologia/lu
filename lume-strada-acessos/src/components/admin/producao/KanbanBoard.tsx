"use client";

import { useEffect, useState, useTransition } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { StatusTarefa, TarefaComRelacoes } from "@/lib/types/producao";
import { STATUS_TAREFA_META, STATUS_TAREFA_ORDEM } from "@/lib/utils/producao";
import { TONE_META } from "@/lib/utils/tone";
import { moverStatusTarefa } from "@/app/admin/producao/actions";
import { TarefaCard } from "@/components/admin/producao/TarefaCard";
import { IconClipboardList, IconColumns, IconLayoutGrid } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface KanbanBoardProps {
  tarefas: TarefaComRelacoes[];
  onAbrirTarefa: (id: string) => void;
}

type LayoutKanban = "linha" | "grade";

/** Preferência é por navegador (localStorage), não por conta — mesmo padrão do colapso da sidebar em `AdminShell.tsx`. */
const STORAGE_KEY_LAYOUT = "lsf_producao_kanban_layout";

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
  const { dict } = useLocale();
  const [tarefasLocais, setTarefasLocais] = useState(tarefas);
  const [, startTransition] = useTransition();
  const [layout, setLayout] = useState<LayoutKanban>("linha");

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
  }, []);

  function alternarLayout(novo: LayoutKanban) {
    setLayout(novo);
    window.localStorage.setItem(STORAGE_KEY_LAYOUT, novo);
  }

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
      <div className="flex justify-end">
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={layout === "linha" ? "flex gap-4 overflow-x-auto pb-2" : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"}>
          {STATUS_TAREFA_ORDEM.map((status) => {
            const meta = STATUS_TAREFA_META[status];
            const tarefasDaColuna = tarefasLocais.filter((t) => t.status === status);
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
