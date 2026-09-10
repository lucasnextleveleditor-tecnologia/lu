"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { FormatoDoPost } from "@/lib/types/producao";

/**
 * A receita de produção de cada formato de post.
 *
 * Configurada uma vez pelo administrador e aplicada em todo post que sobe do
 * calendário de conteúdo — e só nos campos que ficaram em branco. É o que
 * tira da social media o trabalho de preencher tipo de serviço, formatos de
 * exportação e prazo do primeiro corte trinta vezes por mês.
 *
 * `requireAdmin` e não `requireModulo`: a RLS da tabela já exige `is_admin()`
 * para escrever, e a checagem aqui barra antes de tentar. É uma regra da
 * agência, não uma preferência de quem está montando o mês — uma receita
 * trocada em silêncio muda como toda peça futura nasce.
 */

export type ResultadoReceita = { ok: true } | { ok: false; error: string };

const PATHS = ["/admin/configuracoes", "/admin/planejamento"];
const revalidar = () => PATHS.forEach((p) => revalidatePath(p));

function mensagem(err: unknown): string {
  return err instanceof Error ? err.message : "Erro desconhecido.";
}

export async function salvarReceitaDePost(
  formato: FormatoDoPost,
  campos: { tipo_servico_id: string | null; formatos_exportacao: string | null; dias_v1: number | null }
): Promise<ResultadoReceita> {
  try {
    const { supabase } = await requireAdmin();

    const dias =
      campos.dias_v1 === null || !Number.isFinite(campos.dias_v1)
        ? null
        : Math.min(90, Math.max(0, Math.round(campos.dias_v1)));

    // Upsert por (company_id, formato), que é a unique da tabela. Sem isso,
    // salvar duas vezes o mesmo formato criaria duas receitas e a aplicação
    // teria que escolher uma delas — o tipo de coisa que só aparece meses
    // depois, quando alguém pergunta por que o Reels virou Carrossel.
    const { error } = await supabase.from("post_receitas").upsert(
      {
        formato,
        tipo_servico_id: campos.tipo_servico_id || null,
        formatos_exportacao: campos.formatos_exportacao?.trim() || null,
        dias_v1: dias,
      },
      { onConflict: "company_id,formato" }
    );

    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** Tira a receita do formato — os posts daquele formato voltam a subir em branco. */
export async function limparReceitaDePost(formato: FormatoDoPost): Promise<ResultadoReceita> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("post_receitas").delete().eq("formato", formato);
    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}
