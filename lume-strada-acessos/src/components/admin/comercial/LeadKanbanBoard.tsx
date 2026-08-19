"use client";

import { useEffect, useState, useTransition } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { LeadComRelacoes, StatusLead } from "@/lib/types/comercial";
import { STATUS_LEAD_ORDEM } from "@/lib/utils/comercial";
import { fmtBRL } from "@/lib/utils/format";
import { moverStatusLead } from "@/app/admin/comercial/actions";
import { LeadCard } from "@/components/admin/comercial/LeadCard";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ComercialDict } from "@/lib/i18n/dictionaries/pt/comercial";

interface LeadKanbanBoardProps {
  leads: LeadComRelacoes[];
  onAbrirLead: (id: string) => void;
}

function etapaLabel(dict: ComercialDict, status: StatusLead): string {
  const MAPA: Record<StatusLead, string> = {
    lead_frio: dict.etapaLeadFrio,
    contato_inicial: dict.etapaContatoInicial,
    reuniao_realizada: dict.etapaReuniaoRealizada,
    proposta_enviada: dict.etapaPropostaEnviada,
    negociacao: dict.etapaNegociacao,
    fechado_ganha: dict.etapaFechadoGanha,
    perdido: dict.etapaPerdido,
  };
  return MAPA[status];
}

/**
 * Funil de vendas — Kanban PRÓPRIO do módulo Comercial (não é o mesmo
 * componente do Kanban de Produção/Tarefas — colunas, cards e regras de
 * negócio são completamente diferentes, mesmo usando a mesma biblioteca de
 * drag-and-drop por baixo).
 */
export function LeadKanbanBoard({ leads, onAbrirLead }: LeadKanbanBoardProps) {
  const { dict } = useLocale();
  const [leadsLocais, setLeadsLocais] = useState(leads);
  const [, startTransition] = useTransition();

  useEffect(() => setLeadsLocais(leads), [leads]);

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const novoStatus = destination.droppableId as StatusLead;
    setLeadsLocais((atual) => atual.map((l) => (l.id === draggableId ? { ...l, status: novoStatus } : l)));

    startTransition(async () => {
      await moverStatusLead(draggableId, novoStatus);
    });
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {STATUS_LEAD_ORDEM.map((status) => {
          const leadsDaColuna = leadsLocais.filter((l) => l.status === status);
          const totalColuna = leadsDaColuna.reduce((acc, l) => acc + (l.valor_estimado ?? 0), 0);
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
                  <div className="mb-1 flex items-center justify-between px-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{etapaLabel(dict.comercial, status)}</p>
                    <span className="rounded-full bg-base-800 px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                      {leadsDaColuna.length}
                    </span>
                  </div>
                  {totalColuna > 0 && <p className="mb-2.5 px-1 text-[11px] text-ink-muted">{fmtBRL(totalColuna)}</p>}

                  <div className="flex min-h-[80px] flex-1 flex-col gap-2.5">
                    {leadsDaColuna.map((lead, index) => (
                      <Draggable draggableId={lead.id} index={index} key={lead.id}>
                        {(providedDrag, snapshotDrag) => (
                          <div
                            ref={providedDrag.innerRef}
                            {...providedDrag.draggableProps}
                            {...providedDrag.dragHandleProps}
                            className={snapshotDrag.isDragging ? "rotate-1" : undefined}
                          >
                            <LeadCard lead={lead} onClick={() => onAbrirLead(lead.id)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {leadsDaColuna.length === 0 && (
                      <p className="rounded-lg border border-dashed border-base-800 p-4 text-center text-xs text-ink-muted">
                        {dict.comercial.colunaVazia}
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
