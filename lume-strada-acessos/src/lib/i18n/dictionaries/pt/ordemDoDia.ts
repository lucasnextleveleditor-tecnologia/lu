/**
 * Ordem do Dia (call sheet) — o documento que a equipe recebe na véspera da
 * diária e leva impresso para o set.
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
  clienteLabel: string;
  dataLabel: string;
  diariaNumeroLabel: string;
  diariaTotalLabel: string;
  semCliente: string;

  // Horários
  chamadaLabel: string;
  chamadaHint: string;
  encerramentoLabel: string;
  encerramentoHint: string;

  // Clima
  climaTitulo: string;
  climaBuscar: string;
  climaBuscando: string;
  climaVazio: string;
  climaChuva: string;
  nascerDoSol: string;
  porDoSol: string;
  climaAtualizadoEm: string;

  // Locações
  locacoesTitulo: string;
  locacaoNome: string;
  locacaoEndereco: string;
  locacaoNotas: string;
  adicionarLocacao: string;
  locacoesVazio: string;

  // Cronograma
  cronogramaTitulo: string;
  cronogramaHora: string;
  cronogramaAtividade: string;
  cronogramaLocal: string;
  adicionarLinha: string;
  cronogramaVazio: string;

  // Equipe
  equipeTitulo: string;
  equipeFuncao: string;
  equipeNome: string;
  equipeContato: string;
  equipeChamada: string;
  adicionarPessoa: string;
  adicionarDoCadastro: string;
  equipeVazio: string;

  observacoesTitulo: string;
  observacoesPlaceholder: string;

  imprimir: string;
  salvo: string;
  salvando: string;
  rodapeImpressao: string;
}

export const ordemDoDia: OrdemDoDiaDict = {
  tituloPagina: "Ordem do Dia",
  subtituloPagina: "A folha que a equipe recebe na véspera e leva impressa para o set.",
  novaOrdem: "Nova ordem do dia",
  novaAPartirDeCaptacao: "A partir de uma captação",
  semOrdensTitulo: "Nenhuma ordem do dia ainda",
  semOrdensDescricao: "Crie a primeira para organizar horários, locações e equipe de uma diária.",
  semProjeto: "Sem projeto",
  semData: "Sem data",
  diaria: "Diária",
  de: "de",
  abrir: "Abrir",
  excluir: "Excluir",
  confirmarExclusao: "Excluir esta ordem do dia?",

  documento: "Ordem do Dia",
  projetoLabel: "Projeto",
  clienteLabel: "Cliente",
  dataLabel: "Data da diária",
  diariaNumeroLabel: "Diária nº",
  diariaTotalLabel: "de",
  semCliente: "Sem cliente",

  chamadaLabel: "Chamada",
  chamadaHint: "Horário em que a equipe se apresenta",
  encerramentoLabel: "Encerramento",
  encerramentoHint: "Previsão de término da diária",

  climaTitulo: "Clima e luz do dia",
  climaBuscar: "Buscar previsão",
  climaBuscando: "Buscando...",
  climaVazio: "Preencha a data e o endereço da primeira locação para buscar a previsão.",
  climaChuva: "chuva",
  nascerDoSol: "Nascer do sol",
  porDoSol: "Pôr do sol",
  climaAtualizadoEm: "Consultado em",

  locacoesTitulo: "Locações",
  locacaoNome: "Nome do set",
  locacaoEndereco: "Endereço",
  locacaoNotas: "Observações (estacionamento, acesso, contato no local)",
  adicionarLocacao: "Adicionar locação",
  locacoesVazio: "Nenhuma locação — adicione ao menos uma para a equipe saber onde chegar.",

  cronogramaTitulo: "Cronograma",
  cronogramaHora: "Hora",
  cronogramaAtividade: "Atividade",
  cronogramaLocal: "Onde",
  adicionarLinha: "Adicionar etapa",
  cronogramaVazio: "Sem etapas — monte a linha do tempo do dia, da chegada ao encerramento.",

  equipeTitulo: "Equipe escalada",
  equipeFuncao: "Função",
  equipeNome: "Nome",
  equipeContato: "Contato",
  equipeChamada: "Chamada",
  adicionarPessoa: "Adicionar pessoa",
  adicionarDoCadastro: "Adicionar do cadastro",
  equipeVazio: "Ninguém escalado ainda.",

  observacoesTitulo: "Observações gerais",
  observacoesPlaceholder: "Alimentação, transporte, EPI, recomendações de figurino, o que mais a equipe precisa saber...",

  imprimir: "Imprimir / PDF",
  salvo: "Salvo",
  salvando: "Salvando...",
  rodapeImpressao: "Dúvidas no dia? Fale com a produção.",
};
