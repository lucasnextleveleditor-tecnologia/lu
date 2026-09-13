"use client";

import { useState, useTransition, type FormEvent } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { fmtDataCurta, todayISO } from "@/lib/utils/format";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { FUSOS, cidadeDoFuso, deslocamentoDoFuso, fusoValido } from "@/lib/utils/fusos";
import type { BaseParaDuplicar } from "@/app/admin/eventos/data";
import { IconPlus, IconX, IconChevronRight } from "@/components/ui/icons";
import { criarEvento } from "@/app/admin/eventos/actions";
import type { EventoComResumo, StatusEvento } from "@/lib/types/eventos";

/**
 * A LISTA DE EVENTOS — a porta do módulo.
 *
 * Foi reescrita por um motivo que não é estético: a porta não parecia com a
 * sala. Dentro do evento tudo é console — superfície própria, linhas de
 * monitor, rótulo em mono, número grande. Aqui fora era formulário de painel
 * comum, com campo claro e etiqueta cinza. Quem entrava pela primeira vez
 * julgava o módulo inteiro por esta tela, e julgava errado.
 *
 * Cada linha responde, de relance, as três coisas que se quer saber de um
 * evento sem abri-lo: quando é, em que fase está, e — o número que só este
 * módulo tem — quanto da cobertura já existe. O contador de PERDIDO vem em
 * vermelho e separado porque é o único que não dá para consertar depois: uma
 * foto não feita às duas da manhã não vai ser feita mais.
 */

/** Campo de texto do console. Preto, borda fina, foco na cor da marca. */
const CAMPO =
  "w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-white/25 transition focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/25";

/** O rótulo de cada campo: mono, maiúsculo, espaçado — etiqueta de equipamento. */
const ROTULO = "font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40";

export function EventosWorkspace({
  eventos,
  clientes,
  bases,
  titulo,
  subtitulo,
  aviso,
}: {
  eventos: EventoComResumo[];
  clientes: { id: string; nome: string }[];
  /** Modelos salvos e eventos recentes — de onde um evento novo pode nascer pronto. */
  bases: BaseParaDuplicar[];
  titulo: string;
  subtitulo: string;
  /** A faixa de "módulo em construção" — some sozinha quando o módulo abrir. */
  aviso: { titulo: string; texto: string } | null;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const [modalAberto, setModalAberto] = useState(false);

  const aoVivo = eventos.filter((e) => e.status === "ao_vivo").length;

  return (
    <div className="space-y-4">
      {/* --- o cabeçalho, que é o console --- */}
      <div className="ev-console relative overflow-hidden rounded-2xl border border-white/10">
        <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full opacity-[0.16] blur-[90px]"
          style={{ background: "rgb(var(--color-accent))" }}
        />
        {/* A varredura: é ela que faz o painel parecer ligado em vez de impresso. */}
        <div
          aria-hidden
          className="ev-varredura pointer-events-none absolute inset-y-0 w-1/3"
          style={{ background: "linear-gradient(90deg, transparent, rgb(var(--color-accent) / 0.05), transparent)" }}
        />

        <div className="relative px-5 py-6 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.28em]"
                style={{ color: "rgb(var(--color-accent))" }}
              >
                {t.tituloPagina}
              </p>
              <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-white sm:text-2xl">{titulo}</h1>
              <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-white/45">{subtitulo}</p>
            </div>

            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-black transition hover:brightness-110"
              style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 22px rgb(var(--color-accent) / 0.45)" }}
            >
              <IconPlus className="h-4 w-4" />
              {t.novoEvento}
            </button>
          </div>

          {/* A régua de baixo: contagem à esquerda, estado do módulo à direita. */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.07] pt-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              {eventos.length === 0 ? t.listaVazia : substituir(t.listaContagem, { n: eventos.length })}
            </span>
            {aoVivo > 0 && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-danger">
                <span className="ev-rec h-1.5 w-1.5 rounded-full bg-danger" />
                {aoVivo} {t.status.ao_vivo}
              </span>
            )}
            {aviso && (
              <span className="ml-auto inline-flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-accent/80">
                <span className="ev-pendente h-1 w-1 rounded-full bg-accent" />
                {aviso.titulo}
              </span>
            )}
          </div>

          {aviso && <p className="mt-2 text-[11.5px] leading-relaxed text-white/35">{aviso.texto}</p>}
        </div>
      </div>

      {eventos.length === 0 ? (
        <PortaVazia onCriar={() => setModalAberto(true)} />
      ) : (
        <div className="space-y-2">
          {eventos.map((e) => (
            <LinhaDoEvento key={e.id} evento={e} />
          ))}
        </div>
      )}

      {modalAberto && <ModalNovoEvento clientes={clientes} bases={bases} onClose={() => setModalAberto(false)} />}
    </div>
  );
}

