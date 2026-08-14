"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { PrioridadeTarefa, StatusTarefa } from "@/lib/types/producao";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };
export type UploadResult = { ok: true; id: string } | { ok: false; error: string };
export type SignedUrlResult = { ok: true; url: string } | { ok: false; error: string };

const PATH = "/admin/producao";
const BUCKET = "producao";
const TAMANHO_MAX_BYTES = 50 * 1024 * 1024; // 50MB — arquivos de produção (vídeo/imagem) são maiores que os de branding

// ----------------------------------------------------------------------------
// Funcionários (Responsável) & Tipos de Serviço — cadastros de apoio.
// ----------------------------------------------------------------------------
export async function criarFuncionario(nome: string): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("producao");
    if (!nome.trim()) return { ok: false, error: "Informe o nome do funcionário." };
    const { data, error } = await supabase.from("prod_funcionarios").insert({ nome: nome.trim() }).select("id").single();
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true, id: data!.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerFuncionario(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");
    const { error } = await supabase.from("prod_funcionarios").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function criarTipoServico(nome: string): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("producao");
    if (!nome.trim()) return { ok: false, error: "Informe o nome do tipo de serviço." };
    const { data, error } = await supabase.from("prod_tipos_servico").insert({ nome: nome.trim() }).select("id").single();
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true, id: data!.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerTipoServico(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");
    const { error } = await supabase.from("prod_tipos_servico").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Tarefas
// ----------------------------------------------------------------------------
export interface TarefaInput {
  titulo: string;
  briefing: string | null;
  clienteId: string | null;
  responsavelId: string | null;
  tipoServicoId: string | null;
  prioridade: PrioridadeTarefa;
  dataCaptacao: string | null;
  dataEntrega: string | null;
}

export async function criarTarefa(input: TarefaInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("producao");
    if (!input.titulo.trim()) return { ok: false, error: "Informe o título da tarefa." };

    const { data, error } = await supabase
      .from("prod_tarefas")
      .insert({
        titulo: input.titulo.trim(),
        briefing: input.briefing?.trim() || null,
        cliente_id: input.clienteId,
        responsavel_id: input.responsavelId,
        tipo_servico_id: input.tipoServicoId,
        prioridade: input.prioridade,
        data_captacao: input.dataCaptacao || null,
        data_entrega: input.dataEntrega || null,
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

export async function atualizarTarefa(id: string, input: TarefaInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");
    if (!input.titulo.trim()) return { ok: false, error: "Informe o título da tarefa." };

    const { error } = await supabase
      .from("prod_tarefas")
      .update({
        titulo: input.titulo.trim(),
        briefing: input.briefing?.trim() || null,
        cliente_id: input.clienteId,
        responsavel_id: input.responsavelId,
        tipo_servico_id: input.tipoServicoId,
        prioridade: input.prioridade,
        data_captacao: input.dataCaptacao || null,
        data_entrega: input.dataEntrega || null,
      })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Move o card entre colunas — usado pelo drag-and-drop do Kanban e pelo seletor de status no detalhe. */
export async function moverStatusTarefa(id: string, status: StatusTarefa): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");
    const { error } = await supabase.from("prod_tarefas").update({ status }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerTarefa(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");
    const { error } = await supabase.from("prod_tarefas").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Subtarefas
// ----------------------------------------------------------------------------
export async function criarSubtarefa(tarefaId: string, titulo: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");
    if (!titulo.trim()) return { ok: false, error: "Informe o título da subtarefa." };
    const { error } = await supabase.from("prod_subtarefas").insert({ tarefa_id: tarefaId, titulo: titulo.trim() });
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function toggleSubtarefa(id: string, concluida: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");
    const { error } = await supabase.from("prod_subtarefas").update({ concluida }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerSubtarefa(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");
    const { error } = await supabase.from("prod_subtarefas").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Entregas & Versões — controle de revisão (V1/V2...) + fluxo de aprovação.
// ----------------------------------------------------------------------------
export async function criarEntrega(tarefaId: string, nome: string): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("producao");
    if (!nome.trim()) return { ok: false, error: "Informe o nome da entrega." };
    const { data, error } = await supabase
      .from("prod_entregas")
      .insert({ tarefa_id: tarefaId, nome: nome.trim() })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true, id: data!.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerEntrega(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");
    // Apaga só o metadado (a linha e as versões, em cascata). Os arquivos em
    // si ficam no bucket — mesma decisão já tomada em `removerBrandingAsset`
    // (limpeza do Storage fica manual, pelo painel do Supabase, se precisar).
    const { error } = await supabase.from("prod_entregas").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

async function proximaVersaoDe(supabase: Awaited<ReturnType<typeof requireModulo>>["supabase"], entregaId: string): Promise<number> {
  const { data } = await supabase
    .from("prod_entrega_versoes")
    .select("versao")
    .eq("entrega_id", entregaId)
    .order("versao", { ascending: false })
    .limit(1);
  return ((data?.[0]?.versao as number | undefined) ?? 0) + 1;
}

/** Envia uma NOVA VERSÃO (arquivo) pra uma entrega — nunca sobrescreve, sempre soma +1. Coloca a tarefa em "Preview Cliente". */
export async function enviarVersaoArquivo(tarefaId: string, entregaId: string, formData: FormData): Promise<UploadResult> {
  try {
    const { supabase, user } = await requireModulo("producao");
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Selecione um arquivo." };
    if (file.size > TAMANHO_MAX_BYTES) return { ok: false, error: "Arquivo muito grande (máximo 50MB)." };

    const proximaVersao = await proximaVersaoDe(supabase, entregaId);
    const extensao = file.name.includes(".") ? file.name.split(".").pop() : null;
    const caminho = `${entregaId}/v${proximaVersao}-${Date.now()}${extensao ? `.${extensao}` : ""}`;

    const { error: erroUpload } = await supabase.storage.from(BUCKET).upload(caminho, file, {
      contentType: file.type || undefined,
    });
    if (erroUpload) return { ok: false, error: erroUpload.message };

    const { data, error } = await supabase
      .from("prod_entrega_versoes")
      .insert({
        entrega_id: entregaId,
        versao: proximaVersao,
        tipo: "arquivo",
        storage_path: caminho,
        nome_arquivo: file.name,
        tamanho_bytes: file.size,
        tipo_mime: file.type || null,
        enviado_por: user.id,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };

    await supabase.from("prod_tarefas").update({ status: "preview_cliente" }).eq("id", tarefaId);
    revalidatePath(PATH);
    return { ok: true, id: data!.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Mesma lógica de `enviarVersaoArquivo`, mas pra um LINK externo (Vimeo/Drive/Frame.io) em vez de upload. */
export async function enviarVersaoLink(
  tarefaId: string,
  entregaId: string,
  input: { url: string; rotulo: string }
): Promise<UploadResult> {
  try {
    const { supabase, user } = await requireModulo("producao");
    if (!input.url.trim()) return { ok: false, error: "Informe o link." };
    try {
      new URL(input.url.trim());
    } catch {
      return { ok: false, error: "Link inválido — inclua o https://" };
    }

    const proximaVersao = await proximaVersaoDe(supabase, entregaId);

    const { data, error } = await supabase
      .from("prod_entrega_versoes")
      .insert({
        entrega_id: entregaId,
        versao: proximaVersao,
        tipo: "link",
        link_url: input.url.trim(),
        nome_arquivo: input.rotulo.trim() || "Link externo",
        enviado_por: user.id,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };

    await supabase.from("prod_tarefas").update({ status: "preview_cliente" }).eq("id", tarefaId);
    revalidatePath(PATH);
    return { ok: true, id: data!.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Aprovar — fecha a revisão dessa versão e marca a tarefa inteira como Concluída. */
export async function aprovarVersao(tarefaId: string, versaoId: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireModulo("producao");
    const { error: erroVersao } = await supabase
      .from("prod_entrega_versoes")
      .update({ status_aprovacao: "aprovado", aprovado_por: user.id, aprovado_em: new Date().toISOString() })
      .eq("id", versaoId);
    if (erroVersao) return { ok: false, error: erroVersao.message };

    const { error: erroTarefa } = await supabase.from("prod_tarefas").update({ status: "concluida" }).eq("id", tarefaId);
    if (erroTarefa) return { ok: false, error: erroTarefa.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Solicitar Alteração — registra o feedback na versão e devolve a tarefa pra produção; o próximo envio já nasce V+1. */
export async function solicitarAlteracaoVersao(tarefaId: string, versaoId: string, observacao: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireModulo("producao");
    if (!observacao.trim()) return { ok: false, error: "Descreva o que precisa mudar." };

    const { error: erroVersao } = await supabase
      .from("prod_entrega_versoes")
      .update({
        status_aprovacao: "alteracao_solicitada",
        observacao_aprovacao: observacao.trim(),
        aprovado_por: user.id,
        aprovado_em: new Date().toISOString(),
      })
      .eq("id", versaoId);
    if (erroVersao) return { ok: false, error: erroVersao.message };

    const { error: erroTarefa } = await supabase.from("prod_tarefas").update({ status: "em_producao" }).eq("id", tarefaId);
    if (erroTarefa) return { ok: false, error: erroTarefa.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Link de download temporário (1h) — o bucket `producao` é privado, nunca tem URL pública fixa. */
export async function getUrlDownload(storagePath: string): Promise<SignedUrlResult> {
  try {
    const { supabase } = await requireModulo("producao");
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60);
    if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível gerar o link de download." };
    return { ok: true, url: data.signedUrl };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
