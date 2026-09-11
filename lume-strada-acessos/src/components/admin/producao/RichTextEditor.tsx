"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { apelidoDe, filtrarEquipe, mencaoEmDigitacao, type MembroMencionavel } from "@/lib/notificacoes/mencoes";
import { useEquipeMencionavel } from "@/lib/notificacoes/useEquipeMencionavel";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * Editor de texto rico minimalista — sem biblioteca externa de propósito
 * (evita adicionar mais uma dependência de build por causa de um campo de
 * briefing). Usa `contentEditable` + `document.execCommand` (suportado em
 * todo navegador moderno pros comandos básicos usados aqui: negrito,
 * itálico, sublinhado, listas). O conteúdo é salvo como HTML em
 * `prod_tarefas.briefing` — só admin escreve e só admin lê por enquanto
 * (RLS), então o risco de conteúdo malicioso nesse campo é o mesmo de
 * qualquer outro campo de texto administrativo do sistema.
 *
 * MENÇÕES — o `@` aqui dá mais trabalho do que num `textarea` porque não
 * existe `selectionStart`: o cursor vive num nó de texto solto dentro da
 * árvore do editor. Toda a lógica de menção olha para ESSE nó (o texto antes
 * do cursor dentro dele), e não para o HTML inteiro. É por isso também que a
 * menção é inserida por `Range`, e não recompondo a string: recompor
 * apagaria a formatação do parágrafo em que a pessoa está escrevendo.
 */
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const { dict } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const equipe = useEquipeMencionavel();
  const [sugestoes, setSugestoes] = useState<MembroMencionavel[]>([]);
  const [indice, setIndice] = useState(0);

  const BOTOES = [
    { comando: "bold", label: dict.producao.rtNegrito, className: "font-bold" },
    { comando: "italic", label: dict.producao.rtItalico, className: "italic" },
    { comando: "underline", label: dict.producao.rtSublinhado, className: "underline" },
    { comando: "insertUnorderedList", label: dict.producao.rtListaNaoOrdenada },
    { comando: "insertOrderedList", label: dict.producao.rtListaOrdenada },
  ] as const;

  function exec(comando: string) {
    ref.current?.focus();
    document.execCommand(comando);
    onChange(ref.current?.innerHTML ?? "");
  }

  /** O nó de texto onde o cursor está e quanto dele vem antes do cursor. */
  function cursorNoTexto(): { no: Text; offset: number } | null {
    const selecao = window.getSelection();
    if (!selecao || selecao.rangeCount === 0 || !selecao.isCollapsed) return null;
    const no = selecao.anchorNode;
    if (!no || no.nodeType !== Node.TEXT_NODE) return null;
    if (!ref.current?.contains(no)) return null;
    return { no: no as Text, offset: selecao.anchorOffset };
  }

  function recalcular() {
    const posicao = cursorNoTexto();
    if (!posicao) {
      setSugestoes([]);
      return;
    }
    const emDigitacao = mencaoEmDigitacao((posicao.no.textContent ?? "").slice(0, posicao.offset));
    if (!emDigitacao) {
      setSugestoes([]);
      return;
    }
    setSugestoes(filtrarEquipe(equipe, emDigitacao.termo));
    setIndice(0);
  }

  function escolher(membro: MembroMencionavel) {
    const posicao = cursorNoTexto();
    if (!posicao) return;
    const antes = (posicao.no.textContent ?? "").slice(0, posicao.offset);
    const emDigitacao = mencaoEmDigitacao(antes);
    if (!emDigitacao) return;

    const intervalo = document.createRange();
    intervalo.setStart(posicao.no, emDigitacao.inicio);
    intervalo.setEnd(posicao.no, posicao.offset);
    intervalo.deleteContents();

    const inserido = document.createTextNode(`@${apelidoDe(membro.nome)} `);
    intervalo.insertNode(inserido);

    const depois = document.createRange();
    depois.setStart(inserido, inserido.length);
    depois.collapse(true);
    const selecao = window.getSelection();
    selecao?.removeAllRanges();
    selecao?.addRange(depois);

    setSugestoes([]);
    onChange(ref.current?.innerHTML ?? "");
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLDivElement>) {
    if (sugestoes.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndice((i) => (i + 1) % sugestoes.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndice((i) => (i - 1 + sugestoes.length) % sugestoes.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      escolher(sugestoes[indice]!);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSugestoes([]);
    }
  }

  return (
    <div className="relative overflow-visible rounded-lg border border-base-600 bg-base-900">
      <div className="flex items-center gap-1 border-b border-base-700 bg-base-950/60 px-2 py-1.5">
        {BOTOES.map((botao) => (
          <button
            key={botao.comando}
            type="button"
            onClick={() => exec(botao.comando)}
            className={cn(
              "rounded px-2 py-1 text-xs text-ink-secondary transition hover:bg-base-800 hover:text-ink-primary",
              "className" in botao ? botao.className : undefined
            )}
          >
            {botao.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          onChange(ref.current?.innerHTML ?? "");
          recalcular();
        }}
        onKeyDown={aoTeclar}
        onBlur={() => {
          onChange(ref.current?.innerHTML ?? "");
          setTimeout(() => setSugestoes([]), 120);
        }}
        dangerouslySetInnerHTML={{ __html: value || "" }}
        data-placeholder={placeholder}
        className={cn(
          "min-h-[120px] px-3 py-2 text-sm text-ink-primary focus:outline-none",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-ink-muted",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        )}
      />

      {sugestoes.length > 0 && (
        <ul className="absolute left-2 right-2 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-lg border border-base-700 bg-base-900 py-1 shadow-2xl">
          {sugestoes.map((membro, i) => (
            <li key={membro.profileId ?? membro.nome}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  escolher(membro);
                }}
                onMouseEnter={() => setIndice(i)}
                className={cn(
                  "flex w-full items-baseline gap-2 px-3 py-1.5 text-left text-sm transition",
                  i === indice ? "bg-accent/15 text-ink-primary" : "text-ink-secondary hover:bg-base-800"
                )}
              >
                <span className="truncate font-medium">{membro.nome}</span>
                <span className="truncate text-[11px] text-ink-muted">
                  @{apelidoDe(membro.nome)}
                  {membro.cargo ? ` · ${membro.cargo}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
