"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/locales";

/** Troca o idioma da interface — grava o cookie e deixa o `router.refresh()` do `LanguageSwitcher` recarregar os Server Components com o dicionário novo. */
export async function definirIdioma(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
