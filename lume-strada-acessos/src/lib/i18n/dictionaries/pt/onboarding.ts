/**
 * Onboarding de Clientes — o briefing estratégico do cliente novo.
 *
 * Os rótulos dos campos são perguntas, não substantivos: "O que ele vende?"
 * em vez de "Oferta". Quem preenche isso normalmente está com o cliente na
 * linha ou acabou de sair de uma reunião — pergunta se responde, rótulo se
 * decora.
 */
export interface OnboardingDict {
  tituloPagina: string;
  subtituloPagina: string;
  abaClientes: string;
  abaOnboarding: string;

  // Lista
  colCliente: string;
  colProgresso: string;
  colStatus: string;
  colAtualizado: string;
  abrir: string;
  comecar: string;
  semClientes: string;
  statusNaoIniciado: string;
  statusEmAndamento: string;
  statusConcluido: string;
  /** `{n}` de `{total}` etapas. */
  etapasDe: string;
  resumoConcluidos: string;

  // Wizard
  voltarParaClientes: string;
  /** Etapa `{n}` de `{total}`. */
  etapaDe: string;
  anterior: string;
  proximo: string;
  salvar: string;
  salvando: string;
  salvoAgora: string;
  concluir: string;
  concluindo: string;
  reabrir: string;
  /** Concluído em `{data}`. */
  concluidoEm: string;
  /** Falta preencher: `{campos}`. */
  faltamCampos: string;
  rascunhoAviso: string;

  // Etapas
  etapa1Titulo: string;
  etapa1Descricao: string;
  etapa2Titulo: string;
  etapa2Descricao: string;
  etapa3Titulo: string;
  etapa3Descricao: string;
  etapa4Titulo: string;
  etapa4Descricao: string;
  etapa5Titulo: string;
  etapa5Descricao: string;

  // Etapa 1
  ofertaPrincipal: string;
  ofertaPrincipalPlaceholder: string;
  ticketMedio: string;
  propostaUnicaValor: string;
  propostaUnicaValorPlaceholder: string;
  publicoAlvo: string;
  publicoAlvoPlaceholder: string;
  personas: string;
  personasPlaceholder: string;
  jornadaVendas: string;
  jornadaVendasPlaceholder: string;
  concorrentes: string;
  concorrentesPlaceholder: string;
  adicionar: string;

  // Etapa 2
  manualMarcaUrl: string;
  manualMarcaUrlDica: string;
  paletaCores: string;
  paletaCoresDica: string;
  tomDeVoz: string;
  tomDeVozPlaceholder: string;
  diretrizesMarca: string;
  diretrizesMarcaPlaceholder: string;
  driveAtivosUrl: string;
  driveAtivosUrlDica: string;

  // Etapa 3
  objetivoPrincipal: string;
  objetivoLeads: string;
  objetivoVendas: string;
  objetivoBranding: string;
  objetivoComunidade: string;
  objetivoOutro: string;
  objetivoDescricao: string;
  objetivoDescricaoPlaceholder: string;
  roasAlvo: string;
  cpaAlvo: string;
  metaLeadsMes: string;
  metaFaturamentoMes: string;
  historicoMarketing: string;
  historicoMarketingPlaceholder: string;

  // Etapa 4
  metaAdsId: string;
  googleAdsId: string;
  ga4Id: string;
  pixelId: string;
  redesSociais: string;
  siteUrl: string;
  cmsUtilizado: string;
  cmsUtilizadoPlaceholder: string;
  cmsObservacoes: string;
  cmsAviso: string;
  crmUtilizado: string;
  crmUtilizadoPlaceholder: string;
  ferramentasObservacoes: string;
  ferramentasObservacoesPlaceholder: string;

  // Etapa 5
  decisorNome: string;
  decisorCargo: string;
  decisorEmail: string;
  aprovadorWhatsapp: string;
  aprovadorWhatsappDica: string;
  canalComunicacao: string;
  canalWhatsapp: string;
  canalSlack: string;
  canalEmail: string;
  canalTelefone: string;
  canalTeams: string;
  canalDiscord: string;
  canalOutro: string;
  observacoesOperacionais: string;
  observacoesOperacionaisPlaceholder: string;

  selecione: string;
  naoInformado: string;
}

