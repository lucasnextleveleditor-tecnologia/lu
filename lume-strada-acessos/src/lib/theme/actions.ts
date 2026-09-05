"use server";

import { cookies } from "next/headers";
import { THEME_COOKIE, isTheme } from "@/lib/theme/theme";

/** Troca o modo de cor — grava o cookie e deixa o `router.refresh()` do `ThemeToggle` recarregar os Server Components (mesmo padrão de `definirIdioma`). */
export async function definirTema(theme: string): Promise<void> {
  if (!isTheme(theme)) return;
  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
