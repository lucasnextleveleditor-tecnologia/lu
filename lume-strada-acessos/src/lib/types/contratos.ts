import type { PerfilOrcamento } from "@/lib/types/orcamentos";

export type StatusContrato = "rascunho" | "enviado" | "visualizado" | "assinado" | "recusado" | "cancelado";

export interface ContratoRow {
  id: string;
  /** Empresa dona do contrato. Precisa estar no tipo porque a assinatura publica roda pela Service Role, sem sessao de onde tirar a empresa. */
  company_id: string;
  /** Orçamento de origem (aprovado), quando o contrato não é avulso — ver comentário na migração. */
  orcamento_id: string | null;
  tipo_perfil: PerfilOrcamento | null;
  /** Slug do tipo de serviço escolhido dentro do perfil (ver `ModeloContratoServico.tipoServico` em `src/lib/contratos/modelos/`) — livre, validado em código de app. Null = sem tipo de serviço específico. */
  tipo_servico: string | null;
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

  /**
   * 'sistema' = gerado e assinado aqui (tem clausulas, itens e token).
   * 'externo' = assinado fora (papel, Clicksign, DocuSign) e anexado na ficha
   * do cliente; so a capa mais o documento em `arquivo_url` ou `arquivo_path`.
   * Ver `supabase/contrato-externo.sql`.
   */
  origem: "sistema" | "externo";
  /** Link do documento assinado fora. */
  arquivo_url: string | null;
  /** Caminho no bucket privado `contratos`. A leitura e sempre por URL assinada gerada no servidor. */
  arquivo_path: string | null;
  /** Data da assinatura feita fora do sistema. Para origem 'sistema' quem vale e `assinado_em`. */
  assinado_fora_em: string | null;

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
