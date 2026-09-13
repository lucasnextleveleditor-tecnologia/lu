"use client";

import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconLayoutGrid, IconClipboardList, IconCamera, IconUsers, IconBox, IconCheck, IconArrowRight } from "@/components/ui/icons";
import type { AmbienteRow, BlocoRow, CapturaRow, EquipeEventoRow, KitRow } from "@/lib/types/eventos";
import type { Dictionary } from "@/lib/i18n/dictionaries/pt";

/**
 * A PREPARAÇÃO — a trilha de montagem do evento.
 *
 * O módulo tinha três modos e cinco gavetas, todos igualmente disponíveis o
 * tempo todo, e nada dizia por onde começar. Quem abria um evento novo via uma
 * grade vazia e seis botões: dá para clicar em qualquer um, e é exatamente por
 * isso que não dá para saber qual. Faltava a coisa mais simples de todas — uma
 * ORDEM.
 *
 * O desenho é o do acompanhamento de pedido — nós numa trilha, o trecho já
 * andado aceso, o passo da vez destacado — e o motivo de ser esse e não uma
 * lista numerada é o mesmo que faz aquele funcionar: a pessoa não precisa ler
 * para saber onde está. A posição na linha já conta. Número exige leitura e
 * contagem; trilha preenchida se entende de relance, de longe, com o celular
 * na mão e o rádio na outra.
 *
 * E tem UM passo da vez, sempre. É a diferença entre "aqui estão cinco coisas
 * que faltam" e "faça esta agora" — a primeira é um inventário, a segunda é
 * uma instrução. Por isso o painel de baixo mostra só o próximo, com o botão
 * que leva direto a ele.
 *
 * A trilha só existe no Plano, porque só ali a pergunta é "o que falta
 * preparar". No Ao Vivo ela vira "o que está acontecendo agora", e no
 * Fechamento, "o que sobrou" — perguntas que têm as suas próprias telas.
 *
 * KIT ENTRA AQUI, e foi essa a correção que originou a trilha: ele estava
 * solto numa fileira de gavetas junto com Ocorrência e Realtime, que são
 * coisas do meio do show. Planejar o que vai na van é véspera, não madrugada.
 */

export interface EtapaDaPreparacao {
  chave: "ambientes" | "programacao" | "pauta" | "equipe" | "kit";
  feito: boolean;
  quantos: number;
}

/**
 * As etapas, na ordem em que a montagem acontece de verdade: os lugares,
 * depois o que acontece neles, depois o que precisa ser captado, depois quem
 * capta, e por último o equipamento que vai junto. Não é obrigatória — dá para
 * fazer em qualquer sequência —, mas é a ordem em que cada etapa deixa de
 * depender da anterior.
 *
 * Vive fora do componente porque o cabeçalho também precisa saber se o plano
 * fechou, para marcar a fase como concluída na trilha grande.
 */
export function etapasDaPreparacao(dados: {
  ambientes: AmbienteRow[];
  blocos: BlocoRow[];
  capturas: CapturaRow[];
  equipe: EquipeEventoRow[];
  kit: KitRow[];
  usaKit: boolean;
}): EtapaDaPreparacao[] {
  return [
    { chave: "ambientes", feito: dados.ambientes.length > 0, quantos: dados.ambientes.length },
    { chave: "programacao", feito: dados.blocos.length > 0, quantos: dados.blocos.length },
    { chave: "pauta", feito: dados.capturas.length > 0, quantos: dados.capturas.length },
    { chave: "equipe", feito: dados.equipe.length > 0, quantos: dados.equipe.length },
    ...(dados.usaKit
      ? [{ chave: "kit" as const, feito: dados.kit.length > 0, quantos: dados.kit.length }]
      : []),
  ];
}

const ICONE = {
  ambientes: IconLayoutGrid,
  programacao: IconClipboardList,
  pauta: IconCamera,
  equipe: IconUsers,
  kit: IconBox,
} as const;

function rotuloDaEtapa(chave: EtapaDaPreparacao["chave"], t: Dictionary["eventos"]): string {
  if (chave === "ambientes") return t.prepAmbientes;
  if (chave === "programacao") return t.prepProgramacao;
  if (chave === "pauta") return t.prepPauta;
  if (chave === "equipe") return t.prepEquipe;
  return t.prepKit;
}

