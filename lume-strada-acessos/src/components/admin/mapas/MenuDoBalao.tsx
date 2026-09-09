"use client";

import { useState } from "react";
import { CORES_MAPA, ORDEM_CORES } from "@/lib/types/mapa-mental";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import { IconPlus, IconPalette, IconTrash } from "@/components/ui/icons";

/**
 * O menu que aparece colado no balão selecionado.
 *
 * As três ações que se repetem o tempo todo — ramificar, colorir, apagar —
 * ficam a um centímetro do balão em que se está trabalhando, em vez de a uma
 * travessia de tela até o painel lateral. O painel continua existindo para o
 * que é ocasional (fonte, anexos, comentários); aqui fica só o que se usa a
 * cada dois cliques.
 *
 * A posição é calculada em pixels DE TELA, não do mapa: se o menu vivesse
 * dentro da camada que dá zoom, ele encolheria junto com o desenho e viraria
 * um confete ilegível em 30%.
 */
export function MenuDoBalao({
  x,
  y,
  ehRaiz,
  corAtual,
  aoCriarRamo,
  aoMudarCor,
  aoApagar,
}: {
  x: number;
  y: number;
  ehRaiz: boolean;
  corAtual: string;
  aoCriarRamo: () => void;
  aoMudarCor: (cor: string) => void;
  aoApagar: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.mapaMental;
  const [cores, setCores] = useState(false);

  return (
    <div
      className="absolute z-30 flex -translate-y-1/2 items-start gap-1.5"
      style={{ left: x, top: y }}
      // O menu não pode roubar o clique do canvas por trás dele.
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-0.5 rounded-xl border border-base-700 bg-base-900/95 p-1 shadow-lg backdrop-blur-sm">
        <BotaoMenu rotulo={t.novoFilho} onClick={aoCriarRamo}>
          <IconPlus className="h-4 w-4" />
        </BotaoMenu>

        {/* A raiz não tem cor própria: ela é a cor da marca, e os ramos é que
            se distinguem entre si. */}
        {!ehRaiz && (
          <BotaoMenu rotulo={t.corDoRamo} ativo={cores} onClick={() => setCores((c) => !c)}>
            <IconPalette className="h-4 w-4" />
          </BotaoMenu>
        )}

        {!ehRaiz && (
          <BotaoMenu rotulo={t.apagar} perigo onClick={aoApagar}>
            <IconTrash className="h-4 w-4" />
          </BotaoMenu>
        )}
      </div>

      {cores && !ehRaiz && (
        <div className="flex flex-col gap-1 rounded-xl border border-base-700 bg-base-900/95 p-1.5 shadow-lg backdrop-blur-sm">
          <button
            type="button"
            onClick={() => {
              aoMudarCor("");
              setCores(false);
            }}
            title={t.corAutomatica}
            className={cn(
              "h-5 w-5 rounded-full border border-base-600 text-[8px] leading-none text-ink-muted",
              !corAtual && "ring-2 ring-accent ring-offset-1 ring-offset-base-900"
            )}
          >
            A
          </button>
          {ORDEM_CORES.map((chave) => (
            <button
              key={chave}
              type="button"
              onClick={() => {
                aoMudarCor(chave);
                setCores(false);
              }}
              aria-label={chave}
              className={cn("h-5 w-5 rounded-full", corAtual === chave && "ring-2 ring-accent ring-offset-1 ring-offset-base-900")}
              style={{ backgroundColor: CORES_MAPA[chave] }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BotaoMenu({
  rotulo,
  onClick,
  children,
  perigo,
  ativo,
}: {
  rotulo: string;
  onClick: () => void;
  children: React.ReactNode;
  perigo?: boolean;
  ativo?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={rotulo}
      aria-label={rotulo}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg transition",
        ativo && "bg-accent/[0.16] text-accent",
        !ativo && perigo && "text-ink-muted hover:bg-danger/10 hover:text-danger",
        !ativo && !perigo && "text-ink-secondary hover:bg-base-800/70 hover:text-ink-primary"
      )}
    >
      {children}
    </button>
  );
}
