/**
 * Uma contagem em duas formas. É um OBJETO e não uma função de propósito: o
 * dicionário inteiro atravessa a fronteira servidor→cliente (o layout raiz
 * monta o `<LocaleProvider>`), e função não é serializável — uma só derruba
 * o app inteiro, não apenas a tela que a usa.
 */
export interface FormaPlural {
  um: string;
  /** `{n}` é trocado pelo número. */
  muitos: string;
}

/**
 * Ordem do Dia — a folha que todo mundo envolvido recebe na véspera.
 *
 * O vocabulário aqui é DE PROPÓSITO neutro. A mesma folha organiza uma
 * gravação, um ensaio fotográfico, um dia de conteúdo, uma cobertura de
 * evento e um dia de edição — por isso "local" e não "set", "quem vai estar"
 * e não "equipe escalada", "dia" e não "diária". Um fotógrafo não tem crew
 * call; tem hora de começar.
 */
export interface OrdemDoDiaDict {
  tituloPagina: string;
  subtituloPagina: string;
  novaOrdem: string;
  novaAPartirDeCaptacao: string;
  semOrdensTitulo: string;
  semOrdensDescricao: string;
  semProjeto: string;
  semData: string;
  diaria: string;
  de: string;
  abrir: string;
  excluir: string;
  confirmarExclusao: string;

  // Cabeçalho da folha
  documento: string;
  projetoLabel: string;
  projetoExemplo: string;
  clienteLabel: string;
  dataLabel: string;
  diariaNumeroLabel: string;
  diariaTotalLabel: string;
  semCliente: string;
  tipoLabel: string;
  tipoExemplo: string;
  tiposSugeridos: string[];

  // Horários
  chamadaLabel: string;
  chamadaHint: string;
  encerramentoLabel: string;
  encerramentoHint: string;
  duracao: string;
  duracaoVazia: string;

  // Clima
  climaTitulo: string;
  climaBuscar: string;
  climaBuscando: string;
  climaVazio: string;
  climaChuva: string;
  nascerDoSol: string;
  porDoSol: string;
  climaAtualizadoEm: string;

  // Locais
  locacoesTitulo: string;
  locacaoNome: string;
  locacaoNomeExemplo: string;
  locacaoEndereco: string;
  locacaoEnderecoExemplo: string;
  locacaoNotas: string;
  locacaoNotasExemplo: string;
  adicionarLocacao: string;
  locacoesVazio: string;
  contagemLocais: FormaPlural;

  // Cronograma
  cronogramaTitulo: string;
  cronogramaHora: string;
  cronogramaAtividade: string;
  cronogramaAtividadeExemplo: string;
  cronogramaLocal: string;
  cronogramaLocalExemplo: string;
  adicionarLinha: string;
  cronogramaVazio: string;
  contagemEtapas: FormaPlural;

  // Pessoas
  equipeTitulo: string;
  equipeFuncao: string;
  equipeFuncaoExemplo: string;
  equipeNome: string;
  equipeNomeExemplo: string;
  equipeContato: string;
  equipeContatoExemplo: string;
  equipeChamada: string;
  adicionarPessoa: string;
  adicionarDoCadastro: string;
  equipeVazio: string;
  contagemPessoas: FormaPlural;

  // Roteiros de gravação
  roteirosTitulo: string;
  roteirosVazio: string;
  adicionarRoteiro: string;
  roteiroTitulo: string;
  roteiroTituloExemplo: string;
  roteiroFormato: string;
  roteiroFormatoExemplo: string;
  roteiroFalas: string;
  roteiroFalasExemplo: string;
  contagemRoteiros: FormaPlural;
  formatosSugeridos: string[];

  observacoesTitulo: string;
  observacoesPlaceholder: string;

