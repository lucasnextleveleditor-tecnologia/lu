"use client";

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils/cn";
import { apelidoDe, filtrarEquipe, mencaoEmDigitacao, type MembroMencionavel } from "@/lib/notificacoes/mencoes";
import { useEquipeMencionavel } from "@/lib/notificacoes/useEquipeMencionavel";

interface CampoComMencoesProps {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  className?: string;
  /** Uma linha (`input`) ou várias (`textarea`). */
  multilinha?: boolean;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  onEnter?: () => void;
}

/**
 * Campo de texto onde `@` chama gente.
 *
 * DUAS DECISÕES QUE PARECEM DETALHE E NÃO SÃO:
 *
 * 1. A LISTA SÓ APARECE COM RESULTADO. Um seletor que abre vazio dizendo
 *    "ninguém encontrado" cobre o texto e obriga a pessoa a fechá-lo para
 *    continuar escrevendo — e quem escreve `@` num endereço de e-mail não
 *    está chamando ninguém. Sem resultado, o campo se comporta como um campo
 *    de texto comum e a pessoa nem percebe que havia um seletor.
 *
 * 2. ENTER ESCOLHE, MAS SÓ COM A LISTA ABERTA. Em campo de uma linha, Enter
 *    normalmente envia o formulário. Enquanto a lista está aberta ele passa a
 *    escolher a pessoa, e só volta a enviar depois. O contrário — ter de usar
 *    o mouse para escolher no meio de uma frase — quebra o ritmo de quem
 *    digita.
 *
 * O texto inserido é `@apelido` (ver `apelidoDe`), não o nome com espaço:
 * "@Ana Souza" seria indistinguível de "@Ana" seguido de "Souza" na hora de
 * descobrir quem notificar.
 */
export function CampoComMencoes({
  value,
  onChange,
  placeholder,
  className,
  multilinha = false,
  rows = 3,
  required,
  disabled,
  onEnter,
}: CampoComMencoesProps) {
  const equipe = useEquipeMencionavel();
  const campoRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const [sugestoes, setSugestoes] = useState<MembroMencionavel[]>([]);
  const [indice, setIndice] = useState(0);
  const [inicioDaMencao, setInicioDaMencao] = useState<number | null>(null);

  const aberta = sugestoes.length > 0 && inicioDaMencao !== null;

  function recalcular(texto: string, cursor: number) {
    const emDigitacao = mencaoEmDigitacao(texto.slice(0, cursor));
    if (!emDigitacao) {
      setSugestoes([]);
      setInicioDaMencao(null);
      return;
    }
    const achados = filtrarEquipe(equipe, emDigitacao.termo);
    setSugestoes(achados);
    setInicioDaMencao(achados.length > 0 ? emDigitacao.inicio : null);
    setIndice(0);
  }

  function aoDigitar(e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    const texto = e.target.value;
    onChange(texto);
    recalcular(texto, e.target.selectionStart ?? texto.length);
  }

  function escolher(membro: MembroMencionavel) {
    const campo = campoRef.current;
    if (!campo || inicioDaMencao === null) return;

    const cursor = campo.selectionStart ?? value.length;
    const novo = `${value.slice(0, inicioDaMencao)}@${apelidoDe(membro.nome)} ${value.slice(cursor)}`;
    onChange(novo);
    setSugestoes([]);
    setInicioDaMencao(null);

    // O cursor precisa voltar para logo depois da menção; sem isto ele cai no
    // fim do campo e a pessoa perde o lugar no meio da frase que estava
    // escrevendo. O timeout espera o React repintar o valor novo.
    const posicao = inicioDaMencao + apelidoDe(membro.nome).length + 2;
    setTimeout(() => {
      campo.focus();
      campo.setSelectionRange(posicao, posicao);
    }, 0);
  }

  function aoTeclar(e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) {
    if (aberta) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndice((i) => (i + 1) % sugestoes.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndice((i) => (i - 1 + sugestoes.length) % sugestoes.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        escolher(sugestoes[indice]!);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSugestoes([]);
        setInicioDaMencao(null);
        return;
      }
    }

    if (e.key === "Enter" && !multilinha && onEnter) {
      e.preventDefault();
      onEnter();
    }
  }

  const classesBase = cn(
    "w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted",
    "focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition",
    multilinha && "resize-y",
    className
  );

  return (
    <div className="relative">
      {multilinha ? (
        <textarea
          ref={campoRef}
          value={value}
          onChange={aoDigitar}
          onKeyDown={aoTeclar}
          onBlur={() => setTimeout(() => setSugestoes([]), 120)}
          placeholder={placeholder}
          rows={rows}
          required={required}
          disabled={disabled}
          className={classesBase}
        />
      ) : (
        <input
          ref={campoRef}
          value={value}
          onChange={aoDigitar}
          onKeyDown={aoTeclar}
          onBlur={() => setTimeout(() => setSugestoes([]), 120)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={classesBase}
        />
      )}

      {aberta && (
        // `onMouseDown` e não `onClick`: o clique só dispara depois do blur do
        // campo, e o blur fecha a lista — o item sumiria debaixo do cursor
        // antes de o clique chegar.
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-lg border border-base-700 bg-base-900 py-1 shadow-2xl">
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
