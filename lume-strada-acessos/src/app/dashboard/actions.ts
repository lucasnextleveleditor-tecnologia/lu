"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TipoVersaoEntrega } from "@/lib/types/producao";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type SignedUrlResult = { ok: true; url: string } | { ok: false; error: string };

const PATH = "/dashboard";
const BUCKET = "producao";

export interface AprovacaoPendente {
  versaoId: string;
  tarefaId: string;
  tarefaTitulo: string;
  entregaNome: string;
  versao: number;
  tipo: TipoVersaoEntrega;
  nomeArquivo: string;
  linkUrl: string | null;
  temArquivo: boolean;
  tamanhoBytes: number | null;
  criadoEm: string;
}

/**
 * Guarda equivalente a `requireAdmin`/`requireModulo` (`lib/auth/requireAdmin.ts`),
 * só que pro lado do cliente. Devolve também um client Service Role
 * (`createAdminClient`) porque a RLS de Produção (`prod_tarefas`/
 * `prod_entregas`/`prod_entrega_versoes`, ver `supabase/producao.sql`) usa
 * `is_staff()` — só admin/funcionário conseguem ler essas tabelas pela
 * sessão comum, um cliente sempre bateria em zero linhas (não é bug, é a
 * política de sempre desse projeto: acesso de banco grosso, permissão fina
 * na aplicação — ver nota de segurança em `lib/auth/requireAdmin.ts`).
 * TODA função abaixo filtra manualmente por `cliente_id = user.id` ANTES de
 * devolver ou alterar qualquer linha — nunca confia em nenhum id vindo do
 * cliente sem essa checagem.
 */
async function requireCliente() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "cliente") throw new Error("Apenas clientes podem acessar isso.");

  return { user, admin: createAdminClient() };
}

/** Confere que a versão pertence a uma tarefa DESSE cliente antes de deixar aprovar/pedir alteração/baixar — nunca confia no `versaoId` sozinho. */
async function validarDonoDaVersao(
  admin: ReturnType<typeof createAdminClient>,
  versaoId: string,
  userId: string
): Promise<{ ok: true; tarefaId: string; statusAprovacao: string; storagePath: string | null } | { ok: false; error: string }> {
  const { data: versao } = await admin
    .from("prod_entrega_versoes")
    .select("id, entrega_id, status_aprovacao, storage_path")
    .eq("id", versaoId)
    .single();
  if (!versao) return { ok: false, error: "Versão não encontrada." };

  const { data: entrega } = await admin.from("prod_entregas").select("tarefa_id").eq("id", versao.entrega_id).single();
  if (!entrega) return { ok: false, error: "Entrega não encontrada." };

  const { data: tarefa } = await admin.from("prod_tarefas").select("id, cliente_id").eq("id", entrega.tarefa_id).single();
  if (!tarefa || tarefa.cliente_id !== userId) return { ok: false, error: "Você não tem permissão para essa versão." };

  return { ok: true, tarefaId: tarefa.id, statusAprovacao: versao.status_aprovacao, storagePath: versao.storage_path };
}

