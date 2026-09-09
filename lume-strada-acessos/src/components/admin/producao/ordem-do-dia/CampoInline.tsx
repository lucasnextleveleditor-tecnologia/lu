"use client";

import { useEffect, useId, useRef, useState } from "react";
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
 * O campo vazio mostra um EXEMPLO de verdade ("Rua Augusta, 1200 — São Paulo"),
 * não o nome do campo. Exemplo ensina o formato esperado; rótulo repetido
 * dentro do campo não ensina nada. E o exemplo some no clique, antes mesmo de
 * a pessoa digitar a primeira letra — assim ninguém precisa apagar nada nem
 * fica na dúvida se aquilo já estava preenchido.
 *
 * Salva no `blur` (e no Enter), nunca a cada tecla: uma ida ao servidor por
 * caractere digitado seria desperdício e deixaria o campo travando.
 */
export function CampoInline({
  valor,
  onSalvar,
  exemplo,
  className,
  tipo = "text",
  ariaLabel,
  multiline = false,
  sugestoes,
  somenteLeitura = false,
}: {
  valor: string;
  onSalvar: (novo: string) => void;
  /** Exemplo preenchido em cinza claro. Some no clique. */
  exemplo?: string;
  className?: string;
  tipo?: "text" | "time" | "date" | "number";
  ariaLabel: string;
  multiline?: boolean;
  /** Opções sugeridas — o campo continua sendo texto livre. */
  sugestoes?: string[];
  /** Vira texto puro: é assim que a mesma folha serve ao link da equipe. */
  somenteLeitura?: boolean;
}) {
  const [rascunho, setRascunho] = useState(valor);
  const [focado, setFocado] = useState(false);
  const ultimoSalvo = useRef(valor);
  const idLista = useId();

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
    setFocado(false);
    if (rascunho === ultimoSalvo.current) return;
    ultimoSalvo.current = rascunho;
    onSalvar(rascunho);
  }

  // A regra do exemplo: aparece só enquanto o campo está vazio E longe do
  // cursor. No instante do foco vira string vazia, e o campo fica limpo para
  // digitar.
  const textoExemplo = focado ? "" : exemplo;

  const classesComuns = cn(
    "w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-inherit outline-none transition",
    "hover:border-base-700/70 focus:border-accent/60 focus:bg-base-950/50",
    // O exemplo é visivelmente mais apagado que o valor real: ninguém pode
    // confundir sugestão com conteúdo já preenchido.
    "placeholder:text-ink-muted/45 placeholder:font-normal placeholder:italic",
    // Na impressão nada disso existe: sem borda, sem fundo, e o exemplo não
    // vai para o papel (um placeholder impresso seria ruído).
    "papel:border-transparent papel:bg-transparent papel:px-0 papel:py-0 papel:placeholder:text-transparent",
    className
  );

  // Sem edição, o campo não é um input desabilitado — é texto. Um input
  // cinza convida a clicar e frustra; o texto simplesmente se lê. E o
  // exemplo não aparece: sugestão de preenchimento para quem não preenche
  // nada seria só ruído.
  if (somenteLeitura) {
    return (
      <span className={cn("block whitespace-pre-wrap break-words px-1.5 py-1", className)}>
        {valor || <span className="opacity-40">—</span>}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        aria-label={ariaLabel}
        value={rascunho}
        placeholder={textoExemplo}
        onChange={(e) => setRascunho(e.target.value)}
        onFocus={() => setFocado(true)}
        onBlur={confirmar}
        rows={3}
        className={cn(classesComuns, "resize-y")}
      />
    );
  }

  return (
    <>
      <input
        type={tipo}
        aria-label={ariaLabel}
        value={rascunho}
        placeholder={textoExemplo}
        list={sugestoes?.length ? idLista : undefined}
        onChange={(e) => setRascunho(e.target.value)}
        onFocus={() => setFocado(true)}
        onBlur={confirmar}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className={classesComuns}
      />
      {sugestoes?.length ? (
        <datalist id={idLista}>
          {sugestoes.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      ) : null}
    </>
  );
}
