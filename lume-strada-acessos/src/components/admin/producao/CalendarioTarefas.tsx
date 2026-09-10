"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { TarefaComRelacoes } from "@/lib/types/producao";
import type { CompromissoResumo } from "@/lib/types/agenda";
import {
  addDias,
  addMeses,
  diasDaSemanaDe,
  fmtIntervaloSemana,
  fmtMesAno,
  gradeDoMes,
  inicioDaSemana,
} from "@/lib/utils/producao";
import { TIPO_COMPROMISSO_META } from "@/lib/utils/agenda";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { Card } from "@/components/ui/Card";
import { IconChevronLeft, IconChevronRight, IconExternalLink } from "@/components/ui/icons";
import { DiaTarefasModal } from "@/components/admin/producao/DiaTarefasModal";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { todayISO } from "@/lib/utils/format";

interface CalendarioTarefasProps {
  tarefas: TarefaComRelacoes[];
  /** Compromissos manuais da Agenda (tipo captação/entrega) — só leitura, "os dois se conversam" com `/admin/agenda`. */
  compromissosAgenda: CompromissoResumo[];
  onAbrirTarefa: (id: string) => void;
  onNovaTarefa: (data: string) => void;
}

type VisaoCalendario = "semanal" | "mensal";

const MAX_VISIVEIS_POR_DIA = 3;

/** Preferência é por navegador (localStorage), não por conta — mesmo padrão do layout do Kanban. */
const STORAGE_KEY_VISAO = "lsf_producao_calendario_visao";

/**
 * O calendário de prazos, em duas escalas.
 *
 * MENSAL responde "como está o mês" — a grade de parede, sete colunas por
 * cinco linhas, cada dia com espaço para três tarefas e um "+n mais".
 *
 * SEMANAL responde "o que eu faço esta semana" — sete colunas altas, uma por
 * dia, com TODAS as tarefas do dia visíveis. É a diferença que justifica as
 * duas: na grade do mês, um dia com sete entregas mostra três e esconde
 * quatro, justamente no dia em que a pessoa mais precisa ver tudo. Na coluna
 * da semana há altura de sobra, então não existe "+n mais" ali.
 *
 * A escolha fica salva no navegador. Quem trabalha semana a semana não deveria
 * ter que reescolher a cada visita.
 *
 * Uma data só de referência (`referencia`) serve às duas visões: no mensal ela
 * é ancorada no primeiro dia do mês, no semanal na segunda-feira da semana. A
 * navegação anda de mês ou de semana conforme a visão, e "Hoje" volta para
 * hoje nas duas.
 */
