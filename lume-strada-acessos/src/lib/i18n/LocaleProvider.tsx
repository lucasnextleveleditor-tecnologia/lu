"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { criarFormatador, type FormatadorMoeda, type Moeda } from "@/lib/types/moeda";
import type { Dictionary } from "@/lib/i18n/dictionaries/pt";

interface LocaleContextValue {
  locale: Locale;
  dict: Dictionary;
  /** Moeda da EMPRESA — igual para todo o time, independente da língua de cada um. */
  moeda: Moeda;
  /** Já amarrado na moeda e no idioma: `fmtMoeda(valor)`, sem passar nada além do número. */
  fmtMoeda: FormatadorMoeda;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  locale: Locale;
  dict: Dictionary;
  moeda: Moeda;
  children: ReactNode;
}

/**
 * Provider montado UMA vez, no layout raiz (`app/layout.tsx`) — cobre login,
 * área admin e portal do cliente ao mesmo tempo, já que os três ficam
 * aninhados dentro dele. Todo componente CLIENTE que precisa de texto
 * traduzido usa `useLocale()` diretamente — nunca precisa receber `dict`
 * via prop dos pais, mesmo vários níveis abaixo.
 */
export function LocaleProvider({ locale, dict, moeda, children }: LocaleProviderProps) {
  // O formatador é criado uma vez por moeda/idioma, não a cada render: uma
  // tabela de trezentas linhas criaria trezentos `Intl.NumberFormat` iguais.
  const valor = useMemo(() => ({ locale, dict, moeda, fmtMoeda: criarFormatador(moeda, locale) }), [locale, dict, moeda]);
  return <LocaleContext.Provider value={valor}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale() precisa ser chamado dentro de um <LocaleProvider> (ver app/layout.tsx).");
  return ctx;
}
