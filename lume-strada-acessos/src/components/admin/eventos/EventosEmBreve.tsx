"use client";

import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Eventos — a tela que quem ainda não tem o módulo vê no lugar dele.
 *
 * Não é um aviso de erro nem um "em construção" genérico: é a promessa, e ela
 * tem que dar vontade. Quem abre daqui é dono de produtora que faz evento, e a
 * pergunta na cabeça dele é uma só — "isso resolve o meu sábado?". A tela
 * responde mostrando, em vez de listar.
 *
 * A linguagem é de CONSOLE DE OPERAÇÃO, não de página de marketing: moldura de
 * visor de câmera nos cantos, REC piscando, timecode em mono, rótulos
 * minúsculos em caixa alta e uma varredura lenta atravessando o painel. É o
 * vocabulário de quem trabalha atrás da câmera — e é o que separa isto de um
 * hero de SaaS com um degradê bonito.
 *
 * O console é sempre escuro, nos dois temas (ver `.ev-console` em
 * `globals.css`). Toda cor de destaque sai de `--color-accent`, então ele
 * acende na cor da marca de cada agência.
 *
 * A grade é ESTÁTICA e está rotulada como prévia. Uma demonstração que parece
 * clicável e não responde é pior do que uma imagem parada: a pessoa tenta usar
 * e conclui que está quebrado.
 */
