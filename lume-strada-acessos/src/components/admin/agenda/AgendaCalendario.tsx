"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { Compromisso, AgendaItem } from "@/lib/types/agenda";
import type { TarefaAgendaItem, LeadAgendaItem } from "@/lib/types/dashboard";
import type { ClienteRow } from "@/lib/types/cadastros";
import { leadEstaAberto } from "@/lib/utils/comercial";
import { addMeses, fmtHora, fmtMesAno, gradeDoMes, hojeISO, TIPO_COMPROMISSO_META } from "@/lib/utils/agenda";
import { moverCompromisso } from "@/app/admin/agenda/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconCalendar, IconChevronLeft, IconChevronRight, IconExternalLink, IconPlus } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { NovoCompromissoModal } from "@/components/admin/agenda/NovoCompromissoModal";

interface AgendaCalendarioProps {
  compromissos: Compromisso[];
  tarefasAgenda: TarefaAgendaItem[];
  leadsAgenda: LeadAgendaItem[];
  clientes: ClienteRow[];
  /** Total já calculado no servidor (`data.ts`) — mostrado de novo aqui, compacto, ao lado do filtro (mesmo layout do concorrente: stat card colada nos filtros). */
  eventosNoMes: number;
}

const MAX_VISIVEIS_POR_DIA = 4;

