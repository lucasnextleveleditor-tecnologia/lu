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
  totalCliques: number;
  totalVisualizacoes: number;
  totalLeads: number;
  totalVendas: number;
  /** Investido só nos lançamentos DO TIPO leads/vendas — base pro custo por resultado (não é o mesmo que `totalInvestido`, que soma os dois tipos juntos). */
  investidoEmLeads: number;
  investidoEmVendas: number;
  /** null quando ainda não há nenhum lead lançado — não dá pra dividir por zero. */
  custoPorLead: number | null;
  /** null quando ainda não há nenhuma venda lançada. */
  custoPorVenda: number | null;
  /** null quando não há meta de investimento definida (>0) pra esse dia — não dá pra calcular % */
  pctInvestido: number | null;
  status: StatusTrafego;
}

export type RegistroParaSoma = Pick
  TrafegoRegistroRow,
  "valor_investido" | "tipo_resultado" | "quantidade_resultado" | "cliques" | "visualizacoes"
>;

export function somarRegistros(registros: RegistroParaSoma[]) {
  return registros.reduce(
    (acc, r) => {
      const investido = Number(r.valor_investido);
      const quantidade = Number(r.quantidade_resultado);
      const ehVenda = r.tipo_resultado === "vendas";
      return {
        totalInvestido: acc.totalInvestido + investido,
        totalCliques: acc.totalCliques + Number(r.cliques),
        totalVisualizacoes: acc.totalVisualizacoes + Number(r.visualizacoes),
        totalLeads: acc.totalLeads + (ehVenda ? 0 : quantidade),
        totalVendas: acc.totalVendas + (ehVenda ? quantidade : 0),
        investidoEmLeads: acc.investidoEmLeads + (ehVenda ? 0 : investido),
        investidoEmVendas: acc.investidoEmVendas + (ehVenda ? investido : 0),
      };
    },
    {
      totalInvestido: 0,
      totalCliques: 0,
      totalVisualizacoes: 0,
      totalLeads: 0,
      totalVendas: 0,
      investidoEmLeads: 0,
      investidoEmVendas: 0,
    }
  );
}

/** Deriva status/percentual/custo por resultado a partir da meta + registros do dia — nunca gravado, sempre calculado. */
export function calcularResumoTrafego(
  meta: Pick<MetaDiariaRow, "valor_investido_meta"> | null | undefined,
  registros: RegistroParaSoma[]
): ResumoTrafego {
  const somas = somarRegistros(registros);
  // Custo por resultado é o investido DENTRO DAQUELE TIPO dividido pela
  // quantidade daquele tipo — não o investido total, que misturaria o custo
  // de campanhas de lead com o de campanhas de venda.
  const custoPorLead = somas.totalLeads > 0 ? somas.investidoEmLeads / somas.totalLeads : null;
  const custoPorVenda = somas.totalVendas > 0 ? somas.investidoEmVendas / somas.totalVendas : null;

  if (!meta || meta.valor_investido_meta <= 0) {
    return { ...somas, custoPorLead, custoPorVenda, pctInvestido: null, status: "sem_meta" };
  }

  const pctInvestido = somas.totalInvestido / meta.valor_investido_meta;
  const status: StatusTrafego =
    pctInvestido >= LIMIAR_META_BATIDA ? "meta_batida" : pctInvestido >= LIMIAR_NO_CAMINHO ? "no_caminho" : "abaixo_da_meta";

  return { ...somas, custoPorLead, custoPorVenda, pctInvestido, status };
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