export function EventosEmBreve() {
  const { dict } = useLocale();
  const t = dict.eventos;

  return (
    <div className="space-y-4">
      <Console />
      <PautaEEquipe />
      <Fases />
      <Modulos />
      <p className="pb-2 text-center text-[11px] text-ink-muted">{t.emBreveRodape}</p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// O console
// ----------------------------------------------------------------------------

function Console() {
  const { dict } = useLocale();
  const t = dict.eventos;

  return (
    <div className="ev-console relative overflow-hidden rounded-2xl border border-white/10">
      {/* Camada 1 — a textura de monitor. */}
      <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />

      {/* Camada 2 — o brilho da marca, dois focos, bem difuso. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/4 h-[28rem] w-[28rem] rounded-full opacity-[0.18] blur-[100px]"
        style={{ background: "rgb(var(--color-accent))" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-56 right-0 h-[26rem] w-[26rem] rounded-full opacity-[0.10] blur-[110px]"
        style={{ background: "rgb(var(--color-accent-2))" }}
      />

      {/* Camada 3 — a varredura. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 overflow-hidden">
        <div
          className="ev-varredura h-full w-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgb(var(--color-accent) / 0.07), transparent)",
          }}
        />
      </div>

      <Cantos />

      <div className="relative px-6 py-7 sm:px-9 sm:py-9">
        {/* Barra de status */}
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
          <span className="inline-flex items-center gap-2">
            <span className="ev-rec h-1.5 w-1.5 rounded-full bg-danger shadow-[0_0_8px_rgb(239_68_68/0.9)]" />
            {t.consoleRec}
          </span>
          <span className="tabular-nums">{t.consoleTimecode}</span>
        </div>

        <p
          className="mt-7 font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ color: "rgb(var(--color-accent))" }}
        >
          {t.emBreveEtiqueta}
        </p>

        <h2 className="mt-3 max-w-[22ch] text-[2rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-[2.75rem]">
          {/* `block` na segunda metade: o trecho aceso precisa COMECAR a
              linha. Deixado no fluxo, ele quebrava onde desse ("...do evento,
              o / que ainda falta") e a cor passava a marcar meia frase em vez
              da ideia inteira. */}
          {t.emBreveTituloA}
          <span
            className="block"
            style={{
              color: "rgb(var(--color-accent))",
              textShadow: "0 0 28px rgb(var(--color-accent) / 0.55)",
            }}
          >
            {t.emBreveTituloB}
          </span>
        </h2>

        <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-white/55">{t.emBreveSubtitulo}</p>

        <GradeDeCobertura />
        <Numeros />
      </div>
    </div>
  );
}

/** A moldura do visor. Quatro cantos, nunca a borda inteira — o que dá a leitura de "enquadramento" é justamente a borda NÃO se fechar. */
function Cantos() {
  const base = "pointer-events-none absolute h-5 w-5 border-white/25";
  return (
    <div aria-hidden>
      <span className={cn(base, "left-3 top-3 border-l border-t")} />
      <span className={cn(base, "right-3 top-3 border-r border-t")} />
      <span className={cn(base, "bottom-3 left-3 border-b border-l")} />
      <span className={cn(base, "bottom-3 right-3 border-b border-r")} />
    </div>
  );
}

// ----------------------------------------------------------------------------
// A grade de cobertura — o centro da tela
// ----------------------------------------------------------------------------
// Uma faixa por ambiente, o tempo correndo na horizontal, e — a parte que
// nenhuma agenda faz — cada bloco carregando embaixo as marcas do que precisa
// ser captado ali. Verde é captado, cinza respirando é pendente, vermelho é
// pendente com a janela já fechada.
//
// A régua vai das 21h às 03h porque evento vira a madrugada. Uma timeline que
// só sabe ir das 09h às 17h não serve para show nenhum.

const AGORA_PCT = 57;

type Marca = "ok" | "pendente" | "perdido";
interface Bloco {
  rotulo: string;
  inicio: number;
  fim: number;
  marcas: Marca[];
}

const AMBIENTES: { nome: string; blocos: Bloco[]; booms?: { rotulo: string; em: number; marca: Marca }[] }[] = [
  {
    nome: "PALCO PRINCIPAL",
    blocos: [
      { rotulo: "Abertura", inicio: 1, fim: 21, marcas: ["ok", "ok", "ok"] },
      { rotulo: "Show 1", inicio: 25, fim: 53, marcas: ["ok", "ok", "perdido"] },
      { rotulo: "Show 2", inicio: 59, fim: 93, marcas: ["pendente", "pendente"] },
    ],
  },
  {
    nome: "PALCO 2",
    blocos: [
      { rotulo: "DJ set", inicio: 7, fim: 43, marcas: ["ok", "ok"] },
      { rotulo: "Banda", inicio: 49, fim: 85, marcas: ["pendente", "pendente", "pendente"] },
    ],
  },
  {
    nome: "PATROCÍNIO",
    blocos: [
      { rotulo: "Ativação A", inicio: 3, fim: 29, marcas: ["ok", "ok"] },
      { rotulo: "Ativação B", inicio: 35, fim: 61, marcas: ["ok", "perdido"] },
      { rotulo: "Ativação C", inicio: 69, fim: 95, marcas: ["pendente"] },
    ],
  },
  {
    nome: "BOOMS",
    blocos: [],
    booms: [
      { rotulo: "CO₂", em: 33, marca: "ok" },
      { rotulo: "Pirotecnia", em: 63, marca: "pendente" },
      { rotulo: "Confete", em: 88, marca: "pendente" },
    ],
  },
];

const HORAS = ["21", "22", "23", "00", "01", "02", "03"];
/** Largura da coluna de nomes. Caixa alta com `tracking` largo ocupa bem mais
 *  do que a mesma palavra em caixa baixa: a 108px, "PALCO PRINCIPAL" virava
 *  "PALCO PRINCI…" — e o nome do ambiente é o que diz de qual palco é a linha. */
const ROTULO_W = 136;

function GradeDeCobertura() {
  const { dict } = useLocale();
  const t = dict.eventos;

  return (
    <div className="mt-8 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">{t.emBrevePreviaTitulo}</p>
        <div className="flex flex-wrap items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">
          <Legenda classe="bg-status-good shadow-[0_0_6px_rgb(34_197_94/0.8)]" texto={t.legendaCaptado} />
          <Legenda classe="bg-white/35" texto={t.legendaPendente} />
          <Legenda classe="bg-danger shadow-[0_0_6px_rgb(239_68_68/0.8)]" texto={t.legendaPerdido} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* Régua */}
          <div
            className="mb-2 flex font-mono text-[9.5px] tabular-nums text-white/35"
            style={{ paddingLeft: ROTULO_W }}
          >
            {HORAS.map((h) => (
              <span key={h} className="flex-1">
                {h}h
              </span>
            ))}
          </div>

          <div className="relative">
            {/* A linha do agora, com o rastro por cima. Tudo à esquerda dela já
                passou — é por isso que um pendente ali é vermelho e não cinza. */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 top-0 z-20"
              style={{ left: `calc(${ROTULO_W}px + (100% - ${ROTULO_W}px) * ${AGORA_PCT / 100})` }}
            >
              <span
                className="ev-agora absolute inset-y-0 -left-px w-0.5 rounded-full"
                style={{
                  background: "rgb(var(--color-accent))",
                  boxShadow: "0 0 12px rgb(var(--color-accent)), 0 0 28px rgb(var(--color-accent) / 0.5)",
                }}
              />
              <span
                className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
                style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 10px rgb(var(--color-accent))" }}
              />
              <span
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.2em]"
                style={{ color: "rgb(var(--color-accent))" }}
              >
                {t.consoleAgora}
              </span>
            </div>

            <div className="space-y-2 pb-6">
              {AMBIENTES.map((amb, linha) => (
                <div key={amb.nome} className="flex items-stretch">
                  <span
                    className="shrink-0 self-center truncate pr-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/45"
                    style={{ width: ROTULO_W }}
                  >
                    {amb.nome}
                  </span>

                  <div className="relative h-12 flex-1 rounded-md border border-white/[0.06] bg-white/[0.02]">
                    {amb.blocos.map((b, i) => (
                      <div
                        key={b.rotulo}
                        className="ev-entra absolute inset-y-1.5 flex flex-col justify-between rounded border border-white/10 bg-white/[0.045] px-2 py-1.5 backdrop-blur-[2px]"
                        style={{
                          left: `${b.inicio}%`,
                          width: `${b.fim - b.inicio}%`,
                          animationDelay: `${linha * 90 + i * 60}ms`,
                        }}
                      >
                        <span className="truncate text-[10px] leading-none text-white/70">{b.rotulo}</span>
                        <span className="flex gap-1">
                          {b.marcas.map((m, j) => (
                            <MarcaDeCaptura key={j} marca={m} />
                          ))}
                        </span>
                      </div>
                    ))}

                    {/* Boom é INSTANTE, não duração: marca fina cravada na hora,
                        com o nome do lado de fora. Um nome cortado dentro de uma
                        marca de 10px ("Pirotec…") derrotaria o painel que existe
                        justamente para avisar o que falta. */}
                    {amb.booms?.map((b, i) => (
                      <div
                        key={b.rotulo}
                        className="ev-entra absolute inset-y-1.5 flex items-center"
                        style={{ left: `${b.em}%`, animationDelay: `${linha * 90 + i * 60}ms` }}
                      >
                        <span
                          className="flex h-full w-[4px] flex-col justify-end overflow-hidden rounded-full"
                          style={{
                            background: "rgb(var(--color-accent) / 0.3)",
                            boxShadow: "0 0 12px rgb(var(--color-accent) / 0.55)",
                          }}
                        >
                          <span className="block h-2/5 w-full">
                            <MarcaDeCaptura marca={b.marca} vertical />
                          </span>
                        </span>
                        <span className="ml-1.5 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.1em] text-white/55">
                          {b.rotulo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarcaDeCaptura({ marca, vertical }: { marca: Marca; vertical?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full",
        vertical ? "block h-full w-full" : "h-[3px] flex-1",
        marca === "ok" && "bg-status-good shadow-[0_0_6px_rgb(34_197_94/0.75)]",
        marca === "pendente" && "ev-pendente bg-white/45",
        marca === "perdido" && "bg-danger shadow-[0_0_6px_rgb(239_68_68/0.75)]"
      )}
    />
  );
}

function Legenda({ classe, texto }: { classe: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-[3px] w-3.5 rounded-full", classe)} />
      {texto}
    </span>
  );
}

// ----------------------------------------------------------------------------
// Os números
// ----------------------------------------------------------------------------

function Numeros() {
  const { dict } = useLocale();
  const t = dict.eventos;

  const itens = [
    { valor: "47/52", rotulo: t.numeroCaptado, destaque: true },
    { valor: "03", rotulo: t.numeroPendente },
    { valor: "02", rotulo: t.numeroPerdido, alerta: true },
    { valor: "04", rotulo: t.numeroAmbientes },
  ];

  return (
    <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4">
      {itens.map((n) => (
        <div key={n.rotulo} className="bg-base-950 px-4 py-3.5">
          <p
            className={cn("font-mono text-xl font-semibold tabular-nums", n.alerta ? "text-danger" : "text-white")}
            style={n.destaque ? { color: "rgb(var(--color-accent))", textShadow: "0 0 18px rgb(var(--color-accent) / 0.5)" } : undefined}
          >
            {n.valor}
          </p>
          <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/40">{n.rotulo}</p>
        </div>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Os módulos
// ----------------------------------------------------------------------------

function Modulos() {
  const { dict } = useLocale();
  const t = dict.eventos;

  const itens = [
    { n: "01", titulo: t.emBreveAmbientesTitulo, texto: t.emBreveAmbientesTexto },
    { n: "02", titulo: t.emBreveProgramacaoTitulo, texto: t.emBreveProgramacaoTexto },
    { n: "03", titulo: t.emBreveCoberturaTitulo, texto: t.emBreveCoberturaTexto, destaque: true },
    { n: "04", titulo: t.emBreveAoVivoTitulo, texto: t.emBreveAoVivoTexto },
    { n: "05", titulo: t.emBreveEquipeTitulo, texto: t.emBreveEquipeTexto },
    { n: "06", titulo: t.emBreveEquipamentoTitulo, texto: t.emBreveEquipamentoTexto },
    { n: "07", titulo: t.emBrevePosTitulo, texto: t.emBrevePosTexto },
    { n: "08", titulo: t.emBreveCustosTitulo, texto: t.emBreveCustosTexto },
  ];

  return (
    <div className="ev-console relative overflow-hidden rounded-2xl border border-white/10">
      <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative px-6 py-7 sm:px-9">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">{t.emBreveRecursosTitulo}</p>

        {/* Sem caixas: hairlines formando a grade. O que separa um módulo do
            outro é a linha, e não uma borda em volta de cada um — é o que
            mantém a leitura de painel técnico em vez de galeria de cards. */}
        <div className="mt-5 grid gap-px bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((m) => (
            <div
              key={m.n}
              className={cn(
                "group relative bg-base-950 px-5 py-5 transition",
                m.destaque ? "bg-base-950" : "bg-base-950"
              )}
            >
              {m.destaque && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 12px rgb(var(--color-accent))" }}
                />
              )}
              <p
                className="font-mono text-[10px] tabular-nums tracking-[0.2em]"
                style={m.destaque ? { color: "rgb(var(--color-accent))" } : { color: "rgb(255 255 255 / 0.28)" }}
              >
                {m.n}
              </p>
              <p className="mt-3 text-[15px] font-medium leading-snug text-white">{m.titulo}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/45">{m.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Pauta de captação + equipe em campo
// ----------------------------------------------------------------------------
// A grade lá em cima mostra o EVENTO. Estes dois painéis mostram a OPERAÇÃO
// dentro dele: a lista do que ainda falta na janela que está correndo, e quem
// está onde para fazer. É o par de telas que a pessoa vai olhar no celular às
// duas da manhã — e é o que separa este módulo de uma agenda bonita.
//
// O conteúdo é de demonstração e fica aqui, fora do dicionário, pelo mesmo
// motivo da grade: é mock, não interface. Traduzir "Show 2" não ajudaria
// ninguém, e encher o dicionário de frase descartável cobra caro em toda
// alteração futura.

type EstadoItem = "ok" | "pendente" | "perdido";

const PAUTA: { item: string; onde: string; janela: string; estado: EstadoItem }[] = [
  { item: "Show 2 — plano geral do palco", onde: "Palco principal", janela: "00:40 — 01:20", estado: "pendente" },
  { item: "Público na virada", onde: "Pista", janela: "00:55 — 01:05", estado: "pendente" },
  { item: "Pirotecnia", onde: "Palco principal", janela: "02:00", estado: "pendente" },
  { item: "Ativação B — fachada acesa", onde: "Patrocínio", janela: "23:30 — 00:10", estado: "perdido" },
  { item: "Drone — abertura", onde: "Externa", janela: "21:00 — 21:20", estado: "ok" },
  { item: "Bastidor da banda", onde: "Camarim", janela: "22:10 — 22:40", estado: "ok" },
];

const FEED: { funcao: string; o_que: string; quando: string }[] = [
  { funcao: "Câmera 2", o_que: "Show 1 — plano médio", quando: "há 4 min" },
  { funcao: "Foto", o_que: "Ativação A — público", quando: "há 11 min" },
  { funcao: "Drone", o_que: "Externa — abertura", quando: "há 38 min" },
  { funcao: "Câmera 1", o_que: "Abertura — geral", quando: "há 52 min" },
];

const EQUIPE: { funcao: string; onde: string; estado: "campo" | "deslocando" | "fora" }[] = [
  { funcao: "Câmera 1", onde: "Palco principal", estado: "campo" },
  { funcao: "Câmera 2", onde: "Palco 2", estado: "campo" },
  { funcao: "Foto", onde: "Patrocínio", estado: "deslocando" },
  { funcao: "Drone", onde: "Externa", estado: "fora" },
  { funcao: "Realtime", onde: "Base", estado: "campo" },
];

function PautaEEquipe() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
      <PainelPauta />
      <PainelEquipe />
    </div>
  );
}

/** Moldura comum dos painéis — mesmo console escuro do topo, sem repetir as camadas de brilho (dois focos por tela bastam; mais vira neblina). */
function Painel({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: React.ReactNode }) {
  return (
    <div className="ev-console relative overflow-hidden rounded-2xl border border-white/10">
      <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative px-5 py-6 sm:px-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{titulo}</p>
        <p className="mt-2 max-w-[52ch] text-xs leading-relaxed text-white/45">{subtitulo}</p>
        {children}
      </div>
    </div>
  );
}

function PainelPauta() {
  const { dict } = useLocale();
  const t = dict.eventos;

  return (
    <Painel titulo={t.pautaTitulo} subtitulo={t.pautaSubtitulo}>
      <p className="mt-5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/35">{t.pautaJanelaTitulo}</p>

      <ul className="mt-2.5 divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-black/40">
        {PAUTA.map((linha, i) => (
          <li key={linha.item} className="ev-entra flex items-center gap-3 px-3.5 py-2.5" style={{ animationDelay: `${i * 70}ms` }}>
            <Caixa estado={linha.estado} />
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block truncate text-[13px] leading-tight",
                  linha.estado === "ok" ? "text-white/40 line-through decoration-white/20" : "text-white/85"
                )}
              >
                {linha.item}
              </span>
              <span className="mt-0.5 block truncate font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/35">
                {linha.onde}
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 font-mono text-[10px] tabular-nums",
                linha.estado === "perdido" ? "text-danger" : "text-white/40"
              )}
            >
              {linha.janela}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/35">{t.pautaFeedTitulo}</p>
      <ul className="mt-2.5 space-y-1.5">
        {FEED.map((f) => (
          <li key={f.o_que} className="flex items-center gap-2.5 text-[12px]">
            <span className="h-1 w-1 shrink-0 rounded-full bg-status-good shadow-[0_0_6px_rgb(34_197_94/0.8)]" />
            <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">{f.funcao}</span>
            <span className="min-w-0 flex-1 truncate text-white/60">{f.o_que}</span>
            <span className="shrink-0 font-mono text-[9.5px] text-white/30">{f.quando}</span>
          </li>
        ))}
      </ul>
    </Painel>
  );
}

/** A caixinha de marcar. Quadrada e não redonda: redondo virou sinônimo de "status", e aqui é uma AÇÃO que alguém faz no celular — a forma precisa lembrar checklist. */
function Caixa({ estado }: { estado: EstadoItem }) {
  if (estado === "ok") {
    return (
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-status-good shadow-[0_0_10px_rgb(34_197_94/0.55)]"
        aria-hidden
      >
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="#06210F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 6.3 L4.8 8.6 L9.5 3.6" />
        </svg>
      </span>
    );
  }
  if (estado === "perdido") {
    return <span aria-hidden className="h-4 w-4 shrink-0 rounded-[4px] border border-danger/70 bg-danger/15 shadow-[0_0_10px_rgb(239_68_68/0.35)]" />;
  }
  return <span aria-hidden className="ev-pendente h-4 w-4 shrink-0 rounded-[4px] border border-white/30 bg-white/[0.06]" />;
}

function PainelEquipe() {
  const { dict } = useLocale();
  const t = dict.eventos;

  const rotulo = { campo: t.equipeEmCampo, deslocando: t.equipeDeslocando, fora: t.equipeFora } as const;

  return (
    <Painel titulo={t.equipeTitulo} subtitulo={t.equipeSubtitulo}>
      <ul className="mt-5 space-y-2">
        {EQUIPE.map((pessoa, i) => (
          <li
            key={pessoa.funcao}
            className="ev-entra flex items-center gap-3 rounded-xl border border-white/[0.08] bg-black/40 px-3.5 py-2.5"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {/* Sem foto e sem nome: a sigla da FUNÇÃO. Num evento, quem procura
                alguém procura "o drone", não "o Fulano". */}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] font-mono text-[9.5px] uppercase tracking-[0.06em] text-white/60">
              {pessoa.funcao.slice(0, 2)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] leading-tight text-white/85">{pessoa.funcao}</span>
              <span className="mt-0.5 block truncate font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/35">
                {pessoa.onde}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/45">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  pessoa.estado === "campo" && "bg-status-good shadow-[0_0_7px_rgb(34_197_94/0.85)]",
                  pessoa.estado === "deslocando" && "ev-pendente bg-white/50",
                  pessoa.estado === "fora" && "bg-white/20"
                )}
              />
              {rotulo[pessoa.estado]}
            </span>
          </li>
        ))}
      </ul>
    </Painel>
  );
}

// ----------------------------------------------------------------------------
// Antes · Durante · Depois
// ----------------------------------------------------------------------------
// A promessa contada na ordem em que o trabalho acontece. Vem DEPOIS dos
// painéis de propósito: primeiro a pessoa vê a coisa funcionando, depois lê o
// que isso significa para a semana dela. Ao contrário, seria mais um texto de
// site antes da primeira prova de que o produto existe.

function Fases() {
  const { dict } = useLocale();
  const t = dict.eventos;

  const fases = [
    { etiqueta: t.faseAntesEtiqueta, titulo: t.faseAntesTitulo, texto: t.faseAntesTexto },
    { etiqueta: t.faseDuranteEtiqueta, titulo: t.faseDuranteTitulo, texto: t.faseDuranteTexto, agora: true },
    { etiqueta: t.faseDepoisEtiqueta, titulo: t.faseDepoisTitulo, texto: t.faseDepoisTexto },
  ];

  return (
    <div className="ev-console relative overflow-hidden rounded-2xl border border-white/10">
      <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative px-6 py-7 sm:px-9">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">{t.fasesTitulo}</p>

        <div className="mt-6 grid gap-px bg-white/[0.07] sm:grid-cols-3">
          {fases.map((f) => (
            <div key={f.etiqueta} className="relative bg-base-950 px-5 py-5">
              {/* A fase do meio é a que o módulo existe para resolver — e é a
                  única acesa. Destacar as três seria não destacar nenhuma. */}
              {f.agora && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 12px rgb(var(--color-accent))" }}
                />
              )}
              <p
                className="font-mono text-[10px] uppercase tracking-[0.24em]"
                style={f.agora ? { color: "rgb(var(--color-accent))" } : { color: "rgb(255 255 255 / 0.3)" }}
              >
                {f.etiqueta}
              </p>
              <p className="mt-3 text-[15px] font-medium leading-snug text-white">{f.titulo}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/45">{f.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
