"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };

// Organograma vive dentro de Cadastros → Equipe (sub-aba, ver
// `OrganogramaView.tsx`) — não tem página própria, por isso revalida o
// caminho da Central de Cadastros. Admin-only, mesmo padrão de
// `criarMembroEquipe`/`removerMembroEquipe` em `app/admin/actions.ts`:
// organizar a estrutura da equipe não é delegável por permissão.
const PATH = "/admin";

// ----------------------------------------------------------------------------
// Departamentos
// ----------------------------------------------------------------------------
export interface DepartamentoInput {
  nome: string;
  cor: string;
}

export async function criarDepartamento(input: DepartamentoInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireAdmin();
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do departamento." };

    const { count } = await supabase.from("departamentos").select("id", { count: "exact", head: true });

    const { data, error } = await supabase
      .from("departamentos")
      .insert({ nome: input.nome.trim(), cor: input.cor, ordem: count ?? 0 })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true, id: data!.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarDepartamento(id: string, input: DepartamentoInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do departamento." };

    const { error } = await supabase.from("departamentos").update({ nome: input.nome.trim(), cor: input.cor }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Remove o departamento inteiro — os cargos dentro dele vão junto (`on delete cascade`, ver `supabase/organograma.sql`). O modal de confirmação no cliente já avisa disso antes de chamar. */
export async function removerDepartamento(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("departamentos").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Reordena as colunas do organograma (drag horizontal) — recebe os ids já na ordem final e regrava `ordem` = índice de cada um. */
export async function reordenarDepartamentos(ids: string[]): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const resultados = await Promise.all(ids.map((id, index) => supabase.from("departamentos").update({ ordem: index }).eq("id", id)));
    const erro = resultados.find((r) => r.error);
    if (erro?.error) return { ok: false, error: erro.error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Cargos
// ----------------------------------------------------------------------------
export interface CargoInput {
  departamentoId: string;
  titulo: string;
  /** null = "Vago". Vínculo com um membro real da equipe tem prioridade sobre nome livre. */
  funcionarioId: string | null;
  /** Nome livre pra freelancer/parceiro externo — só usado quando `funcionarioId` é null. */
  nomeLivre: string | null;
}

export async function criarCargo(input: CargoInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireAdmin();
    if (!input.titulo.trim()) return { ok: false, error: "Informe o título do cargo." };

    const { count } = await supabase
      .from("cargos")
      .select("id", { count: "exact", head: true })
      .eq("departamento_id", input.departamentoId);

    const { data, error } = await supabase
      .from("cargos")
      .insert({
        departamento_id: input.departamentoId,
        titulo: input.titulo.trim(),
        funcionario_id: input.funcionarioId,
        nome_livre: input.funcionarioId ? null : input.nomeLivre?.trim() || null,
        ordem: count ?? 0,
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true, id: data!.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarCargo(id: string, input: CargoInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!input.titulo.trim()) return { ok: false, error: "Informe o título do cargo." };

    const { error } = await supabase
      .from("cargos")
      .update({
        titulo: input.titulo.trim(),
        funcionario_id: input.funcionarioId,
        nome_livre: input.funcionarioId ? null : input.nomeLivre?.trim() || null,
      })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerCargo(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("cargos").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Move um cargo (drag-and-drop) — dentro do mesmo departamento (reordena) ou
 * pra outro departamento (arrasta pra outra coluna). `colunasAfetadas` traz,
 * pra cada departamento que mudou de conteúdo (origem e/ou destino), a lista
 * de ids já na ordem final — regrava `ordem` = índice em cada uma. Mesmo
 * espírito do `moverStatusTarefa` do Kanban de Produção, só que aqui a
 * ORDEM dentro da coluna importa (lá as tarefas não são ordenadas à mão).
 */
export async function moverCargo(
  cargoId: string,
  novoDepartamentoId: string,
  colunasAfetadas: { departamentoId: string; ids: string[] }[]
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error: erroMove } = await supabase.from("cargos").update({ departamento_id: novoDepartamentoId }).eq("id", cargoId);
    if (erroMove) return { ok: false, error: erroMove.message };

    for (const coluna of colunasAfetadas) {
      const resultados = await Promise.all(coluna.ids.map((id, index) => supabase.from("cargos").update({ ordem: index }).eq("id", id)));
      const erro = resultados.find((r) => r.error);
      if (erro?.error) return { ok: false, error: erro.error.message };
    }

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
