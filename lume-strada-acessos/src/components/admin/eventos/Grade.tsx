"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fusoValido } from "@/lib/utils/fusos";
import { estadoDaCaptura, type AmbienteRow, type BlocoRow, type CapturaRow, type EstadoCaptura } from "@/lib/types/eventos";

/**
 * A GRADE — ambientes nas linhas, tempo nas colunas.
 *
 * É o mesmo componente no Plano e no Ao Vivo, e isso não é economia de código:
 * é a razão de o módulo funcionar. A pessoa passa a semana olhando esta tela
 * para montar o evento e chega no sábado olhando ELA DE NOVO, com o relógio
 * correndo por cima. Se fossem dois desenhos diferentes, o sábado começaria
 * com uma tela nova para aprender — no pior momento possível para aprender
 * qualquer coisa.
 *
 * O QUE MUDA ENTRE OS DOIS MODOS é pouco e é de propósito: no Plano dá para
 * criar bloco clicando no vazio e a linha AGORA só aparece se o evento for
 * hoje; no Ao Vivo a linha corre, o passado escurece e o bloco mostra a
 * cobertura. A grade é a mesma.
 *
 * O TEMPO AQUI É SEMPRE ABSOLUTO (ISO com fuso). O fuso do evento decide
 * apenas como as horas são ESCRITAS — a linha AGORA é o relógio de verdade e
 * não muda de lugar por causa dele. Um evento em Lisboa visto do Brasil mostra
 * "23:00" no eixo e a linha no ponto certo, que é o que a produção precisa.
 */

const MINUTO = 60_000;
const HORA = 60 * MINUTO;

/** Largura da coluna de nomes. Caixa alta com tracking largo ocupa mais do que parece. */
const ROTULO_W = 148;

/**
 * A paleta das faixas, na ordem dos ambientes.
 *
 * Cor por AMBIENTE e não por tipo de bloco: no meio do evento a pergunta é
 * "o que está rolando no palco 2?", e a resposta tem que sair pela cor da
 * linha, de relance. O tipo do bloco já se distingue pela forma — barra para
 * o que tem duração, pino para o instante.
 */
const PALETA = ["#84CC16", "#F59E0B", "#A78BFA", "#38BDF8", "#F472B6", "#2DD4BF"] as const;

export function corDoAmbiente(ambiente: Pick<AmbienteRow, "cor">, indice: number): string {
  return ambiente.cor ?? PALETA[indice % PALETA.length]!;
}

// ----------------------------------------------------------------------------
// O relógio
// ----------------------------------------------------------------------------

/**
 * O agora, em milissegundos — `null` até a primeira pintura no navegador.
 *
 * O `null` inicial não é preguiça: um componente cliente também renderiza no
 * SERVIDOR, e um `Date.now()` lá em cima daria um HTML com um horário e uma
 * hidratação com outro. O React reclama, e perto da meia-noite a diferença é
 * de um dia inteiro. Então a linha AGORA simplesmente não existe no primeiro
 * quadro, e aparece no segundo.
 *
 * 15 segundos entre batidas: numa grade de seis horas, isso move a linha menos
 * de um pixel — mas é o bastante para ela nunca parecer travada, e barato o
 * suficiente para rodar a noite inteira num celular.
 */
export function useRelogio(ativo = true): number | null {
  const [agora, setAgora] = useState<number | null>(null);

  useEffect(() => {
    if (!ativo) return;
    setAgora(Date.now());
    const id = setInterval(() => setAgora(Date.now()), 15_000);
    return () => clearInterval(id);
  }, [ativo]);

  return agora;
}

// ----------------------------------------------------------------------------
// Fuso
// ----------------------------------------------------------------------------

/** Quantos minutos o fuso está à frente do UTC NESTE instante (horário de verão incluído). */
function offsetEmMinutos(fuso: string, quando: number): number {
  const parte = new Intl.DateTimeFormat("en-US", { timeZone: fuso, timeZoneName: "longOffset" })
    .formatToParts(new Date(quando))
    .find((p) => p.type === "timeZoneName")?.value;
  if (!parte || parte === "GMT") return 0;
  const m = parte.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!m) return 0;
  const sinal = m[1] === "-" ? -1 : 1;
  return sinal * (Number(m[2]) * 60 + Number(m[3]));
}

