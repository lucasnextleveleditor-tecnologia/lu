export interface PortalDict {
  // Botão no admin (ClienteDetalheModal) — gera/copia o link fixo do cliente.
  copiarLinkPortalBtn: string;
  linkCopiadoMsg: string;

  // Página pública /portal/[token]
  tituloPagina: string;
  subtituloComEmpresa: string;
  linkInvalidoTitulo: string;
  linkInvalidoDescricao: string;

  orcamentosTitulo: string;
  orcamentosVazio: string;
  contratosTitulo: string;
  contratosVazio: string;
  portfolioTitulo: string;
  timelineTitulo: string;
  timelineVazio: string;

  verOrcamentoBtn: string;
  verContratoBtn: string;
  baixarPdfBtn: string;

  eventoEnviadoOrcamento: string;
  eventoVisualizadoOrcamento: string;
  eventoAprovadoOrcamento: string;
  eventoRecusadoOrcamento: string;
  eventoEnviadoContrato: string;
  eventoVisualizadoContrato: string;
  eventoAssinadoContrato: string;
  eventoRecusadoContrato: string;
}

export const portal: PortalDict = {
  copiarLinkPortalBtn: "Copiar Link do Portal",
  linkCopiadoMsg: "Link copiado!",

  tituloPagina: "Portal do Cliente",
  subtituloComEmpresa: "Tudo o que você tem com {empresa}, em um só lugar.",
  linkInvalidoTitulo: "Link inválido",
  linkInvalidoDescricao: "Este link não é válido ou pode ter sido desativado. Fale com quem te enviou pra confirmar o endereço.",

  orcamentosTitulo: "Orçamentos",
  orcamentosVazio: "Nenhum orçamento por aqui ainda.",
  contratosTitulo: "Contratos",
  contratosVazio: "Nenhum contrato por aqui ainda.",
  portfolioTitulo: "Nossos Trabalhos",
  timelineTitulo: "Histórico",
  timelineVazio: "Ainda não há atividade registrada.",

  verOrcamentoBtn: "Ver Orçamento",
  verContratoBtn: "Ver Contrato",
  baixarPdfBtn: "Baixar PDF",

  eventoEnviadoOrcamento: 'Orçamento "{titulo}" enviado',
  eventoVisualizadoOrcamento: 'Orçamento "{titulo}" visualizado',
  eventoAprovadoOrcamento: 'Orçamento "{titulo}" aprovado',
  eventoRecusadoOrcamento: 'Orçamento "{titulo}" recusado',
  eventoEnviadoContrato: 'Contrato "{titulo}" enviado',
  eventoVisualizadoContrato: 'Contrato "{titulo}" visualizado',
  eventoAssinadoContrato: 'Contrato "{titulo}" assinado',
  eventoRecusadoContrato: 'Contrato "{titulo}" recusado',
};