/** Chave sentinela pro balde "Sem Cliente" no filtro/`Set` de visibilidade — nenhum `clientes.id` de verdade colide com essa string. */
const SEM_CLIENTE_KEY = "__sem_cliente__";

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
export function AgendaCalendario({ compromissos, tarefasAgenda, leadsAgenda, clientes: clientesIniciais, eventosNoMes }: AgendaCalendarioProps) {
  const { dict } = useLocale();
  const [, startTransition] = useTransition();

  const [compromissosLocais, setCompromissosLocais] = useState(compromissos);
  useEffect(() => setCompromissosLocais(compromissos), [compromissos]);

  // Estado local (não só a prop) pra um cliente criado "na hora" pelo "+
  // Novo Cliente" dentro do modal de compromisso aparecer no filtro e no
  // dropdown imediatamente — mesmo padrão de `ProducaoWorkspace.tsx`.
  const [clientes, setClientes] = useState(clientesIniciais);

  const [referencia, setReferencia] = useState(() => {
    const hoje = new Date();
    return new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1));
  });
  // Filtro/legenda por CLIENTE (não mais por tipo) — cada compromisso/item
  // pinta com a MESMA cor do cadastro do cliente (`clientes.cor`), igual já
  // acontece no Calendário de Produção; quem não tem cliente vinculado cai
  // no balde "Sem Cliente" (`SEM_CLIENTE_KEY`). Tudo visível por padrão.
  const [clientesVisiveis, setClientesVisiveis] = useState<Set<string>>(
    () => new Set([...clientesIniciais.map((c) => c.id), SEM_CLIENTE_KEY])
  );

  function handleClienteCriado(novo: Pick<ClienteRow, "id" | "nome" | "cor">) {
    setClientes((atual) =>
      [...atual, { ...novo, documento: null, email: null, telefone: null, nome_responsavel: null, endereco: null, profile_id: null, portal_token: "", created_at: "", updated_at: "" }].sort((a, b) =>
        a.nome.localeCompare(b.nome)
      )
    );
    setClientesVisiveis((atual) => new Set(atual).add(novo.id));
  }

  const [modalAberto, setModalAberto] = useState(false);
  const [dataPreenchida, setDataPreenchida] = useState<string | undefined>(undefined);
  const [compromissoEmEdicao, setCompromissoEmEdicao] = useState<Compromisso | null>(null);

  const hojeIso = hojeISO();
  const semanas = gradeDoMes(referencia);
  const leadsAbertos = useMemo(() => leadsAgenda.filter(leadEstaAberto), [leadsAgenda]);
  const clientesPorId = useMemo(() => new Map(clientes.map((c) => [c.id, c])), [clientes]);

  const itensPorDia = useMemo(() => {
    const mapa = new Map<string, AgendaItem[]>();
    function add(dia: string | null, item: AgendaItem) {
      if (!dia) return;
      mapa.set(dia, [...(mapa.get(dia) ?? []), item]);
    }

    for (const c of compromissosLocais) {
      const clienteVinculado = c.cliente_cadastro_id ? clientesPorId.get(c.cliente_cadastro_id) : undefined;
      add(c.data, {
        id: c.id,
        origem: "manual",
        tipo: c.tipo,
        titulo: c.titulo,
        data: c.data,
        hora: c.hora,
        clienteNome: clienteVinculado?.nome ?? c.cliente_nome,
        clienteId: c.cliente_cadastro_id,
        clienteCor: clienteVinculado?.cor ?? null,
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
          clienteId: t.cliente_id ?? null,
          clienteCor: t.cliente_cor ?? null,
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
          clienteId: t.cliente_id ?? null,
          clienteCor: t.cliente_cor ?? null,
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
          clienteId: null,
          clienteCor: null,
          href: "/admin/comercial",
        });
      }
    }
    return mapa;
  }, [compromissosLocais, tarefasAgenda, leadsAbertos, clientesPorId]);

  // Filtro só mostra quem TEM algo no calendário (compromisso manual ou
  // captação/entrega auto-surfada de Produção) — pedido explícito pra não
  // listar a base inteira de clientes cadastrados, só os que realmente
  // aparecem aqui. Considera TODOS os meses já carregados, não só o mês em
  // exibição (senão o filtro mudaria de opções a cada troca de mês).
  const { clientesComItens, temItemSemCliente } = useMemo(() => {
    const ids = new Set<string>();
    let semCliente = false;
    for (const itens of itensPorDia.values()) {
      for (const item of itens) {
        if (item.clienteId) ids.add(item.clienteId);
        else semCliente = true;
      }
    }
    return { clientesComItens: clientes.filter((c) => ids.has(c.id)), temItemSemCliente: semCliente };
  }, [itensPorDia, clientes]);

  function alternarCliente(chave: string) {
    setClientesVisiveis((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(chave)) proximo.delete(chave);
      else proximo.add(chave);
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

  return (
    <div className="space-y-5">
      {/* Linha de cima: filtro por cliente + stat compacto + placeholder do
          Google Agenda lado a lado — pedido explícito pra NÃO ocupar espaço
          vertical do calendário (antes ficavam numa coluna estreita ao lado
          dele). O calendário abaixo agora usa a largura inteira da tela. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
        <Card className="p-4 sm:p-5">
          <p className="mb-3 text-sm font-semibold text-ink-primary">{dict.agenda.filtrarPorCliente}</p>
          {clientesComItens.length === 0 && !temItemSemCliente ? (
            <p className="text-xs text-ink-muted">{dict.agenda.semClientesCadastradosAjuda}</p>
          ) : (
            <div className="flex max-h-28 flex-wrap gap-x-5 gap-y-2 overflow-y-auto">
              {clientesComItens.map((cliente) => (
                <label key={cliente.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={clientesVisiveis.has(cliente.id)}
                    onChange={() => alternarCliente(cliente.id)}
                    className="h-4 w-4 shrink-0 rounded border-base-600 bg-base-900 accent-accent"
                  />
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cliente.cor ?? undefined }} />
                  <span className="text-ink-primary">{cliente.nome}</span>
                </label>
              ))}
              {temItemSemCliente && (
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={clientesVisiveis.has(SEM_CLIENTE_KEY)}
                    onChange={() => alternarCliente(SEM_CLIENTE_KEY)}
                    className="h-4 w-4 shrink-0 rounded border-base-600 bg-base-900 accent-accent"
                  />
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-dashed border-ink-muted" />
                  <span className="text-ink-secondary">{dict.agenda.semClienteFiltro}</span>
                </label>
              )}
            </div>
          )}
        </Card>

        <Card className="flex items-center p-4 sm:p-5">
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
        <Card className="flex items-center justify-center p-4 sm:p-5">
          <div className="w-full">
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
          </div>
        </Card>
      </div>

      {/* Calendário — largura total, sem dividir espaço com a coluna lateral. */}
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
                  const itensDoDia = (itensPorDia.get(dia) ?? []).filter((item) =>
                    clientesVisiveis.has(item.clienteId ?? SEM_CLIENTE_KEY)
                  );
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
                              // Cor = CLIENTE (mesma do cadastro em Cadastros → Clientes), não mais
                              // o tipo do compromisso — igual ao Calendário de Produção. Sem cliente
                              // vinculado cai num cinza neutro (classe, não hex, pra acompanhar o
                              // tema automaticamente). O TIPO continua identificável pelo ícone —
                              // cor nunca é a única pista de significado.
                              const TipoIcon = TIPO_COMPROMISSO_META[item.tipo].icon;
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
                                          "flex w-full items-center gap-1 rounded px-1.5 py-1 text-left text-[11px] font-medium transition hover:opacity-90",
                                          item.clienteCor ? "text-white" : "bg-base-700 text-ink-primary",
                                          snapshotDrag.isDragging && "rotate-1 scale-[1.02] drop-shadow-[0_16px_28px_rgba(0,0,0,0.6)]"
                                        )}
                                        style={item.clienteCor ? { backgroundColor: item.clienteCor } : undefined}
                                        title={item.clienteNome ? `${item.titulo} — ${item.clienteNome}` : item.titulo}
                                      >
                                        <TipoIcon className="h-3 w-3 shrink-0 opacity-90" />
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
                                  className={cn(
                                    "flex w-full items-center gap-1 rounded border border-dashed bg-base-900/60 px-1.5 py-1 text-left text-[11px] font-medium text-ink-primary transition hover:bg-base-800/60",
                                    !item.clienteCor && "border-base-600"
                                  )}
                                  style={item.clienteCor ? { borderColor: item.clienteCor } : undefined}
                                  title={`${item.titulo}${item.clienteNome ? ` — ${item.clienteNome}` : ""} (${dict.agenda.origemAutoDica})`}
                                >
                                  <TipoIcon className="h-3 w-3 shrink-0 opacity-80" />
                                  <span
                                    className={cn("h-1.5 w-1.5 shrink-0 rounded-full", !item.clienteCor && "bg-base-600")}
                                    style={item.clienteCor ? { backgroundColor: item.clienteCor } : undefined}
                                  />
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

      {modalAberto && (
        <NovoCompromissoModal
          compromisso={compromissoEmEdicao}
          dataInicial={dataPreenchida}
          clientes={clientes}
          onClienteCriado={handleClienteCriado}
          onClose={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}
