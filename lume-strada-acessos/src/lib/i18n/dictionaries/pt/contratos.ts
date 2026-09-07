/**
 * Módulo Contratos (`/admin/contratos`) — Fase 3 do sistema guiado de
 * Orçamentos: gera um contrato de verdade (PDF de texto real, ver
 * `src/lib/pdf/ContratoPdfDocument.tsx`) a partir de um orçamento já
 * aprovado (herda cliente/itens/valor) ou avulso, com cláusulas por modelo
 * de perfil profissional (`/admin/contratos/tipos`) e assinatura simples no
 * link público (`/contrato/[token]`, sem login). Chaves com `{placeholder}`
 * são preenchidas via `.replace()`, mesmo padrão de `orcamentos.ts`.
 */
export interface ContratosDict {
  // Geral
  tituloPagina: string;
  subtituloPagina: string;
  novoContratoBtn: string;
  voltarParaContratos: string;

  // StatTiles
  statAguardandoAssinatura: string;
  hintAguardandoAssinatura: string;
  statAssinadoMes: string;
  hintAssinadoMes: string;
  statTaxaAssinatura: string;
  hintTaxaAssinatura: string;

  // Lista
  buscarPlaceholder: string;
  filtroStatusTodos: string;
  colTitulo: string;
  colCliente: string;
  colOrigem: string;
  colValor: string;
  listaVaziaTitulo: string;
  listaVaziaDescricao: string;
  origemAvulso: string;
  origemOrcamento: string;

  // Status
  statusRascunho: string;
  statusEnviado: string;
  statusVisualizado: string;
  statusAssinado: string;
  statusRecusado: string;
  statusCancelado: string;

  // Construtor
  origemTitulo: string;
  origemHint: string;
  dadosDoContratoTitulo: string;
  tipoDeContratoLabel: string;
  aplicarModeloBtn: string;
  tituloContratoLabel: string;
  placeholderTituloContrato: string;
  nomeClienteLabel: string;
  placeholderNomeCliente: string;
  clausulasTitulo: string;
  clausulasHint: string;
  placeholdersHint: string;
  restaurarSugestaoBtn: string;
  avisoModeloJuridico: string;
  itensDoContratoTitulo: string;
  itensVazioDescricao: string;
  salvarRascunhoBtn: string;
  salvarEEnviarBtn: string;

  // Ações do detalhe
  marcarAssinadoBtn: string;
  marcarRecusadoBtn: string;
  marcarCanceladoBtn: string;
  assinadoAvisoTitulo: string;
  assinadoAvisoDescricao: string;
  recusadoAvisoTitulo: string;

  // Tipos de Contrato / Modelos por profissão
  tiposBtn: string;
  tiposSubtitulo: string;
  tiposSalvarBtn: string;
  tiposSalvoMsg: string;

  // Página pública
  contratoTitulo: string;
  assinarContratoBtn: string;
  recusarContratoBtn: string;
  confirmarAssinaturaTitulo: string;
  confirmarAssinaturaDescricao: string;
  confirmarAssinaturaBtn: string;
  placeholderSeuNomeAssinatura: string;
  linkInvalidoDescricao: string;
}

export const contratos: ContratosDict = {
  tituloPagina: "Contratos",
  subtituloPagina: "Gere contratos a partir de orçamentos aprovados ou avulsos, com cláusulas por tipo de trabalho e assinatura simples no link.",
  novoContratoBtn: "Novo Contrato",
  voltarParaContratos: "Voltar pros Contratos",

  statAguardandoAssinatura: "Aguardando Assinatura",
  hintAguardandoAssinatura: "{n} contrato(s) enviado(s) esperando assinatura",
  statAssinadoMes: "Assinado no Mês",
  hintAssinadoMes: "Soma dos contratos assinados este mês",
  statTaxaAssinatura: "Taxa de Assinatura",
  hintTaxaAssinatura: "Entre os contratos já decididos (assinados ou recusados)",

  buscarPlaceholder: "Buscar por título ou cliente...",
  filtroStatusTodos: "Todos os status",
  colTitulo: "Título",
  colCliente: "Cliente",
  colOrigem: "Origem",
  colValor: "Valor",
  listaVaziaTitulo: "Nenhum contrato criado ainda.",
  listaVaziaDescricao: "Gere um contrato a partir de um orçamento aprovado, ou comece um avulso do zero.",
  origemAvulso: "Avulso",
  origemOrcamento: "Gerado a partir do orçamento \"{titulo}\"",

  statusRascunho: "Rascunho",
  statusEnviado: "Enviado",
  statusVisualizado: "Visualizado",
  statusAssinado: "Assinado",
  statusRecusado: "Recusado",
  statusCancelado: "Cancelado",

  origemTitulo: "Origem do Contrato",
  origemHint: "Escolha um orçamento já aprovado pra herdar cliente, itens e valor automaticamente — ou deixe em branco pra um contrato avulso.",
  dadosDoContratoTitulo: "Dados do Contrato",
  tipoDeContratoLabel: "Tipo de contrato",
  aplicarModeloBtn: "Aplicar modelo deste tipo",
  tituloContratoLabel: "Título do contrato",
  placeholderTituloContrato: "Ex: Contrato de Prestação de Serviços — Empresa XYZ",
  nomeClienteLabel: "Nome do cliente",
  placeholderNomeCliente: "Nome de quem vai assinar",
  clausulasTitulo: "Cláusulas do Contrato",
  clausulasHint: "Texto final do contrato — editável livremente antes de enviar.",
  placeholdersHint: "Use {{cliente}}, {{empresa}}, {{titulo}}, {{valor_total}}, {{condicoes_pagamento}} e {{data}} — são substituídos automaticamente ao gerar um contrato novo com este modelo.",
  restaurarSugestaoBtn: "Restaurar sugestão padrão",
  avisoModeloJuridico: "Este é só um rascunho de ponto de partida — recomendamos revisar com um advogado antes de enviar a um cliente real.",
  itensDoContratoTitulo: "Itens do Contrato",
  itensVazioDescricao: "Nenhum item adicionado ainda.",
  salvarRascunhoBtn: "Salvar Rascunho",
  salvarEEnviarBtn: "Salvar e Enviar",

  marcarAssinadoBtn: "Marcar como Assinado",
  marcarRecusadoBtn: "Marcar como Recusado",
  marcarCanceladoBtn: "Cancelar Contrato",
  assinadoAvisoTitulo: "Contrato assinado",
  assinadoAvisoDescricao: "Assinado por {nome} em {data}.",
  recusadoAvisoTitulo: "Contrato recusado",

  tiposBtn: "Modelos",
  tiposSubtitulo: "Monte um modelo de cláusulas pra cada tipo de trabalho — o texto já preenchido some ao escolher esse tipo num contrato novo, sempre editável antes de enviar.",
  tiposSalvarBtn: "Salvar Modelo",
  tiposSalvoMsg: "Modelo salvo!",

  contratoTitulo: "Contrato de Prestação de Serviços",
  assinarContratoBtn: "Assinar Contrato",
  recusarContratoBtn: "Recusar",
  confirmarAssinaturaTitulo: "Confirmar assinatura",
  confirmarAssinaturaDescricao: "Ao confirmar, você assina este contrato nos termos apresentados. Seu nome, data/hora e IP ficam registrados como comprovante.",
  confirmarAssinaturaBtn: "Confirmar Assinatura",
  placeholderSeuNomeAssinatura: "Digite seu nome completo pra assinar",
  linkInvalidoDescricao: "Este link de contrato não existe ou foi removido.",
};