/** Lista as versões de entrega aguardando aprovação DESSE cliente — únicas linhas que o Dashboard do cliente mostra (ver `src/app/dashboard/page.tsx`). */
export async function listarAprovacoesPendentes(): Promise<AprovacaoPendente[]> {
  const { user, admin } = await requireCliente();

  const { data: tarefas } = await admin.from("prod_tarefas").select("id, titulo").eq("cliente_id", user.id);
  const tarefaIds = (tarefas ?? []).map((t) => t.id);
  if (tarefaIds.length === 0) return [];
  const tituloTarefa = new Map(tarefas!.map((t) => [t.id, t.titulo]));

  const { data: entregas } = await admin.from("prod_entregas").select("id, tarefa_id, nome").in("tarefa_id", tarefaIds);
  const entregaIds = (entregas ?? []).map((e) => e.id);
  if (entregaIds.length === 0) return [];
  const entregaPorId = new Map(entregas!.map((e) => [e.id, e]));

  const { data: versoes } = await admin
    .from("prod_entrega_versoes")
    .select("id, entrega_id, versao, tipo, storage_path, link_url, nome_arquivo, tamanho_bytes, status_aprovacao, created_at")
    .in("entrega_id", entregaIds)
    .eq("status_aprovacao", "pendente")
    .order("created_at", { ascending: false });

  return (versoes ?? []).map((v) => {
    const entrega = entregaPorId.get(v.entrega_id)!;
    return {
      versaoId: v.id as string,
      tarefaId: entrega.tarefa_id as string,
      tarefaTitulo: tituloTarefa.get(entrega.tarefa_id) ?? "Tarefa",
      entregaNome: entrega.nome as string,
      versao: v.versao as number,
      tipo: v.tipo as TipoVersaoEntrega,
      nomeArquivo: v.nome_arquivo as string,
      linkUrl: v.link_url as string | null,
      temArquivo: Boolean(v.storage_path),
      tamanhoBytes: v.tamanho_bytes as number | null,
      criadoEm: v.created_at as string,
    };
  });
}

/** Link de download temporário (1h) — mesma ideia de `getUrlDownload` (Produção/admin), só que recebe o ID da VERSÃO (não o path direto), pra sempre validar posse antes de gerar a URL assinada. */
export async function getUrlDownloadCliente(versaoId: string): Promise<SignedUrlResult> {
  try {
    const { user, admin } = await requireCliente();
    const dono = await validarDonoDaVersao(admin, versaoId, user.id);
    if (!dono.ok) return dono;
    if (!dono.storagePath) return { ok: false, error: "Essa versão não tem arquivo — é um link." };

    const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(dono.storagePath, 60 * 60);
    if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível gerar o link de download." };
    return { ok: true, url: data.signedUrl };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Aprovar — mesma lógica de `aprovarVersao` (Produção/admin): fecha a revisão e marca a tarefa como Concluída. */
export async function aprovarVersaoCliente(versaoId: string): Promise<ActionResult> {
  try {
    const { user, admin } = await requireCliente();
    const dono = await validarDonoDaVersao(admin, versaoId, user.id);
    if (!dono.ok) return dono;
    if (dono.statusAprovacao !== "pendente") return { ok: false, error: "Essa versão já foi revisada." };

    const { error: erroVersao } = await admin
      .from("prod_entrega_versoes")
      .update({ status_aprovacao: "aprovado", aprovado_por: user.id, aprovado_em: new Date().toISOString() })
      .eq("id", versaoId);
    if (erroVersao) return { ok: false, error: erroVersao.message };

    const { error: erroTarefa } = await admin.from("prod_tarefas").update({ status: "concluida" }).eq("id", dono.tarefaId);
    if (erroTarefa) return { ok: false, error: erroTarefa.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Solicitar Alteração — mesma lógica de `solicitarAlteracaoVersao` (Produção/admin): registra o feedback e devolve a tarefa pra produção. */
export async function solicitarAlteracaoVersaoCliente(versaoId: string, observacao: string): Promise<ActionResult> {
  try {
    if (!observacao.trim()) return { ok: false, error: "Descreva o que precisa mudar." };
    const { user, admin } = await requireCliente();
    const dono = await validarDonoDaVersao(admin, versaoId, user.id);
    if (!dono.ok) return dono;
    if (dono.statusAprovacao !== "pendente") return { ok: false, error: "Essa versão já foi revisada." };

    const { error: erroVersao } = await admin
      .from("prod_entrega_versoes")
      .update({
        status_aprovacao: "alteracao_solicitada",
        observacao_aprovacao: observacao.trim(),
        aprovado_por: user.id,
        aprovado_em: new Date().toISOString(),
      })
      .eq("id", versaoId);
    if (erroVersao) return { ok: false, error: erroVersao.message };

    const { error: erroTarefa } = await admin.from("prod_tarefas").update({ status: "em_producao" }).eq("id", dono.tarefaId);
    if (erroTarefa) return { ok: false, error: erroTarefa.message };

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
