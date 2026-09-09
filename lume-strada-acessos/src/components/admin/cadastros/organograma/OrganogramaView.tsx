"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { CargoComRelacoes, CargoRow, DepartamentoRow, EquipeMembroRow } from "@/lib/types/cadastros";
import { removerDepartamento, reordenarDepartamentos, moverCargo, removerCargo } from "@/app/admin/organograma/actions";
import { Button } from "@/components/ui/Button";
import { DepartamentoModal } from "@/components/admin/cadastros/organograma/DepartamentoModal";
import { CargoModal } from "@/components/admin/cadastros/organograma/CargoModal";
import { IconPencil, IconPlus, IconSitemap, IconTrash, IconUserPlus } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface OrganogramaViewProps {
  departamentos: DepartamentoRow[];
  cargos: CargoRow[];
  equipeMembros: EquipeMembroRow[];
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1]![0] : "";
  return (primeira + ultima).toUpperCase();
}

/**
 * Organograma da agência — colunas coloridas (departamentos) com cargos
 * dentro, arrastáveis (`@hello-pangea/dnd`, mesma lib do Kanban de
 * Produção) tanto pra reordenar quanto pra mover um cargo pra outro
 * departamento. Cada cargo pode estar "Vago", ligado a um membro real da
 * equipe (`equipe_membros`) ou ter um nome livre (freelancer/parceiro
 * externo).
 *
 * Visual e nomenclatura são ORIGINAIS deste sistema (paleta de cores já
 * usada em Financeiro, cards no mesmo estilo do resto do painel) — não é
 * uma cópia de nenhuma outra ferramenta, só o mesmo tipo de organização
 * (departamentos coloridos > cargos) que já é comum em organogramas.
 */
