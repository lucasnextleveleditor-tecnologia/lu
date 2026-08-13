export type OrigemLead = "indicacao" | "trafego_pago" | "outbound" | "outro";
export type StatusLead =
  | "lead_frio"
  | "contato_inicial"
  | "reuniao_realizada"
  | "proposta_enviada"
  | "negociacao"
  | "fechado_ganha"
  | "perdido";

export interface LeadRow {
  id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  origem: OrigemLead | null;
  tipo_servico_id: string | null;
  valor_estimado: number | null;
  data_prevista_fechamento: string | null; // ISO date
  contrato_assinado: boolean;
  status: StatusLead;
  proximo_contato_em: string | null; // ISO date
  cliente_id: string | null;
  convertido_em: string | null;
  created_at: string;
  updated_at: string;
}

/** Lead enriquecido com o nome do serviço de interesse (join em memória com `prod_tipos_servico`). */
export type LeadComRelacoes = LeadRow & { tipo_servico_nome: string | null };

export interface AnotacaoRow {
  id: string;
  lead_id: string;
  nota: string;
  proximo_contato_em: string | null;
  criado_por: string | null;
  created_at: string;
}
