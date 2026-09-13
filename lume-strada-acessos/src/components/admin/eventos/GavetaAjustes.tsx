"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { DatePicker } from "@/components/ui/DatePicker";
import { IconX, IconTrash } from "@/components/ui/icons";
import { FUSOS, cidadeDoFuso, deslocamentoDoFuso } from "@/lib/utils/fusos";
import { STATUS_EVENTO, type AmbienteRow, type EventoRow, type StatusEvento } from "@/lib/types/eventos";
import {
  atualizarEvento,
  mudarStatusEvento,
  removerEvento,
  criarAmbiente,
  renomearAmbiente,
  removerAmbiente,
} from "@/app/admin/eventos/actions";
import { ajustarEvento, type ChaveDeUso } from "@/app/admin/eventos/[id]/actions";

/**
 * A GAVETA DE AJUSTES — tudo o que é sobre o evento, e não dentro dele.
 *
 * Ela nasceu só com as chaves de "o que este evento usa", e isso deixou quatro
 * buracos que só apareceram quando alguém tentou usar o módulo de verdade:
 * não dava para acrescentar um palco depois de criar o evento, nem renomear
 * um, nem corrigir a data, nem apagar o evento. As Server Actions existiam
 * desde o começo — o que faltava era tela, que é a única parte que o usuário
 * enxerga.
 *
 * O buraco do palco era o pior dos quatro: a grade se desenha a partir dos
 * ambientes, então um evento criado sem palco — ou com o palco errado — ficava
 * sem saída. A pessoa teria que apagar o evento e refazer, e apagar também não
 * tinha botão.
 *
 * A ordem das seções é a de quem procura: primeiro o que se corrige com mais
 * frequência (a data mudou, o nome estava errado), depois os palcos, depois as
 * chaves, e por último o que não tem volta.
 */

const CAMPO =
  "w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-white/25 transition focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/25";
const ROTULO = "font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40";
const SECAO = "font-mono text-[10px] uppercase tracking-[0.24em] text-white/45";

/**
 * ISO → data e hora COMO O NAVEGADOR LÊ.
 *
 * De propósito, e é o espelho do que o formulário de criação faz: quem digitou
 * "quatro da manhã" digitou pensando no relógio da própria parede. Ler de
 * volta no fuso do evento mostraria outro número para a mesma pessoa que
 * acabou de escrever aquele — e ela concluiria, com razão, que o campo mudou
 * sozinho. O fuso do evento governa como a GRADE escreve as horas, não este
 * formulário.
 */
function partes(iso: string): { data: string; hora: string } {
  const d = new Date(iso);
  const dois = (n: number) => String(n).padStart(2, "0");
  return {
    data: `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`,
    hora: `${dois(d.getHours())}:${dois(d.getMinutes())}`,
  };
}

