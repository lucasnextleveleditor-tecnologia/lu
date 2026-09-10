"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconChevronDown, IconSearch, IconCheck } from "@/components/ui/icons";
import { bandeiraDe, combinaComBusca, nomeDoPais, paisesOrdenados, paisPorIso } from "@/lib/ferramentas/paises";

/**
 * Escolher um país entre 235.
 *
 * Um `<select>` nativo com 235 opções é uma lista que só se navega rolando —
 * e ninguém rola até a Tanzânia. Aqui a busca é o caminho principal: dá pra
 * digitar o nome no próprio idioma ("alemanha", "germany"), o código de duas
 * letras ("de") ou o próprio DDI ("49", "+49"), e a lista filtra enquanto se
 * digita.
 *
 * Os seis países do dia a dia ficam presos no topo, antes da ordem
 * alfabética, porque a lista completa é o caso raro — o comum é Brasil.
 *
 * A ordem alfabética é calculada no NAVEGADOR, com o idioma de quem está
 * olhando: "Alemanha" e "Germany" não caem no mesmo lugar do alfabeto, então
 * uma ordem fixa no código sairia embaralhada em dois dos três idiomas.
 */
export function SeletorDePais({
  iso,
  onChange,
  desabilitado,
}: {
  iso: string;
  onChange: (iso: string) => void;
  desabilitado?: boolean;
}) {
  const { dict, locale } = useLocale();
  const t = dict.ferramentas.linkWhatsapp;

  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const caixaRef = useRef<HTMLDivElement>(null);
  const buscaRef = useRef<HTMLInputElement>(null);

  const todos = useMemo(() => paisesOrdenados(locale), [locale]);
  const filtrados = useMemo(() => todos.filter((item) => combinaComBusca(item, busca)), [todos, busca]);

  const atual = paisPorIso(iso);
  const nomeAtual = atual ? nomeDoPais(atual.iso, locale) : iso;

  // Clique fora e Esc fecham. Sem isso, um painel aberto sobre a página fica
  // no caminho de tudo e a única saída é escolher alguma coisa.
  useEffect(() => {
    if (!aberto) return;
    const foraDaCaixa = (e: MouseEvent) => {
      if (caixaRef.current && !caixaRef.current.contains(e.target as Node)) setAberto(false);
    };
    const teclou = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", foraDaCaixa);
    document.addEventListener("keydown", teclou);
    return () => {
      document.removeEventListener("mousedown", foraDaCaixa);
      document.removeEventListener("keydown", teclou);
    };
  }, [aberto]);

  // Abrir já com o cursor na busca: quem abre a lista quer digitar, não rolar.
  useEffect(() => {
    if (aberto) buscaRef.current?.focus();
    else setBusca("");
  }, [aberto]);

  function escolher(novo: string) {
    onChange(novo);
    setAberto(false);
  }

  return (
    <div className="relative" ref={caixaRef}>
      <button
        type="button"
        disabled={desabilitado}
        onClick={() => setAberto((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-left text-sm text-ink-primary transition",
          "focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-40"
        )}
      >
        <span aria-hidden className="shrink-0 text-base leading-none">
          {bandeiraDe(iso)}
        </span>
        <span className="min-w-0 flex-1 truncate">{nomeAtual}</span>
        <span className="shrink-0 tabular-nums text-ink-muted">+{atual?.ddi ?? ""}</span>
        <IconChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-ink-muted transition", aberto && "rotate-180")} />
      </button>

      {aberto && (
        <div className="absolute z-40 mt-1.5 w-full min-w-[16rem] overflow-hidden rounded-xl border border-base-700 bg-base-900 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-base-800 px-3 py-2">
            <IconSearch className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
            <input
              ref={buscaRef}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => {
                // Enter escolhe o primeiro resultado — digitou "alem", apertou
                // Enter, acabou. É o caminho mais curto e o mais usado.
                if (e.key === "Enter" && filtrados[0]) {
                  e.preventDefault();
                  escolher(filtrados[0].pais.iso);
                }
              }}
              placeholder={t.buscarPais}
              className="w-full bg-transparent text-sm text-ink-primary outline-none placeholder:text-ink-muted"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <ul className="max-h-72 overflow-y-auto py-1">
            {filtrados.length === 0 && (
              <li className="px-3 py-6 text-center text-xs text-ink-muted">{t.nenhumPais}</li>
            )}
            {filtrados.map((item, i) => {
              const escolhido = item.pais.iso === iso;
              // Linha divisória depois do último frequente — separa "os de
              // sempre" do alfabeto sem precisar de título nenhum.
              const ultimoFrequente = item.frequente && !filtrados[i + 1]?.frequente && !busca;
              return (
                <li key={item.pais.iso} className={cn(ultimoFrequente && "border-b border-base-800 pb-1")}>
                  <button
                    type="button"
                    onClick={() => escolher(item.pais.iso)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition",
                      escolhido ? "bg-accent/10 text-ink-primary" : "text-ink-secondary hover:bg-base-800"
                    )}
                  >
                    <span aria-hidden className="shrink-0 text-base leading-none">
                      {bandeiraDe(item.pais.iso)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{item.nome}</span>
                    <span className="shrink-0 text-xs tabular-nums text-ink-muted">+{item.pais.ddi}</span>
                    {escolhido && <IconCheck className="h-3.5 w-3.5 shrink-0 text-accent" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
