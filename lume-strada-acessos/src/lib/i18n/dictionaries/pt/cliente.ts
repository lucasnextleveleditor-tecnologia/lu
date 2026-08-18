/**
 * Portal do cliente (`app/dashboard/page.tsx` + `AprovacoesPendentes.tsx`)
 * — a fila de materiais de Produção esperando aprovação/revisão do cliente.
 * Único conteúdo que o cliente vê nessa área (ver comentário em
 * `dashboard/page.tsx`), então este dicionário fica pequeno de propósito.
 */
export interface ClienteDict {
  tituloPagina: string;
  subtituloPagina: string;
  nenhumaAprovacaoPendente: string;
  enviadoEm: string;
  aprovar: string;
  placeholderAlteracao: string;
  solicitarAlteracao: string;
}

export const cliente: ClienteDict = {
  tituloPagina: "Materiais para Aprovação",
  subtituloPagina: "Arquivos e links enviados pela Lume Strada Filmes, esperando sua revisão.",
  nenhumaAprovacaoPendente: "Nada esperando sua aprovação no momento.",
  enviadoEm: "Enviado em {data}",
  aprovar: "Aprovar",
  placeholderAlteracao: "O que precisa mudar?",
  solicitarAlteracao: "Solicitar Alteração",
};
