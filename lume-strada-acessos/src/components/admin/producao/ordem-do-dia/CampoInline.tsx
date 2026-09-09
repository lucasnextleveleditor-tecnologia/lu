"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Campo que parece texto e vira input só quando recebe o cursor.
 *
 * A folha é um DOCUMENTO — quem abre precisa lê-la como quem lê um papel, não
 * como quem encara um formulário. Caixas e bordas em volta de cada valor
 * transformariam a ordem do dia num cadastro; aqui a borda só aparece no
 * foco, e some de novo. É por isso que existe este componente em vez de usar
 * o `<Input>` comum do sistema.
 *
 * Salva no `blur` (e no Enter), nunca a cada tecla: uma ida ao servidor por
 * caractere digitado seria desperdício e deixaria o campo travando.
 */
export function CampoInline({
  valor,
  onSalvar,
  placeholder,
  className,
  tipo = "text",
  ariaLabel,
  multiline = false,
}: {
  valor: string;
  onSalvar: (novo: string) => void;
  placeholder?: string;
  className?: string;
  tipo?: "text" | "time" | "date" | "number";
  ariaLabel: string;
  multiline?: boolean;
}) {
  const [rascunho, setRascunho] = useState(valor);
  const ultimoSalvo = useRef(valor);

  // Quando o servidor devolve um valor diferente (outra pessoa editou, ou o
  // revalidate trouxe dado novo), o campo acompanha — mas só se a pessoa não
  // estiver com uma edição pendente em cima dele.
  useEffect(() => {
    if (valor !== ultimoSalvo.current) {
      ultimoSalvo.current = valor;
      setRascunho(valor);
    }
  }, [valor]);

  function confirmar() {
    if (rascunho === ultimoSalvo.current) return;
    ultimoSalvo.current = rascunho;
    onSalvar(rascunho);
  }

  const classesComuns = cn(
    "w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-inherit outline-none transition",
    "hover:border-base-700 focus:border-accent/60 focus:bg-base-950/40",
    "placeholder:text-ink-muted/60",
    // Na impressão nada disso existe: sem borda, sem fundo, e o texto some se
    // estiver vazio (um placeholder impresso seria ruído no papel).
    "print:border-transparent print:bg-transparent print:px-0 print:py-0",
    className
  );

  if (multiline) {
    return (
      <textarea
        aria-label={ariaLabel}
        value={rascunho}
        placeholder={placeholder}
        onChange={(e) => setRascunho(e.target.value)}
        onBlur={confirmar}
        rows={3}
        className={cn(classesComuns, "resize-y")}
      />
    );
  }

  return (
    <input
      type={tipo}
      aria-label={ariaLabel}
      value={rascunho}
      placeholder={placeholder}
      onChange={(e) => setRascunho(e.target.value)}
      onBlur={confirmar}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className={classesComuns}
    />
  );
}