function instante(data: string, hora: string): string | null {
  if (!data || !hora) return null;
  const d = new Date(`${data}T${hora}:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function GavetaAjustes({
  evento,
  ambientes,
  clientes,
  onFechar,
}: {
  evento: EventoRow;
  ambientes: AmbienteRow[];
  clientes: { id: string; nome: string }[];
  onFechar: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const ini = partes(evento.inicio);
  const fim = partes(evento.fim);

  const [nome, setNome] = useState(evento.nome);
  const [clienteId, setClienteId] = useState(evento.cliente_id ?? "");
  const [local, setLocal] = useState(evento.local ?? "");
  const [fuso, setFuso] = useState(evento.fuso);
  const [dataInicio, setDataInicio] = useState(ini.data);
  const [horaInicio, setHoraInicio] = useState(ini.hora);
  const [dataFim, setDataFim] = useState(fim.data);
  const [horaFim, setHoraFim] = useState(fim.hora);

  const [novoPalco, setNovoPalco] = useState("");

  /**
   * A fase anda sozinha — "ao vivo" no play, "pós" ao encerrar — e por isso
   * este controle é o último da gaveta, e não o primeiro: mexer nele à mão é
   * exceção, não rotina. Existe pelos dois buracos que o automático não cobre:
   * "montagem", que é o dia chegando antes de o show começar, e "encerrado",
   * que é o arquivamento de um evento já entregue. Sem ele, um evento de um
   * ano atrás fica marcado como "pós" para sempre na lista.
   */
  function mudarFase(status: StatusEvento) {
    if (status === evento.status) return;
    iniciar(async () => {
      if (!reportar(await mudarStatusEvento(evento.id, status))) return;
      router.refresh();
    });
  }
  const [apagando, setApagando] = useState(false);

  const ERROS: Record<string, string> = {
    EVENTO_SEM_NOME: t.erroEventoSemNome,
    EVENTO_SEM_DATA: t.erroEventoSemData,
    EVENTO_FIM_ANTES: t.erroEventoFimAntes,
    AMBIENTE_SEM_NOME: t.erroAmbienteSemNome,
    EVENTO_NAO_ENCONTRADO: t.erroEventoNaoEncontrado,
  };

  function reportar(r: { ok: true } | { ok: false; error: string }): boolean {
    if (r.ok) {
      setErro(null);
      return true;
    }
    setErro(ERROS[r.error] ?? r.error);
    return false;
  }

  const mudou =
    nome !== evento.nome ||
    clienteId !== (evento.cliente_id ?? "") ||
    local !== (evento.local ?? "") ||
    fuso !== evento.fuso ||
    dataInicio !== ini.data ||
    horaInicio !== ini.hora ||
    dataFim !== fim.data ||
    horaFim !== fim.hora;

  function salvarDados() {
    const inicio = instante(dataInicio, horaInicio);
    const termino = instante(dataFim, horaFim);
    if (!inicio || !termino) {
      setErro(t.erroEventoSemData);
      return;
    }
    iniciar(async () => {
      const r = await atualizarEvento(evento.id, {
        nome,
        clienteId: clienteId || null,
        local: local || null,
        inicio,
        fim: termino,
        fuso,
        observacoes: evento.observacoes,
      });
      if (!reportar(r)) return;
      setSalvo(true);
      router.refresh();
    });
  }

  function acrescentarPalco() {
    const limpo = novoPalco.trim();
    if (!limpo) return;
    iniciar(async () => {
      const r = await criarAmbiente(evento.id, limpo);
      if (!reportar(r)) return;
      setNovoPalco("");
      router.refresh();
    });
  }

  function apagarEvento() {
    iniciar(async () => {
      const r = await removerEvento(evento.id);
      if (!reportar(r)) return;
      // Sai da tela ANTES do refresh: o evento não existe mais, e ficar nela
      // renderizaria um "não encontrado" no lugar de uma saída.
      router.push("/admin/eventos");
    });
  }

  const CHAVES: { chave: ChaveDeUso; ligado: boolean; titulo: string; texto: string }[] = [
    { chave: "usa_kit", ligado: evento.usa_kit, titulo: t.ajustesKit, texto: t.ajustesKitAjuda },
    { chave: "usa_realtime", ligado: evento.usa_realtime, titulo: t.ajustesRealtime, texto: t.ajustesRealtimeAjuda },
    { chave: "usa_ponto", ligado: evento.usa_ponto, titulo: t.ajustesPonto, texto: t.ajustesPontoAjuda },
    { chave: "usa_cache", ligado: evento.usa_cache, titulo: t.ajustesCache, texto: t.ajustesCacheAjuda },
    { chave: "usa_entregas", ligado: evento.usa_entregas, titulo: t.ajustesEntregas, texto: t.ajustesEntregasAjuda },
  ];

  function virar(chave: ChaveDeUso, valor: boolean) {
    iniciar(async () => {
      await ajustarEvento(evento.id, chave, valor);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={dict.common.fechar}
        onClick={onFechar}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
      />

      <aside className="ev-console fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-y-auto border-l border-white/10 shadow-2xl">
        <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />

        <div className="relative px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{t.gavetaAjustes}</p>
            <button
              type="button"
              onClick={onFechar}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition hover:text-white"
            >
              {dict.common.fechar}
            </button>
          </div>

          {erro && (
            <p className="mt-4 rounded-lg border border-danger/35 bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
              {erro}
            </p>
          )}

          {/* ---------------- dados do evento ---------------- */}
          <p className={cn(SECAO, "mt-6")}>{t.ajustesDados}</p>

          <div className="mt-3 space-y-4 rounded-xl border border-white/[0.08] bg-black/30 p-4">
            <div>
              <label className={ROTULO} htmlFor="aj-nome">
                {t.campoNome}
              </label>
              <input
                id="aj-nome"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setSalvo(false);
                }}
                className={cn(CAMPO, "mt-1.5")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={ROTULO} htmlFor="aj-cliente">
                  {t.campoCliente}
                </label>
                <select
                  id="aj-cliente"
                  value={clienteId}
                  onChange={(e) => {
                    setClienteId(e.target.value);
                    setSalvo(false);
                  }}
                  className={cn(CAMPO, "mt-1.5")}
                >
                  <option value="">{t.semCliente}</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={ROTULO} htmlFor="aj-local">
                  {t.campoLocal}
                </label>
                <input
                  id="aj-local"
                  value={local}
                  onChange={(e) => {
                    setLocal(e.target.value);
                    setSalvo(false);
                  }}
                  className={cn(CAMPO, "mt-1.5")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={ROTULO}>{t.campoInicio}</label>
                <div className="mt-1.5 flex gap-2">
                  <div className="min-w-0 flex-1">
                    <DatePicker
                      value={dataInicio}
                      onChange={(v) => {
                        setDataInicio(v);
                        setSalvo(false);
                      }}
                    />
                  </div>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => {
                      setHoraInicio(e.target.value);
                      setSalvo(false);
                    }}
                    className={cn(CAMPO, "w-[5.5rem] shrink-0 px-2 text-center font-mono tabular-nums")}
                  />
                </div>
              </div>
              <div>
                <label className={ROTULO}>{t.campoFim}</label>
                <div className="mt-1.5 flex gap-2">
                  <div className="min-w-0 flex-1">
                    <DatePicker
                      value={dataFim}
                      onChange={(v) => {
                        setDataFim(v);
                        setSalvo(false);
                      }}
                    />
                  </div>
                  <input
                    type="time"
                    value={horaFim}
                    onChange={(e) => {
                      setHoraFim(e.target.value);
                      setSalvo(false);
                    }}
                    className={cn(CAMPO, "w-[5.5rem] shrink-0 px-2 text-center font-mono tabular-nums")}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={ROTULO} htmlFor="aj-fuso">
                {t.fusoLabel}
              </label>
              <select
                id="aj-fuso"
                value={fuso}
                onChange={(e) => {
                  setFuso(e.target.value);
                  setSalvo(false);
                }}
                className={cn(CAMPO, "mt-1.5")}
              >
                {FUSOS.map((grupo) => (
                  <optgroup key={grupo.regiao} label={rotuloDaRegiao(grupo.regiao, t)}>
                    {grupo.fusos.map((f) => (
                      <option key={f} value={f}>
                        {cidadeDoFuso(f)} · {deslocamentoDoFuso(f)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3">
              {salvo && !mudou && (
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-status-good">
                  {t.ajustesSalvo}
                </span>
              )}
              <button
                type="button"
                onClick={salvarDados}
                disabled={pendente || !mudou || !nome.trim()}
                className="rounded-full px-4 py-2 text-xs font-semibold text-black transition hover:brightness-110 disabled:opacity-30"
                style={{ background: "rgb(var(--color-accent))" }}
              >
                {pendente ? dict.common.salvando : dict.common.salvar}
              </button>
            </div>
          </div>

          {/* ---------------- palcos ---------------- */}
          <p className={cn(SECAO, "mt-7")}>{t.campoAmbientes}</p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/35">{t.campoAmbientesAjuda}</p>

          <ul className="mt-3 space-y-1.5">
            {ambientes.length === 0 && (
              <li className="rounded-xl border border-danger/25 bg-danger/[0.05] px-4 py-3 text-[12px] leading-relaxed text-white/55">
                {t.ajustesSemPalco}
              </li>
            )}
            {ambientes.map((a) => (
              <Palco key={a.id} ambiente={a} ocupado={pendente} onErro={reportar} />
            ))}
          </ul>

          <div className="mt-2 flex gap-2">
            <input
              value={novoPalco}
              onChange={(e) => setNovoPalco(e.target.value)}
              placeholder={t.campoAmbientesPlaceholder}
              className={CAMPO}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  acrescentarPalco();
                }
              }}
            />
            <button
              type="button"
              onClick={acrescentarPalco}
              disabled={pendente || !novoPalco.trim()}
              className="shrink-0 rounded-lg border border-white/[0.12] px-3.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/55 transition hover:border-white/30 hover:text-white disabled:opacity-30"
            >
              {dict.common.adicionar}
            </button>
          </div>

          {/* ---------------- o que o evento usa ---------------- */}
          <p className={cn(SECAO, "mt-7")}>{t.ajustesTitulo}</p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/35">{t.ajustesAjuda}</p>

          <ul className="mt-3 space-y-2">
            {CHAVES.map((c) => (
              <li key={c.chave}>
                <button
                  type="button"
                  disabled={pendente}
                  onClick={() => virar(c.chave, !c.ligado)}
                  className={cn(
                    "flex w-full items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition disabled:opacity-50",
                    c.ligado ? "border-accent/40 bg-accent/[0.06]" : "border-white/[0.08] bg-black/40 hover:border-white/20"
                  )}
                >
                  <Chave ligada={c.ligado} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[14px] font-medium", c.ligado ? "text-white" : "text-white/70")}>
                      {c.titulo}
                    </span>
                    <span className="mt-1 block text-[11.5px] leading-relaxed text-white/45">{c.texto}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-3 font-mono text-[9.5px] leading-relaxed tracking-[0.06em] text-white/25">
            {t.ajustesRodape}
          </p>

          {/* ---------------- a fase ---------------- */}
          <p className={cn(SECAO, "mt-7")}>{t.ajustesStatus}</p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/35">{t.ajustesStatusAjuda}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {STATUS_EVENTO.map((st) => {
              const atual = st === evento.status;
              return (
                <button
                  key={st}
                  type="button"
                  disabled={pendente}
                  onClick={() => mudarFase(st)}
                  className={cn(
                    "rounded-lg border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition disabled:opacity-40",
                    atual
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-white/[0.09] text-white/40 hover:border-white/25 hover:text-white/75"
                  )}
                >
                  {t.status[st]}
                </button>
              );
            })}
          </div>

          {/* ---------------- o que não tem volta ---------------- */}
          <p className={cn(SECAO, "mt-8 text-danger/70")}>{t.ajustesPerigo}</p>

          <div className="mt-3 rounded-xl border border-danger/25 bg-danger/[0.04] p-4">
            <p className="text-[12px] leading-relaxed text-white/50">{t.ajustesPerigoAjuda}</p>

            {/* Dois toques, e o segundo diz o nome do evento. Um `confirm()` do
                navegador seria mais curto e diria menos: ninguém lê o texto de
                uma caixa cinza, e é o nome ali que faz a pessoa perceber que
                está apagando o evento errado. */}
            {apagando ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={apagarEvento}
                  disabled={pendente}
                  className="rounded-full bg-danger px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
                >
                  {substituir(t.ajustesPerigoConfirmar, { nome: evento.nome })}
                </button>
                <button
                  type="button"
                  onClick={() => setApagando(false)}
                  className="rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition hover:text-white"
                >
                  {dict.common.cancelar}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setApagando(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-danger/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-danger transition hover:bg-danger/10"
              >
                <IconTrash className="h-3.5 w-3.5" />
                {t.ajustesPerigo}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

/**
 * Um palco da lista.
 *
 * O nome é editável no lugar, e só grava quando o campo perde o foco ou a
 * pessoa aperta Enter — não a cada tecla. Gravar por tecla mandaria uma
 * requisição por letra e, pior, deixaria "Palco Princip" no banco durante
 * meio segundo, que é o tempo de outra tela ler dali.
 */
function Palco({
  ambiente,
  ocupado,
  onErro,
}: {
  ambiente: AmbienteRow;
  ocupado: boolean;
  onErro: (r: { ok: true } | { ok: false; error: string }) => boolean;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [, iniciar] = useTransition();
  const [nome, setNome] = useState(ambiente.nome);
  const [apagando, setApagando] = useState(false);

  function gravar() {
    const limpo = nome.trim();
    if (!limpo || limpo === ambiente.nome) {
      setNome(ambiente.nome);
      return;
    }
    iniciar(async () => {
      if (!onErro(await renomearAmbiente(ambiente.id, limpo))) {
        setNome(ambiente.nome);
        return;
      }
      router.refresh();
    });
  }

  function apagar() {
    iniciar(async () => {
      if (!onErro(await removerAmbiente(ambiente.id))) return;
      router.refresh();
    });
  }

  return (
    <li className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2">
      <span
        aria-hidden
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{
          background: ambiente.cor ?? "rgb(var(--color-accent))",
          boxShadow: `0 0 7px ${ambiente.cor ?? "rgb(var(--color-accent))"}`,
        }}
      />
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onBlur={gravar}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") setNome(ambiente.nome);
        }}
        aria-label={substituir(t.removerAmbienteDe, { ambiente: ambiente.nome })}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-white/85 focus:outline-none"
      />

      {apagando ? (
        <span className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={apagar}
            disabled={ocupado}
            className="rounded-md bg-danger px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white disabled:opacity-40"
          >
            {dict.common.remover}
          </button>
          <button
            type="button"
            onClick={() => setApagando(false)}
            className="rounded-md px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/35 hover:text-white"
          >
            {dict.common.cancelar}
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setApagando(true)}
          className="shrink-0 rounded-md p-1.5 text-white/25 transition hover:text-danger"
          aria-label={substituir(t.removerAmbienteDe, { ambiente: ambiente.nome })}
        >
          <IconX className="h-3.5 w-3.5" />
        </button>
      )}
    </li>
  );
}

/** O interruptor. Desenhado, não `<input type=checkbox>`: o resto da tela é console. */
function Chave({ ligada }: { ligada: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 flex h-[22px] w-[38px] shrink-0 items-center rounded-full border p-[3px] transition",
        ligada ? "justify-end border-accent/50 bg-accent/20" : "justify-start border-white/15 bg-black/60"
      )}
    >
      <span
        className={cn("h-[14px] w-[14px] rounded-full transition", ligada ? "shadow-[0_0_8px_rgb(var(--color-accent)/0.9)]" : "bg-white/25")}
        style={ligada ? { background: "rgb(var(--color-accent))" } : undefined}
      />
    </span>
  );
}

/** O rótulo da região sai do dicionário; a lista de fusos é código. */
function rotuloDaRegiao(
  regiao: "americaDoSul" | "americaDoNorte" | "europa",
  t: { fusoRegiaoAmericaDoSul: string; fusoRegiaoAmericaDoNorte: string; fusoRegiaoEuropa: string }
): string {
  if (regiao === "americaDoSul") return t.fusoRegiaoAmericaDoSul;
  if (regiao === "americaDoNorte") return t.fusoRegiaoAmericaDoNorte;
  return t.fusoRegiaoEuropa;
}
