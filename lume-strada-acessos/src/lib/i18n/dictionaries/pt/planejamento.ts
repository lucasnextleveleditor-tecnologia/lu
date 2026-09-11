import type { CanalDoPost, FormatoDoPost, TipoDePauta } from "@/lib/types/producao";

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

  // Detalhe do post
  postDetalhes: string;
  postTipoServico: string;
  semTipoServico: string;
  postFormatoEntrega: string;
  postBriefing: string;
  postBriefingPlaceholder: string;
  inserirMarca: string;
  campoOpcionalReceita: string;

  // Indicadores do escopo
  tiposDePauta: Record<TipoDePauta, string>;
  faltaUm: string;
  faltamVarios: string;
  escopoCompleto: string;
  acimaDoEscopo: string;
  escolhaCliente: string;
  semClientesComCiclo: string;
  semCicloParaConteudo: string;
  cicloEmEdicao: string;
  irParaOCiclo: string;

  conteudoResumoDoCiclo: string;
  abrirCalendario: string;

  // Receita de produção por formato (Configurações → Conteúdo)
  abaConteudo: string;
  receitasTitulo: string;
  receitasDescricao: string;
  receitasSemTipos: string;
  receitaDiasV1: string;
  receitaDiasV1Sufixo: string;
  receitaSemV1: string;

  // A tela de Padrões de produção: a prévia do topo, o cadastro de
  // formatos da empresa e os erros das actions, que chegam como CÓDIGO
  // ("FORMATO_EM_USO") justamente para virarem frase aqui, em cada idioma.
  abaPadroesDeProducao: string;
  previaTitulo: string;
  previaColunaPauta: string;
  previaColunaTarefa: string;
  previaTituloExemplo: string;
  previaCampoTitulo: string;
  previaCampoData: string;
  previaEtiquetaPadrao: string;
  previaEmBranco: string;
  previaRodape: string;
  previaDiasAntes: string;
  previaUmDiaAntes: string;
  previaMesmoDia: string;
  formatosQueUso: string;
  salvaSozinho: string;
  ocultarFormato: string;
  ocultarFormatoDe: string;
  adicionarFormato: string;
  adicionarFormatoAjuda: string;
  criarFormatoLabel: string;
  criarFormatoPlaceholder: string;
  criarFormatoBotao: string;
  criarFormatoAjuda: string;
  excluirFormato: string;
  excluirFormatoDe: string;
  excluirFormatoPergunta: string;
  semFormatosAtivos: string;
  tiposServicoCompartilhados: string;
  cadastrarTipoServico: string;
  erroFormatoSemNome: string;
  erroFormatoNomeLongo: string;
  erroFormatoDuplicado: string;
  erroFormatoEmUso: string;
  erroFormatoNativo: string;
  erroFormatoDesconhecido: string;

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

  postDetalhes: "Detalhes do post",
  postTipoServico: "Tipo de serviço",
  semTipoServico: "Sem categoria",
  postFormatoEntrega: "Formato de entrega",
  postBriefing: "Briefing",
  postBriefingPlaceholder: "Legenda, roteiro, o que precisa aparecer…",
  inserirMarca: "Inserir a marca do cliente",
  campoOpcionalReceita: "Em branco, o padrão do formato preenche ao subir.",

  tiposDePauta: { post: "Posts", campanha: "Campanhas", extra: "Peças extras" },
  faltaUm: "falta {n}",
  faltamVarios: "faltam {n}",
  escopoCompleto: "escopo completo",
  acimaDoEscopo: "{n} acima do escopo",
  escolhaCliente: "Cliente",
  semClientesComCiclo: "Nenhum cliente tem ciclo ainda. Crie o primeiro em Planejamento.",
  semCicloParaConteudo: "Este cliente ainda não tem um ciclo. Crie um em Planejamento para montar o calendário.",
  cicloEmEdicao: "Ciclo de {inicio} a {fim}",
  irParaOCiclo: "Abrir o ciclo",

  conteudoResumoDoCiclo: "{n} pautas neste ciclo. O calendário fica na aba Conteúdo.",
  abrirCalendario: "Abrir o calendário",
  abaConteudo: "Conteúdo",
  receitasTitulo: "Padrões de produção por formato",
  receitasDescricao: "Cada formato de post já implica um jeito de produzir. Preencha aqui uma vez, e todo post que subir do calendário nasce assim — só nos campos que a social media deixou em branco.",
  receitasSemTipos: "Você ainda não tem tipos de serviço cadastrados.",
  receitaDiasV1: "Primeiro corte",
  receitaDiasV1Sufixo: "dias antes do post",
  receitaSemV1: "sem primeiro corte",
  abaPadroesDeProducao: "Padrões de produção",
  previaTitulo: "Como a tarefa vai nascer",
  previaColunaPauta: "A social media escreve",
  previaColunaTarefa: "A produção recebe",
  previaTituloExemplo: "Bastidores da gravação",
  previaCampoTitulo: "Título",
  previaCampoData: "Data do post",
  previaEtiquetaPadrao: "padrão",
  previaEmBranco: "fica em branco",
  previaRodape: "Campo preenchido na pauta não é tocado: se a social media escrever o formato de entrega naquele post, o padrão não encosta.",
  previaDiasAntes: "{n} dias antes",
  previaUmDiaAntes: "1 dia antes",
  previaMesmoDia: "no mesmo dia",
  formatosQueUso: "Os formatos que você usa",
  salvaSozinho: "Salva sozinho ao sair do campo.",
  ocultarFormato: "Não uso este formato",
  ocultarFormatoDe: "Parar de usar o formato {formato}",
  adicionarFormato: "Adicionar formato",
  adicionarFormatoAjuda: "Formatos que você tem cadastrados mas não usa:",
  criarFormatoLabel: "Ou crie um formato seu",
  criarFormatoPlaceholder: "Podcast, Newsletter, E-mail…",
  criarFormatoBotao: "Criar",
  criarFormatoAjuda: "Ele passa a aparecer no seletor de formato do calendário de conteúdo.",
  excluirFormato: "Excluir formato",
  excluirFormatoDe: "Excluir o formato {formato}",
  excluirFormatoPergunta: "Excluir {formato}?",
  semFormatosAtivos: "Nenhum formato em uso. Adicione pelo menos um — sem formato, o post sobe sem padrão nenhum.",
  tiposServicoCompartilhados: "Os tipos de serviço são o mesmo cadastro do módulo Produção.",
  cadastrarTipoServico: "Cadastrar um agora",
  erroFormatoSemNome: "Dê um nome ao formato.",
  erroFormatoNomeLongo: "O nome do formato precisa ter no máximo 40 caracteres.",
  erroFormatoDuplicado: "Você já tem um formato com esse nome.",
  erroFormatoEmUso: "Este formato já está em peças da produção. Deixe de usá-lo em vez de excluir.",
  erroFormatoNativo: "Formato nativo não pode ser excluído — basta deixar de usá-lo.",
  erroFormatoDesconhecido: "Este formato não está mais cadastrado. Atualize a página.",

  historicoTitulo: "Ciclos deste cliente",
  semHistorico: "Este é o primeiro ciclo deste cliente.",

  pdfEyebrow: "Planejamento estratégico",
  pdfRodape: "{app} — gerado em {data}",
};
