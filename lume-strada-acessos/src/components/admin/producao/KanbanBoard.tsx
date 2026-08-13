"use client";

import { useEffect, useState, useTransition } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { StatusTarefa, TarefaComRelacoes } from "@/lib/types/producao";
import { STATUS_TAREFA_META, STATUS_TAREFA_ORDEM } from "@/lib/utils/producao";
import { moverStatusTarefa } from "@/app/admin/producao/actions";
import { TarefaCard } from "@/components/admin/producao/TarefaCard";
import { cn } from "@/lib/utils/cn";

interface KanbanBoardProps {
  tarefas: TarefaComRelacoes[];
  onAbrirTarefa: (id: string) => void;
}

/**
 * Board com drag-and-drop (`@hello-pangea/dnd`, fork mantido do
 * react-beautiful-dnd) — arrastar um card muda o status na hora, com estado
 * OTIMISTA local (não espera a resposta do servidor pra mostrar o card na
 * coluna nova) e sincroniza de volta com o servidor em segundo plano.
 */
export function KanbanBoard({ tarefas, onAbrirTarefa }: KanbanBoardProps) {
  const [tarefasLocais, setTarefasLocais] = useState(tarefas);
  const [, startTransition] = useTransition();

  useEffect(() => setTarefasLocais(tarefas), [tarefas]);

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
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
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
                    "flex w-72 shrink-0 flex-col rounded-2xl border p-3 transition-colors",
                    snapshot.isDraggingOver ? "border-accent/50 bg-base-900/60" : "border-base-800 bg-base-950/40"
                  )}
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{meta.label}</p>
                    <span className="rounded-full bg-base-800 px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
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
                            className={snapshotDrag.isDragging ? "rotate-1" : undefined}
                          >
                            <TarefaCard tarefa={tarefa} onClick={() => onAbrirTarefa(tarefa.id)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {tarefasDaColuna.length === 0 && (
                      <p className="rounded-lg border border-dashed border-base-800 p-4 text-center text-xs text-ink-muted">
                        Nenhuma tarefa aqui.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