export function OrganogramaView({ departamentos, cargos, equipeMembros }: OrganogramaViewProps) {
  const { dict } = useLocale();
  const [departamentosLocais, setDepartamentosLocais] = useState(departamentos);
  const [cargosLocais, setCargosLocais] = useState(cargos);
  const [, startTransition] = useTransition();

  const [modalDepartamentoAberto, setModalDepartamentoAberto] = useState(false);
  const [departamentoEditando, setDepartamentoEditando] = useState<DepartamentoRow | null>(null);
  const [confirmandoExclusaoDepto, setConfirmandoExclusaoDepto] = useState<string | null>(null);

  const [departamentoParaNovoCargo, setDepartamentoParaNovoCargo] = useState<string | null>(null);
  const [cargoEditando, setCargoEditando] = useState<CargoRow | null>(null);
  const [confirmandoExclusaoCargo, setConfirmandoExclusaoCargo] = useState<string | null>(null);

  useEffect(() => setDepartamentosLocais(departamentos), [departamentos]);
  useEffect(() => setCargosLocais(cargos), [cargos]);

  const equipeMembrosPorId = useMemo(() => new Map(equipeMembros.map((m) => [m.id, m])), [equipeMembros]);
  const cargosComRelacoes: CargoComRelacoes[] = useMemo(
    () => cargosLocais.map((c) => ({ ...c, funcionario_nome: c.funcionario_id ? equipeMembrosPorId.get(c.funcionario_id)?.nome ?? null : null })),
    [cargosLocais, equipeMembrosPorId]
  );

  function cargosDoDepartamento(departamentoId: string): CargoComRelacoes[] {
    return cargosComRelacoes.filter((c) => c.departamento_id === departamentoId).sort((a, b) => a.ordem - b.ordem);
  }

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === "DEPARTAMENTO") {
      const reordenados = Array.from(departamentosLocais);
      const [movido] = reordenados.splice(source.index, 1);
      reordenados.splice(destination.index, 0, movido!);
      setDepartamentosLocais(reordenados);
      startTransition(async () => {
        await reordenarDepartamentos(reordenados.map((d) => d.id));
      });
      return;
    }

    // Drag de cargo — pode ser dentro do mesmo departamento (reordena) ou
    // pra outro departamento (destination.droppableId é o id do departamento
    // de destino, ver `droppableId` de cada coluna abaixo).
    const origemId = source.droppableId;
    const destinoId = destination.droppableId;

    const origemAtual = cargosDoDepartamento(origemId).map((c) => c.id);
    origemAtual.splice(source.index, 1);

    const destinoAtual = origemId === destinoId ? origemAtual : cargosDoDepartamento(destinoId).map((c) => c.id);
    destinoAtual.splice(destination.index, 0, draggableId);

    setCargosLocais((atual) => {
      const proximo = atual.map((c) => (c.id === draggableId ? { ...c, departamento_id: destinoId } : c));
      const comOrdem = (ids: string[]) => {
        for (const [index, id] of ids.entries()) {
          const cargo = proximo.find((c) => c.id === id);
          if (cargo) cargo.ordem = index;
        }
      };
      comOrdem(origemId === destinoId ? destinoAtual : origemAtual);
      if (origemId !== destinoId) comOrdem(destinoAtual);
      return [...proximo];
    });

    const colunasAfetadas =
      origemId === destinoId ? [{ departamentoId: destinoId, ids: destinoAtual }] : [{ departamentoId: origemId, ids: origemAtual }, { departamentoId: destinoId, ids: destinoAtual }];

    startTransition(async () => {
      await moverCargo(draggableId, destinoId, colunasAfetadas);
    });
  }

  function handleExcluirDepartamento(id: string) {
    startTransition(async () => {
      await removerDepartamento(id);
      setConfirmandoExclusaoDepto(null);
    });
  }

  function handleExcluirCargo(id: string) {
    startTransition(async () => {
      await removerCargo(id);
      setConfirmandoExclusaoCargo(null);
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setModalDepartamentoAberto(true)} className="text-xs">
          <IconPlus className="h-3.5 w-3.5" />
          {dict.cadastros.novoDepartamentoBotao}
        </Button>
      </div>

      {departamentosLocais.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-base-800/70 bg-base-950/50 py-16 text-center">
          <IconSitemap className="h-6 w-6 text-ink-muted/60" />
          <p className="text-sm text-ink-muted">{dict.cadastros.organogramaVazio}</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="departamentos-row" type="DEPARTAMENTO" direction="horizontal">
            {(providedRow) => (
              <div ref={providedRow.innerRef} {...providedRow.droppableProps} className="flex items-start gap-4 overflow-x-auto pb-2">
                {departamentosLocais.map((departamento, indexDepto) => {
                  const cargosDaColuna = cargosDoDepartamento(departamento.id);
                  return (
                    <Draggable draggableId={departamento.id} index={indexDepto} key={departamento.id}>
                      {(providedDepto) => (
                        <div
                          ref={providedDepto.innerRef}
                          {...providedDepto.draggableProps}
                          className="flex w-72 shrink-0 flex-col rounded-2xl border border-base-800/70 bg-base-950/50 backdrop-blur-sm"
                        >
                          <div
                            {...providedDepto.dragHandleProps}
                            className="flex items-center justify-between gap-2 rounded-t-2xl border-b px-3 py-2.5"
                            style={{ borderColor: `${departamento.cor}55`, backgroundColor: `${departamento.cor}18` }}
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: departamento.cor }} />
                              <p className="truncate text-xs font-semibold uppercase tracking-wide text-ink-primary">{departamento.nome}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                onClick={() => setDepartamentoEditando(departamento)}
                                className="rounded p-1 text-ink-muted hover:text-ink-primary"
                                aria-label={dict.common.editar}
                              >
                                <IconPencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setConfirmandoExclusaoDepto(departamento.id)}
                                className="rounded p-1 text-ink-muted hover:text-danger"
                                aria-label={dict.cadastros.excluirDepartamentoAria}
                              >
                                <IconTrash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {confirmandoExclusaoDepto === departamento.id && (
                            <div className="flex items-center justify-between gap-2 border-b border-base-800/70 bg-base-900/60 px-3 py-2 text-[11px]">
                              <span className="text-ink-secondary">{dict.cadastros.confirmarExclusaoDepartamento}</span>
                              <div className="flex shrink-0 gap-2">
                                <button onClick={() => handleExcluirDepartamento(departamento.id)} className="font-medium text-danger hover:underline">
                                  {dict.common.sim}
                                </button>
                                <button onClick={() => setConfirmandoExclusaoDepto(null)} className="text-ink-muted hover:text-ink-primary">
                                  {dict.common.nao}
                                </button>
                              </div>
                            </div>
                          )}

                          <Droppable droppableId={departamento.id} type="CARGO">
                            {(providedCol, snapshotCol) => (
                              <div
                                ref={providedCol.innerRef}
                                {...providedCol.droppableProps}
                                className={cn("flex min-h-[60px] flex-1 flex-col gap-2 p-3 transition-colors", snapshotCol.isDraggingOver && "bg-base-900/40")}
                              >
                                {cargosDaColuna.map((cargo, indexCargo) => (
                                  <Draggable draggableId={cargo.id} index={indexCargo} key={cargo.id}>
                                    {(providedCargo, snapshotCargo) => (
                                      <div
                                        ref={providedCargo.innerRef}
                                        {...providedCargo.draggableProps}
                                        {...providedCargo.dragHandleProps}
                                        className={cn(
                                          "group rounded-xl border border-base-700/70 bg-gradient-to-br from-base-900 to-base-950 p-2.5 transition-all",
                                          snapshotCargo.isDragging && "rotate-1 scale-[1.02] drop-shadow-[0_16px_28px_rgba(0,0,0,0.6)]"
                                        )}
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <p className="text-xs font-medium leading-snug text-ink-primary">{cargo.titulo}</p>
                                          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button onClick={() => setCargoEditando(cargo)} className="rounded p-0.5 text-ink-muted hover:text-ink-primary" aria-label={dict.common.editar}>
                                              <IconPencil className="h-3 w-3" />
                                            </button>
                                            <button
                                              onClick={() => setConfirmandoExclusaoCargo(cargo.id)}
                                              className="rounded p-0.5 text-ink-muted hover:text-danger"
                                              aria-label={dict.cadastros.excluirCargoAria}
                                            >
                                              <IconTrash className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>

                                        {confirmandoExclusaoCargo === cargo.id ? (
                                          <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px]">
                                            <span className="text-ink-secondary">{dict.cadastros.confirmarExclusaoCargo}</span>
                                            <div className="flex gap-1.5">
                                              <button onClick={() => handleExcluirCargo(cargo.id)} className="font-medium text-danger hover:underline">
                                                {dict.common.sim}
                                              </button>
                                              <button onClick={() => setConfirmandoExclusaoCargo(null)} className="text-ink-muted hover:text-ink-primary">
                                                {dict.common.nao}
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="mt-1.5 flex items-center gap-1.5">
                                            {cargo.funcionario_nome || cargo.nome_livre ? (
                                              <>
                                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-base-600 bg-gradient-to-br from-base-700 to-base-800 text-[8px] font-semibold text-ink-secondary">
                                                  {iniciais(cargo.funcionario_nome ?? cargo.nome_livre ?? "")}
                                                </span>
                                                <p className="truncate text-[11px] text-ink-secondary">{cargo.funcionario_nome ?? cargo.nome_livre}</p>
                                              </>
                                            ) : (
                                              <span className="rounded-full border border-base-600/50 bg-base-800/70 px-2 py-0.5 text-[10px] text-ink-muted">
                                                {dict.cadastros.cargoVagoBadge}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {providedCol.placeholder}
                                {cargosDaColuna.length === 0 && (
                                  <p className="rounded-xl bg-base-900/40 py-4 text-center text-[11px] text-ink-muted">{dict.cadastros.nenhumCargoNoDepartamento}</p>
                                )}
                              </div>
                            )}
                          </Droppable>

                          <button
                            onClick={() => setDepartamentoParaNovoCargo(departamento.id)}
                            className="flex items-center justify-center gap-1.5 rounded-b-2xl border-t border-base-800/70 py-2 text-[11px] font-medium text-ink-muted transition hover:text-ink-primary"
                          >
                            <IconUserPlus className="h-3.5 w-3.5" />
                            {dict.cadastros.novoCargoBotao}
                          </button>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {providedRow.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {modalDepartamentoAberto && <DepartamentoModal onClose={() => setModalDepartamentoAberto(false)} />}
      {departamentoEditando && <DepartamentoModal departamento={departamentoEditando} onClose={() => setDepartamentoEditando(null)} />}
      {departamentoParaNovoCargo && (
        <CargoModal departamentoId={departamentoParaNovoCargo} equipeMembros={equipeMembros} onClose={() => setDepartamentoParaNovoCargo(null)} />
      )}
      {cargoEditando && (
        <CargoModal departamentoId={cargoEditando.departamento_id} equipeMembros={equipeMembros} cargo={cargoEditando} onClose={() => setCargoEditando(null)} />
      )}
    </div>
  );
}
