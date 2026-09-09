"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * A paleta vertical, encostada na lateral da tela do mapa.
 *
 * O formato é o de um editor gráfico de verdade — coluna estreita, ícone só,
 * nome no hover — e existe pelo motivo certo: ferramenta de canvas se usa o
 * tempo todo e com o olho no desenho, não no topo da página. Ficar ao lado
 * do mapa faz a mão ir e voltar num movimento curto, e mantém a barra de
 * cima livre para o que é do documento (título, compartilhar, salvar).
 *
 * As ferramentas vêm agrupadas: primeiro como se aponta (seta, mão), depois
 * como se enxerga (encaixar, arrumar), depois como a tela se comporta (fundo,
 * tela cheia). Um filete separa cada grupo — é o que evita que dez ícones
 * iguais virem uma parede sem hierarquia.
 */
export interface ItemPaleta {
  chave: string;
  rotulo: string;
  dica?: string;
  icone: ReactNode;
  ativo?: boolean;
  aoClicar: () => void;
}

export function PaletaFerramentas({ grupos }: { grupos: ItemPaleta[][] }) {
  return (
    <div className="absolute left-3 top-3 z-20 flex flex-col gap-1 rounded-xl border border-base-700 bg-base-900/90 p-1 shadow-lg backdrop-blur-sm">
      {grupos.map((grupo, i) => (
        <div key={i} className="contents">
          {i > 0 && <span className="mx-1.5 my-0.5 h-px bg-base-700" aria-hidden />}
          {grupo.map((item) => (
            <button
              key={item.chave}
              type="button"
              onClick={item.aoClicar}
              aria-label={item.rotulo}
              aria-pressed={item.ativo}
              title={item.dica ? `${item.rotulo} — ${item.dica}` : item.rotulo}
              className={cn(
                "group relative flex h-8 w-8 items-center justify-center rounded-lg transition",
                item.ativo
                  ? "bg-accent/[0.16] text-accent ring-1 ring-inset ring-accent/30"
                  : "text-ink-muted hover:bg-base-800/70 hover:text-ink-primary"
              )}
            >
              {item.icone}

              {/* O nome aparece ao lado no hover: ícone sozinho é rápido para
                  quem já sabe e mudo para quem não sabe. */}
              <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-md border border-base-700 bg-base-900 px-2 py-1 text-[11px] text-ink-secondary shadow-lg group-hover:block">
                {item.rotulo}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
