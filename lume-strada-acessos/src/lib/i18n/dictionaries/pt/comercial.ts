/**
 * Módulo Comercial (CRM/funil de vendas) — `app/admin/comercial/page.tsx` e
 * `components/admin/comercial/*`. Cobre o funil (Kanban/Lista), o modal de
 * detalhe/edição de lead, o log de follow-up e o mini-cadastro de serviços
 * aberto de dentro do lead. Strings de erro de Server Action
 * (`app/admin/comercial/actions.ts`) ficam de fora — continuam em
 * português, é escopo separado do rollout de i18n.
 */
export interface ComercialDict {
  // Cabeçalho da página
  tituloPagina: string;
  subtituloPagina: string;
  statEmNegociacao: string;
  statTaxaConversao: string;
  statFechadosMes: string;
  statFollowupsAtrasados: string;
  /** `{count}` é substituído pelo número de leads em aberto. */
  hintLeadsAbertos: string;
  /** `{ganhos}` e `{perdidos}` são substituídos pelas contagens. */
  hintTaxaConversao: string;
  hintFechadosMes: string;
  hintFollowupsAtrasados: string;

  // ComercialWorkspace — alternância de visão, exportação, novo lead
  visaoFunil: string;
  visaoLista: string;
  novoLead: string;
  colEtapaFunil: string;
  colProximoContatoCsv: string;
  colCriadoEm: string;

  // LeadKanbanBoard
  colunaVazia: string;

  // LeadCard
  badgeContrato: string;
  atrasadoPrefixo: string;
  proximoContatoPrefixo: string;

  // ListaLeads
  placeholderBusca: string;
  vazioSemLeads: string;
  vazioSemFiltro: string;
  colLead: string;
  colProximoContato: string;
  colValorEstimado: string;

  // Campos compartilhados entre LeadModal e LeadDetalheModal
  origemLeadLabel: string;
  naoInformado: string;
  servicoInteresseLabel: string;
  gerenciar: string;
  valorEstimadoLabel: string;
  previsaoFechamentoLabel: string;
  contratoAssinadoLabel: string;

  // LeadDetalheModal
  convertidoLabel: string;
  convertidoEmPrefixo: string;
  convertidoRodape: string;
  converterTitulo: string;
  converterHintDisponivel: string;
  /** `{etapa}` é substituído pelo nome da etapa "Fechado (Ganha)". */
  converterHintIndisponivel: string;
  convertendo: string;
  linkAcessoTitulo: string;
  linkAcessoAjuda: string;
  excluirLeadPergunta: string;
  simExcluir: string;
  excluirLeadBotao: string;
  badgeSalvo: string;

  // LeadModal
  labelNomeLead: string;
  placeholderNomeLead: string;
  criando: string;
  criarLead: string;

  // FollowUpLog
  anotacoesHistorico: string;
  placeholderNota: string;
  proximoContatoLabel: string;
  /** `{numero}` = número do contato (1º, 2º...), `{dias}` = dias sugeridos de intervalo. */
  sugestaoContato: string;
  registrar: string;
  semContatos: string;
  proximoContatoAgendado: string;

  // GerenciarServicosModal
  servicosOferecidosTitulo: string;
  servicosDescricao: string;
  servicosListaTitulo: string;
  placeholderServico: string;

  // Etapas do funil (StatusLead) — usadas no Kanban, na Lista e no detalhe do lead
  etapaLeadFrio: string;
  etapaContatoInicial: string;
  etapaReuniaoRealizada: string;
  etapaPropostaEnviada: string;
  etapaNegociacao: string;
  etapaFechadoGanha: string;
  etapaPerdido: string;

  // Origem do lead (OrigemLead)
  origem: string;
  origemIndicacao: string;
  origemTrafegoPago: string;
  origemOutbound: string;
  origemOutro: string;
  origemWhatsapp: string;
}

