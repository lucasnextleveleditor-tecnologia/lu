"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const BOTOES = [
  { comando: "bold", label: "B", className: "font-bold" },
  { comando: "italic", label: "I", className: "italic" },
  { comando: "underline", label: "S", className: "underline" },
  { comando: "insertUnorderedList", label: "• Lista" },
  { comando: "insertOrderedList", label: "1. Lista" },
] as const;

/**
 * Editor de texto rico minimalista — sem biblioteca externa de propósito
 * (evita adicionar mais uma dependência de build por causa de um campo de
 * briefing). Usa `contentEditable` + `document.execCommand` (suportado em
 * todo navegador moderno pros comandos básicos usados aqui: negrito,
 * itálico, sublinhado, listas). O conteúdo é salvo como HTML em
 * `prod_tarefas.briefing` — só admin escreve e só admin lê por enquanto
 * (RLS), então o risco de conteúdo malicioso nesse campo é o mesmo de
 * qualquer outro campo de texto administrativo do sistema.
 */
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  function exec(comando: string) {
    ref.current?.focus();
    document.execCommand(comando);
    onChange(ref.current?.innerHTML ?? "");
  }

  return (
    <div className="overflow-hidden rounded-lg border border-base-600 bg-base-900">
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
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        onBlur={() => onChange(ref.current?.innerHTML ?? "")}
        dangerouslySetInnerHTML={{ __html: value || "" }}
        data-placeholder={placeholder}
        className={cn(
          "min-h-[120px] px-3 py-2 text-sm text-ink-primary focus:outline-none",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-ink-muted",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        )}
      />
    </div>
  );
}
