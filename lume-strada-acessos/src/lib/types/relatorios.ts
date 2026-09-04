import type { StatusLead } from "@/lib/types/comercial";

// ============================================================================
// Tipos do Hub de Relatórios (`/admin/relatorios`) — cada `Relatorio*Data` é
// o formato JÁ AGREGADO que a Server Action de cada módulo devolve pro
// client (nunca a linha crua da tabela: a agregação por data/categoria/
// funcionário acontece toda no servidor, o client só desenha o gráfico).
// ============================================================================

export interface RelatorioFinanceiroData {
  serieDiaria: { data: string; receitas: number; despesas: number }[];
  porCategoria: { nome: string; valor: number; cor: string; emoji: string | null }[];
  totalReceitas: number;
  totalDespesas: number;
  resultado: number; // DRE simplificado: totalReceitas - totalDespesas
  qtdTransacoes: number;
}

export interface RelatorioComercialData {
  funil: { status: StatusLead; label: string; total: number }[];
  totalLeadsNoPeriodo: number;
  fechados: number;
  perdidos: number;
  taxaConversao: number | null; // fechados / (fechados + perdidos), no período
  tempoMedioFechamentoDias: number | null; // média de (convertido_em - created_at) dos leads fechados no período
  valorFechadoNoPeriodo: number;
}

export interface RelatorioProducaoData {
  produtividade: { funcionarioId: string; nome: string; concluidas: number }[];
  tarefasCriadasNoPeriodo: number;
  tarefasConcluidasNoPeriodo: number;
  tarefasAtrasadas: number; // sempre "agora" (gargalo é estado atual, não do período — ver comentário na action)
  tempoMedioConclusaoDias: number | null;
}

export interface RelatorioTrafegoData {
  serieDiaria: { data: string; investimento: number; receitaBruta: number }[];
  totalInvestimento: number;
  totalReceitaBruta: number;
  roas: number | null; // receita / investimento
  roi: number | null; // (receita - investimento) / investimento
  totalReembolsos: number;
  lucroLiquido: number; // receita - investimento - reembolsos
  fechamentosNoPeriodo: { semanaInicio: string; semanaFim: string; lucroLiquidoReal: number; reembolsos: number }[];
  investimentoPorCliente: { clienteId: string; nome: string; investido: number; leads: number }[];
}

export interface RelatorioInventarioData {
  totalInvestido: number;
  patrimonioAtual: number;
  depreciacaoTotal: number;
  percentualMedio: number;
  itensConsiderados: number;
  distribuicao: { categoriaNome: string; valorAtual: number }[];
}