export function PreparacaoDoPlano({
  ambientes,
  blocos,
  capturas,
  equipe,
  kit,
  usaKit,
  onGaveta,
  onIrAoVivo,
}: {
  ambientes: AmbienteRow[];
  blocos: BlocoRow[];
  capturas: CapturaRow[];
  equipe: EquipeEventoRow[];
  kit: KitRow[];
  /** O kit só é etapa quando o evento ligou o kit (ver a gaveta de Ajustes). */
  usaKit: boolean;
  onGaveta: (qual: "equipe" | "kit") => void;
  onIrAoVivo: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;

  const etapas = etapasDaPreparacao({ ambientes, blocos, capturas, equipe, kit, usaKit });
  const feitos = etapas.filter((e) => e.feito).length;
  const proximo = etapas.find((e) => !e.feito) ?? null;
  const pronto = proximo === null;

  return (
    <div
      className={cn(
        "ev-console relative overflow-hidden rounded-2xl border transition",
        pronto ? "border-status-good/30" : "border-white/10"
      )}
    >
      <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em]">
            <span className={pronto ? "text-status-good" : "text-accent"}>
              {pronto ? t.prepPronto : t.prepTitulo}
            </span>
          </p>
          <span className="font-mono text-[10px] tabular-nums text-white/35">
            {substituir(t.prepContagem, { feitos, total: etapas.length })}
          </span>
        </div>

        {/* --- A TRILHA ---
            Nó + trecho de linha, por etapa. O trecho que liga duas etapas
            concluídas fica aceso; o resto, apagado. Num telefone a trilha
            rola em vez de espremer cinco rótulos em 400px. */}
        <div className="mt-5 overflow-x-auto pb-1">
          <ol className="flex min-w-[420px] items-start">
            {etapas.map((e, i) => {
              const Icone = ICONE[e.chave];
              const ehProximo = proximo?.chave === e.chave;
              const anteriorFeito = i > 0 && !!etapas[i - 1]?.feito;

              return (
                <li key={e.chave} className="flex min-w-0 flex-1 flex-col items-center">
                  {/* linha + nó, na mesma altura */}
                  <div className="flex w-full items-center">
                    <span
                      aria-hidden
                      className={cn(
                        "h-px flex-1 transition",
                        i === 0 ? "opacity-0" : anteriorFeito ? "bg-accent/60" : "bg-white/10"
                      )}
                    />

                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition",
                        e.feito
                          ? "border-accent/70 text-black"
                          : ehProximo
                            ? "border-accent/70 text-accent"
                            : "border-white/12 text-white/25"
                      )}
                      style={
                        e.feito
                          ? { background: "rgb(var(--color-accent))", boxShadow: "0 0 12px rgb(var(--color-accent) / 0.5)" }
                          : ehProximo
                            ? { boxShadow: "0 0 0 4px rgb(var(--color-accent) / 0.12)" }
                            : undefined
                      }
                    >
                      {e.feito ? <IconCheck className="h-4 w-4" /> : <Icone className="h-4 w-4" />}
                    </span>

                    <span
                      aria-hidden
                      className={cn(
                        "h-px flex-1 transition",
                        i === etapas.length - 1 ? "opacity-0" : e.feito ? "bg-accent/60" : "bg-white/10"
                      )}
                    />
                  </div>

                  <span
                    className={cn(
                      "mt-2.5 block max-w-full truncate px-1 text-center text-[11px] transition",
                      e.feito ? "text-white/70" : ehProximo ? "text-white" : "text-white/30"
                    )}
                  >
                    {rotuloDaEtapa(e.chave, t)}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] tabular-nums text-white/25">
                    {e.quantos > 0 ? e.quantos : "—"}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* --- O PRÓXIMO PASSO, um só --- */}
        <div className="mt-5 border-t border-white/[0.07] pt-4">
          {pronto ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12.5px] leading-relaxed text-white/45">{t.prepProntoAjuda}</p>
              <button
                type="button"
                onClick={onIrAoVivo}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-black transition hover:brightness-110"
                style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 22px rgb(var(--color-accent) / 0.45)" }}
              >
                {t.prepIrAoVivo}
                <IconArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <ProximoPasso etapa={proximo} onGaveta={onGaveta} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * O passo da vez.
 *
 * Duas formas, e a diferença não é estética: a etapa que se resolve numa
 * gaveta ganha BOTÃO, porque existe um lugar para levar a pessoa; a que se
 * resolve na própria grade ganha uma INSTRUÇÃO, porque o lugar já está na
 * tela e um botão só a faria clicar para chegar onde ela está.
 */
function ProximoPasso({
  etapa,
  onGaveta,
}: {
  etapa: EtapaDaPreparacao;
  onGaveta: (qual: "equipe" | "kit") => void;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;

  const DICA: Record<EtapaDaPreparacao["chave"], string> = {
    ambientes: t.prepDicaAmbientes,
    programacao: t.prepDicaProgramacao,
    pauta: t.prepDicaPauta,
    equipe: t.prepDicaEquipe,
    kit: t.prepDicaKit,
  };

  const gaveta = etapa.chave === "equipe" ? "equipe" : etapa.chave === "kit" ? "kit" : null;
  const acao = etapa.chave === "equipe" ? t.prepAcaoEquipe : etapa.chave === "kit" ? t.prepAcaoKit : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">{t.prepProximo}</p>
        <p className="mt-1 text-[13px] text-white/85">{DICA[etapa.chave]}</p>
      </div>

      {gaveta && acao && (
        <button
          type="button"
          onClick={() => onGaveta(gaveta)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-black transition hover:brightness-110"
          style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 22px rgb(var(--color-accent) / 0.45)" }}
        >
          {acao}
          <IconArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
