"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import { addDaysISO, todayISO } from "@/lib/utils/format";
import type { DescontoTipo, PerfilOrcamento, UnidadeServico } from "@/lib/types/orcamentos";

const PATH = "/admin/orcamentos";
// `/admin/orcamentos` é só uma rota-redirect (ver `page.tsx`) — quem realmente
// renderiza a lista/funil de propostas que a pessoa vê no dia a dia é a aba
// "Propostas" do hub unificado, em `/admin/comercial`. Sem revalidar esse
// caminho também, o cache de navegação do Next podia continuar mostrando a
// versão de ANTES da edição até um F5 manual — por isso toda ação que muda
// um orçamento revalida os dois.
const PATH_HUB = "/admin/comercial";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };

// ----------------------------------------------------------------------------
// Categorias
// ----------------------------------------------------------------------------

export async function criarCategoria(input: { nome: string; emoji: string | null }): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome da categoria." };

    const { count } = await supabase.from("orc_categorias").select("id", { count: "exact", head: true });

    const { data, error } = await supabase
      .from("orc_categorias")
      .insert({ nome: input.nome.trim(), emoji: input.emoji, ordem: count ?? 0 })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };

    revalidatePath(`${PATH}/catalogo`);
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarCategoria(id: string, input: { nome: string; emoji: string | null }): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome da categoria." };

    const { error } = await supabase.from("orc_categorias").update({ nome: input.nome.trim(), emoji: input.emoji }).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`${PATH}/catalogo`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Apagar a categoria NÃO apaga os serviços dela — `categoria_id` só vira `null` (ver `on delete set null` na migração), os serviços continuam no catálogo como "Sem categoria". */
