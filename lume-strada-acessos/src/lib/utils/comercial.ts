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
  whatsapp: { label: "WhatsApp" }, // origem automática, criada pelo botão "Adicionar ao CRM" do Inbox
};

/** Um lead conta como "em aberto" (ainda no funil) quando não chegou em Fechado nem Perdido. */
export function leadEstaAberto(lead: Pick<LeadRow, "status">): boolean {
  return lead.status !== "fechado_ganha" && lead.status !== "perdido";
}

export function isFollowUpAtrasado(lead: Pick<LeadRow, "proximo_contato_em" | "status">): boolean {
  if (!lead.proximo_contato_em || !leadEstaAberto(lead)) return false;
  return lead.proximo_contato_em < new Date().toISOString().slice(0, 10);
}

// ----------------------------------------------------------------------------
// Cadência de follow-up — sugere sozinha a data do próximo contato toda vez
// que uma anotação é registrada (1ª sem resposta, reunião remarcada,
// proposta parada... é sempre a mesma anotação, só muda o texto), em vez de
// depender do admin lembrar de calcular/digitar a data toda vez.
//
// Padrão comum de prospecção: toques próximos logo no início (não deixar
// passar mais de uma semana sem cobrar nos primeiros contatos) e espaçando
// aos poucos até estabilizar num check-in semanal contínuo enquanto o lead
// não responde/fecha — nunca "esquece" o lead, mas também não pressiona
// tanto a ponto de incomodar.
// ----------------------------------------------------------------------------
export const CADENCIA_FOLLOWUP_DIAS = [2, 3, 5, 7];

/**
 * Data sugerida pro próximo follow-up. `anotacoesAnteriores` é quantas
 * anotações esse lead já tem ANTES da que está sendo registrada agora (0 =
 * é a primeira) — do último valor da cadência em diante, repete sempre o
 * último (nunca deixa passar mais que isso entre um contato e outro).
 */
export function sugerirProximoContato(anotacoesAnteriores: number, hoje: Date = new Date()): string {
  const indice = Math.min(anotacoesAnteriores, CADENCIA_FOLLOWUP_DIAS.length - 1);
  const dias = CADENCIA_FOLLOWUP_DIAS[indice] ?? CADENCIA_FOLLOWUP_DIAS[CADENCIA_FOLLOWUP_DIAS.length - 1]!;
  const data = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() + dias));
  return data.toISOString().slice(0, 10);
}