// ----------------------------------------------------------------------------
// A tela sem nenhum evento
// ----------------------------------------------------------------------------

/**
 * O VAZIO MOSTRA O MAPA.
 *
 * Antes ele dizia só "nenhum evento cadastrado ainda" — e quem chegava aqui
 * ficava sem a menor ideia do que existe atrás da porta. Como TODO o módulo
 * mora dentro de um evento, a lista vazia é literalmente a única coisa que uma
 * pessoa nova vê: ela julga o módulo inteiro por uma caixa tracejada com uma
 * frase dentro.
 *
 * Então o vazio virou o mapa: os três modos, o que cada um responde, e as
 * gavetas que abrem em qualquer um deles. Não é enfeite — é a explicação de
 * para que serve criar o primeiro evento.
 */
function PortaVazia({ onCriar }: { onCriar: () => void }) {
  const { dict } = useLocale();
  const t = dict.eventos;

  const MODOS = [
    { nome: t.modoPlano, quando: t.modoPlanoQuando, cor: "#38bdf8" },
    { nome: t.modoAoVivo, quando: t.modoAoVivoQuando, cor: "#f43f5e" },
    { nome: t.modoFechamento, quando: t.modoFechamentoQuando, cor: "#a78bfa" },
  ];

  const GAVETAS = [t.gavetaEquipe, t.gavetaKit, t.gavetaOcorrencia, t.gavetaRealtime, t.gavetaAjustes];

  return (
    <div className="ev-console relative overflow-hidden rounded-2xl border border-white/10">
      <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />

      <div className="relative px-5 py-8 sm:px-8 sm:py-10">
        <div className="text-center">
          <p className="text-[15px] font-medium text-white/90">{t.listaVaziaTitulo}</p>
          <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-white/40">{t.listaVaziaTexto}</p>
        </div>

        {/* --- o mapa --- */}
        <p className="mt-9 text-center font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/30">
          {t.mapaTitulo}
        </p>

        <div className="mx-auto mt-4 grid max-w-2xl gap-2.5 sm:grid-cols-3">
          {MODOS.map((m) => (
            <div
              key={m.nome}
              className="rounded-xl border border-white/[0.08] bg-black/40 px-4 py-4 text-center"
              style={{ boxShadow: `inset 0 1px 0 0 ${m.cor}33` }}
            >
              <span
                aria-hidden
                className="mx-auto block h-1 w-8 rounded-full"
                style={{ background: m.cor, boxShadow: `0 0 10px ${m.cor}` }}
              />
              <p className="mt-3 text-[13.5px] font-medium text-white/90">{m.nome}</p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">{m.quando}</p>
            </div>
          ))}
        </div>

        {/* A linha que liga os modos às gavetas — elas abrem em qualquer um. */}
        <div aria-hidden className="mx-auto mt-3 h-5 w-px bg-gradient-to-b from-white/15 to-transparent" />

        <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-1.5">
          {GAVETAS.map((g) => (
            <span
              key={g}
              className="rounded-full border border-white/[0.09] px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/45"
            >
              {g}
            </span>
          ))}
        </div>

        <p className="mx-auto mt-4 max-w-md text-center text-[11.5px] leading-relaxed text-white/30">{t.mapaAjuda}</p>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={onCriar}
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold text-black transition hover:brightness-110"
            style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 22px rgb(var(--color-accent) / 0.45)" }}
          >
            <IconPlus className="h-4 w-4" />
            {t.novoEvento}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------

const TOM_DO_STATUS: Record<StatusEvento, string> = {
  planejamento: "border-white/15 text-white/45",
  montagem: "border-status-warning/40 text-status-warning",
  ao_vivo: "border-danger/50 text-danger",
  pos: "border-white/15 text-white/60",
  encerrado: "border-white/[0.08] text-white/30",
};

function LinhaDoEvento({ evento }: { evento: EventoComResumo }) {
  const { dict } = useLocale();
  const t = dict.eventos;

  const cobertura =
    evento.capturas_total > 0 ? Math.round((evento.capturas_captadas / evento.capturas_total) * 100) : null;

  return (
    <a
      href={`/admin/eventos/${evento.id}`}
      className="ev-console group relative flex flex-wrap items-center gap-x-5 gap-y-3 overflow-hidden rounded-xl border border-white/[0.09] px-4 py-4 transition hover:border-accent/35"
    >
      <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0 opacity-50" />

      {/* O filete da esquerda acende no hover — é o que diz "isto abre". */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[2px] opacity-0 transition group-hover:opacity-100"
        style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 12px rgb(var(--color-accent) / 0.8)" }}
      />

      <div className="relative min-w-[12rem] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-medium text-white">{evento.nome}</span>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]",
              TOM_DO_STATUS[evento.status]
            )}
          >
            {/* O ao vivo pisca: é o único estado em que alguém precisa estar olhando agora. */}
            {evento.status === "ao_vivo" && (
              <span className="ev-rec mr-1 inline-block h-1 w-1 rounded-full bg-danger align-middle" />
            )}
            {t.status[evento.status]}
          </span>
        </div>
        <p className="mt-0.5 truncate font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/35">
          {[evento.cliente_nome, evento.local].filter(Boolean).join(" · ") || t.semCliente}
        </p>
      </div>

      <div className="relative font-mono text-[11px] tabular-nums text-white/60">
        {fmtDataCurta(evento.inicio.slice(0, 10))}
        {evento.fim.slice(0, 10) !== evento.inicio.slice(0, 10) && (
          <span className="text-white/30"> → {fmtDataCurta(evento.fim.slice(0, 10))}</span>
        )}
      </div>

      <div className="relative flex items-center gap-4 font-mono text-[11px] tabular-nums">
        <Numero valor={String(evento.ambientes)} rotulo={t.numeroAmbientes} />
        <Numero valor={String(evento.equipe)} rotulo={t.numeroEquipe} />
        {cobertura === null ? (
          <span className="text-[9px] uppercase tracking-[0.12em] text-white/25">{t.semPauta}</span>
        ) : (
          <>
            <Numero valor={`${cobertura}%`} rotulo={t.numeroCobertura} acento />
            {evento.capturas_perdidas > 0 && (
              <Numero valor={String(evento.capturas_perdidas)} rotulo={t.numeroPerdido} alerta />
            )}
          </>
        )}
      </div>

      <IconChevronRight className="relative h-4 w-4 shrink-0 text-white/25 transition group-hover:text-accent" />
    </a>
  );
}