export const onboarding: OnboardingDict = {
  tituloPagina: "Onboarding",
  subtituloPagina: "O que a equipe precisa saber sobre cada cliente antes de produzir qualquer coisa.",
  abaClientes: "Clientes",
  abaOnboarding: "Onboarding",

  colCliente: "Cliente",
  colProgresso: "Progresso",
  colStatus: "Situação",
  colAtualizado: "Atualizado",
  abrir: "Abrir",
  comecar: "Começar",
  semClientes: "Nenhum cliente cadastrado ainda.",
  statusNaoIniciado: "Não iniciado",
  statusEmAndamento: "Em andamento",
  statusConcluido: "Concluído",
  etapasDe: "{n} de {total} etapas",
  resumoConcluidos: "{n} de {total} clientes com briefing concluído",

  voltarParaClientes: "Clientes",
  etapaDe: "Etapa {n} de {total}",
  anterior: "Voltar",
  proximo: "Avançar",
  salvar: "Salvar",
  salvando: "Salvando…",
  salvoAgora: "Salvo",
  concluir: "Concluir briefing",
  concluindo: "Concluindo…",
  reabrir: "Reabrir para editar",
  concluidoEm: "Briefing concluído em {data}.",
  faltamCampos: "Para concluir, falta preencher: {campos}.",
  rascunhoAviso: "Cada etapa é salva sozinha ao avançar — dá para parar no meio e voltar depois.",

  etapa1Titulo: "Negócio e Estratégia",
  etapa1Descricao: "O que ele vende, para quem, e por que compram dele e não do concorrente.",
  etapa2Titulo: "Branding e Ativos",
  etapa2Descricao: "Como a marca fala e onde estão os arquivos.",
  etapa3Titulo: "Metas e KPIs",
  etapa3Descricao: "O que precisa acontecer para o contrato ser considerado um sucesso.",
  etapa4Titulo: "Acessos e Ferramentas",
  etapa4Descricao: "Onde as coisas rodam e com que identificadores.",
  etapa5Titulo: "Operacional",
  etapa5Descricao: "Quem decide, quem aprova e por onde se fala.",

  ofertaPrincipal: "O que ele vende?",
  ofertaPrincipalPlaceholder: "Produto ou serviço principal, em uma ou duas frases.",
  ticketMedio: "Ticket médio",
  propostaUnicaValor: "Por que compram dele e não do concorrente?",
  propostaUnicaValorPlaceholder: "A promessa que só ele consegue cumprir.",
  publicoAlvo: "Quem compra?",
  publicoAlvoPlaceholder: "Idade, região, renda, momento de vida, cargo…",
  personas: "Personas",
  personasPlaceholder: "Uma ou duas pessoas típicas, com nome e contexto — ajuda mais que uma faixa etária.",
  jornadaVendas: "Como é o caminho até a compra?",
  jornadaVendasPlaceholder: "Do primeiro contato ao pagamento: onde descobre, o que pergunta, quanto tempo leva.",
  concorrentes: "Principais concorrentes",
  concorrentesPlaceholder: "Nome do concorrente",
  adicionar: "Adicionar",

  manualMarcaUrl: "Manual da marca (link)",
  manualMarcaUrlDica: "Drive, Notion, Figma — link não ocupa armazenamento e o cliente atualiza sem passar por aqui.",
  paletaCores: "Paleta de cores",
  paletaCoresDica: "Na ordem: principal, secundária, apoio.",
  tomDeVoz: "Tom de voz",
  tomDeVozPlaceholder: "Fala por “você” ou por “vocês”? Usa gíria? Pode usar emoji? O que nunca se diz?",
  diretrizesMarca: "Diretrizes e restrições",
  diretrizesMarcaPlaceholder: "O que não pode aparecer, palavras proibidas, exigências jurídicas.",
  driveAtivosUrl: "Drive de fotos e ativos (link)",
  driveAtivosUrlDica: "A pasta onde estão logo, fotos, vídeos brutos e material de apoio.",

  objetivoPrincipal: "Objetivo principal do contrato",
  objetivoLeads: "Gerar leads",
  objetivoVendas: "Vender",
  objetivoBranding: "Marca e posicionamento",
  objetivoComunidade: "Comunidade e audiência",
  objetivoOutro: "Outro",
  objetivoDescricao: "Em uma frase, o que precisa acontecer",
  objetivoDescricaoPlaceholder: "Ex: dobrar os agendamentos da clínica até dezembro.",
  roasAlvo: "ROAS alvo",
  cpaAlvo: "Custo por aquisição alvo",
  metaLeadsMes: "Meta de leads por mês",
  metaFaturamentoMes: "Meta de faturamento por mês",
  historicoMarketing: "O que já tentaram antes",
  historicoMarketingPlaceholder: "O que funcionou, o que não funcionou e com quem trabalharam. Evita repetir erro caro.",

  metaAdsId: "ID do Gerenciador de Anúncios (Meta)",
  googleAdsId: "ID do Google Ads",
  ga4Id: "ID do Google Analytics (GA4)",
  pixelId: "ID do Pixel",
  redesSociais: "Redes sociais",
  siteUrl: "Site",
  cmsUtilizado: "Plataforma do site / CMS",
  cmsUtilizadoPlaceholder: "WordPress, Shopify, Webflow, Wix…",
  cmsObservacoes: "Onde está o acesso e com quem",
  cmsAviso: "Não escreva senhas aqui. Anote apenas onde a credencial está guardada e quem administra — senha fica no gerenciador de senhas.",
  crmUtilizado: "CRM utilizado",
  crmUtilizadoPlaceholder: "RD Station, HubSpot, planilha, nenhum…",
  ferramentasObservacoes: "Outras ferramentas",
  ferramentasObservacoesPlaceholder: "Ferramenta de e-mail, plataforma de curso, gateway de pagamento…",

  decisorNome: "Quem decide",
  decisorCargo: "Cargo",
  decisorEmail: "E-mail",
  aprovadorWhatsapp: "WhatsApp de quem aprova",
  aprovadorWhatsappDica: "Nem sempre é a mesma pessoa que decide o contrato.",
  canalComunicacao: "Canal oficial de comunicação",
  canalWhatsapp: "WhatsApp",
  canalSlack: "Slack",
  canalEmail: "E-mail",
  canalTelefone: "Telefone",
  canalTeams: "Microsoft Teams",
  canalDiscord: "Discord",
  canalOutro: "Outro",
  observacoesOperacionais: "Combinados e restrições",
  observacoesOperacionaisPlaceholder: "Horário de resposta, prazo de aprovação, quem não pode ser acionado direto.",

  selecione: "Selecione…",
  naoInformado: "Não informado",
};
