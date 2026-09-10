/**
 * Planejamento Estratégico e Cronograma.
 *
 * O vocabulário aqui é o do dia a dia da agência — "pautas", "artes", "go
 * live", "reunião de resultados" — e não o do banco de dados. Quem preenche
 * esta tela acabou de sair de uma reunião de planejamento; os rótulos
 * precisam ser as palavras que foram ditas lá.
 */
export interface PlanejamentoDict {
  abaPlanejamento: string;
  subtituloPagina: string;

  // Lista
  colCliente: string;
  colCiclo: string;
  colVencimento: string;
  colStatus: string;
  semClientes: string;
  semCicloAtivo: string;
  criarCiclo: string;
  criando: string;
  abrir: string;
  /** `{n}` de `{total}` clientes com ciclo ativo. */
  resumoAtivos: string;
  /** `{n}` ciclo(s) no histórico. */
  ciclosEncerrados: { um: string; muitos: string };
  /** De `{inicio}` a `{fim}`. */
  periodo: string;
  /** Faltam `{n}` dias. */
  faltamDias: { um: string; muitos: string };
  venceHoje: string;
  venceu: string;

  // Status
  statusRascunho: string;
  statusAtivo: string;
  statusEncerrado: string;
  statusCancelado: string;

  // Página do ciclo
  voltar: string;
  tituloCiclo: string;
  baixarPdf: string;

  blocoResumo: string;
  blocoResumoDescricao: string;
  duracao: string;
  /** `{n}` mês / meses. */
  duracaoMeses: { um: string; muitos: string };
  dataInicio: string;
  dataFim: string;
  dataFimDica: string;
  focoEstrategico: string;
  focoEstrategicoPlaceholder: string;
  orcamentoMidia: string;

  blocoEscopo: string;
  blocoEscopoDescricao: string;
  postsSocial: string;
  campanhasTrafego: string;
  pecasExtras: string;
  pecasExtrasPlaceholder: string;
  adicionar: string;
  escopoObservacoes: string;
  escopoObservacoesPlaceholder: string;

  blocoCronograma: string;
  blocoCronogramaDescricao: string;
  dataLimitePautas: string;
  dataLimiteArtes: string;
  dataGoLive: string;
  dataReuniaoResultados: string;

  salvar: string;
  salvando: string;
  salvoAgora: string;
  ativarCiclo: string;
  encerrarCiclo: string;
  cancelarCiclo: string;
  excluir: string;
  confirmarExcluir: string;
  jaExisteAtivo: string;
  erroTabelaAusente: string;

  reguaTitulo: string;
  reguaTexto: string;
  /** Próximo aviso quando faltarem `{n}` dias. */
  proximoAviso: string;
  semMaisAvisos: string;

  historicoTitulo: string;
  semHistorico: string;

  pdfEyebrow: string;
  /** `{app}` — `{data}`. */
  pdfRodape: string;
}

export const planejamento: PlanejamentoDict = {
  abaPlanejamento: "Planejamento",
  subtituloPagina: "O ciclo de trabalho com este cliente: escopo, verba e datas.",

  colCliente: "Cliente",
  colCiclo: "Ciclo",
  colVencimento: "Vencimento",
  colStatus: "Status",
  semClientes: "Cadastre um cliente para montar o primeiro planejamento.",
  semCicloAtivo: "Sem ciclo ativo",
  criarCiclo: "Criar ciclo",
  criando: "Criando…",
  abrir: "Abrir",
  resumoAtivos: "{n} de {total} clientes com ciclo ativo.",
  ciclosEncerrados: { um: "{n} ciclo no histórico", muitos: "{n} ciclos no histórico" },
  periodo: "{inicio} a {fim}",
  faltamDias: { um: "falta {n} dia", muitos: "faltam {n} dias" },
  venceHoje: "vence hoje",
  venceu: "venceu",

  statusRascunho: "Rascunho",
  statusAtivo: "Ativo",
  statusEncerrado: "Encerrado",
  statusCancelado: "Cancelado",

  voltar: "Voltar para Planejamento",
  tituloCiclo: "Ciclo de planejamento",
  baixarPdf: "Imprimir / PDF",

  blocoResumo: "Resumo do ciclo",
  blocoResumoDescricao: "Quanto tempo dura, quando começa e para onde estamos apontando.",
  duracao: "Duração",
  duracaoMeses: { um: "{n} mês", muitos: "{n} meses" },
  dataInicio: "Data de início",
  dataFim: "Data de término",
  dataFimDica:
    "Calculada a partir do início e da duração — é ela que o sistema usa para avisar a equipe.",
  focoEstrategico: "Foco estratégico do ciclo",
  focoEstrategicoPlaceholder: "O que este ciclo precisa provar ou destravar",
  orcamentoMidia: "Verba de mídia do ciclo",

  blocoEscopo: "Escopo de entregas",
  blocoEscopoDescricao: "O que foi combinado para o ciclo inteiro, e não por mês.",
  postsSocial: "Posts de social media",
  campanhasTrafego: "Campanhas de tráfego",
  pecasExtras: "Peças extras",
  pecasExtrasPlaceholder: "Ex.: 1 vídeo institucional",
  adicionar: "Adicionar",
  escopoObservacoes: "Observações do escopo",
  escopoObservacoesPlaceholder: "O que está fora, o que depende do cliente, o que ficou em aberto",

  blocoCronograma: "Cronograma",
  blocoCronogramaDescricao: "As datas que a equipe e o cliente combinaram. Deixe em branco o que ainda não foi marcado.",
  dataLimitePautas: "Limite para as pautas",
  dataLimiteArtes: "Limite para as artes",
  dataGoLive: "Go live",
  dataReuniaoResultados: "Reunião de resultados",

  salvar: "Salvar",
  salvando: "Salvando…",
  salvoAgora: "Salvo",
  ativarCiclo: "Ativar ciclo",
  encerrarCiclo: "Encerrar ciclo",
  cancelarCiclo: "Cancelar ciclo",
  excluir: "Excluir",
  confirmarExcluir: "Excluir este ciclo? Não é possível recuperar.",
  jaExisteAtivo: "Este cliente já tem um ciclo ativo. Encerre o atual antes de ativar outro.",
  erroTabelaAusente: "O módulo de planejamento ainda não foi instalado no banco. Rode a migração e tente de novo.",

  reguaTitulo: "Avisos automáticos",
  reguaTexto:
    "Com o ciclo ativo, a equipe é avisada no sino quando faltarem 20, 15, 10, 5, 4, 3, 2 e 1 dia para o fim.",
  proximoAviso: "Próximo aviso quando faltarem {n} dias.",
  semMaisAvisos: "Todos os avisos deste ciclo já foram enviados.",

  historicoTitulo: "Ciclos deste cliente",
  semHistorico: "Este é o primeiro ciclo deste cliente.",

  pdfEyebrow: "Planejamento estratégico",
  pdfRodape: "{app} — gerado em {data}",
};
