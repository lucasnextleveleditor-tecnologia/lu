import type { CanalDoPost, FormatoDoPost } from "@/lib/types/producao";

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
  continuarRascunho: string;
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
  /** Faltando `{n}` dia(s) — o texto de cada aviso configurado. */
  reguaChip: { um: string; muitos: string };
  reguaVazia: string;
  reguaAdicionar: string;
  reguaPlaceholder: string;
  reguaLimite: string;
  reguaJaPassou: string;
  reguaPadrao: string;
  /** Próximo aviso quando faltarem `{n}` dias. */
  proximoAviso: string;
  semMaisAvisos: string;

  // Calendário de conteúdo
  conteudoTitulo: string;
  conteudoDescricao: string;
  visaoLista: string;
  visaoCalendario: string;
  /** `{n}` de `{total}` posts pautados. */
  postsPautadosDe: string;
  postsPautados: string;
  postsPautadosUm: string;
  novoPostPlaceholder: string;
  adicionarPost: string;
  removerPost: string;
  postSemTitulo: string;
  semPosts: string;
  canal: string;
  formato: string;
  canais: Record<CanalDoPost, string>;
  formatos: Record<FormatoDoPost, string>;
  selecionarTodos: string;
  semResponsavel: string;
  /** Subir `{n}` para produção. */
  subirParaProducao: string;
  subiuUm: string;
  subiuVarios: string;
  jaNaProducao: string;
  devolverParaPauta: string;
  semDiaUm: string;
  semDiaVarios: string;
  mesAnterior: string;
  proximoMes: string;
  /** +`{n}` mais, na célula do dia. */
  maisPosts: string;
  /** Dom, Seg, ... — cabeçalho da grade. */
  diasDaSemana: string[];

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
  continuarRascunho: "Continuar rascunho",
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
    "Escolha quantos dias antes do fim a equipe deve ser avisada no sino. Cada número é um aviso — pode ter quantos quiser, até 12.",
  reguaChip: { um: "faltando {n} dia", muitos: "faltando {n} dias" },
  reguaVazia: "Nenhum aviso configurado: este ciclo não vai notificar ninguém.",
  reguaAdicionar: "Adicionar aviso",
  reguaPlaceholder: "dias",
  reguaLimite: "Máximo de 12 avisos por ciclo.",
  reguaJaPassou: "já passou",
  reguaPadrao: "Usar a régua padrão",
  proximoAviso: "Próximo aviso quando faltarem {n} dias.",
  semMaisAvisos: "Todos os avisos deste ciclo já foram enviados.",

  conteudoTitulo: "Calendário de conteúdo",
  conteudoDescricao:
    "Os posts deste ciclo, dia a dia. Escreva as ideias na lista e depois solte para a produção com um responsável.",
  visaoLista: "Lista",
  visaoCalendario: "Calendário",
  postsPautadosDe: "{n} de {total} posts pautados",
  postsPautados: "{n} posts pautados",
  postsPautadosUm: "{n} post pautado",
  novoPostPlaceholder: "Ideia do post — ex.: bastidores da gravação",
  adicionarPost: "Adicionar",
  removerPost: "Excluir post",
  postSemTitulo: "Escreva a ideia do post antes de adicionar.",
  semPosts: "Nenhum post ainda. Escreva a primeira ideia acima.",
  canal: "Canal",
  formato: "Formato",
  canais: {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    linkedin: "LinkedIn",
    facebook: "Facebook",
    site: "Site / blog",
    outro: "Outro",
  },
  formatos: {
    reels: "Reels",
    carrossel: "Carrossel",
    story: "Story",
    estatico: "Estático",
    video: "Vídeo",
    texto: "Texto",
    outro: "Outro",
  },
  selecionarTodos: "Selecionar todos",
  semResponsavel: "Sem responsável",
  subirParaProducao: "Subir {n} para produção",
  subiuUm: "1 post foi para a produção.",
  subiuVarios: "{n} posts foram para a produção.",
  jaNaProducao: "Em produção",
  devolverParaPauta: "Devolver para a pauta",
  semDiaUm: "1 post ainda está sem dia.",
  semDiaVarios: "{n} posts ainda estão sem dia.",
  mesAnterior: "Mês anterior",
  proximoMes: "Próximo mês",
  maisPosts: "+{n} mais",
  diasDaSemana: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],

  historicoTitulo: "Ciclos deste cliente",
  semHistorico: "Este é o primeiro ciclo deste cliente.",

  pdfEyebrow: "Planejamento estratégico",
  pdfRodape: "{app} — gerado em {data}",
};
