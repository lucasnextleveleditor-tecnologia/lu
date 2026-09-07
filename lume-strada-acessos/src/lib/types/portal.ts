import type { StatusOrcamento, OrcamentoRow, PortfolioItemComUrl } from "@/lib/types/orcamentos";
import type { StatusContrato, ContratoRow } from "@/lib/types/contratos";

/**
 * Fase 4 — Portal do Cliente ("Link do cliente estendido"). Um único link
 * fixo por cliente (`clientes.portal_token`, ver `supabase/portal.sql`) que
 * agrega tudo que já existe de público pra ele: orçamentos, contratos,
 * portfólio já usado e uma linha do tempo — sem tabela nova de log, montada
 * em cima dos timestamps que `orcamentos`/`contratos` já guardam.
 */

export type OrigemTimelinePortal = "orcamento" | "contrato";

/** Só os marcos que fazem sentido pro CLIENTE ver — "criado" fica de fora (é ruído interno, o cliente não mandou nada ainda nesse momento). */
export type EventoTimelinePortal = "enviado" | "visualizado" | "aprovado" | "assinado" | "recusado";

export interface TimelineEventoPortal {
  origem: OrigemTimelinePortal;
  evento: EventoTimelinePortal;
  data: string; // ISO timestamp
  titulo: string;
  token: string;
}

export interface PortalClienteData {
  cliente: {
    nome: string;
    email: string | null;
  };
  empresaNome: string | null;
  orcamentos: (OrcamentoRow & { statusExibicao: StatusOrcamento; total: number })[];
  contratos: (ContratoRow & { total: number })[];
  portfolio: PortfolioItemComUrl[];
  timeline: TimelineEventoPortal[];
}
