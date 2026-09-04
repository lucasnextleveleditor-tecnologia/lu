"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface ValoresVisiveisContextValue {
  /** `false` = valores financeiros mascarados (estado padrão, sempre — ver comentário abaixo). */
  visivel: boolean;
  alternar: () => void;
}

const ValoresVisiveisContext = createContext<ValoresVisiveisContextValue | null>(null);

/**
 * Provider montado UMA vez no `AdminShell` — cobre Dashboard e Financeiro
 * (as duas telas com dado financeiro sensível) ao mesmo tempo, mesmo
 * espírito do `LocaleProvider` (ver `lib/i18n/`). Estado SEMPRE começa em
 * `false` (oculto) e NUNCA é persistido em localStorage/cookie de
 * propósito: o pedido era "abrir já oculto", ou seja, todo carregamento
 * novo da área admin (login, F5, nova aba) deve mostrar os valores
 * mascarados até o usuário clicar no ícone de olho — diferente da
 * preferência de idioma ou de sidebar colapsada, que SÃO lembradas entre
 * sessões. Dentro da MESMA sessão (navegando por link, sem reload) o
 * estado continua compartilhado entre Financeiro e Dashboard, já que os
 * dois vivem dentro do mesmo `AdminShell`.
 */
export function ValoresVisiveisProvider({ children }: { children: ReactNode }) {
  const [visivel, setVisivel] = useState(false);

  function alternar() {
    setVisivel((v) => !v);
  }

  return <ValoresVisiveisContext.Provider value={{ visivel, alternar }}>{children}</ValoresVisiveisContext.Provider>;
}

export function useValoresVisiveis(): ValoresVisiveisContextValue {
  const ctx = useContext(ValoresVisiveisContext);
  if (!ctx) {
    throw new Error("useValoresVisiveis() precisa ser chamado dentro de um <ValoresVisiveisProvider> (ver AdminShell.tsx).");
  }
  return ctx;
}
