"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  IconNavAgenda,
  IconNavClientes,
  IconNavInventario,
  IconNavProducao,
  IconNavTrafego,
  IconNavVisaoGeral,
} from "@/components/ui/icons-nav";

/**
 * A tela que quem ainda não tem o módulo vê no lugar dele.
 *
 * Não é um "página não encontrada" nem um aviso de erro: é uma promessa com
 * data marcada no futuro. Quem abre daqui é dono de agência que faz evento, e
 * a pergunta dele é uma só — "isso vai resolver o meu sábado?". Então a tela
 * mostra a resposta em vez de listar funcionalidades: a prévia no topo é a
 * grade de cobertura, que é o que o módulo faz de diferente.
 *
 * A prévia é ESTÁTICA e rotulada como prévia. Uma demonstração que parece
 * interativa e não responde ao clique é pior do que uma imagem parada —
 * a pessoa tenta usar, não acontece nada, e a conclusão é que está quebrado.
 */
export function EventosEmBreve() {
  const { dict } = useLocale();
  const t = dict.eventos;

  const recursos = [
    { icone: IconNavAgenda, titulo: t.emBreveAmbientesTitulo, texto: t.emBreveAmbientesTexto },
    { icone: IconNavProducao, titulo: t.emBreveProgramacaoTitulo, texto: t.emBreveProgramacaoTexto },
    { icone: IconNavVisaoGeral, titulo: t.emBreveCoberturaTitulo, texto: t.emBreveCoberturaTexto, destaque: true },
    { icone: IconNavTrafego, titulo: t.emBreveAoVivoTitulo, texto: t.emBreveAoVivoTexto },
    { icone: IconNavClientes, titulo: t.emBreveEquipeTitulo, texto: t.emBreveEquipeTexto },
    { icone: IconNavInventario, titulo: t.emBreveEquipamentoTitulo, texto: t.emBreveEquipamentoTexto },
  ];

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        {/* Brilho na cor da marca, bem contido — dá o ar de "coisa nova" sem
            competir com o texto. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full opacity-[0.14] blur-3xl"
          style={{ background: "rgb(var(--color-accent))" }}
        />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t.emBreveEtiqueta}
          </span>

          <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-ink-primary">{t.emBreveTitulo}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{t.emBreveSubtitulo}</p>
        </div>

        <GradeDeCobertura className="relative mt-7" />
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-primary">{t.emBreveRecursosTitulo}</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recursos.map((r) => (
            <div
              key={r.titulo}
              className={cn(
                "rounded-xl border bg-base-900/60 p-4 transition",
                r.destaque ? "border-accent/35 bg-accent/[0.04]" : "border-base-800"
              )}
            >
              <span
                className={cn(
                  "mb-3 flex h-9 w-9 items-center justify-center rounded-lg border",
                  r.destaque ? "border-accent/40 text-accent" : "border-base-700 text-ink-muted"
                )}
              >
                <r.icone className="h-[19px] w-[19px]" />
              </span>
              <p className="text-sm font-medium text-ink-primary">{r.titulo}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{r.texto}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="pb-2 text-center text-xs text-ink-muted">{t.emBreveRodape}</p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// A prévia: a grade de cobertura
// ----------------------------------------------------------------------------
// Uma linha por ambiente, o tempo correndo na horizontal, e — a parte que
// interessa — cada bloco carrega EMBAIXO as marcas de captação daquela janela.
// Verde é captado, vazio é pendente, vermelho é pendente com a janela já
// fechada. É isso que responde "a equipe pegou tudo?" sem ninguém precisar
// perguntar no rádio.
//
// Números fixos, de propósito: é um desenho, não uma consulta. Percentuais em
// vez de pixels para a grade acompanhar a largura da tela.

const AGORA_PCT = 58;

type Marca = "ok" | "pendente" | "perdido";
interface Bloco {
  rotulo: string;
  inicio: number;
  fim: number;
  marcas: Marca[];
  boom?: boolean;
}

const AMBIENTES: { nome: string; blocos: Bloco[] }[] = [
  {
    nome: "Palco principal",
    blocos: [
      { rotulo: "Abertura", inicio: 2, fim: 22, marcas: ["ok", "ok", "ok"] },
      { rotulo: "Show 1", inicio: 26, fim: 54, marcas: ["ok", "ok", "perdido"] },
      { rotulo: "Show 2", inicio: 60, fim: 92, marcas: ["pendente", "pendente"] },
    ],
  },
  {
    nome: "Palco 2",
    blocos: [
      { rotulo: "DJ set", inicio: 8, fim: 44, marcas: ["ok", "ok"] },
      { rotulo: "Banda", inicio: 50, fim: 86, marcas: ["pendente", "pendente", "pendente"] },
    ],
  },
  {
    nome: "Patrocinadores",
    blocos: [
      { rotulo: "Ativação A", inicio: 4, fim: 30, marcas: ["ok", "ok"] },
      { rotulo: "Ativação B", inicio: 36, fim: 62, marcas: ["ok", "perdido"] },
      { rotulo: "Ativação C", inicio: 70, fim: 96, marcas: ["pendente"] },
    ],
  },
  {
    nome: "Booms",
    blocos: [
      { rotulo: "CO₂", inicio: 33, fim: 36, marcas: ["ok"], boom: true },
      { rotulo: "Pirotecnia", inicio: 64, fim: 68, marcas: ["pendente"], boom: true },
      { rotulo: "Confete", inicio: 88, fim: 91, marcas: ["pendente"], boom: true },
    ],
  },
];

const HORAS = ["21h", "22h", "23h", "00h", "01h", "02h", "03h"];

function GradeDeCobertura({ className }: { className?: string }) {
  const { dict } = useLocale();

  return (
    <div className={cn("rounded-xl border border-base-800 bg-base-950/50 p-4", className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink-primary">{dict.eventos.emBrevePreviaTitulo}</p>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-ink-muted">
          <Legenda cor="bg-status-good" texto={dict.eventos.legendaCaptado} />
          <Legenda cor="bg-base-600" texto={dict.eventos.legendaPendente} />
          <Legenda cor="bg-status-critical" texto={dict.eventos.legendaPerdido} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          {/* Régua de horas */}
          <div className="mb-1.5 flex pl-[104px] text-[10px] tabular-nums text-ink-muted">
            {HORAS.map((h) => (
              <span key={h} className="flex-1">
                {h}
              </span>
            ))}
          </div>

          <div className="relative">
            {/* A linha do agora. Tudo à esquerda dela já passou — e é por isso
                que um item pendente ali vira "perdido" em vez de continuar
                cinza esperando. */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 top-0 z-10 w-px"
              style={{ left: `calc(104px + (100% - 104px) * ${AGORA_PCT / 100})`, background: "rgb(var(--color-accent))" }}
            >
              <span className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent" />
            </div>

            <div className="space-y-1.5">
              {AMBIENTES.map((amb) => (
                <div key={amb.nome} className="flex items-stretch">
                  <span className="w-[104px] shrink-0 self-center truncate pr-3 text-[11px] text-ink-secondary">{amb.nome}</span>
                  <div className="relative h-11 flex-1 rounded-md bg-base-900/60">
                    {amb.blocos.map((b) =>
                      /* Boom é INSTANTE, não duração: a marca é estreita e o
                         nome vai para FORA dela. Dentro, um rótulo de quatro
                         letras já viraria "Pirotec…" — e um nome cortado num
                         painel que existe para avisar o que falta captar
                         derrota o próprio painel. */
                      b.boom ? (
                        <div
                          key={b.rotulo}
                          className="absolute inset-y-1 flex items-center"
                          style={{ left: `${b.inicio}%` }}
                        >
                          <span
                            className="flex h-full flex-col justify-end rounded border border-dashed border-accent/60 bg-accent/10 px-1 pb-1"
                            style={{ width: 10 }}
                          >
                            {b.marcas.map((m, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "h-1 w-full rounded-full",
                                  m === "ok" && "bg-status-good",
                                  m === "pendente" && "bg-base-600",
                                  m === "perdido" && "bg-status-critical"
                                )}
                              />
                            ))}
                          </span>
                          <span className="ml-1 whitespace-nowrap text-[9.5px] leading-none text-ink-secondary">{b.rotulo}</span>
                        </div>
                      ) : (
                        <div
                          key={b.rotulo}
                          className="absolute inset-y-1 flex flex-col justify-between rounded border border-base-700 bg-base-800/80 px-1.5 py-1"
                          style={{ left: `${b.inicio}%`, width: `${b.fim - b.inicio}%` }}
                        >
                          <span className="truncate text-[9.5px] leading-none text-ink-secondary">{b.rotulo}</span>
                          <span className="flex gap-0.5">
                            {b.marcas.map((m, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "h-1 flex-1 rounded-full",
                                  m === "ok" && "bg-status-good",
                                  m === "pendente" && "bg-base-600",
                                  m === "perdido" && "bg-status-critical"
                                )}
                              />
                            ))}
                          </span>
                        </div>
                      )
                    )}
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

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-1.5 w-3 rounded-full", cor)} />
      {texto}
    </span>
  );
}
