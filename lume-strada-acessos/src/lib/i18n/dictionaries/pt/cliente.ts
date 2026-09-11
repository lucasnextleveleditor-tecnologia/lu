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
  legendaTitulo: string;
  baixarArquivo: string;
  aprovar: string;
  placeholderAlteracao: string;
  solicitarAlteracao: string;

  // As duas abas da area do cliente: a fila de aprovacao e o contrato
  // dele (so leitura, ver supabase/contrato-externo.sql).
  abaAprovacoes: string;
  abaContratos: string;
  contratosTitulo: string;
  contratosSubtitulo: string;
  contratosVazio: string;
  contratoAbrir: string;
  contratoAssinadoEm: string;
  contratoSemData: string;
}

export const cliente: ClienteDict = {
  tituloPagina: "Materiais para Aprovação",
  subtituloPagina: "Arquivos e links enviados pela sua agência, esperando sua revisão.",
  nenhumaAprovacaoPendente: "Nada esperando sua aprovação no momento.",
  enviadoEm: "Enviado em {data}",
  legendaTitulo: "Legenda",
  baixarArquivo: "Baixar arquivo",
  aprovar: "Aprovar",
  placeholderAlteracao: "O que precisa mudar?",
  solicitarAlteracao: "Solicitar Alteração",
  abaAprovacoes: "Aprovações",
  abaContratos: "Contrato",
  contratosTitulo: "Seu contrato",
  contratosSubtitulo: "Os contratos que você assinou com a agência.",
  contratosVazio: "Nenhum contrato disponível por aqui ainda.",
  contratoAbrir: "Abrir contrato",
  contratoAssinadoEm: "Assinado em {data}",
  contratoSemData: "Contrato assinado",
};
