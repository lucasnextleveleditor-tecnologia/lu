"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/dictionaries/pt";

interface LocaleContextValue {
  locale: Locale;
  dict: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps extends LocaleContextValue {
  children: ReactNode;
}

/**
 * Provider montado UMA vez, no layout raiz (`app/layout.tsx`) — cobre login,
 * área admin e portal do cliente ao mesmo tempo, já que os três ficam
 * aninhados dentro dele. Todo componente CLIENTE que precisa de texto
 * traduzido usa `useLocale()` diretamente — nunca precisa receber `dict`
 * via prop dos pais, mesmo vários níveis abaixo.
 */
export function LocaleProvider({ locale, dict, children }: LocaleProviderProps) {
  return <LocaleContext.Provider value={{ locale, dict }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale() precisa ser chamado dentro de um <LocaleProvider> (ver app/layout.tsx).");
  return ctx;
}