function horaEscrita(quando: number, fuso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: fuso, hour: "2-digit", minute: "2-digit", hour12: false }).format(
    new Date(quando)
  );
}

// ----------------------------------------------------------------------------
// A grade
// ----------------------------------------------------------------------------

export interface GradeProps {
  ambientes: AmbienteRow[];
  blocos: BlocoRow[];
  capturas: CapturaRow[];
  /** Fuso do evento — só muda como as horas são escritas. */
  fuso: string;
  /** A janela que a grade desenha. */
  inicio: string;
  fim: string;
  modo: "plano" | "aovivo";
  blocoSelecionadoId?: string | null;
  onAbrirBloco?: (bloco: BlocoRow) => void;
  /** Clique no vazio: cria bloco naquele ambiente, naquele minuto (já arredondado). */
  onCriarAqui?: (ambienteId: string, inicioISO: string, duracaoMin?: number) => void;
}

export function Grade({
  ambientes,
  blocos,
  capturas,
  fuso,
  inicio,
  fim,
  modo,
  blocoSelecionadoId,
  onAbrirBloco,
  onCriarAqui,
}: GradeProps) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const zona = fusoValido(fuso);
  const agora = useRelogio();

  // A janela desenhada estica para caber bloco que passou do fim previsto —
  // evento atrasa, e um bloco desenhado fora da tela é um bloco que ninguém vê.
  const { de, ate } = useMemo(() => {
    let de = new Date(inicio).getTime();
    let ate = new Date(fim).getTime();
    for (const b of blocos) {
      de = Math.min(de, new Date(b.inicio).getTime());
      ate = Math.max(ate, new Date(b.fim ?? b.inicio).getTime());
    }
    // Meia hora de respiro dos dois lados: bloco colado na borda não dá para ler.
    return { de: de - 30 * MINUTO, ate: ate + 30 * MINUTO };
  }, [inicio, fim, blocos]);

  const total = Math.max(ate - de, HORA);
  const pct = (quando: number) => ((quando - de) / total) * 100;

  /** As marcas de hora, no fuso do evento. */
  const marcas = useMemo(() => {
    const off = offsetEmMinutos(zona, de) * MINUTO;
    const primeira = Math.ceil((de + off) / HORA) * HORA - off;
    const lista: number[] = [];
    for (let q = primeira; q <= ate; q += HORA) lista.push(q);
    return lista;
  }, [de, ate, zona]);

  const capturasPorBloco = useMemo(() => {
    const mapa = new Map<string, CapturaRow[]>();
    for (const c of capturas) {
      if (!c.bloco_id) continue;
      const lista = mapa.get(c.bloco_id) ?? [];
      lista.push(c);
      mapa.set(c.bloco_id, lista);
    }
    return mapa;
  }, [capturas]);

  const agoraVisivel = agora !== null && agora >= de && agora <= ate;

  return (
    <div className="ev-console relative overflow-hidden rounded-2xl border border-white/10">
      <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />
      <Cantos />

      <div className="relative px-4 py-5 sm:px-6">
        <BarraDaGrade zona={zona} agora={agora} modo={modo} />

        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[720px]">
            <Regua marcas={marcas} pct={pct} zona={zona} />

            <div className="relative">
              {agoraVisivel && <LinhaDoAgora esquerda={pct(agora!)} rotulo={t.consoleAgora} />}

              <div className="space-y-2 pb-7">
                {ambientes.length === 0 && (
                  <p className="py-8 text-center text-xs text-white/40">{t.gradeSemAmbientes}</p>
                )}

                {ambientes.map((amb, i) => (
                  <Faixa
                    key={amb.id}
                    ambiente={amb}
                    cor={corDoAmbiente(amb, i)}
                    blocos={blocos.filter((b) => b.ambiente_id === amb.id)}
                    capturasPorBloco={capturasPorBloco}
                    pct={pct}
                    de={de}
                    total={total}
                    zona={zona}
                    agora={agora}
                    modo={modo}
                    selecionadoId={blocoSelecionadoId ?? null}
                    onAbrirBloco={onAbrirBloco}
                    onCriarAqui={onCriarAqui}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <Legenda />
      </div>
    </div>
  );
}

/** A moldura do visor: quatro cantos, nunca a borda fechada. */
function Cantos() {
  const base = "pointer-events-none absolute h-5 w-5 border-white/20";
  return (
    <div aria-hidden>
      <span className={cn(base, "left-3 top-3 border-l border-t")} />
      <span className={cn(base, "right-3 top-3 border-r border-t")} />
      <span className={cn(base, "bottom-3 left-3 border-b border-l")} />
      <span className={cn(base, "bottom-3 right-3 border-b border-r")} />
    </div>
  );
}

function BarraDaGrade({ zona, agora, modo }: { zona: string; agora: number | null; modo: "plano" | "aovivo" }) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const aoVivo = modo === "aovivo";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
      <span className="inline-flex items-center gap-2">
        {aoVivo ? (
          <>
            <span className="ev-rec h-1.5 w-1.5 rounded-full bg-danger shadow-[0_0_8px_rgb(239_68_68/0.9)]" />
            {t.gradeAoVivo}
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            {t.gradePlano}
          </>
        )}
      </span>
      <span className="inline-flex items-center gap-3 tabular-nums">
        <span className="text-white/30">{zona.split("/").pop()?.replace(/_/g, " ")}</span>
        {/* `suppressHydrationWarning` não resolveria: o relógio só existe
            depois de montar, então aqui fica um traço até lá. */}
        <span style={{ color: "rgb(var(--color-accent))" }}>{agora === null ? "--:--" : horaEscrita(agora, zona)}</span>
      </span>
    </div>
  );
}

