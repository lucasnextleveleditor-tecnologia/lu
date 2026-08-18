/**
 * Hub de Relatórios (`/admin/relatorios`) — página, abas do hub e os 5
 * relatórios (Comercial, Financeiro, Produção, Tráfego, Inventário):
 * cabeçalhos, StatTiles, títulos de gráfico, rótulos de tooltip/legenda e
 * colunas de exportação CSV. Strings realmente genéricas (ex: "Categoria",
 * "Data") ficam em `common`, não aqui.
 */
export interface RelatoriosDict {
  // Página (app/admin/relatorios/page.tsx)
  subtituloPagina: string;
  hubSemPermissao: string;

  // Abas do hub — label + descrição curta de cada módulo
  moduloComercialLabel: string;
  moduloComercialHint: string;
  moduloFinanceiroLabel: string;
  moduloFinanceiroHint: string;
  moduloProducaoLabel: string;
  moduloProducaoHint: string;
  moduloTrafegoLabel: string;
  moduloTrafegoHint: string;
  moduloInventarioLabel: string;
  moduloInventarioHint: string;

  // Compartilhado entre relatórios
  leadsLabel: string;
  /** Sufixo usado após um número de dias (ex: "3 {diasSufixo}"). */
  diasSufixo: string;

  // Comercial
  comercialErroTitulo: string;
  comercialVazioTitulo: string;
  comercialVazioDescricao: string;
  comercialCsvEtapa: string;
  comercialCsvTotalLeads: string;
  comercialTitulo: string;
  comercialSubtitulo: string;
  comercialStatLeadsPeriodo: string;
  comercialStatTaxaConversao: string;
  /** Template com placeholders `{fechados}` e `{perdidos}`. */
  comercialStatTaxaConversaoHint: string;
  comercialStatTempoFechamento: string;
  comercialStatTempoFechamentoHint: string;
  comercialStatValorFechado: string;
  comercialFunilTitulo: string;

  // Financeiro
  financeiroErroTitulo: string;
  financeiroVazioTitulo: string;
  financeiroVazioDescricao: string;
  financeiroCsvReceitas: string;
  financeiroCsvDespesas: string;
  financeiroCsvSaldo: string;
  financeiroTitulo: string;
  financeiroSubtitulo: string;
  financeiroStatReceitas: string;
  financeiroStatDespesas: string;
  financeiroStatResultado: string;
  financeiroStatResultadoHint: string;
  financeiroStatLancamentos: string;
  financeiroStatLancamentosHint: string;
  financeiroFluxoCaixaTitulo: string;
  financeiroLegendaReceitas: string;
  financeiroLegendaDespesas: string;
  financeiroDespesasCategoriaTitulo: string;
  financeiroTooltipDespesa: string;

  // Inventário
  inventarioErroTitulo: string;
  inventarioVazioTitulo: string;
  inventarioVazioDescricao: string;
  inventarioCsvValorAtual: string;
  inventarioTitulo: string;
  inventarioSubtitulo: string;
  inventarioStatTotalInvestido: string;
  /** Template com placeholder `{n}`. */
  inventarioStatTotalInvestidoHint: string;
  inventarioStatPatrimonioAtual: string;
  inventarioStatDepreciacaoTotal: string;
  inventarioStatDepreciacaoTotalHintValorizacao: string;
  inventarioStatDepreciacaoTotalHintPerda: string;
  inventarioStatDepreciacaoMedia: string;
  inventarioDistribuicaoTitulo: string;
  inventarioTooltipValorAtual: string;

  // Produção
  producaoErroTitulo: string;
  producaoCsvFuncionario: string;
  producaoCsvTarefasConcluidas: string;
  producaoTitulo: string;
  producaoSubtitulo: string;
  producaoStatCriadas: string;
  producaoStatConcluidas: string;
  producaoStatGargalos: string;
  producaoStatGargalosHint: string;
  producaoStatTempoConclusao: string;
  producaoStatTempoConclusaoHint: string;
  producaoVazioTitulo: string;
  producaoVazioDescricao: string;
  producaoProdutividadeTitulo: string;
  producaoSemConcluidas: string;
  producaoTooltipConcluidas: string;