export const comercial: ComercialDict = {
  tituloPagina: "CRM & Vendas",
  subtituloPagina: "Funil de pré-vendas, follow-up e conversão de leads em clientes.",
  statEmNegociacao: "Em Negociação",
  statTaxaConversao: "Taxa de Conversão",
  statFechadosMes: "Fechados no Mês",
  statFollowupsAtrasados: "Follow-ups Atrasados",
  hintLeadsAbertos: "{count} lead(s) em aberto",
  hintTaxaConversao: "{ganhos} ganhos · {perdidos} perdidos",
  hintFechadosMes: "Negócios ganhos",
  hintFollowupsAtrasados: "Precisam de contato",

  visaoFunil: "Funil",
  visaoLista: "Lista",
  novoLead: "Novo Lead",
  colEtapaFunil: "Etapa do Funil",
  colProximoContatoCsv: "Próximo Contato",
  colCriadoEm: "Criado em",

  colunaVazia: "Nenhum lead aqui.",

  badgeContrato: "Contrato",
  atrasadoPrefixo: "Atrasado · ",
  proximoContatoPrefixo: "Próx. contato: ",

  placeholderBusca: "Nome, e-mail, WhatsApp, serviço...",
  vazioSemLeads: "Nenhum lead cadastrado ainda.",
  vazioSemFiltro: "Nenhum lead corresponde aos filtros atuais.",
  colLead: "Lead",
  colProximoContato: "Próx. Contato",
  colValorEstimado: "Valor Estimado",

  origemLeadLabel: "Origem do Lead",
  naoInformado: "Não informado",
  servicoInteresseLabel: "Serviço de Interesse",
  gerenciar: "Gerenciar",
  valorEstimadoLabel: "Valor Estimado (R$)",
  previsaoFechamentoLabel: "Previsão de Fechamento",
  contratoAssinadoLabel: "Contrato já assinado",

  convertidoLabel: "Convertido em cliente",
  convertidoEmPrefixo: "em",
  convertidoRodape: "já aparece em Clientes & Acessos.",
  converterTitulo: "Converter em Cliente",
  converterHintDisponivel: "Cria o login (com senha provisória) pro e-mail do lead e cria o perfil oficial em Clientes & Acessos.",
  converterHintIndisponivel: "Disponível quando o lead tiver um e-mail cadastrado — recomendado ao chegar em {etapa}.",
  convertendo: "Convertendo...",
  linkAcessoTitulo: "Acesso gerado",
  linkAcessoAjuda:
    "Copie e-mail + senha e envie manualmente pro cliente (WhatsApp, e-mail, etc.). Ele loga com esses dados e o painel vai obrigar a trocar a senha assim que entrar.",
  excluirLeadPergunta: "Excluir este lead?",
  simExcluir: "Sim, excluir",
  excluirLeadBotao: "Excluir Lead",
  badgeSalvo: "Salvo",

  labelNomeLead: "Nome da Empresa/Pessoa *",
  placeholderNomeLead: "Ex: Studio Criativo Ltda",
  criando: "Criando...",
  criarLead: "Criar Lead",

  anotacoesHistorico: "Anotações & Histórico",
  placeholderNota: "Resumo da reunião/contato...",
  proximoContatoLabel: "Próximo contato",
  sugestaoContato: "(sugestão: {numero}º contato, +{dias}d)",
  registrar: "Registrar",
  semContatos: "Nenhum contato registrado ainda.",
  proximoContatoAgendado: "Próx. contato agendado: ",

  servicosOferecidosTitulo: "Serviços Oferecidos",
  servicosDescricao: "Essa lista também é usada em Produção — adicionar ou remover aqui vale pros dois módulos.",
  servicosListaTitulo: "Serviços",
  placeholderServico: "Ex: Edição de Vídeo",

  etapaLeadFrio: "Lead Frio",
  etapaContatoInicial: "Contato Inicial",
  etapaReuniaoRealizada: "Reunião Realizada",
  etapaPropostaEnviada: "Proposta Enviada",
  etapaNegociacao: "Negociação",
  etapaFechadoGanha: "Fechado (Ganha)",
  etapaPerdido: "Perdido",

  origem: "Origem",
  origemIndicacao: "Indicação",
  origemTrafegoPago: "Tráfego Pago",
  origemOutbound: "Outbound",
  origemOutro: "Outro",
  origemWhatsapp: "WhatsApp",
};