function Regua({ marcas, pct, zona }: { marcas: number[]; pct: (q: number) => number; zona: string }) {
  return (
    <div className="relative mb-2 h-4" style={{ marginLeft: ROTULO_W }}>
      {marcas.map((q) => (
        <span
          key={q}
          className="absolute -translate-x-1/2 font-mono text-[9.5px] tabular-nums text-white/35"
          style={{ left: `${pct(q)}%` }}
        >
          {horaEscrita(q, zona)}
        </span>
      ))}
    </div>
  );
}

function LinhaDoAgora({ esquerda, rotulo }: { esquerda: number; rotulo: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-0 top-0 z-20"
      style={{ left: `calc(${ROTULO_W}px + (100% - ${ROTULO_W}px) * ${esquerda / 100})` }}
    >
      <span
        className="ev-agora absolute inset-y-0 -left-px w-0.5 rounded-full"
        style={{
          background: "rgb(var(--color-accent))",
          boxShadow: "0 0 12px rgb(var(--color-accent)), 0 0 28px rgb(var(--color-accent) / 0.5)",
        }}
      />
      <span
        className="absolute -top-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
        style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 10px rgb(var(--color-accent))" }}
      />
      <span
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.2em]"
        style={{ color: "rgb(var(--color-accent))" }}
      >
        {rotulo}
      </span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Uma faixa (um ambiente)
// ----------------------------------------------------------------------------

interface FaixaProps {
  ambiente: AmbienteRow;
  cor: string;
  blocos: BlocoRow[];
  capturasPorBloco: Map<string, CapturaRow[]>;
  pct: (q: number) => number;
  de: number;
  total: number;
  zona: string;
  agora: number | null;
  modo: "plano" | "aovivo";
  selecionadoId: string | null;
  onAbrirBloco?: (bloco: BlocoRow) => void;
  onCriarAqui?: (ambienteId: string, inicioISO: string, duracaoMin?: number) => void;
}

function Faixa({
  ambiente,
  cor,
  blocos,
  capturasPorBloco,
  pct,
  de,
  total,
  zona,
  agora,
  modo,
  selecionadoId,
  onAbrirBloco,
  onCriarAqui,
}: FaixaProps) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const trilha = useRef<HTMLDivElement>(null);
  /** O bloco sendo desenhado agora. Instantes em ms, não ISO: isto é aritmética. */
  const [arrasto, setArrasto] = useState<{ de: number; ate: number } | null>(null);

  /**
   * ARRASTAR NO VAZIO DESENHA O BLOCO. Clicar sem arrastar continua criando um
   * de uma hora.
   *
   * As duas coisas existem porque são duas cabeças. Quem já sabe que o show
   * dura quarenta minutos desenha os quarenta e pula a etapa do painel; quem
   * ainda não sabe toca uma vez e resolve a duração lá dentro, com os +/−. Ter
   * só o clique obrigava todo mundo a corrigir 60 minutos depois; ter só o
   * arrasto obrigaria a mirar com o dedo antes de pensar.
   *
   * Tudo arredondado para 5 minutos: a precisão que o dedo tem numa barra de
   * seis horas é de uns 15, e um bloco que nasce "22:03" faz a pessoa corrigir
   * antes de fazer qualquer outra coisa. Cinco é fino o bastante para caber
   * uma passagem de som e grosso o bastante para nunca nascer torto.
   */
  const PASSO = 5 * MINUTO;

  function instanteDoX(clientX: number): number | null {
    if (!trilha.current) return null;
    const caixa = trilha.current.getBoundingClientRect();
    const fracao = Math.min(1, Math.max(0, (clientX - caixa.left) / caixa.width));
    return Math.round((de + fracao * total) / PASSO) * PASSO;
  }

  function comecarArrasto(e: React.PointerEvent<HTMLDivElement>) {
    if (modo !== "plano" || !onCriarAqui) return;
    // Só o vazio. Em cima de um bloco, o clique é dele.
    if (e.target !== e.currentTarget) return;
    const quando = instanteDoX(e.clientX);
    if (quando === null) return;
    // O ponteiro fica preso nesta trilha: sem isso, arrastar para fora da
    // faixa (ou soltar em cima de um bloco vizinho) perderia o "soltou" e o
    // rascunho ficaria desenhado na tela para sempre.
    e.currentTarget.setPointerCapture(e.pointerId);
    setArrasto({ de: quando, ate: quando });
  }

  function moverArrasto(e: React.PointerEvent<HTMLDivElement>) {
    if (!arrasto) return;
    const quando = instanteDoX(e.clientX);
    if (quando === null) return;
    setArrasto((a) => (a ? { ...a, ate: quando } : a));
  }

  function soltarArrasto(e: React.PointerEvent<HTMLDivElement>) {
    if (!arrasto || !onCriarAqui) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);

    const inicio = Math.min(arrasto.de, arrasto.ate);
    const minutos = Math.abs(arrasto.ate - arrasto.de) / MINUTO;
    setArrasto(null);

    // Menos de cinco minutos é clique, não arrasto: o dedo treme, e tremer não
    // pode virar um bloco de zero minuto.
    onCriarAqui(ambiente.id, new Date(inicio).toISOString(), minutos >= 5 ? minutos : undefined);
  }

  return (
    <div className="flex items-stretch">
      <div className="shrink-0 self-center pr-3" style={{ width: ROTULO_W }}>
        <p className="flex items-center gap-2 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-white/70">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: cor, boxShadow: `0 0 7px ${cor}` }} />
          <span className="truncate">{ambiente.nome}</span>
        </p>
        <p className="mt-0.5 pl-3.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/30">
          {ambiente.modo_padrao === "cravado" ? t.ancoraCravado : t.ancoraEncadeado}
        </p>
      </div>

      <div
        ref={trilha}
        onPointerDown={comecarArrasto}
        onPointerMove={moverArrasto}
        onPointerUp={soltarArrasto}
        onPointerCancel={() => setArrasto(null)}
        className={cn(
          "relative h-14 flex-1 touch-none rounded-md border border-white/[0.06] bg-white/[0.02]",
          modo === "plano" && onCriarAqui && "cursor-copy"
        )}
      >
        {/* O rascunho, enquanto o dedo está na tela. Mostra os minutos porque
            é a pergunta que a pessoa está respondendo ao arrastar. */}
        {arrasto && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-1 z-10 flex items-center justify-center rounded-md border border-dashed"
            style={{
              left: `${pct(Math.min(arrasto.de, arrasto.ate))}%`,
              width: `${Math.max(0.4, pct(Math.max(arrasto.de, arrasto.ate)) - pct(Math.min(arrasto.de, arrasto.ate)))}%`,
              borderColor: "rgb(var(--color-accent) / 0.65)",
              background: "rgb(var(--color-accent) / 0.12)",
            }}
          >
            <span className="font-mono text-[9px] tabular-nums text-white/80">
              {Math.abs(arrasto.ate - arrasto.de) / MINUTO}
            </span>
          </span>
        )}
        {/* O passado, escurecido. Só no Ao Vivo: no Plano tudo é futuro. */}
        {modo === "aovivo" && agora !== null && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 rounded-l-md bg-black/40"
            style={{ width: `${Math.min(100, Math.max(0, pct(agora)))}%` }}
          />
        )}

        {blocos.map((b) => {
          const ini = new Date(b.inicio).getTime();
          const fim = b.fim ? new Date(b.fim).getTime() : null;
          const capturas = capturasPorBloco.get(b.id) ?? [];
          const selecionado = selecionadoId === b.id;

          if (b.tipo === "boom" || fim === null) {
            return (
              <Boom
                key={b.id}
                bloco={b}
                cor={cor}
                esquerda={pct(ini)}
                capturas={capturas}
                agora={agora}
                selecionado={selecionado}
                onAbrir={onAbrirBloco}
              />
            );
          }

          return (
            <Bloco
              key={b.id}
              bloco={b}
              cor={cor}
              esquerda={pct(ini)}
              largura={Math.max(pct(fim) - pct(ini), 1.2)}
              capturas={capturas}
              agora={agora}
              zona={zona}
              modo={modo}
              selecionado={selecionado}
              onAbrir={onAbrirBloco}
            />
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// O bloco
// ----------------------------------------------------------------------------

/**
 * A cor da BORDA vem do ambiente; o que muda com a cobertura é a barra de
 * baixo. Pintar o bloco inteiro de vermelho porque falta uma foto tiraria da
 * tela a informação principal — de qual palco é aquilo.
 */
function Bloco({
  bloco,
  cor,
  esquerda,
  largura,
  capturas,
  agora,
  zona,
  modo,
  selecionado,
  onAbrir,
}: {
  bloco: BlocoRow;
  cor: string;
  esquerda: number;
  largura: number;
  capturas: CapturaRow[];
  agora: number | null;
  zona: string;
  modo: "plano" | "aovivo";
  selecionado: boolean;
  onAbrir?: (b: BlocoRow) => void;
}) {
  const agoraISO = agora === null ? null : new Date(agora).toISOString();
  const estados = agoraISO ? capturas.map((c) => estadoDaCaptura(c, agoraISO)) : [];
  const rolandoAgora =
    agora !== null && agora >= new Date(bloco.inicio).getTime() && agora <= new Date(bloco.fim ?? bloco.inicio).getTime();

  return (
    <button
      type="button"
      onClick={() => onAbrir?.(bloco)}
      title={`${bloco.titulo} · ${horaEscrita(new Date(bloco.inicio).getTime(), zona)}`}
      className={cn(
        "ev-entra absolute inset-y-1.5 flex flex-col justify-between overflow-hidden rounded border px-2 py-1.5 text-left backdrop-blur-[2px] transition",
        "hover:z-10 hover:brightness-125 focus-visible:z-10 focus-visible:outline-none",
        selecionado && "z-10 ring-1 ring-white/60"
      )}
      style={{
        left: `${esquerda}%`,
        width: `${largura}%`,
        borderColor: `${cor}66`,
        background: `linear-gradient(180deg, ${cor}22, ${cor}0f)`,
        boxShadow: rolandoAgora ? `0 0 0 1px ${cor}88, 0 0 18px ${cor}55` : undefined,
      }}
    >
      <span className="flex items-center gap-1.5 overflow-hidden">
        {bloco.ancora === "cravado" && (
          // O cadeado é o que diz, sem texto, que aquele bloco não anda quando
          // o anterior atrasa. Num evento com trinta blocos, ler isso de
          // relance é a diferença entre entender a grade e decorá-la.
          <IconCravado className="h-2.5 w-2.5 shrink-0 text-white/50" />
        )}
        <span className="truncate text-[11px] font-medium leading-none text-white/90">{bloco.titulo}</span>
        {bloco.atraso_min !== 0 && (
          <span className="shrink-0 font-mono text-[8.5px] text-danger">
            {bloco.atraso_min > 0 ? "+" : ""}
            {bloco.atraso_min}
          </span>
        )}
      </span>

      {modo === "aovivo" && capturas.length > 0 && (
        <span className="flex gap-0.5">
          {estados.map((e, i) => (
            <MarcaDeCaptura key={capturas[i]!.id} estado={e} />
          ))}
        </span>
      )}
    </button>
  );
}

/** Boom é instante: pino fino, nome do lado de fora. Nome cortado dentro de uma marca de 4px derrotaria o painel que existe para avisar o que falta. */
function Boom({
  bloco,
  cor,
  esquerda,
  capturas,
  agora,
  selecionado,
  onAbrir,
}: {
  bloco: BlocoRow;
  cor: string;
  esquerda: number;
  capturas: CapturaRow[];
  agora: number | null;
  selecionado: boolean;
  onAbrir?: (b: BlocoRow) => void;
}) {
  const agoraISO = agora === null ? null : new Date(agora).toISOString();
  const estado: EstadoCaptura | null = agoraISO && capturas[0] ? estadoDaCaptura(capturas[0], agoraISO) : null;

  return (
    <button
      type="button"
      onClick={() => onAbrir?.(bloco)}
      className={cn(
        "ev-entra absolute inset-y-1.5 flex items-center transition hover:z-10 focus-visible:z-10 focus-visible:outline-none",
        selecionado && "z-10"
      )}
      style={{ left: `${esquerda}%` }}
    >
      <span
        className="block h-full w-[4px] shrink-0 rounded-full"
        style={{ background: `${cor}55`, boxShadow: `0 0 12px ${cor}88`, outline: selecionado ? "1px solid #fff9" : undefined }}
      >
        {estado && <span className="block h-2/5 w-full"><MarcaDeCaptura estado={estado} vertical /></span>}
      </span>
      <span className="ml-1.5 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.1em] text-white/60">
        {bloco.titulo}
      </span>
    </button>
  );
}

function MarcaDeCaptura({ estado, vertical }: { estado: EstadoCaptura; vertical?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full",
        vertical ? "block h-full w-full" : "h-[3px] flex-1",
        estado === "captado" && "bg-status-good shadow-[0_0_6px_rgb(34_197_94/0.75)]",
        estado === "pendente" && "ev-pendente bg-white/45",
        estado === "perdido" && "bg-danger shadow-[0_0_6px_rgb(239_68_68/0.75)]",
        estado === "nao_rolou" && "bg-white/15"
      )}
    />
  );
}

function Legenda() {
  const { dict } = useLocale();
  const t = dict.eventos;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">
      <Item classe="bg-status-good shadow-[0_0_6px_rgb(34_197_94/0.8)]" texto={t.legendaCaptado} />
      <Item classe="bg-white/40" texto={t.legendaPendente} />
      <Item classe="bg-danger shadow-[0_0_6px_rgb(239_68_68/0.8)]" texto={t.legendaPerdido} />
      <span className="inline-flex items-center gap-1.5">
        <IconCravado className="h-2.5 w-2.5 text-white/45" />
        {t.ancoraCravado}
      </span>
    </div>
  );
}

function Item({ classe, texto }: { classe: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-[3px] w-3.5 rounded-full", classe)} />
      {texto}
    </span>
  );
}

/** Cadeado minúsculo — o mesmo traço dos ícones do menu, em 12. */
export function IconCravado(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" {...props}>
      <rect x="2.2" y="5.2" width="7.6" height="5.2" rx="1.2" fill="currentColor" stroke="none" />
      <path d="M4 5.2V3.9a2 2 0 0 1 4 0v1.3" />
    </svg>
  );
}
