import type { PortalDict } from "../pt/portal";

export const portal: PortalDict = {
  copiarLinkPortalBtn: "Copy Portal Link",
  linkCopiadoMsg: "Link copied!",

  tituloPagina: "Client Portal",
  subtituloComEmpresa: "Everything you have with {empresa}, in one place.",
  linkInvalidoTitulo: "Invalid link",
  linkInvalidoDescricao: "This link isn't valid or may have been deactivated. Contact whoever sent it to confirm the address.",

  orcamentosTitulo: "Proposals",
  orcamentosVazio: "No proposals here yet.",
  contratosTitulo: "Contracts",
  contratosVazio: "No contracts here yet.",
  portfolioTitulo: "Our Work",
  timelineTitulo: "History",
  timelineVazio: "No activity recorded yet.",

  verOrcamentoBtn: "View Proposal",
  verContratoBtn: "View Contract",
  baixarPdfBtn: "Download PDF",

  eventoEnviadoOrcamento: 'Proposal "{titulo}" sent',
  eventoVisualizadoOrcamento: 'Proposal "{titulo}" viewed',
  eventoAprovadoOrcamento: 'Proposal "{titulo}" approved',
  eventoRecusadoOrcamento: 'Proposal "{titulo}" declined',
  eventoEnviadoContrato: 'Contract "{titulo}" sent',
  eventoVisualizadoContrato: 'Contract "{titulo}" viewed',
  eventoAssinadoContrato: 'Contract "{titulo}" signed',
  eventoRecusadoContrato: 'Contract "{titulo}" declined',
};
