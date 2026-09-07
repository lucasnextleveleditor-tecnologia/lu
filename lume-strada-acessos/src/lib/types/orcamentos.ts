export type OrcCategoriaRow = {
  id: string;
  nome: string;
  emoji: string | null;
  ordem: number;
  created_at: string;
};

export type UnidadeServico = "unico" | "hora" | "dia" | "mes" | "pacote";

export interface OrcServicoRow {
  id: string;
  categoria_id: string | null;
  nome: string;
  descricao: string | null;
  valor_padrao: number;
  unidade: UnidadeServico;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

/** Serviço do catálogo enriquecido com o nome da categoria (join em memória). */
export type ServicoComCategoria = OrcServicoRow & { categoria_nome: string | null };

export type StatusOrcamento = "rascunho" | "enviado" | "visualizado" | "aprovado" | "recusado" | "expirado";
export type DescontoTipo = "percentual" | "fixo";

export interface OrcamentoRow {
  id: string;
  titulo: string;
  cliente_id: string | null;
  lead_id: string | null;
  nome_destinatario: string;
  email_destinatario: string | null;
  whatsapp_destinatario: string | null;
  status: StatusOrcamento;
  validade_dias: number;
  data_expiracao: string | null; // ISO date
  desconto_tipo: DescontoTipo | null;
  desconto_valor: number;
  condicoes_pagamento: string | null;
  observacoes: string | null;
  token: string;
  enviado_em: string | null;
  visualizado_em: string | null;
  visualizacoes_count: number;
  aprovado_em: string | null;
  aprovado_por_nome: string | null;
  recusado_em: string | null;
  motivo_recusa: string | null;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrcItemRow {
  id: string;
  orcamento_id: string;
  servico_id: string | null;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valor_unitario: number;
  opcional: boolean;
  selecionado: boolean;
  ordem: number;
  created_at: string;
}

export type OrcamentoComRelacoes = OrcamentoRow & { cliente_nome: string | null; itens: OrcItemRow[] };

/**
 * Total de um orçamento — soma só os itens SELECIONADOS (obrigatórios
 * sempre entram; opcionais só se `selecionado = true`, é o mecanismo de
 * "personalização" do cliente no link público) e aplica o desconto por
 * cima. Mesma função usada no painel admin (preview) E na página pública
 * (recálculo ao vivo quando o cliente marca/desmarca um item) — um único
 * lugar de verdade pro cálculo, nunca duplicado entre servidor/cliente.
 */
export function calcularTotalOrcamento(
  itens: Pick<OrcItemRow, "quantidade" | "valor_unitario" | "opcional" | "selecionado">[],
  descontoTipo: DescontoTipo | null,
  descontoValor: number
): { subtotal: number; desconto: number; total: number } {
  const subtotal = itens.filter((i) => !i.opcional || i.selecionado).reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
  const desconto = !descontoTipo ? 0 : descontoTipo === "percentual" ? subtotal * (descontoValor / 100) : Math.min(descontoValor, subtotal);
  return { subtotal, desconto, total: Math.max(0, subtotal - desconto) };
}

export function calcularStatusExibicao(o: Pick<OrcamentoRow, "status" | "data_expiracao">): StatusOrcamento {
  const jaDecidido = o.status === "aprovado" || o.status === "recusado";
  if (jaDecidido || o.status === "rascunho") return o.status;
  const hoje = new Date().toISOString().slice(0, 10);
  if (o.data_expiracao && o.data_expiracao < hoje) return "expirado";
  return o.status;
}