export async function removerCategoria(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    const { error } = await supabase.from("orc_categorias").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`${PATH}/catalogo`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Catálogo de serviços
// ----------------------------------------------------------------------------

interface ServicoInput {
  categoriaId: string | null;
  nome: string;
  descricao: string | null;
  valorPadrao: number;
  /** Opcional — 0 quando o usuário não quer cadastrar custo. Só alimenta a Calculadora de Margem, nunca aparece pro cliente. */
  custoPadrao: number;
  unidade: UnidadeServico;
}

export async function criarServico(input: ServicoInput): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do serviço." };

    const { data, error } = await supabase
      .from("orc_servicos")
      .insert({
        categoria_id: input.categoriaId,
        nome: input.nome.trim(),
        descricao: input.descricao?.trim() || null,
        valor_padrao: input.valorPadrao,
        custo_padrao: input.custoPadrao,
        unidade: input.unidade,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };

    revalidatePath(`${PATH}/catalogo`);
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarServico(id: string, input: ServicoInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    if (!input.nome.trim()) return { ok: false, error: "Informe o nome do serviço." };

    const { error } = await supabase
      .from("orc_servicos")
      .update({
        categoria_id: input.categoriaId,
        nome: input.nome.trim(),
        descricao: input.descricao?.trim() || null,
        valor_padrao: input.valorPadrao,
        custo_padrao: input.custoPadrao,
        unidade: input.unidade,
      })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`${PATH}/catalogo`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Esconde do catálogo sem apagar — orçamentos já criados com esse serviço mantêm nome/valor (cópia própria em `orc_itens`, ver comentário na migração). */
export async function alternarAtivoServico(id: string, ativo: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    const { error } = await supabase.from("orc_servicos").update({ ativo }).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`${PATH}/catalogo`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerServico(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    const { error } = await supabase.from("orc_servicos").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`${PATH}/catalogo`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Orçamentos — cabeçalho + itens são salvos JUNTOS numa única ação (o
// formulário do construtor monta a lista inteira de itens em memória antes
// de salvar) — mais simples e mais robusto do que ter uma Server Action por
// item individual, e não perde nada: item de orçamento não tem histórico
// próprio (comentário, anexo) que precisasse sobreviver a uma edição.
// ----------------------------------------------------------------------------

export interface ItemInput {
  servicoId: string | null;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number;
  opcional: boolean;
  /** Só é lido na CRIAÇÃO de um item obrigatório opcional já desmarcado não faz sentido — o form nunca deveria mandar `false` aqui pra um item não-opcional, mas a action reforça isso de qualquer forma. */
  selecionado: boolean;
}

/** Uma linha da tabela "Itens de Entrega" (deliverables) — o quê + prazo, sem preço (ver `orc_itens_entrega`). */
export interface ItemEntregaInput {
  item: string;
  prazo: string | null;
}

/** Uma coluna descritiva de "Investimento" (ex: "Equipe & Equipamento") — título + lista solta de itens, uma por linha (ver `orc_colunas_investimento`). */
export interface ColunaInvestimentoInput {
  titulo: string;
  itens: string | null;
}

export interface OrcamentoHeaderInput {
  titulo: string;
  clienteId: string | null;
  leadId: string | null;
  nomeDestinatario: string;
  emailDestinatario: string | null;
  whatsappDestinatario: string | null;
  validadeDias: number;
  descontoTipo: DescontoTipo | null;
  descontoValor: number;
  condicoesPagamento: string | null;
  observacoes: string | null;
  /** Texto da proposta de trabalho e objetivos específicos deste orçamento (ver `supabase/orcamentos-pdf-institucional.sql`) — exibidos na página de proposta do PDF (`OrcamentoPdfDocument.tsx`). Opcional. */
  textoProposta?: string | null;
  objetivos?: string | null;
  /** Perfil escolhido no construtor (Fase 2) — só rótulo, ver `PerfilOrcamento`. */
  tipoPerfil: PerfilOrcamento | null;
  /** Slug do tipo de serviço dentro do perfil (ver `ModeloContratoServico.tipoServico`, `src/lib/contratos/modelos/`) — opcional, independente do modelo de itens padrão de `orc_tipos_orcamento`. */
  tipoServico: string | null;
  /** Proposta Comercial Web v2 — capa, cor de destaque e resumo do projeto (ver `supabase/orcamentos-proposta-completa.sql`). Todos opcionais/omitidos. */
  corDestaque?: string | null;
  capaPath?: string | null;
  capaSubtitulo?: string | null;
  escalaTextoCapa?: number;
  quantidadeDiarias?: string | null;
  equipeEscalada?: string | null;
}

function normalizarItensEntrega(itens: ItemEntregaInput[]) {
  return itens
    .filter((i) => i.item.trim().length > 0)
    .map((i, index) => ({ item: i.item.trim(), prazo: i.prazo?.trim() || null, ordem: index }));
}

function normalizarColunasInvestimento(colunas: ColunaInvestimentoInput[]) {
  return colunas
    .filter((c) => c.titulo.trim().length > 0)
    .map((c, index) => ({ titulo: c.titulo.trim(), itens: c.itens?.trim() || null, ordem: index }));
}

/** Substitui por completo os Itens de Entrega e as Colunas de Investimento de um orçamento — mesmo princípio de `normalizarItens`/substituição total já usado pra `orc_itens` (nenhuma das duas tabelas carrega histórico próprio que precisasse sobreviver a uma edição). */
async function salvarConteudoPropostaV2(
  supabase: Awaited<ReturnType<typeof requireModulo>>["supabase"],
  orcamentoId: string,
  itensEntrega: ItemEntregaInput[],
  colunasInvestimento: ColunaInvestimentoInput[]
): Promise<ActionResult> {
  const { error: erroLimparEntrega } = await supabase.from("orc_itens_entrega").delete().eq("orcamento_id", orcamentoId);
  if (erroLimparEntrega) return { ok: false, error: erroLimparEntrega.message };

  const entregaNormalizada = normalizarItensEntrega(itensEntrega);
  if (entregaNormalizada.length > 0) {
    const { error } = await supabase.from("orc_itens_entrega").insert(entregaNormalizada.map((i) => ({ ...i, orcamento_id: orcamentoId })));
    if (error) return { ok: false, error: error.message };
  }

  const { error: erroLimparColunas } = await supabase.from("orc_colunas_investimento").delete().eq("orcamento_id", orcamentoId);
  if (erroLimparColunas) return { ok: false, error: erroLimparColunas.message };

  const colunasNormalizadas = normalizarColunasInvestimento(colunasInvestimento);
  if (colunasNormalizadas.length > 0) {
    const { error } = await supabase.from("orc_colunas_investimento").insert(colunasNormalizadas.map((c) => ({ ...c, orcamento_id: orcamentoId })));
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
}

function normalizarItens(itens: ItemInput[]) {
  return itens.map((item, index) => ({
    servico_id: item.servicoId,
    nome: item.nome.trim(),
    descricao: item.descricao?.trim() || null,
    quantidade: item.quantidade > 0 ? item.quantidade : 1,
    valor_unitario: item.valorUnitario,
    opcional: item.opcional,
    // Item obrigatório nunca pode nascer desmarcado — só o opcional herda a escolha do form.
    selecionado: item.opcional ? item.selecionado : true,
    ordem: index,
  }));
}

export async function criarOrcamentoCompleto(
  header: OrcamentoHeaderInput,
  itens: ItemInput[],
  itensEntrega: ItemEntregaInput[] = [],
  colunasInvestimento: ColunaInvestimentoInput[] = []
): Promise<ActionResultId> {
  try {
    const { supabase, user } = await requireModulo("orcamentos");
    if (!header.titulo.trim()) return { ok: false, error: "Informe um título pro orçamento." };
    if (!header.nomeDestinatario.trim()) return { ok: false, error: "Informe o nome do destinatário." };
    if (itens.length === 0) return { ok: false, error: "Adicione pelo menos um item ao orçamento." };

    const { data: orcamento, error: erroOrcamento } = await supabase
      .from("orcamentos")
      .insert({
        titulo: header.titulo.trim(),
        cliente_id: header.clienteId,
        lead_id: header.leadId,
        nome_destinatario: header.nomeDestinatario.trim(),
        email_destinatario: header.emailDestinatario?.trim() || null,
        whatsapp_destinatario: header.whatsappDestinatario?.trim() || null,
        validade_dias: header.validadeDias,
        desconto_tipo: header.descontoTipo,
        desconto_valor: header.descontoValor,
        condicoes_pagamento: header.condicoesPagamento?.trim() || null,
        observacoes: header.observacoes?.trim() || null,
        texto_proposta: header.textoProposta?.trim() || null,
        objetivos: header.objetivos?.trim() || null,
        tipo_perfil: header.tipoPerfil,
        tipo_servico: header.tipoServico,
        cor_destaque: header.corDestaque?.trim() || null,
        capa_path: header.capaPath?.trim() || null,
        capa_subtitulo: header.capaSubtitulo?.trim() || null,
        escala_texto_capa: header.escalaTextoCapa ?? 1,
        quantidade_diarias: header.quantidadeDiarias?.trim() || null,
        equipe_escalada: header.equipeEscalada?.trim() || null,
        criado_por: user.id,
      })
      .select("id")
      .single();
    if (erroOrcamento) return { ok: false, error: erroOrcamento.message };

    const { error: erroItens } = await supabase
      .from("orc_itens")
      .insert(normalizarItens(itens).map((item) => ({ ...item, orcamento_id: orcamento.id })));
    if (erroItens) return { ok: false, error: erroItens.message };

    const resultV2 = await salvarConteudoPropostaV2(supabase, orcamento.id, itensEntrega, colunasInvestimento);
    if (!resultV2.ok) return resultV2;

    revalidatePath(PATH);
    revalidatePath(PATH_HUB);
    return { ok: true, id: orcamento.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function atualizarOrcamentoCompleto(
  id: string,
  header: OrcamentoHeaderInput,
  itens: ItemInput[],
  itensEntrega: ItemEntregaInput[] = [],
  colunasInvestimento: ColunaInvestimentoInput[] = []
): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    if (!header.titulo.trim()) return { ok: false, error: "Informe um título pro orçamento." };
    if (!header.nomeDestinatario.trim()) return { ok: false, error: "Informe o nome do destinatário." };
    if (itens.length === 0) return { ok: false, error: "Adicione pelo menos um item ao orçamento." };

    const { error: erroOrcamento } = await supabase
      .from("orcamentos")
      .update({
        titulo: header.titulo.trim(),
        cliente_id: header.clienteId,
        lead_id: header.leadId,
        nome_destinatario: header.nomeDestinatario.trim(),
        email_destinatario: header.emailDestinatario?.trim() || null,
        whatsapp_destinatario: header.whatsappDestinatario?.trim() || null,
        validade_dias: header.validadeDias,
        desconto_tipo: header.descontoTipo,
        desconto_valor: header.descontoValor,
        condicoes_pagamento: header.condicoesPagamento?.trim() || null,
        observacoes: header.observacoes?.trim() || null,
        texto_proposta: header.textoProposta?.trim() || null,
        objetivos: header.objetivos?.trim() || null,
        tipo_perfil: header.tipoPerfil,
        tipo_servico: header.tipoServico,
        cor_destaque: header.corDestaque?.trim() || null,
        capa_path: header.capaPath?.trim() || null,
        capa_subtitulo: header.capaSubtitulo?.trim() || null,
        escala_texto_capa: header.escalaTextoCapa ?? 1,
        quantidade_diarias: header.quantidadeDiarias?.trim() || null,
        equipe_escalada: header.equipeEscalada?.trim() || null,
      })
      .eq("id", id);
    if (erroOrcamento) return { ok: false, error: erroOrcamento.message };

    // Substitui o conjunto de itens inteiro — mais simples e seguro do que
    // tentar "diffar" quais linhas mudaram/sumiram/apareceram (ver comentário
    // no topo da seção: item de orçamento não carrega histórico próprio).
    const { error: erroLimpar } = await supabase.from("orc_itens").delete().eq("orcamento_id", id);
    if (erroLimpar) return { ok: false, error: erroLimpar.message };

    const { error: erroItens } = await supabase.from("orc_itens").insert(normalizarItens(itens).map((item) => ({ ...item, orcamento_id: id })));
    if (erroItens) return { ok: false, error: erroItens.message };

    const resultV2 = await salvarConteudoPropostaV2(supabase, id, itensEntrega, colunasInvestimento);
    if (!resultV2.ok) return resultV2;

    revalidatePath(PATH);
    revalidatePath(`${PATH}/${id}`);
    revalidatePath(PATH_HUB);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerOrcamento(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");
    const { error } = await supabase.from("orcamentos").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    revalidatePath(PATH_HUB);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Clona cabeçalho + itens como um RASCUNHO novo (token novo, status zerado) — útil pra reaproveitar uma proposta parecida sem montar tudo de novo do zero. */
export async function duplicarOrcamento(id: string): Promise<ActionResultId> {
  try {
    const { supabase, user } = await requireModulo("orcamentos");

    const { data: original, error: erroOriginal } = await supabase.from("orcamentos").select("*").eq("id", id).single();
    if (erroOriginal || !original) return { ok: false, error: erroOriginal?.message ?? "Orçamento não encontrado." };

    const { data: itensOriginais, error: erroItensOriginais } = await supabase.from("orc_itens").select("*").eq("orcamento_id", id).order("ordem");
    if (erroItensOriginais) return { ok: false, error: erroItensOriginais.message };

    const [{ data: entregaOriginal }, { data: colunasOriginais }] = await Promise.all([
      supabase.from("orc_itens_entrega").select("*").eq("orcamento_id", id).order("ordem"),
      supabase.from("orc_colunas_investimento").select("*").eq("orcamento_id", id).order("ordem"),
    ]);

    const { data: copia, error: erroCopia } = await supabase
      .from("orcamentos")
      .insert({
        titulo: `${original.titulo} (cópia)`,
        cliente_id: original.cliente_id,
        lead_id: original.lead_id,
        nome_destinatario: original.nome_destinatario,
        email_destinatario: original.email_destinatario,
        whatsapp_destinatario: original.whatsapp_destinatario,
        validade_dias: original.validade_dias,
        desconto_tipo: original.desconto_tipo,
        desconto_valor: original.desconto_valor,
        condicoes_pagamento: original.condicoes_pagamento,
        observacoes: original.observacoes,
        texto_proposta: original.texto_proposta,
        objetivos: original.objetivos,
        tipo_perfil: original.tipo_perfil,
        cor_destaque: original.cor_destaque,
        capa_path: original.capa_path,
        capa_subtitulo: original.capa_subtitulo,
        escala_texto_capa: original.escala_texto_capa,
        quantidade_diarias: original.quantidade_diarias,
        equipe_escalada: original.equipe_escalada,
        criado_por: user.id,
      })
      .select("id")
      .single();
    if (erroCopia) return { ok: false, error: erroCopia.message };

    if (entregaOriginal && entregaOriginal.length > 0) {
      await supabase.from("orc_itens_entrega").insert(entregaOriginal.map((i) => ({ orcamento_id: copia.id, item: i.item, prazo: i.prazo, ordem: i.ordem })));
    }
    if (colunasOriginais && colunasOriginais.length > 0) {
      await supabase.from("orc_colunas_investimento").insert(colunasOriginais.map((c) => ({ orcamento_id: copia.id, titulo: c.titulo, itens: c.itens, ordem: c.ordem })));
    }

    if (itensOriginais && itensOriginais.length > 0) {
      const { error: erroItens } = await supabase.from("orc_itens").insert(
        itensOriginais.map((item) => ({
          orcamento_id: copia.id,
          servico_id: item.servico_id,
          nome: item.nome,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          // Opcional volta sempre SELECIONADO na cópia — decisão do cliente
          // no orçamento anterior não deveria "vazar" pra uma proposta nova.
          opcional: item.opcional,
          selecionado: true,
          ordem: item.ordem,
        }))
      );
      if (erroItens) return { ok: false, error: erroItens.message };
    }

    revalidatePath(PATH);
    revalidatePath(PATH_HUB);
    return { ok: true, id: copia.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Marca como enviado (ou reenviado) — recalcula a data de expiração a partir de HOJE + `validade_dias`, mesmo se já tinha sido enviado antes. Bloqueado só pra orçamento já `aprovado` (nesse ponto, duplicar é o caminho certo pra propor de novo). */
export async function enviarOrcamento(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");

    const { data: orcamento, error: erroBusca } = await supabase.from("orcamentos").select("status, validade_dias").eq("id", id).single();
    if (erroBusca || !orcamento) return { ok: false, error: erroBusca?.message ?? "Orçamento não encontrado." };
    if (orcamento.status === "aprovado") return { ok: false, error: "Este orçamento já foi aprovado — duplique pra enviar uma nova proposta." };

    const { error } = await supabase
      .from("orcamentos")
      .update({ status: "enviado", enviado_em: new Date().toISOString(), data_expiracao: addDaysISO(todayISO(), orcamento.validade_dias) })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    revalidatePath(`${PATH}/${id}`);
    revalidatePath(PATH_HUB);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Ajuste manual de status pelo admin — cobre o caso "cliente aprovou por telefone/WhatsApp" sem passar pelo link público. */
export async function marcarStatusManual(id: string, status: "rascunho" | "aprovado" | "recusado"): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("orcamentos");

    const patch: Record<string, unknown> = { status };
    if (status === "aprovado") patch.aprovado_em = new Date().toISOString();
    if (status === "recusado") patch.recusado_em = new Date().toISOString();

    const { error } = await supabase.from("orcamentos").update(patch).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(PATH);
    revalidatePath(`${PATH}/${id}`);
    revalidatePath(PATH_HUB);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