  // Link para a equipe
  enviar: string;
  linkLigado: string;
  linkDesligado: string;
  linkDesligadoHint: string;
  linkLigadoHint: string;
  avisoCadastro: string;
  copiarLink: string;
  linkCopiado: string;
  enviarWhatsapp: string;
  mensagemWhatsapp: string;
  arquivar: string;
  desarquivar: string;
  ativas: string;
  arquivadas: string;
  semArquivadasTitulo: string;
  semArquivadasDescricao: string;
  acoes: string;
  semAcessoTitulo: string;
  semAcessoDescricao: string;
  linkInvalidoTitulo: string;
  linkInvalidoDescricao: string;
  irParaInicio: string;

  imprimir: string;
  imprimirHint: string;
  pdfColorido: string;
  pdfColoridoHint: string;
  salvo: string;
  salvando: string;
  rodapeImpressao: string;
}

export const ordemDoDia: OrdemDoDiaDict = {
  tituloPagina: "Ordem de Externa",
  subtituloPagina: "A folha que todo mundo recebe na véspera da externa: onde é, a que horas, quem vai estar e o que vai ser gravado.",
  novaOrdem: "Nova ordem de externa",
  novaAPartirDeCaptacao: "A partir de um agendamento",
  semOrdensTitulo: "Nenhuma ordem de externa ainda",
  semOrdensDescricao: "Crie a primeira para organizar horários, locais e pessoas de um dia de trabalho.",
  semProjeto: "Sem projeto",
  semData: "Sem data",
  diaria: "Dia",
  de: "de",
  abrir: "Abrir",
  excluir: "Excluir",
  confirmarExclusao: "Excluir esta ordem de externa?",

  documento: "Ordem do Dia",
  projetoLabel: "Projeto",
  projetoExemplo: "Campanha de verão — Marca X",
  clienteLabel: "Cliente",
  dataLabel: "Data",
  diariaNumeroLabel: "Dia nº",
  diariaTotalLabel: "de",
  semCliente: "Sem cliente",
  tipoLabel: "Tipo de dia",
  tipoExemplo: "Ensaio fotográfico",
  tiposSugeridos: [
    "Gravação",
    "Ensaio fotográfico",
    "Dia de conteúdo",
    "Cobertura de evento",
    "Entrevista",
    "Live / transmissão",
    "Edição",
    "Direção de arte",
    "Reunião com cliente",
    "Roteiro",
  ],

  chamadaLabel: "Início",
  chamadaHint: "Todo mundo no local",
  encerramentoLabel: "Encerramento",
  encerramentoHint: "Previsão de término",
  duracao: "de trabalho",
  duracaoVazia: "Defina os dois horários",

  climaTitulo: "Clima e luz do dia",
  climaBuscar: "Buscar previsão",
  climaBuscando: "Buscando...",
  climaVazio: "Preencha a data e o endereço do primeiro local para buscar a previsão.",
  climaChuva: "chuva",
  nascerDoSol: "Nascer do sol",
  porDoSol: "Pôr do sol",
  climaAtualizadoEm: "Consultado em",

  locacoesTitulo: "Onde",
  locacaoNome: "Nome do local",
  locacaoNomeExemplo: "Estúdio · Sala 2",
  locacaoEndereco: "Endereço",
  locacaoEnderecoExemplo: "Rua Augusta, 1200 — São Paulo, SP",
  locacaoNotas: "Observações do local",
  locacaoNotasExemplo: "Estacionamento no subsolo. Falar com a portaria. Elevador de carga até 18h.",
  adicionarLocacao: "Adicionar local",
  locacoesVazio: "Nenhum local — adicione ao menos um para todo mundo saber onde chegar.",
  contagemLocais: { um: "1 local", muitos: "{n} locais" },

  cronogramaTitulo: "Cronograma",
  cronogramaHora: "Hora",
  cronogramaAtividade: "O que acontece",
  cronogramaAtividadeExemplo: "Montagem de luz e teste de câmera",
  cronogramaLocal: "Onde",
  cronogramaLocalExemplo: "Sala 2",
  adicionarLinha: "Adicionar etapa",
  cronogramaVazio: "Sem etapas — monte a linha do tempo do dia, da chegada ao encerramento.",
  contagemEtapas: { um: "1 etapa", muitos: "{n} etapas" },

  equipeTitulo: "Quem vai estar",
  equipeFuncao: "Função",
  equipeFuncaoExemplo: "Fotógrafo",
  equipeNome: "Nome",
  equipeNomeExemplo: "Ana Ribeiro",
  equipeContato: "Contato",
  equipeContatoExemplo: "(11) 91234-5678",
  equipeChamada: "Início",
  adicionarPessoa: "Adicionar pessoa",
  adicionarDoCadastro: "Adicionar do cadastro",
  equipeVazio: "Ninguém confirmado ainda.",
  contagemPessoas: { um: "1 pessoa", muitos: "{n} pessoas" },

  roteirosTitulo: "Roteiros de gravação",
  roteirosVazio: "Nenhum roteiro — liste aqui cada vídeo que vai ser gravado e o que se fala em cada um.",
  adicionarRoteiro: "Adicionar roteiro",
  roteiroTitulo: "Assunto do vídeo",
  roteiroTituloExemplo: "Vídeo sobre os 3 erros que travam o cliente",
  roteiroFormato: "Formato",
  roteiroFormatoExemplo: "Reels 30s",
  roteiroFalas: "Falas",
  roteiroFalasExemplo: "Abertura: \"Se o seu cliente some depois do orçamento, o problema não é o preço.\"\nDesenvolvimento: os três erros, um por vez.\nFechamento: chamada para o link da bio.",
  contagemRoteiros: { um: "1 roteiro", muitos: "{n} roteiros" },
  formatosSugeridos: [
    "Reels 30s",
    "Reels 60s",
    "Stories",
    "YouTube",
    "YouTube Shorts",
    "TikTok",
    "Depoimento",
    "Institucional",
    "Making of",
    "Entrevista",
  ],

  observacoesTitulo: "O que mais precisa saber",
  observacoesPlaceholder:
    "Alimentação, transporte, estacionamento, roupa e figurino, equipamento que cada um leva, senha do Wi-Fi, para onde vão os arquivos no fim do dia...",

  enviar: "Enviar para a equipe",
  linkLigado: "Link ligado",
  linkDesligado: "Link desligado",
  linkDesligadoHint: "A folha fica só no painel. Ligue para mandar o link para quem vai trabalhar no dia.",
  linkLigadoHint: "Quem abrir vê a folha sempre atualizada — se o horário mudar às 22h, o celular de todo mundo já mostra o novo.",
  avisoCadastro: "Quem abrir precisa entrar com a conta de funcionário ou cliente da sua agência. Quem não tem cadastro não vê nada.",
  copiarLink: "Copiar link",
  linkCopiado: "Link copiado",
  enviarWhatsapp: "Mandar no WhatsApp",
  mensagemWhatsapp: "Ordem de externa de {projeto} — {data}. Abra aqui:",
  arquivar: "Arquivar",
  desarquivar: "Desarquivar",
  ativas: "Ativas",
  arquivadas: "Arquivadas",
  semArquivadasTitulo: "Nenhuma folha arquivada",
  semArquivadasDescricao: "Folhas arquivadas saem da lista principal, mas continuam inteiras.",
  acoes: "Ações",
  semAcessoTitulo: "Você não tem acesso a esta folha",
  semAcessoDescricao: "Esta folha é de outra agência, ou o compartilhamento foi desligado. Peça a quem enviou para liberar o seu acesso.",
  linkInvalidoTitulo: "Folha não encontrada",
  linkInvalidoDescricao: "Este link não existe mais ou o compartilhamento foi desligado.",
  irParaInicio: "Ir para o início",

  imprimir: "Imprimir",
  imprimirHint: "Folha em preto e branco, para levar no bolso",
  pdfColorido: "PDF colorido",
  pdfColoridoHint: "Igual ao que você vê aqui — para mandar por mensagem",
  salvo: "Salvo",
  salvando: "Salvando...",
  rodapeImpressao: "Dúvidas no dia? Fale com quem está produzindo.",
};
