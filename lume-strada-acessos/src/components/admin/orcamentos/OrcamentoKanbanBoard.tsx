"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { StatusOrcamento } from "@/lib/types/orcamentos";
import { STATUS_ORCAMENTO_ORDEM } from "@/lib/utils/orcamentos";
import { enviarOrcamento, marcarStatusManual } from "@/app/admin/orcamentos/actions";

import { OrcamentoKanbanCard, type OrcamentoDoKanban } from "@/components/admin/orcamentos/OrcamentoKanbanCard";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface OrcamentoKanbanBoardProps {
  orcamentos: OrcamentoDoKanban[];
}

/**
 * Colunas que só mudam SOZINHAS — "visualizado" quando o cliente abre o link
 * público (ver `buscarOrcamentoPublicoPorToken`), "expirado" quando a data
 * de validade passa (`calcularStatusExibicao`, calculado na hora, nunca
 * gravado). Não existe ação de servidor pra forçar nenhum dos dois — soltar
 * um card aqui é ignorado (ele volta pro lugar).
 */
const COLUNAS_SOMENTE_LEITURA: StatusOrcamento[] = ["visualizado", "expirado"];

/**
 * Funil de Propostas — Kanban dos orçamentos por status, mesmo padrão visual
 * e mesma biblioteca de drag-and-drop do `LeadKanbanBoard.tsx` (Comercial),
 * mas com regras de negócio próprias: arrastar pra "Enviado" chama
 * `enviarOrcamento` (gera/renova o link e a validade); arrastar pra
 * "Aprovado"/"Recusado"/"Rascunho" chama `marcarStatusManual` (ajuste manual
 * do admin, ex: "cliente aprovou por telefone"). Reordenar um card dentro da
 * MESMA coluna nunca dispara essas ações — evita, por exemplo, reenviar (e
 * resetar a validade de) um orçamento só porque a pessoa arrastou o card pra
 * cima na mesma coluna "Enviado".
 */
export function OrcamentoKanbanBoard({ orcamentos }: OrcamentoKanbanBoardProps) {
  const { dict, fmtMoeda } = useLocale();
  const router = useRouter();
  const [itensLocais, setItensLocais] = useState(orcamentos);
  const [erro, setErro] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => setItensLocais(orcamentos), [orcamentos]);

  const STATUS_LABEL: Record<StatusOrcamento, string> = {
    rascunho: dict.orcamentos.statusRascunho,
    enviado: dict.orcamentos.statusEnviado,
    visualizado: dict.orcamentos.statusVisualizado,
    aprovado: dict.orcamentos.statusAprovado,
    recusado: dict.orcamentos.statusRecusado,
    expirado: dict.orcamentos.statusExpirado,
  };

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const novoStatus = destination.droppableId as StatusOrcamento;
    const statusAnterior = itensLocais.find((o) => o.id === draggableId)?.statusExibicao;

    // Mesma coluna (só reordenando visualmente) — nada muda de status, então
    // não há nada pra persistir; sem isso, arrastar dentro de "Enviado"
    // chamaria `enviarOrcamento` de novo e resetaria a validade à toa.
    if (novoStatus === statusAnterior) return;

    setErro(null);

    if (COLUNAS_SOMENTE_LEITURA.includes(novoStatus)) {
      setErro(dict.orcamentos.funilColunaSomenteLeitura);
      return;
    }

    setItensLocais((atual) => atual.map((o) => (o.id === draggableId ? { ...o, statusExibicao: novoStatus } : o)));

    startTransition(async () => {
      const result = novoStatus === "enviado" ? await enviarOrcamento(draggableId) : await marcarStatusManual(draggableId, novoStatus as "rascunho" | "aprovado" | "recusado");
      if (!result.ok) {
        setErro(result.error);
        if (statusAnterior) setItensLocais((atual) => atual.map((o) => (o.id === draggableId ? { ...o, statusExibicao: statusAnterior } : o)));
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      {erro && <p className="text-sm text-danger">{erro}</p>}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {STATUS_ORCAMENTO_ORDEM.map((status) => {
            const itensDaColuna = itensLocais.filter((o) => o.statusExibicao === status);
            const totalColuna = itensDaColuna.reduce((acc, o) => acc + o.total, 0);
            const somenteLeitura = COLUNAS_SOMENTE_LEITURA.includes(status);
            return (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex w-72 shrink-0 flex-col rounded-2xl border p-3 transition-colors",
                      snapshot.isDraggingOver
                        ? somenteLeitura
                          ? "border-danger/40 bg-base-900/60"
                          : "border-accent/50 bg-base-900/60"
                        : "border-base-800 bg-base-950/40"
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between px-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{STATUS_LABEL[status]}</p>
                      <span className="rounded-full bg-base-800 px-2 py-0.5 text-[11px] font-medium text-ink-secondary">{itensDaColuna.length}</span>
                    </div>
                    {totalColuna > 0 && <p className="mb-1 px-1 text-[11px] text-ink-muted">{fmtMoeda(totalColuna)}</p>}
                    {somenteLeitura && <p className="mb-2.5 px-1 text-[10px] text-ink-muted/70">{dict.orcamentos.funilColunaAutomatica}</p>}

                    <div className="flex min-h-[80px] flex-1 flex-col gap-2.5">
                      {itensDaColuna.map((orcamento, index) => (
                        <Draggable draggableId={orcamento.id} index={index} key={orcamento.id}>
                          {(providedDrag, snapshotDrag) => (
                            <div
                              ref={providedDrag.innerRef}
                              {...providedDrag.draggableProps}
                              {...providedDrag.dragHandleProps}
                              className={snapshotDrag.isDragging ? "rotate-1" : undefined}
                            >
                              <OrcamentoKanbanCard orcamento={orcamento} onClick={() => router.push(`/admin/orcamentos/${orcamento.id}`)} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {itensDaColuna.length === 0 && (
                        <p className="rounded-lg border border-dashed border-base-800 p-4 text-center text-xs text-ink-muted">{dict.orcamentos.funilColunaVazia}</p>
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
