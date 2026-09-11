"use server";

import { revalidatePath } from "next/cache";
import { registrarDoCliente } from "@/lib/eventos/registrar";
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
  /** O texto que vai junto com a peça, escrito no envio. */
  legenda: string | null;
  /** Decide COMO desenhar o preview de um arquivo: vídeo, imagem ou PDF. */
  tipoMime: string | null;
  /**
   * URL assinada (1h) do arquivo no Storage, gerada JÁ na listagem.
   *
   * Antes o cliente clicava e o navegador abria outra aba — que é
   * exatamente o que tirava ele da plataforma. Para o vídeo tocar aqui
   * dentro, a URL precisa existir no primeiro render, e não depois de um
   * clique. O bucket continua privado: isto é um link temporário, não uma
   * URL pública.
   */
  urlArquivo: string | null;
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

  // `em_pauta` de fora, e aqui isso é o mais delicado da lista: este é o
  // PORTAL DO CLIENTE. Uma pauta que ainda está sendo pensada não pode
  // aparecer para ele antes de a agência decidir mostrar.
  const { data: tarefas } = await admin
    .from("prod_tarefas")
    .select("id, titulo")
    .eq("cliente_id", user.id)
    .eq("em_pauta", false);
  const tarefaIds = (tarefas ?? []).map((t) => t.id);
  if (tarefaIds.length === 0) return [];
  const tituloTarefa = new Map(tarefas!.map((t) => [t.id, t.titulo]));

  const { data: entregas } = await admin.from("prod_entregas").select("id, tarefa_id, nome").in("tarefa_id", tarefaIds);
  const entregaIds = (entregas ?? []).map((e) => e.id);
  if (entregaIds.length === 0) return [];
  const entregaPorId = new Map(entregas!.map((e) => [e.id, e]));

  const { data: versoes } = await admin
    .from("prod_entrega_versoes")
    .select(
      "id, entrega_id, versao, tipo, storage_path, link_url, nome_arquivo, tamanho_bytes, tipo_mime, legenda, status_aprovacao, created_at"
    )
    .in("entrega_id", entregaIds)
    .eq("status_aprovacao", "pendente")
    .order("created_at", { ascending: false });

  // As URLs assinadas saem TODAS DE UMA VEZ, e não uma por linha em série:
  // são chamadas de rede, e uma lista de dez entregas viraria dez idas
  // encadeadas ao Storage antes de a página aparecer.
  const caminhos = (versoes ?? []).map((v) => v.storage_path as string | null).filter(Boolean) as string[];
  const urlPorCaminho = new Map<string, string>();
  if (caminhos.length > 0) {
    const { data: assinadas } = await admin.storage.from(BUCKET).createSignedUrls(caminhos, 60 * 60);
    for (const a of assinadas ?? []) {
      if (a.path && a.signedUrl) urlPorCaminho.set(a.path, a.signedUrl);
    }
  }

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
      legenda: (v.legenda as string | null) ?? null,
      tipoMime: (v.tipo_mime as string | null) ?? null,
      urlArquivo: v.storage_path ? (urlPorCaminho.get(v.storage_path as string) ?? null) : null,
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

/**
 * Registra na trilha um passo dado pelo PRÓPRIO CLIENTE, do portal.
 *
 * Tudo aqui roda com Service Role e sem `auth.uid()` da equipe, então três
 * coisas precisam ser resolvidas à mão: a empresa (o default da tabela
 * devolveria nulo), o cliente do cadastro (é a linha do tempo dele) e o nome
 * de quem aprovou — que vem de `clientes.nome`, porque no portal não há um
 * perfil de funcionário para consultar.
 *
 * A distinção importa mais aqui do que em qualquer outro lugar da trilha:
 * "aprovado pelo cliente" e "aprovado pela agência" são fatos diferentes, e
 * é o `ator_tipo` que os separa.
 */
async function registrarDoPortal(
  admin: ReturnType<typeof createAdminClient>,
  _userId: string,
  tarefaId: string,
  evento: Omit<Parameters<typeof registrarDoCliente>[3], "clienteId" | "titulo" | "tarefaId">
): Promise<void> {
  const { data: tarefa } = await admin
    .from("prod_tarefas")
    .select("titulo, company_id, cliente_cadastro_id")
    .eq("id", tarefaId)
    .maybeSingle<{ titulo: string; company_id: string; cliente_cadastro_id: string | null }>();
  if (!tarefa) return;

  const { data: cliente } = tarefa.cliente_cadastro_id
    ? await admin.from("clientes").select("nome").eq("id", tarefa.cliente_cadastro_id).maybeSingle<{ nome: string }>()
    : { data: null };

  await registrarDoCliente(admin, tarefa.company_id, cliente?.nome ?? null, {
    ...evento,
    tarefaId,
    clienteId: tarefa.cliente_cadastro_id,
    titulo: tarefa.titulo,
  });
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

    await registrarDoPortal(admin, user.id, dono.tarefaId, {
      acao: "versao_aprovada",
      entidade: "versao",
      entidadeId: versaoId,
      para: "concluida",
    });

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

    await registrarDoPortal(admin, user.id, dono.tarefaId, {
      acao: "versao_alteracao_solicitada",
      entidade: "versao",
      entidadeId: versaoId,
      para: "em_producao",
      detalhe: { observacao: observacao.trim().slice(0, 300) },
    });

    revalidatePath(PATH);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
