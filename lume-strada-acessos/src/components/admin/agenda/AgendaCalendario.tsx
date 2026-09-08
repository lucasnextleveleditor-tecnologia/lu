"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { Compromisso, AgendaItem, TipoCompromisso } from "@/lib/types/agenda";
import type { TarefaAgendaItem, LeadAgendaItem } from "@/lib/types/dashboard";
import { leadEstaAberto } from "@/lib/utils/comercial";
import { addMeses, fmtHora, fmtMesAno, gradeDoMes, hojeISO, TIPO_COMPROMISSO_META, TIPO_COMPROMISSO_ORDEM } from "@/lib/utils/agenda";
import { moverCompromisso } from "@/app/admin/agenda/actions";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconCalendar, IconChevronLeft, IconChevronRight, IconExternalLink, IconPlus } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { NovoCompromissoModal } from "@/components/admin/agenda/NovoCompromissoModal";
import type { AgendaDict } from "@/lib/i18n/dictionaries/pt/agenda";

interface AgendaCalendarioProps {
  compromissos: Compromisso[];
  tarefasAgenda: TarefaAgendaItem[];
  leadsAgenda: LeadAgendaItem[];
  /** Total já calculado no servidor (`data.ts`) — mostrado de novo aqui, compacto, ao lado do filtro (mesmo layout do concorrente: stat card colada nos filtros). */
  eventosNoMes: number;
}

const MAX_VISIVEIS_POR_DIA = 4;

function labelDoTipo(dict: AgendaDict, tipo: TipoCompromisso): string {
  const porTipo: Record<TipoCompromisso, string> = {
    captacao: dict.tipoCaptacao,
    reuniao: dict.tipoReuniao,
    entrega: dict.tipoEntrega,
    pagamento: dict.tipoPagamento,
  };
  return porTipo[tipo];
}

/**
 * Calendário mensal da Agenda — junta compromissos MANUAIS (tabela
 * `compromissos`, arrastáveis pra reagendar, clicáveis pra editar) com
 * itens auto-surfados só-leitura de Produção (captação/entrega) e Comercial
 * (próximo contato de lead em aberto), no mesmo grid. Drag-and-drop com
 * `@hello-pangea/dnd`, mesmo padrão de `KanbanBoard.tsx` (estado local
 * otimista + Server Action em background); cada dia é um `Droppable`
 * (`droppableId` = data ISO), só os compromissos manuais viram `Draggable`
 * — os itens auto não têm índice de arrasto (não pertencem a `compromissos`,
 * arrastar não faria nada).
 */
