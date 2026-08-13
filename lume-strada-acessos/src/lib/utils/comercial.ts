import type { LeadRow, OrigemLead, StatusLead } from "@/lib/types/comercial";
import type { Tone } from "@/lib/utils/tone";

/** Ordem fixa das colunas do funil (Kanban). */
export const STATUS_LEAD_ORDEM: StatusLead[] = [
  "lead_frio",
  "contato_inicial",
  "reuniao_realizada",
  "proposta_enviada",
  "negociacao",
  "fechado_ganha",
  "perdido",
];

export const STATUS_LEAD_META: Record<StatusLead, { label: string; tone: Tone }> = {
  lead_frio: { label: "Lead Frio", tone: "neutral" },
  contato_inicial: { label: "Contato Inicial", tone: "neutral" },
  reuniao_realizada: { label: "Reunião Realizada", tone: "warning" },
  proposta_enviada: { label: "Proposta Enviada", tone: "warning" },
  negociacao: { label: "Negociação", tone: "warning" },
  fechado_ganha: { label: "Fechado (Ganha)", tone: "good" },
  perdido: { label: "Perdido", tone: "critical" },
};

export const ORIGEM_LEAD_META: Record<OrigemLead, { label: string }> = {
  indicacao: { label: "Indicação" },
  trafego_pago: { label: "Tráfego Pago" },
  outbound: { label: "Outbound" },
  outro: { label: "Outro" },
};

/** Um lead conta como "em aberto" (ainda no funil) quando não chegou em Fechado nem Perdido. */
export function leadEstaAberto(lead: Pick<LeadRow, "status">): boolean {
  return lead.status !== "fechado_ganha" && lead.status !== "perdido";
}

export function isFollowUpAtrasado(lead: Pick<LeadRow, "proximo_contato_em" | "status">): boolean {
  if (!lead.proximo_contato_em || !leadEstaAberto(lead)) return false;
  return lead.proximo_contato_em < new Date().toISOString().slice(0, 10);
}
