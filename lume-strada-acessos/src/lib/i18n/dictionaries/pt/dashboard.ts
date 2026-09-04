/**
 * Módulo "Dashboard" do admin (`/admin/dashboard` — Visão Geral + Calendário):
 * sub-nav de abas, agenda do dia (`AgendaDoDia.tsx`), grade de calendário
 * (`CalendarioGeral.tsx`), card de Financeiro do Mês (`FinanceiroDoMesCard.tsx`)
 * e os cards/seções da Visão Geral (`VisaoGeral.tsx`). Strings com `{n}` são
 * templates — o número entra via `.replace("{n}", String(valor))` no
 * componente, nunca fixo aqui.
 */
export interface DashboardDict {
  tituloPagina: string;
  subtituloPagina: string;
  tabVisaoGeral: string;
  tabCalendario: string;
  nadaAgendado: string;
  captacoes: string;
  entregas: string;
  followUpsComercial: string;
  mesAnterior: string;
  proximoMes: string;
  hoje: string;
  diaDom: string;
  diaSeg: string;
  diaTer: string;
  diaQua: string;
  diaQui: string;
  diaSex: string;
  diaSab: string;
  captacaoSingular: string;
  captacaoPlural: string;
  entregaSingular: string;
  entregaPlural: string;
  followUpSingular: string;
  followUpPlural: string;
  legendaCaptacao: string;
  legendaEntrega: string;
  legendaFollowUp: string;
  financeiroDoMesTitulo: string;
  verFinanceiro: string;
  receitas: string;
  despesas: string;
  saldoDoMes: string;
  nenhumCardLiberado: string;
  secaoProducao: string;
  secaoComercial: string;
  secaoFinanceiro: string;
  secaoOutrosModulos: string;
  captacoesHojeLabel: string;
  captacoesHojeHint: string;
  entregasHojeLabel: string;
  entregasHojeHint: string;
  tarefasAtrasadasLabel: string;
  tarefasAtrasadasHint: string;
  aguardandoAprovacaoLabel: string;
  aguardandoAprovacaoHint: string;
  leadsEmAbertoLabel: string;
  leadsEmAbertoHint: string;
  followUpsAtrasadosLabel: string;
  followUpsAtrasadosHint: string;
  propostasAbertasLabel: string;
  propostasAbertasHint: string;
  saldoConsolidadoLabel: string;
  saldoConsolidadoHint: string;
  contasVencidasLabel: string;
  contasVencidasHint: string;
  itensEmManutencaoLabel: string;
  emprestadosNoMomento: string;
  nenhumItemEmprestado: string;
  investidoAdsHojeLabel: string;
  leadsGeradosHoje: string;
  whatsappLabel: string;
  naoConfigurado: string;
  conversasHoje: string;
  conecteEmAdminWhatsapp: string;
  agendaDeHojeTitulo: string;
}

export const dashboard: DashboardDict = {
  tituloPagina: "Dashboard",
  subtituloPagina: "Visão geral da agência e agenda de captações e entregas.",
  tabVisaoGeral: "Visão Geral",
  tabCalendario: "Calendário",
  nadaAgendado: "Nada agendado pra esse dia.",
  captacoes: "Captações",
  entregas: "Entregas",
  followUpsComercial: "Follow-ups (Comercial)",
  mesAnterior: "Mês anterior",
  proximoMes: "Próximo mês",
  hoje: "Hoje",
  diaDom: "Dom",
  diaSeg: "Seg",
  diaTer: "Ter",
  diaQua: "Qua",
  diaQui: "Qui",
  diaSex: "Sex",
  diaSab: "Sáb",
  captacaoSingular: "captação",
  captacaoPlural: "captações",
  entregaSingular: "entrega",
  entregaPlural: "entregas",
  followUpSingular: "follow-up",
  followUpPlural: "follow-ups",
  legendaCaptacao: "Captação",
  legendaEntrega: "Entrega",
  legendaFollowUp: "Follow-up",
  financeiroDoMesTitulo: "Financeiro do Mês",
  verFinanceiro: "Ver Financeiro",
  receitas: "Receitas",
  despesas: "Despesas",
  saldoDoMes: "Saldo do mês",
  nenhumCardLiberado: "Nenhum card liberado pro seu usuário ainda — fale com o administrador pra ajustar em Cadastros → Equipe.",
  secaoProducao: "Produção",
  secaoComercial: "Comercial",
  secaoFinanceiro: "Financeiro",
  secaoOutrosModulos: "Outros Módulos",
  captacoesHojeLabel: "Captações Hoje",
  captacoesHojeHint: "Gravações agendadas pra hoje",
  entregasHojeLabel: "Entregas Hoje",
  entregasHojeHint: "Prazos de entrega vencendo hoje",
  tarefasAtrasadasLabel: "Tarefas Atrasadas",
  tarefasAtrasadasHint: "Prazo vencido, ainda não concluídas",
  aguardandoAprovacaoLabel: "Aguardando Aprovação",
  aguardandoAprovacaoHint: "Versões de entrega esperando o cliente",
  leadsEmAbertoLabel: "Leads em Aberto",
  leadsEmAbertoHint: "Ainda no funil comercial",
  followUpsAtrasadosLabel: "Follow-ups Atrasados",
  followUpsAtrasadosHint: "Próximo contato já venceu",
  propostasAbertasLabel: "Propostas Abertas",
  propostasAbertasHint: "Valor estimado, leads em aberto",
  saldoConsolidadoLabel: "Saldo Consolidado",
  saldoConsolidadoHint: "Soma das contas profissionais",
  contasVencidasLabel: "Contas Vencidas",
  contasVencidasHint: "Não pagas, com vencimento já passado",
  itensEmManutencaoLabel: "Itens em Manutenção",
  emprestadosNoMomento: "{n} emprestado(s) no momento",
  nenhumItemEmprestado: "Nenhum item emprestado",
  investidoAdsHojeLabel: "Investido em Ads Hoje",
  leadsGeradosHoje: "{n} leads gerados hoje",
  whatsappLabel: "WhatsApp",
  naoConfigurado: "Não configurado",
  conversasHoje: "{n} conversas hoje",
  conecteEmAdminWhatsapp: "Conecte em Admin → WhatsApp",
  agendaDeHojeTitulo: "Agenda de Hoje",
};