export function AgendaCalendario({ compromissos, tarefasAgenda, leadsAgenda, eventosNoMes }: AgendaCalendarioProps) {
  const { dict } = useLocale();
  const { theme } = useTheme();
  const [, startTransition] = useTransition();

  const [compromissosLocais, setCompromissosLocais] = useState(compromissos);
  useEffect(() => setCompromissosLocais(compromissos), [compromissos]);

  const [referencia, setReferencia] = useState(() => {
    const hoje = new Date();
    return new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1));
  });
  const [tiposVisiveis, setTiposVisiveis] = useState<Set<TipoCompromisso>>(() => new Set(TIPO_COMPROMISSO_ORDEM));
  const [modalAberto, setModalAberto] = useState(false);
  const [dataPreenchida, setDataPreenchida] = useState<string | undefined>(undefined);
  const [compromissoEmEdicao, setCompromissoEmEdicao] = useState<Compromisso | null>(null);

  const hojeIso = hojeISO();
  const semanas = gradeDoMes(referencia);
  const leadsAbertos = useMemo(() => leadsAgenda.filter(leadEstaAberto), [leadsAgenda]);

  const itensPorDia = useMemo(() => {
    const mapa = new Map<string, AgendaItem[]>();
    function add(dia: string | null, item: AgendaItem) {
      if (!dia) return;
      mapa.set(dia, [...(mapa.get(dia) ?? []), item]);
    }

    for (const c of compromissosLocais) {
      add(c.data, {
        id: c.id,
        origem: "manual",
        tipo: c.tipo,
        titulo: c.titulo,
        data: c.data,
        hora: c.hora,
        clienteNome: c.cliente_nome,
        compromissoId: c.id,
      });
    }
    for (const t of tarefasAgenda) {
      if (t.data_captacao) {
        add(t.data_captacao, {
          id: `producao-captacao-${t.id}`,
          origem: "producao",
          tipo: "captacao",
          titulo: t.titulo,
          data: t.data_captacao,
          hora: null,
          clienteNome: t.cliente_nome,
          href: "/admin/producao",
        });
      }
      if (t.data_entrega) {
        add(t.data_entrega, {
          id: `producao-entrega-${t.id}`,
          origem: "producao",
          tipo: "entrega",
          titulo: t.titulo,
          data: t.data_entrega,
          hora: null,
          clienteNome: t.cliente_nome,
          href: "/admin/producao",
        });
      }
    }
    for (const l of leadsAbertos) {
      if (l.proximo_contato_em) {
        add(l.proximo_contato_em, {
          id: `comercial-followup-${l.id}`,
          origem: "comercial",
          tipo: "reuniao",
          titulo: l.nome,
          data: l.proximo_contato_em,
          hora: null,
          clienteNome: null,
          href: "/admin/comercial",
        });
      }
    }
    return mapa;
  }, [compromissosLocais, tarefasAgenda, leadsAbertos]);

  function alternarTipo(tipo: TipoCompromisso) {
    setTiposVisiveis((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(tipo)) proximo.delete(tipo);
      else proximo.add(tipo);
      return proximo;
    });
  }

  function abrirNovoCompromisso(data?: string) {
    setCompromissoEmEdicao(null);
    setDataPreenchida(data);
    setModalAberto(true);
  }

  function abrirEdicao(item: AgendaItem) {
    if (item.origem !== "manual") return;
    const compromisso = compromissosLocais.find((c) => c.id === item.compromissoId);
    if (!compromisso) return;
    setCompromissoEmEdicao(compromisso);
    setDataPreenchida(undefined);
    setModalAberto(true);
  }

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const novaData = destination.droppableId;
    setCompromissosLocais((atual) => atual.map((c) => (c.id === draggableId ? { ...c, data: novaData } : c)));

    startTransition(async () => {
      await moverCompromisso(draggableId, novaData);
    });
  }

  function corDoTipo(tipo: TipoCompromisso): string {
    const meta = TIPO_COMPROMISSO_META[tipo];
    return theme === "dark" ? meta.corDark : meta.corLight;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      {/* Coluna estreita: filtro por tipo + stat compacto + placeholder do Google Agenda — mesmo agrupamento do concorrente, ao lado do calendário. */}
      <div className="space-y-5">
        <Card className="p-4 sm:p-5">
          <p className="mb-3 text-sm font-semibold text-ink-primary">{dict.agenda.filtrarPorTipo}</p>
          <div className="space-y-2.5">
            {TIPO_COMPROMISSO_ORDEM.map((tipo) => {
              const Icon = TIPO_COMPROMISSO_META[tipo].icon;
              return (
                <label key={tipo} className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={tiposVisiveis.has(tipo)}
                    onChange={() => alternarTipo(tipo)}
                    className="h-4 w-4 shrink-0 rounded border-base-600 bg-base-900 accent-accent"
                  />
                  <Icon className="h-4 w-4 shrink-0 text-ink-muted" />
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: corDoTipo(tipo) }} />
                  <span className="flex-1 text-ink-primary">{labelDoTipo(dict.agenda, tipo)}</span>
                </label>
              );
            })}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm"
              style={{ background: "linear-gradient(135deg, #fb7185, #fb7185dd)" }}
            >
              <IconCalendar className="h-[22px] w-[22px] text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl font-bold tracking-tight text-ink-primary">{eventosNoMes}</p>
              <p className="text-xs text-ink-muted">{dict.agenda.statEventosMesLabel}</p>
            </div>
          </div>
        </Card>

        {/* Placeholder inerte de propósito — sem OAuth real (ver limite de escopo no plano). Nunca finge um estado "conectado". */}
        <Card className="p-4 sm:p-5">
          <Button
            type="button"
            variant="ghost"
            disabled
            title={dict.agenda.googleCalendarTooltip}
            className="w-full cursor-not-allowed justify-center gap-1.5"
          >
            <IconExternalLink className="h-4 w-4" />
            {dict.agenda.googleCalendarBtn}
          </Button>
          <p className="mt-2 flex justify-center">
            <span className="rounded-full border border-base-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              {dict.agenda.emBreve}
            </span>
          </p>
        </Card>
      </div>

      {/* Coluna larga: grid mensal. */}
      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold capitalize">{fmtMesAno(referencia)}</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setReferencia((r) => addMeses(r, -1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
              aria-label={dict.agenda.mesAnterior}
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const hoje = new Date();
                setReferencia(new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1)));
              }}
              className="rounded-lg border border-base-600 px-2.5 py-1 text-xs text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            >
              {dict.agenda.hoje}
            </button>
            <button
              onClick={() => setReferencia((r) => addMeses(r, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
              aria-label={dict.agenda.proximoMes}
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
            <Button type="button" onClick={() => abrirNovoCompromisso()} className="ml-1.5 gap-1.5">
              <IconPlus className="h-4 w-4" />
              {dict.agenda.novoCompromissoBtn}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          {dict.agenda.diasSemana.map((d) => (
            <div key={d} className="pb-1.5">
              {d}
            </div>
          ))}
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-1.5">
            {semanas.map((semana, i) => (
              <div key={i} className="grid grid-cols-7 gap-1.5">
                {semana.map((dia, j) => {
                  if (!dia) return <div key={j} className="min-h-[132px] rounded-lg" />;
                  const itensDoDia = (itensPorDia.get(dia) ?? []).filter((item) => tiposVisiveis.has(item.tipo));
                  const visiveis = itensDoDia.slice(0, MAX_VISIVEIS_POR_DIA);
                  const restantes = itensDoDia.length - visiveis.length;
                  const isHoje = dia === hojeIso;
                  let indiceArrastavel = 0;

                  return (
                    <Droppable droppableId={dia} key={dia}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          role="button"
                          tabIndex={0}
                          onClick={() => abrirNovoCompromisso(dia)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              abrirNovoCompromisso(dia);
                            }
                          }}
                          title={itensDoDia.length === 0 ? dict.agenda.diaVazioTitle : undefined}
                          className={cn(
                            "min-h-[132px] cursor-pointer rounded-lg border p-1.5 text-left transition hover:border-ink-muted",
                            snapshot.isDraggingOver
                              ? "border-accent/60 bg-base-800/60"
                              : isHoje
                                ? "border-accent/50 bg-base-900/60"
                                : "border-base-800 bg-base-950/40"
                          )}
                        >
                          <p className={cn("mb-1 px-0.5 text-[11px]", isHoje ? "font-semibold text-ink-primary" : "text-ink-muted")}>
                            {Number(dia.slice(-2))}
                          </p>
                          <div className="space-y-1">
                            {visiveis.map((item) => {
                              const cor = corDoTipo(item.tipo);
                              if (item.origem === "manual") {
                                const index = indiceArrastavel++;
                                return (
                                  <Draggable draggableId={item.compromissoId ?? item.id} index={index} key={item.id}>
                                    {(providedDrag, snapshotDrag) => (
                                      <button
                                        type="button"
                                        ref={providedDrag.innerRef}
                                        {...providedDrag.draggableProps}
                                        {...providedDrag.dragHandleProps}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          abrirEdicao(item);
                                        }}
                                        className={cn(
                                          "flex w-full items-center gap-1 rounded px-1.5 py-1 text-left text-[11px] font-medium text-white transition hover:opacity-90",
                                          snapshotDrag.isDragging && "rotate-1 scale-[1.02] drop-shadow-[0_16px_28px_rgba(0,0,0,0.6)]"
                                        )}
                                        style={{ backgroundColor: cor }}
                                        title={item.clienteNome ? `${item.titulo} — ${item.clienteNome}` : item.titulo}
                                      >
                                        {item.hora && <span className="shrink-0 opacity-80">{fmtHora(item.hora)}</span>}
                                        <span className="truncate">{item.titulo}</span>
                                      </button>
                                    )}
                                  </Draggable>
                                );
                              }
                              // Item auto-surfado (Produção/Comercial) — só leitura, NÃO é `Draggable`
                              // (arrastar não faria nada, não pertence à tabela `compromissos`).
                              // Borda tracejada + ícone de link externo distinguem visualmente do
                              // pill manual (sólido, arrastável) sem depender só da cor.
                              return (
                                <Link
                                  key={item.id}
                                  href={item.href ?? "/admin/dashboard"}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex w-full items-center gap-1 rounded border border-dashed bg-base-900/60 px-1.5 py-1 text-left text-[11px] font-medium text-ink-primary transition hover:bg-base-800/60"
                                  style={{ borderColor: cor }}
                                  title={`${item.titulo} — ${dict.agenda.origemAutoDica}`}
                                >
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: cor }} />
                                  <span className="min-w-0 flex-1 truncate">{item.titulo}</span>
                                  <IconExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                                </Link>
                              );
                            })}
                            {provided.placeholder}
                            {restantes > 0 && (
                              <p className="px-1.5 text-[10px] text-ink-muted">{dict.agenda.maisEventos.replace("{n}", String(restantes))}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            ))}
          </div>
        </DragDropContext>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-base-800 pt-2.5 text-[11px] text-ink-muted">
          <span className="h-2.5 w-3 shrink-0 rounded-sm border border-dashed border-base-500" />
          {dict.agenda.origemAutoDica}
        </div>
      </Card>

      {modalAberto && <NovoCompromissoModal compromisso={compromissoEmEdicao} dataInicial={dataPreenchida} onClose={() => setModalAberto(false)} />}
    </div>
  );
}