function Numero({ valor, rotulo, acento, alerta }: { valor: string; rotulo: string; acento?: boolean; alerta?: boolean }) {
  return (
    <span className="text-center">
      <span
        className={cn("block text-[15px] font-semibold leading-none", alerta ? "text-danger" : "text-white")}
        style={acento ? { color: "rgb(var(--color-accent))" } : undefined}
      >
        {valor}
      </span>
      <span className="mt-1 block text-[8.5px] uppercase tracking-[0.14em] text-white/30">{rotulo}</span>
    </span>
  );
}

// ----------------------------------------------------------------------------
// Novo evento
// ----------------------------------------------------------------------------

/**
 * O formulário cria o evento E os primeiros ambientes.
 *
 * Os dois juntos porque um evento sem ambiente não desenha grade nenhuma — a
 * tela seguinte seria uma tela vazia pedindo para cadastrar algo antes de
 * poder fazer qualquer coisa. Quem está criando já sabe quantos palcos vai ter.
 *
 * A ORDEM DOS CAMPOS é a ordem em que a cabeça responde: o que é, de quem é e
 * onde, quando, e só então onde a equipe vai estar. O fuso e o modelo ficam
 * numa gaveta fechada no rodapé porque na esmagadora maioria das vezes o
 * evento é em casa e nasce do zero — e campo que quase ninguém mexe, aberto,
 * é campo que todo mundo lê antes de ignorar.
 */
