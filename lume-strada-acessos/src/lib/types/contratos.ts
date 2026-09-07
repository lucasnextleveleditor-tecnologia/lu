import type { PerfilOrcamento } from "@/lib/types/orcamentos";

export type StatusContrato = "rascunho" | "enviado" | "visualizado" | "assinado" | "recusado" | "cancelado";

export interface ContratoRow {
  id: string;
  /** Orçamento de origem (aprovado), quando o contrato não é avulso — ver comentário na migração. */
  orcamento_id: string | null;
  tipo_perfil: PerfilOrcamento | null;
  titulo: string;
  cliente_id: string | null;
  nome_cliente: string;
  email_cliente: string | null;
  whatsapp_cliente: string | null;
  /** Texto final (cabeçalho + cláusulas), já com os placeholders do modelo substituídos — cópia própria do contrato. */
  clausulas: string;
  condicoes_pagamento: string | null;
  observacoes: string | null;
  status: StatusContrato;
  token: string;
  enviado_em: string | null;
  visualizado_em: string | null;
  assinado_em: string | null;
  assinado_nome: string | null;
  assinado_ip: string | null;
  recusado_em: string | null;
  motivo_recusa: string | null;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContratoItemRow {
  id: string;
  contrato_id: string;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valor_unitario: number;
  ordem: number;
  created_at: string;
}

export type ContratoComRelacoes = ContratoRow & { cliente_nome: string | null; orcamento_titulo: string | null; itens: ContratoItemRow[] };

/** Mesmo cálculo de `calcularTotalOrcamento`, mas sem desconto/opcional — o valor do contrato é sempre a soma cheia dos itens que ele lista. */
export function calcularTotalContrato(itens: Pick<ContratoItemRow, "quantidade" | "valor_unitario">[]): number {
  return itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
}

// ----------------------------------------------------------------------------
// Modelo de cláusulas por perfil profissional (ver `supabase/contratos.sql`)
// ----------------------------------------------------------------------------
export interface ContratoTipoRow {
  id: string;
  perfil: PerfilOrcamento;
  clausulas_padrao: string;
  condicoes_pagamento_padrao: string | null;
  created_at: string;
  updated_at: string;
}