export function CalendarioTarefas({ tarefas, compromissosAgenda, onAbrirTarefa, onNovaTarefa }: CalendarioTarefasProps) {
  const { dict, locale } = useLocale();
  const { theme } = useTheme();
  const DIAS_SEMANA = dict.producao.diasSemana;

  const [visao, setVisao] = useState<VisaoCalendario>("mensal");
  const [referencia, setReferencia] = useState(() => {
    const hoje = new Date();
    return new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
  });
  const [diaExpandido, setDiaExpandido] = useState<string | null>(null);

  // Sincroniza com a preferência salva DEPOIS da primeira renderização —
  // evita mismatch de hidratação (servidor não tem acesso ao localStorage).
  useEffect(() => {
    const salvo = window.localStorage.getItem(STORAGE_KEY_VISAO);
    if (salvo === "semanal" || salvo === "mensal") setVisao(salvo);
  }, []);

  function alternarVisao(nova: VisaoCalendario) {
    setVisao(nova);
    window.localStorage.setItem(STORAGE_KEY_VISAO, nova);
  }

  const hojeIso = todayISO();

  const primeiroDoMes = new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth(), 1));
  const semanas = gradeDoMes(primeiroDoMes);
  const segundaDaSemana = inicioDaSemana(referencia);
  const diasDaSemana = diasDaSemanaDe(segundaDaSemana);

  // Os dias que estão NA TELA — é sobre eles que a legenda de clientes se
  // monta, para ela falar do que se está vendo e não do mês inteiro quando a
  // visão é de uma semana.
  const diasVisiveis = visao === "semanal" ? diasDaSemana : semanas.flat().filter((d): d is string => d !== null);

  const tarefasPorDia = new Map<string, TarefaComRelacoes[]>();
  for (const t of tarefas) {
    if (!t.data_entrega) continue;
    tarefasPorDia.set(t.data_entrega, [...(tarefasPorDia.get(t.data_entrega) ?? []), t]);
  }

  // Compromissos manuais da Agenda (captação/entrega) — mapeados à parte dos
  // `tarefas` de Produção, mas desenhados no MESMO dia no grid. Não têm
  // `onClick` de abrir tarefa (não são uma `TarefaComRelacoes`): navegam pra
  // `/admin/agenda`, mesmo padrão dos itens auto-surfados da própria Agenda.
  const compromissosPorDia = new Map<string, CompromissoResumo[]>();
  for (const c of compromissosAgenda) {
    compromissosPorDia.set(c.data, [...(compromissosPorDia.get(c.data) ?? []), c]);
  }
  function corDoTipo(tipo: CompromissoResumo["tipo"]): string {
    const meta = TIPO_COMPROMISSO_META[tipo];
    return theme === "dark" ? meta.corDark : meta.corLight;
  }

  // Legenda de clientes — só os que têm cor escolhida E têm tarefa visível no
  // período em tela. Dedup por `cliente_nome`, não por cor — cores podem se
  // repetir entre clientes (ver comentário em `ClienteModal`).
  const clientesComCorNoPeriodo = new Map<string, string>();
  for (const dia of diasVisiveis) {
    for (const t of tarefasPorDia.get(dia) ?? []) {
      if (t.cliente_nome && t.cliente_cor && !clientesComCorNoPeriodo.has(t.cliente_nome)) {
        clientesComCorNoPeriodo.set(t.cliente_nome, t.cliente_cor);
      }
    }
  }

  function andar(passo: -1 | 1) {
    setReferencia((r) => (visao === "semanal" ? addDias(r, passo * 7) : addMeses(r, passo)));
  }

  function irParaHoje() {
    const hoje = new Date();
    setReferencia(new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())));
  }

  const rotuloPeriodo =
    visao === "semanal"
      ? fmtIntervaloSemana(segundaDaSemana, addDias(segundaDaSemana, 6), locale)
      : fmtMesAno(primeiroDoMes);

  /** Os cartões de um dia — os mesmos nas duas visões, para nada mudar de cara ao trocar a escala. */
  function ItensDoDia({ dia, limite }: { dia: string; limite: number | null }) {
    const tarefasDoDia = tarefasPorDia.get(dia) ?? [];
    const visiveis = limite === null ? tarefasDoDia : tarefasDoDia.slice(0, limite);
    const restantes = tarefasDoDia.length - visiveis.length;
    const compromissosDoDia = compromissosPorDia.get(dia) ?? [];

    return (
      <div className="space-y-1">
        {visiveis.map((t) => (
          <button
            key={t.id}
            onClick={(e) => {
              e.stopPropagation();
              onAbrirTarefa(t.id);
            }}
            className={cn(
              "flex w-full items-center gap-1 rounded px-1.5 py-1 text-left text-[11px] font-medium text-ink-primary transition hover:opacity-80",
              t.prioridade === "urgente" || t.prioridade === "alta" ? "bg-status-critical/20" : "bg-base-800"
            )}
            title={t.cliente_nome ? `${t.titulo} — ${t.cliente_nome}` : t.titulo}
          >
            {/* Etiqueta de cor do cliente — identidade nunca só pela cor do texto/fundo (contraste imprevisível com hex livre), sempre um dot ao lado do nome. */}
            {t.cliente_cor && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: t.cliente_cor }} />}
            <span className="truncate">{t.titulo}</span>
          </button>
        ))}

        {/* Compromissos manuais da Agenda (captação/entrega) no mesmo dia —
            borda tracejada + ícone de link externo, mesmo tratamento visual
            dos itens auto-surfados dentro da própria Agenda: só leitura,
            clique navega pro módulo de origem, nunca conta pra paginação
            "+n mais" (essa continua sendo só de tarefas de Produção). */}
        {compromissosDoDia.map((c) => (
          <Link
            key={c.id}
            href="/admin/agenda"
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center gap-1 rounded border border-dashed bg-base-900/60 px-1.5 py-1 text-left text-[11px] font-medium text-ink-primary transition hover:bg-base-800/60"
            style={{ borderColor: corDoTipo(c.tipo) }}
            title={c.cliente_nome ? `${c.titulo} — ${c.cliente_nome} (${dict.producao.origemAgendaDica})` : `${c.titulo} (${dict.producao.origemAgendaDica})`}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: corDoTipo(c.tipo) }} />
            <span className="min-w-0 flex-1 truncate">{c.titulo}</span>
            <IconExternalLink className="h-3 w-3 shrink-0 opacity-60" />
          </Link>
        ))}

        {restantes > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDiaExpandido(dia);
            }}
            className="block w-full px-1.5 text-left text-[10px] text-ink-muted underline-offset-2 hover:text-ink-primary hover:underline"
          >
            {dict.producao.maisTarefas.replace("{n}", String(restantes))}
          </button>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => andar(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            aria-label={visao === "semanal" ? dict.producao.semanaAnterior : dict.producao.mesAnterior}
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <p className="min-w-[9rem] text-center text-sm font-semibold capitalize">{rotuloPeriodo}</p>
          <button
            onClick={() => andar(1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            aria-label={visao === "semanal" ? dict.producao.proximaSemana : dict.producao.proximoMes}
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={irParaHoje}
            className="rounded-lg border border-base-600 px-2.5 py-1 text-xs text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
          >
            {dict.producao.irParaHoje}
          </button>
        </div>

        <div className="ml-auto flex overflow-hidden rounded-lg border border-base-600">
          {(["semanal", "mensal"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => alternarVisao(v)}
              aria-pressed={visao === v}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition",
                visao === v ? "bg-base-800 text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
              )}
            >
              {v === "semanal" ? dict.producao.visaoSemanal : dict.producao.visaoMensal}
            </button>
          ))}
        </div>
      </div>

      {visao === "semanal" ? (
        // Sete colunas altas no desktop, uma embaixo da outra no celular:
        // sete colunas num telefone dariam 50px de largura cada, onde nem o
        // título da tarefa cabe.
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-7">
          {diasDaSemana.map((dia) => {
            const isHoje = dia === hojeIso;
            const diaDaSemana = new Date(`${dia}T00:00:00Z`).getUTCDay();
            return (
              <div
                key={dia}
                role="button"
                tabIndex={0}
                onClick={() => onNovaTarefa(dia)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onNovaTarefa(dia);
                  }
                }}
                title={dict.producao.novaTarefa}
                className={cn(
                  "min-h-[220px] cursor-pointer rounded-lg border p-2 text-left transition hover:border-ink-muted",
                  isHoje ? "border-accent/50 bg-base-900/60" : "border-base-800 bg-base-950/40"
                )}
              >
                <p className="mb-2 flex items-baseline gap-1.5 px-0.5">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                    {DIAS_SEMANA[diaDaSemana]}
                  </span>
                  <span className={cn("text-sm font-semibold tabular-nums", isHoje ? "text-accent" : "text-ink-secondary")}>
                    {dia.slice(-2)}
                  </span>
                </p>
                {/* Sem limite: numa coluna alta cabe tudo, e esconder entrega
                    justamente no dia cheio é esconder o problema. */}
                <ItensDoDia dia={dia} limite={null} />
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="pb-1.5">
                {d}
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            {semanas.map((semana, i) => (
              <div key={i} className="grid grid-cols-7 gap-1.5">
                {semana.map((dia, j) => {
                  if (!dia) return <div key={j} className="min-h-[92px] rounded-lg" />;
                  const isHoje = dia === hojeIso;
                  return (
                    <div
                      key={j}
                      role="button"
                      tabIndex={0}
                      onClick={() => onNovaTarefa(dia)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onNovaTarefa(dia);
                        }
                      }}
                      title={dict.producao.novaTarefa}
                      className={cn(
                        "min-h-[92px] cursor-pointer rounded-lg border p-1.5 text-left transition hover:border-ink-muted",
                        isHoje ? "border-accent/50 bg-base-900/60" : "border-base-800 bg-base-950/40"
                      )}
                    >
                      <p className={cn("mb-1 px-0.5 text-[11px]", isHoje ? "font-semibold text-accent" : "text-ink-muted")}>
                        {Number(dia.slice(-2))}
                      </p>
                      <ItensDoDia dia={dia} limite={MAX_VISIVEIS_POR_DIA} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-critical/60" /> {dict.producao.legendaAltaUrgente}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-base-700" /> {dict.producao.legendaNormalBaixa}
        </span>
        {compromissosAgenda.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-3 shrink-0 rounded-sm border border-dashed border-base-500" /> {dict.producao.origemAgendaDica}
          </span>
        )}
      </div>

      {clientesComCorNoPeriodo.size > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-base-800 pt-2.5 text-[11px] text-ink-muted">
          <span className="font-medium text-ink-secondary">{dict.producao.legendaClientesLabel}</span>
          {[...clientesComCorNoPeriodo].map(([nome, cor]) => (
            <span key={nome} className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cor }} /> {nome}
            </span>
          ))}
        </div>
      )}

      {diaExpandido && (
        <DiaTarefasModal
          data={diaExpandido}
          tarefas={tarefasPorDia.get(diaExpandido) ?? []}
          onAbrirTarefa={(id) => {
            setDiaExpandido(null);
            onAbrirTarefa(id);
          }}
          onNovaTarefa={(data) => {
            setDiaExpandido(null);
            onNovaTarefa(data);
          }}
          onClose={() => setDiaExpandido(null)}
        />
      )}
    </Card>
  );
}