function ModalNovoEvento({
  clientes,
  bases,
  onClose,
}: {
  clientes: { id: string; nome: string }[];
  bases: BaseParaDuplicar[];
  onClose: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;

  const hoje = todayISO();
  const [nome, setNome] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [local, setLocal] = useState("");
  const [baseId, setBaseId] = useState("");
  // `Intl` devolve o fuso do navegador; `fusoValido` derruba para o padrão
  // quando ele não está na lista curada (alguém em Tóquio cadastrando um
  // evento no Brasil, por exemplo). Na esmagadora maioria das vezes o evento é
  // em casa, e acertar sozinho poupa um campo.
  const [fuso, setFuso] = useState(() => fusoValido(Intl.DateTimeFormat().resolvedOptions().timeZone));
  const [dataInicio, setDataInicio] = useState(hoje);
  const [horaInicio, setHoraInicio] = useState("20:00");
  const [dataFim, setDataFim] = useState(hoje);
  const [horaFim, setHoraFim] = useState("04:00");
  const [ambientes, setAmbientes] = useState<string[]>(["Palco principal"]);
  const [novoAmbiente, setNovoAmbiente] = useState("");
  const [avancado, setAvancado] = useState(false);
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const ERROS: Record<string, string> = {
    EVENTO_SEM_NOME: t.erroEventoSemNome,
    EVENTO_SEM_DATA: t.erroEventoSemData,
    EVENTO_FIM_ANTES: t.erroEventoFimAntes,
    AMBIENTE_SEM_NOME: t.erroAmbienteSemNome,
  };

  /**
   * Junta data + hora no instante com fuso.
   *
   * `new Date("2026-09-12T04:00:00")` sem sufixo de fuso é lido pelo navegador
   * no fuso DE QUEM ESTÁ OLHANDO — que é exatamente o que se quer: a pessoa
   * digitou "quatro da manhã" pensando no relógio dela. O `toISOString()`
   * converte para UTC na hora de gravar.
   */
  function instante(data: string, hora: string): string | null {
    if (!data || !hora) return null;
    const d = new Date(`${data}T${hora}:00`);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  function adicionarAmbiente() {
    const limpo = novoAmbiente.trim();
    if (!limpo || ambientes.length >= 20) return;
    if (ambientes.some((a) => a.toLowerCase() === limpo.toLowerCase())) return;
    setAmbientes((a) => [...a, limpo]);
    setNovoAmbiente("");
  }

  function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    const inicio = instante(dataInicio, horaInicio);
    const fim = instante(dataFim, horaFim);
    if (!inicio || !fim) {
      setErro(t.erroEventoSemData);
      return;
    }

    iniciar(async () => {
      const r = await criarEvento(
        { nome, clienteId: clienteId || null, local: local || null, inicio, fim, fuso, observacoes: null },
        ambientes,
        baseId || null
      );
      if (!r.ok) {
        setErro(ERROS[r.error] ?? r.error);
        return;
      }
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="ev-console relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/[0.12] shadow-2xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 left-1/3 h-64 w-64 rounded-full opacity-[0.18] blur-[80px]"
          style={{ background: "rgb(var(--color-accent))" }}
        />

        <div className="relative px-6 py-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.28em]"
                style={{ color: "rgb(var(--color-accent))" }}
              >
                {t.novoEvento}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/40">{t.novoEventoAjuda}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={dict.common.fechar}
              className="shrink-0 rounded-lg border border-white/10 p-1.5 text-white/40 transition hover:border-white/25 hover:text-white"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          </div>

          <form onSubmit={salvar} className="mt-6 space-y-5">
            {/* --- o que é --- */}
            <div>
              <label className={ROTULO} htmlFor="ev-nome">
                {t.campoNome}
              </label>
              <input
                id="ev-nome"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder={t.campoNomePlaceholder}
                className={cn(CAMPO, "mt-1.5 text-[15px]")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={ROTULO} htmlFor="ev-cliente">
                  {t.campoCliente}
                </label>
                <select
                  id="ev-cliente"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
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
                <label className={ROTULO} htmlFor="ev-local">
                  {t.campoLocal}
                </label>
                <input
                  id="ev-local"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  placeholder={t.campoLocalPlaceholder}
                  className={cn(CAMPO, "mt-1.5")}
                />
              </div>
            </div>

            {/* --- quando ---
                Data E hora, nos dois lados. Um evento que começa 20h de sábado
                e termina 4h de domingo é a regra, não a exceção — e sem a hora
                a grade não sabe onde começar a desenhar. */}
            <div className="rounded-xl border border-white/[0.08] bg-black/30 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={ROTULO}>{t.campoInicio}</label>
                  <div className="mt-1.5 flex gap-2">
                    <div className="min-w-0 flex-1">
                      <DatePicker value={dataInicio} onChange={setDataInicio} />
                    </div>
                    <input
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      className={cn(CAMPO, "w-[5.5rem] shrink-0 px-2 text-center font-mono tabular-nums")}
                    />
                  </div>
                </div>
                <div>
                  <label className={ROTULO}>{t.campoFim}</label>
                  <div className="mt-1.5 flex gap-2">
                    <div className="min-w-0 flex-1">
                      <DatePicker value={dataFim} onChange={setDataFim} />
                    </div>
                    <input
                      type="time"
                      value={horaFim}
                      onChange={(e) => setHoraFim(e.target.value)}
                      className={cn(CAMPO, "w-[5.5rem] shrink-0 px-2 text-center font-mono tabular-nums")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- onde a equipe vai estar --- */}
            <div>
              <label className={ROTULO}>{t.campoAmbientes}</label>
              <p className="mt-1 text-[11.5px] leading-relaxed text-white/30">{t.campoAmbientesAjuda}</p>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {ambientes.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-accent/[0.08] py-1.5 pl-3 pr-1.5 text-[11.5px] text-white/85"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() => setAmbientes((lista) => lista.filter((x) => x !== a))}
                      className="rounded-full p-0.5 text-white/35 transition hover:text-danger"
                      aria-label={substituir(t.removerAmbienteDe, { ambiente: a })}
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="mt-2 flex gap-2">
                <input
                  value={novoAmbiente}
                  onChange={(e) => setNovoAmbiente(e.target.value)}
                  placeholder={t.campoAmbientesPlaceholder}
                  className={CAMPO}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      adicionarAmbiente();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={adicionarAmbiente}
                  disabled={!novoAmbiente.trim()}
                  className="shrink-0 rounded-lg border border-white/[0.12] px-3.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/55 transition hover:border-white/30 hover:text-white disabled:opacity-30"
                >
                  {dict.common.adicionar}
                </button>
              </div>
            </div>

            {/* --- a gaveta do que quase ninguém mexe --- */}
            <div className="rounded-xl border border-white/[0.07]">
              <button
                type="button"
                onClick={() => setAvancado((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/35">
                  {t.avancadoTitulo}
                </span>
                <span className="font-mono text-[13px] leading-none text-white/30">{avancado ? "−" : "+"}</span>
              </button>

              {avancado && (
                <div className="space-y-4 border-t border-white/[0.07] px-4 py-4">
                  {/* O fuso é do LOCAL do evento, não de quem está cadastrando:
                      quem opera de São Paulo um show em Lisboa precisa da grade
                      na hora de Lisboa. */}
                  <div>
                    <label className={ROTULO} htmlFor="ev-fuso">
                      {t.fusoLabel}
                    </label>
                    <select
                      id="ev-fuso"
                      value={fuso}
                      onChange={(e) => setFuso(e.target.value)}
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
                    <p className="mt-1.5 text-[11px] leading-relaxed text-white/30">{t.fusoAjuda}</p>
                  </div>

                  <div>
                    <label className={ROTULO} htmlFor="ev-base">
                      {t.baseLabel}
                    </label>
                    <select
                      id="ev-base"
                      value={baseId}
                      onChange={(e) => setBaseId(e.target.value)}
                      className={cn(CAMPO, "mt-1.5")}
                    >
                      <option value="">{t.baseDoZero}</option>
                      {bases.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.modelo ? `${b.nome} · ${t.baseModelo}` : b.nome}
                        </option>
                      ))}
                    </select>
                    {baseId && <p className="mt-1.5 text-[11px] leading-relaxed text-accent/70">{t.baseAjuda}</p>}
                  </div>
                </div>
              )}
            </div>

            {erro && (
              <p className="rounded-lg border border-danger/35 bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
                {erro}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-white/[0.07] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition hover:text-white"
              >
                {dict.common.cancelar}
              </button>
              <button
                type="submit"
                disabled={pendente || !nome.trim()}
                className="rounded-full px-5 py-2.5 text-xs font-semibold text-black transition hover:brightness-110 disabled:opacity-30 disabled:shadow-none"
                style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 22px rgb(var(--color-accent) / 0.45)" }}
              >
                {pendente ? dict.common.salvando : t.criarEvento}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
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
