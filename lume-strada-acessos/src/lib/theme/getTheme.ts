import { cookies } from "next/headers";
import { DEFAULT_THEME, THEME_COOKIE, isTheme, type Theme } from "@/lib/theme/theme";

/**
 * Lê o tema escolhido (cookie `lsf_theme`) — chamado no layout raiz, junto
 * com `getDictionary()`, pra resolver o tema ANTES do primeiro HTML sair
 * (zero flash de tema errado). Componentes cliente usam `useTheme()`
 * (`ThemeProvider.tsx`) em vez desta função.
 */
export async function getTheme(): Promise<Theme> {
  const cookieStore = await cookies();
  const valor = cookieStore.get(THEME_COOKIE)?.value;
  return isTheme(valor) ? valor : DEFAULT_THEME;
}
