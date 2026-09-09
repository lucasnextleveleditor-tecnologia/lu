"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { IconCheck, IconX } from "@/components/ui/icons";

/**
 * Botões de ação de uma linha de lista — visíveis, não escondidos num menu.
 *
 * O menu de três pontinhos parecia arrumado, mas cobrava um preço alto:
 * ninguém descobre o que existe dentro dele sem clicar, e, quando a linha
 * mora dentro de uma lista com cantos arredondados, o menu que abre é
 * cortado pelo `overflow-hidden` da própria lista — o clique acontece e
 * aparentemente nada acontece.
 *
 * Aqui as ações ficam à vista, uma ao lado da outra, cada uma com o seu
 * ícone e o seu tooltip.
 */
export function BotaoDeAcao({
  icone,
  rotulo,
  aoClicar,
  desativado,
  className,
}: {
  icone: React.ReactNode;
  rotulo: string;
  aoClicar: () => void;
  desativado?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={rotulo}
      aria-label={rotulo}
      disabled={desativado}
      onClick={(e) => {
        // As ações costumam morar ao lado de um link para o próprio item —
        // sem isto, clicar em "arquivar" abriria o item.
        e.preventDefault();
        e.stopPropagation();
        aoClicar();
      }}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-base-700 text-ink-muted transition",
        "hover:border-ink-muted hover:text-ink-primary disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
    >
      {icone}
    </button>
  );
}

/**
 * Excluir em dois passos, sem janela do navegador.
 *
 * O primeiro clique não apaga nada: transforma o botão numa pergunta com
 * "sim" e "não" ao lado. É a mesma proteção do `confirm()` do navegador, mas
 * sem travar a página, sem sumir da tela em celular e sem depender de um
 * diálogo que o sistema operacional desenha do jeito dele.
 *
 * A pergunta se cancela sozinha em alguns segundos: um botão vermelho
 * esquecido aberto na tela é um clique acidental esperando acontecer.
 */
export function BotaoExcluir({
  rotulo,
  pergunta,
  rotuloConfirmar,
  rotuloCancelar,
  aoConfirmar,
  desativado,
  icone,
}: {
  rotulo: string;
  pergunta: string;
  rotuloConfirmar: string;
  rotuloCancelar: string;
  aoConfirmar: () => void;
  desativado?: boolean;
  icone: React.ReactNode;
}) {
  const [perguntando, setPerguntando] = useState(false);

  useEffect(() => {
    if (!perguntando) return;
    const t = setTimeout(() => setPerguntando(false), 6000);
    return () => clearTimeout(t);
  }, [perguntando]);

  if (!perguntando) {
    return (
      <BotaoDeAcao
        icone={icone}
        rotulo={rotulo}
        desativado={desativado}
        aoClicar={() => setPerguntando(true)}
        className="hover:border-danger/50 hover:bg-danger/10 hover:text-danger"
      />
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-1 rounded-lg border border-danger/40 bg-danger/10 px-1.5 py-1">
      <span className="whitespace-nowrap text-[11px] font-medium text-danger">{pergunta}</span>
      <button
        type="button"
        title={rotuloConfirmar}
        aria-label={rotuloConfirmar}
        disabled={desativado}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPerguntando(false);
          aoConfirmar();
        }}
        className="flex h-6 w-6 items-center justify-center rounded-md bg-danger/20 text-danger transition hover:bg-danger/30 disabled:opacity-40"
      >
        <IconCheck className="h-3 w-3" />
      </button>
      <button
        type="button"
        title={rotuloCancelar}
        aria-label={rotuloCancelar}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPerguntando(false);
        }}
        className="flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition hover:text-ink-primary"
      >
        <IconX className="h-3 w-3" />
      </button>
    </span>
  );
}
