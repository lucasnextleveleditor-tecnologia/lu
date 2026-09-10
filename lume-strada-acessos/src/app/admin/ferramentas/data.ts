import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Os números que aparecem no rodapé de cada ferramenta.
 *
 * Um cartão que diz apenas "Disponível" não informa nada: a pessoa já sabe
 * que a ferramenta existe, senão não estaria olhando para ela. O que ela não
 * sabe é se tem alguma coisa esperando lá dentro — e é isso que transforma
 * uma vitrine numa tela de trabalho.
 *
 * Todas as contagens usam `head: true`: o banco devolve só o total, sem
 * trazer uma linha sequer. São seis consultas ao mesmo tempo, e a página
 * abre sem esperar nenhuma delas individualmente.
 */
export interface ContagensDasFerramentas {
  ordensAtivas: number;
  mapas: number;
  contratosAguardando: number;
  documentosAguardando: number;
}

async function contar(supabase: SupabaseClient, tabela: string, filtro: (q: any) => any): Promise<number> {
  try {
    const { count } = await filtro(supabase.from(tabela).select("id", { count: "exact", head: true }));
    return count ?? 0;
  } catch {
    // Uma contagem que falha não pode derrubar a tela: o cartão continua
    // levando à ferramenta, apenas sem o número.
    return 0;
  }
}

export async function buscarContagensDasFerramentas(supabase: SupabaseClient): Promise<ContagensDasFerramentas> {
  const [ordensAtivas, mapas, contratosAguardando, documentosAguardando] = await Promise.all([
    contar(supabase, "ordens_do_dia", (q) => q.eq("arquivado", false)),
    contar(supabase, "mapas_mentais", (q) => q.eq("arquivado", false)),
    contar(supabase, "contratos", (q) => q.in("status", ["enviado", "visualizado"])),
    contar(supabase, "assinatura_documentos", (q) => q.eq("status", "enviado").eq("arquivado", false)),
  ]);

  return { ordensAtivas, mapas, contratosAguardando, documentosAguardando };
}
