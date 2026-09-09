"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { CompromissoInput } from "@/lib/types/agenda";

const PATH = "/admin/agenda";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };

function normalizarInput(input: CompromissoInput) {
  return {
    titulo: input.titulo.trim(),
    tipo: input.tipo,
    data: input.data,
    hora: input.hora || null,
    cliente_cadastro_id: input.clienteCadastroId || null,
    cliente_nome: input.clienteNome?.trim() || null,
    notas: input.notas?.trim() || null,
  };
}

export async function criarCompromisso(input: CompromissoInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("agenda");
    if (!input.titulo.trim()) return { ok: false, error: "Informe o título do compromisso." };
    if (!input.data) return { ok: false, error: "Informe a data do compromisso." };

    const { data, error } = await supabase.from("compromissos").insert(normalizarInput(input)).select("id").single();
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    return { ok: true, id: data.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarCompromisso(id: string, input: CompromissoInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("agenda");
    if (!input.titulo.trim()) return { ok: false, error: "Informe o título do compromisso." };
    if (!input.data) return { ok: false, error: "Informe a data do compromisso." };

    const { error } = await supabase.from("compromissos").update(normalizarInput(input)).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerCompromisso(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("agenda");
    const { error } = await supabase.from("compromissos").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Move o compromisso pra outro dia — usado pelo arrastar-e-soltar do calendário (`AgendaCalendario.tsx`). Só mexe na coluna `data`; hora/demais campos não mudam. */
export async function moverCompromisso(id: string, novaData: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("agenda");
    const { error } = await supabase.from("compromissos").update({ data: novaData }).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
