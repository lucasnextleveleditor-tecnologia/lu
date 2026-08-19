import type { MetaDiariaRow, TrafegoRegistroRow } from "@/lib/types/database";
import type { Tone } from "@/lib/utils/tone";

export type StatusTrafego = "sem_meta" | "abaixo_da_meta" | "no_caminho" | "meta_batida";

// Limiares do andamento em relação à META DE INVESTIMENTO do dia — critério
// PRIMÁRIO de status (leads é mostrado como métrica secundária no card, mas
// não entra nesta conta, porque nem todo cliente define meta de leads).
// Ajustar aqui recalibra o painel inteiro sem tocar em nenhuma tela.
const LIMIAR_NO_CAMINHO = 0.6; // >=60% do investimento-meta já lançado -> "No Caminho"
const LIMIAR_META_BATIDA = 1.0; // >=100% -> "Meta Batida"

export interface ResumoTrafego {
  totalInvestido: number;
  totalLeads: number;
  /** null quando não há meta de investimento definida (>0) pra esse dia — não dá pra calcular % */
  pctInvestido: number | null;
  status: StatusTrafego;
}

export function somarRegistros(registros: Pick<TrafegoRegistroRow, "valor_investido" | "leads_gerados">[]) {
  return registros.reduce(
    (acc, r) => ({
      totalInvestido: acc.totalInvestido + Number(r.valor_investido),
      totalLeads: acc.totalLeads + Number(r.leads_gerados),
    }),
    { totalInvestido: 0, totalLeads: 0 }
  );
}

/** Deriva status/percentual a partir da meta + registros do dia — nunca gravado, sempre calculado. */
export function calcularResumoTrafego(
  meta: Pick<MetaDiariaRow, "valor_investido_meta"> | null | undefined,
  registros: Pick<TrafegoRegistroRow, "valor_investido" | "leads_gerados">[]
): ResumoTrafego {
  const { totalInvestido, totalLeads } = somarRegistros(registros);

  if (!meta || meta.valor_investido_meta <= 0) {
    return { totalInvestido, totalLeads, pctInvestido: null, status: "sem_meta" };
  }

  const pctInvestido = totalInvestido / meta.valor_investido_meta;
  const status: StatusTrafego =
    pctInvestido >= LIMIAR_META_BATIDA ? "meta_batida" : pctInvestido >= LIMIAR_NO_CAMINHO ? "no_caminho" : "abaixo_da_meta";

  return { totalInvestido, totalLeads, pctInvestido, status };
}

// "No Caminho" e "Meta Batida" dividem o mesmo tone (good) — o que os
// distingue não é a cor, é o rótulo (e o ícone no card): a regra da paleta
// de status é "nunca só cor", e aqui os dois estados são igualmente
// positivos, só num estágio diferente do dia.
export const STATUS_TRAFEGO_META: Record<StatusTrafego, { label: string; tone: Tone }> = {
  sem_meta: { label: "Sem Meta Definida", tone: "neutral" },
  abaixo_da_meta: { label: "Abaixo da Meta", tone: "warning" },
  no_caminho: { label: "No Caminho", tone: "good" },
  meta_batida: { label: "Meta Batida", tone: "good" },
};
