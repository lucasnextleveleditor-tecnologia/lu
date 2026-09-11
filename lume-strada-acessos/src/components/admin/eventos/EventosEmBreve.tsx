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
      {/* Camada 1 — a planta baixa. */}
      <div aria-hidden className="ev-grade-fundo pointer-events-none absolute inset-0" />

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
  ];

  return (
    <div className="ev-console relative overflow-hidden rounded-2xl border border-white/10">
      <div aria-hidden className="ev-grade-fundo pointer-events-none absolute inset-0 opacity-60" />

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
