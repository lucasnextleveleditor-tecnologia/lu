"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { PublicoAviso, TomAviso } from "@/lib/types/notificacoes";

export type ResultadoAviso = { ok: true; id: string } | { ok: false; error: string };
type Resultado = { ok: true } | { ok: false; error: string };

const PATH = "/admin/configuracoes";

/**
 * Publica um aviso para a equipe.
 *
 * A distribuição — transformar UM aviso em uma notificação por destinatário —
 * acontece num gatilho do banco (`distribuir_aviso`), e não aqui. Se ficasse
 * nesta função, um aviso criado por qualquer outro caminho (importação,
 * automação futura, correção manual no painel do Supabase) nasceria mudo, e
 * o silêncio seria descoberto pelo funcionário que não foi avisado.
 *
 * `requireAdmin()` e não `requireModulo`: falar em nome da empresa não é
 * permissão que se delegue por módulo — mesma regra de Aparência.
 */
export async function publicarAviso(input: {
  titulo: string;
  mensagem: string;
  tom: TomAviso;
  publico: PublicoAviso;
  destinatarios: string[];
}): Promise<ResultadoAviso> {
  try {
    const { supabase, user, companyId } = await requireAdmin();
    if (!companyId) return { ok: false, error: "Sua conta não está ligada a uma empresa." };

    const titulo = input.titulo.trim();
    const mensagem = input.mensagem.trim();
    if (!titulo) return { ok: false, error: "Escreva um título para o aviso." };
    if (!mensagem) return { ok: false, error: "Escreva a mensagem do aviso." };
    if (input.publico === "specific_users" && input.destinatarios.length === 0) {
      return { ok: false, error: "Escolha pelo menos uma pessoa para receber o aviso." };
    }

    const { data: perfil } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle<{ full_name: string | null }>();

    const { data, error } = await supabase
      .from("announcements")
      .insert({
        company_id: companyId,
        sender_id: user.id,
        sender_nome: perfil?.full_name ?? null,
        title: titulo,
        message: mensagem,
        tone: input.tom,
        target_type: input.publico,
        // Público "todos" ignora a lista: guardar destinatários num aviso
        // geral criaria duas versões da mesma verdade, e um dia alguém leria
        // a errada.
        target_user_ids: input.publico === "specific_users" ? input.destinatarios : [],
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível publicar o aviso." };

    revalidatePath(PATH);
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Arquiva um aviso: ele sai do sino de todo mundo e continua no histórico.
 *
 * Arquivar, e não excluir, porque um comunicado é registro do que foi dito à
 * equipe — apagar seria perder a resposta para "isso foi avisado?".
 */
export async function arquivarAviso(id: string, arquivado: boolean): Promise<Resultado> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("announcements").update({ arquivado }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Exclusão de verdade — para o aviso publicado por engano, antes de alguém ler. */
export async function excluirAviso(id: string): Promise<Resultado> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
