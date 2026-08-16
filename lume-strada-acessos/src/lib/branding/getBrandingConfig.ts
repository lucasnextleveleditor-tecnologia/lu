import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { BrandingConfigRow } from "@/lib/types/database";
import { DEFAULT_BRANDING } from "@/lib/branding/constants";

/**
 * Lê a linha singleton de `branding_config` — usada pelo layout raiz (CSS
 * vars + favicon), pela sidebar do admin, pelo header do cliente e pela
 * tela de login. `cache()` do React dedupe chamadas dentro do mesmo request
 * (ex: layout raiz + admin/layout.tsx pedindo os dois nesta mesma
 * renderização não disparam duas queries).
 *
 * Nunca lança: se o schema ainda não foi rodado no Supabase do usuário (tabela
 * não existe) ou a query falhar por qualquer motivo, cai no visual padrão —
 * branding ausente não pode derrubar o app.
 */
export const getBrandingConfig = cache(async (): Promise<BrandingConfigRow> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("branding_config")
      .select("*")
      .limit(1)
      .overrideTypes<BrandingConfigRow[], { merge: false }>();

    if (error || !data?.[0]) return DEFAULT_BRANDING;

    // O select("*") só traz as colunas que já existem no banco do usuário
    // NESTE momento. Se o código já foi atualizado com um campo novo (ex: as
    // colunas de banner_*) mas a migração .sql correspondente ainda não
    // rodou no Supabase dele, o objeto volta SEM essas chaves (undefined,
    // não null). Por isso sempre mesclamos com DEFAULT_BRANDING por baixo:
    // garante que todo consumidor (login, admin, dashboard, formulário de
    // Aparência) sempre recebe o formato completo de BrandingConfigRow,
    // mesmo com o banco temporariamente atrás do código — evita telas
    // quebrando com "Cannot read properties of undefined" só porque o SQL
    // ainda não foi aplicado.
    return { ...DEFAULT_BRANDING, ...data[0] };
  } catch {
    return DEFAULT_BRANDING;
  }
});
