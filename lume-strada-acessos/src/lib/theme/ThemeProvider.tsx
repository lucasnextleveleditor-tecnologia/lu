"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Theme } from "@/lib/theme/theme";

interface ThemeContextValue {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps extends ThemeContextValue {
  children: ReactNode;
}

/**
 * Provider montado UMA vez no layout raiz (`app/layout.tsx`), igual ao
 * `LocaleProvider` — cobre login, área admin e portal do cliente ao mesmo
 * tempo. O tema em si já está aplicado na tag `<html>` (classe `dark`/
 * `light`) antes disso tudo renderizar; este contexto só existe pra
 * componentes cliente (como o próprio `ThemeToggle`) saberem qual ícone/
 * rótulo mostrar sem precisar ler a classe do DOM na mão.
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme() precisa ser chamado dentro de um <ThemeProvider> (ver app/layout.tsx).");
  return ctx;
}