  // Tráfego
  trafegoErroTitulo: string;
  trafegoVazioTitulo: string;
  trafegoVazioDescricao: string;
  trafegoCsvInvestimento: string;
  trafegoCsvReceitaBruta: string;
  trafegoTitulo: string;
  trafegoSubtitulo: string;
  trafegoStatRoas: string;
  trafegoStatRoasHint: string;
  trafegoStatRoi: string;
  trafegoStatRoiHint: string;
  trafegoStatLucroLiquido: string;
  trafegoStatLucroLiquidoHint: string;
  trafegoStatReembolsos: string;
  trafegoInvestimentoVsReceitaTitulo: string;
  trafegoLegendaReceitaBruta: string;
  trafegoLegendaInvestimento: string;
  trafegoFechamentosTitulo: string;
  trafegoInvestimentoPorClienteTitulo: string;
  trafegoTooltipInvestido: string;
}

export const relatorios: RelatoriosDict = {
  subtituloPagina: "Central de Business Intelligence — um período só, todos os módulos comparáveis.",
  hubSemPermissao: "Nenhum relatório liberado pro seu usuário ainda — fale com o administrador pra ajustar em Cadastros → Equipe.",

  moduloComercialLabel: "Comercial & CRM",
  moduloComercialHint: "Funil de vendas, conversão e tempo de fechamento",
  moduloFinanceiroLabel: "Financeiro",
  moduloFinanceiroHint: "Fluxo de caixa, DRE simplificado e despesas por categoria",
  moduloProducaoLabel: "Produção & Tarefas",
  moduloProducaoHint: "Produtividade por funcionário e gargalos",
  moduloTrafegoLabel: "Tráfego & Metas",
  moduloTrafegoHint: "ROI, ROAS, lucro líquido e reembolsos",
  moduloInventarioLabel: "Inventário",
  moduloInventarioHint: "Depreciação total do patrimônio",

  leadsLabel: "Leads",
  diasSufixo: "dia(s)",

  comercialErroTitulo: "Não foi possível carregar o Comercial",
  comercialVazioTitulo: "Nenhum lead criado no período",
  comercialVazioDescricao: "Ajuste o intervalo de datas acima ou cadastre leads em CRM & Vendas.",
  comercialCsvEtapa: "Etapa do Funil",
  comercialCsvTotalLeads: "Total de Leads",
  comercialTitulo: "Comercial & CRM — Funil de Vendas",
  comercialSubtitulo: "Leads criados no período, por etapa atual do funil",
  comercialStatLeadsPeriodo: "Leads no Período",
  comercialStatTaxaConversao: "Taxa de Conversão",
  comercialStatTaxaConversaoHint: "{fechados} fechado(s) · {perdidos} perdido(s)",
  comercialStatTempoFechamento: "Tempo Médio de Fechamento",
  comercialStatTempoFechamentoHint: "Da criação até o fechamento",
  comercialStatValorFechado: "Valor Fechado no Período",
  comercialFunilTitulo: "Funil de Vendas",

  financeiroErroTitulo: "Não foi possível carregar o Financeiro",
  financeiroVazioTitulo: "Sem lançamentos no período",
  financeiroVazioDescricao: "Ajuste o intervalo de datas acima ou lance receitas/despesas em Financeiro.",
  financeiroCsvReceitas: "Receitas (R$)",
  financeiroCsvDespesas: "Despesas (R$)",
  financeiroCsvSaldo: "Saldo (R$)",
  financeiroTitulo: "Financeiro — Fluxo de Caixa & DRE",
  financeiroSubtitulo: "Contexto profissional · lançamentos por data de vencimento",
  financeiroStatReceitas: "Receitas no Período",
  financeiroStatDespesas: "Despesas no Período",
  financeiroStatResultado: "Resultado (DRE)",
  financeiroStatResultadoHint: "Receitas − Despesas",
  financeiroStatLancamentos: "Lançamentos",
  financeiroStatLancamentosHint: "Receitas + despesas no período",
  financeiroFluxoCaixaTitulo: "Fluxo de Caixa Projetado",
  financeiroLegendaReceitas: "Receitas",
  financeiroLegendaDespesas: "Despesas",
  financeiroDespesasCategoriaTitulo: "Despesas por Categoria",
  financeiroTooltipDespesa: "Despesa",

  inventarioErroTitulo: "Não foi possível carregar o Inventário",
  inventarioVazioTitulo: "Sem itens com valores cadastrados",
  inventarioVazioDescricao: "Preencha valor pago e valor atual dos itens ativos em Inventário & Patrimônio para calcular a depreciação.",
  inventarioCsvValorAtual: "Valor Atual (R$)",
  inventarioTitulo: "Inventário — Depreciação do Patrimônio",
  inventarioSubtitulo: "Sempre uma foto do agora — não é filtrado pelo período selecionado acima",
  inventarioStatTotalInvestido: "Total Investido",
  inventarioStatTotalInvestidoHint: "{n} item(ns) considerado(s)",
  inventarioStatPatrimonioAtual: "Patrimônio Atual",
  inventarioStatDepreciacaoTotal: "Depreciação Total",
  inventarioStatDepreciacaoTotalHintValorizacao: "Valorização líquida",
  inventarioStatDepreciacaoTotalHintPerda: "Perda de valor acumulada",
  inventarioStatDepreciacaoMedia: "Depreciação Média",
  inventarioDistribuicaoTitulo: "Patrimônio Atual por Categoria",
  inventarioTooltipValorAtual: "Valor Atual",

  producaoErroTitulo: "Não foi possível carregar Produção",
  producaoCsvFuncionario: "Funcionário",
  producaoCsvTarefasConcluidas: "Tarefas Concluídas",
  producaoTitulo: "Produção & Tarefas — Produtividade",
  producaoSubtitulo: "Conclusões no período, por responsável · gargalos são sempre o estado atual",
  producaoStatCriadas: "Tarefas Criadas no Período",
  producaoStatConcluidas: "Tarefas Concluídas no Período",
  producaoStatGargalos: "Gargalos — Atrasadas Agora",
  producaoStatGargalosHint: "Prazo vencido, ainda não concluídas",
  producaoStatTempoConclusao: "Tempo Médio de Conclusão",
  producaoStatTempoConclusaoHint: "Da criação até a conclusão",
  producaoVazioTitulo: "Sem movimentação no período",
  producaoVazioDescricao: "Nenhuma tarefa foi criada nem concluída no intervalo selecionado.",
  producaoProdutividadeTitulo: "Produtividade por Funcionário",
  producaoSemConcluidas: "Nenhuma tarefa concluída no período.",
  producaoTooltipConcluidas: "Concluídas",

  trafegoErroTitulo: "Não foi possível carregar o Tráfego",
  trafegoVazioTitulo: "Sem tracking no período",
  trafegoVazioDescricao: "Nenhum anúncio de Info-Produtos nem registro de tráfego por cliente foi lançado no intervalo selecionado.",
  trafegoCsvInvestimento: "Investimento (R$)",
  trafegoCsvReceitaBruta: "Receita Bruta (R$)",
  trafegoTitulo: "Tráfego & Metas — ROI, ROAS e Lucro Líquido",
  trafegoSubtitulo: "Consolidado do tracking de Info-Produtos (única fonte do módulo com receita)",
  trafegoStatRoas: "ROAS",
  trafegoStatRoasHint: "Receita ÷ Investimento",
  trafegoStatRoi: "ROI",
  trafegoStatRoiHint: "(Receita − Investimento) ÷ Investimento",
  trafegoStatLucroLiquido: "Lucro Líquido",
  trafegoStatLucroLiquidoHint: "Receita − Investimento − Reembolsos",
  trafegoStatReembolsos: "Reembolsos",
  trafegoInvestimentoVsReceitaTitulo: "Investimento vs. Receita Bruta",
  trafegoLegendaReceitaBruta: "Receita Bruta",
  trafegoLegendaInvestimento: "Investimento",
  trafegoFechamentosTitulo: "Lucro Líquido vs. Reembolsos — Fechamentos Semanais",
  trafegoInvestimentoPorClienteTitulo: "Investimento por Cliente (Tráfego)",
  trafegoTooltipInvestido: "Investido",
};
