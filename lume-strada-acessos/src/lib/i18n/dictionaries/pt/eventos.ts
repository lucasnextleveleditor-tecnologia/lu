import type { StatusEvento } from "@/lib/types/eventos";

/**
 * Eventos — a operação de campo (ambientes simultâneos, programação, booms e
 * a pauta de captação).
 *
 * O módulo nasce em construção: quem não está na lista de acesso antecipado
 * (ver `lib/auth/acessoAntecipado.ts`) vê a página de "em breve", e é dela que
 * vem a maior parte destas chaves.
 */
export interface EventosDict {
  tituloPagina: string;
  subtituloPagina: string;
  emBreveEtiqueta: string;
  emBreveTituloA: string;
  emBreveTituloB: string;
  consoleRec: string;
  consoleTimecode: string;
  consoleAgora: string;
  numeroCaptado: string;
  numeroPendente: string;
  numeroPerdido: string;
  numeroAmbientes: string;

  // O modulo de verdade: lista, criacao e as fases da operacao.
  novoEvento: string;
  criarEvento: string;
  listaVazia: string;
  listaContagem: string;
  listaVaziaTitulo: string;
  listaVaziaTexto: string;
  semCliente: string;
  semPauta: string;
  numeroEquipe: string;
  numeroCobertura: string;
  campoNome: string;
  campoNomePlaceholder: string;
  campoCliente: string;
  campoLocal: string;
  campoLocalPlaceholder: string;
  campoInicio: string;
  campoFim: string;
  campoAmbientes: string;
  campoAmbientesAjuda: string;
  campoAmbientesPlaceholder: string;
  removerAmbienteDe: string;
  erroEventoSemNome: string;
  erroEventoSemData: string;
  erroEventoFimAntes: string;
  erroAmbienteSemNome: string;
  /** Rotulo de cada fase da operacao (ver StatusEvento em lib/types/eventos.ts). */
  status: Record<StatusEvento, string>;
  emBreveSubtitulo: string;
  emBrevePreviaTitulo: string;
  legendaCaptado: string;
  legendaPendente: string;
  legendaPerdido: string;
  emBreveRecursosTitulo: string;
  emBreveAmbientesTitulo: string;
  emBreveAmbientesTexto: string;
  emBreveProgramacaoTitulo: string;
  emBreveProgramacaoTexto: string;
  emBreveCoberturaTitulo: string;
  emBreveCoberturaTexto: string;
  emBreveAoVivoTitulo: string;
  emBreveAoVivoTexto: string;
  emBreveEquipeTitulo: string;
  emBreveEquipeTexto: string;
  emBreveEquipamentoTitulo: string;
  emBreveEquipamentoTexto: string;

  // A pagina de "em breve": as tres fases da operacao, o painel de pauta
  // e a equipe em campo. Conteudo de demonstracao continua no componente.
  fasesTitulo: string;
  faseAntesEtiqueta: string;
  faseAntesTitulo: string;
  faseAntesTexto: string;
  faseDuranteEtiqueta: string;
  faseDuranteTitulo: string;
  faseDuranteTexto: string;
  faseDepoisEtiqueta: string;
  faseDepoisTitulo: string;
  faseDepoisTexto: string;
  pautaTitulo: string;
  pautaSubtitulo: string;
  pautaJanelaTitulo: string;
  pautaFeedTitulo: string;
  pautaColunaJanela: string;
  pautaColunaOnde: string;
  equipeTitulo: string;
  equipeSubtitulo: string;
  equipeEmCampo: string;
  equipeDeslocando: string;
  equipeFora: string;
  emBrevePosTitulo: string;
  emBrevePosTexto: string;
  emBreveCustosTitulo: string;
  emBreveCustosTexto: string;

  // Parte 2 do modulo: os tres modos, a grade, o atraso em cascata e o log.
  modoPlano: string;
  modoPlanoQuando: string;
  modoAoVivo: string;
  modoAoVivoQuando: string;
  modoFechamento: string;
  modoFechamentoQuando: string;
  gradePlano: string;
  gradeAoVivo: string;
  gradeSemAmbientes: string;
  gradeCliqueParaCriar: string;
  ancoraEncadeado: string;
  ancoraCravado: string;
  ancoraEncadeadoAjuda: string;
  ancoraCravadoAjuda: string;
  tipoShow: string;
  tipoAtivacao: string;
  tipoBoom: string;
  tipoOperacao: string;
  darOPlay: string;
  darOPlayAjuda: string;
  encerrar: string;
  encerrarAjuda: string;
  logAtraso: string;
  logEmpurrado: string;
  logPlay: string;
  logPlayNaHora: string;
  logEncerrado: string;
  colisaoTitulo: string;
  colisaoSobreposicao: string;
  colisaoMesmaPessoa: string;
  colisaoOrdemTrocada: string;
  colisaoEmpurrarTambem: string;
  colisaoDeixarComoEsta: string;
  fusoRegiaoAmericaDoSul: string;
  fusoRegiaoAmericaDoNorte: string;
  fusoRegiaoEuropa: string;
  fusoLabel: string;
  fusoAjuda: string;
  erroBlocoSemTitulo: string;
  erroBlocoSemInicio: string;
  erroBlocoNaoEncontrado: string;
  erroEventoNaoEncontrado: string;
  erroOcorrenciaVazia: string;
  /** Titulos da pauta que nasce com o bloco (ver lib/eventos/pautaPadrao.ts). */
  pautaPadrao: Record<string, string>;
  blocoNovo: string;
  blocoEditar: string;
  blocoTitulo: string;
  blocoTituloPlaceholder: string;
  blocoTipo: string;
  blocoAncora: string;
  blocoQuando: string;
  blocoDuracao: string;
  blocoOnde: string;
  blocoSemAmbiente: string;
  blocoQuemCobre: string;
  blocoSemResponsavel: string;
  blocoQuemCobreAjuda: string;
  atrasouTitulo: string;
  atrasoAbrirBloco: string;
  eventoSemLocal: string;
  voltarParaEventos: string;
  eventoNaoComecou: string;
  balancoExiste: string;
  balancoNaoExiste: string;
  balancoConta: string;
  balancoDoisBotoes: string;
  balancoProximoEvento: string;
  balancoSemDestinatario: string;
  balancoVazio: string;
  balancoTudoCaptado: string;
  balancoPrevisto: string;
  balancoRealizado: string;
  balancoDiferenca: string;
  balancoAtraso: string;
  balancoPessoas: string;
  balancoHoras: string;
  motivoSemMotivo: string;
  motivoJanelaFechou: string;
  botaoCriarEntregas: string;
  botaoCriarEntregasAjuda: string;
  botaoLancarCustos: string;
  botaoLancarCustosAjuda: string;
  botaoSalvarTemplate: string;
  botaoSalvarTemplateAjuda: string;
  botaoJaFeito: string;
  entregasCriadas: string;
  custosLancados: string;
  templateSalvo: string;
  entregaBriefing: string;
  custoEquipe: string;
  templateSufixo: string;
  erroEntregasJaCriadas: string;
  erroCustosJaLancados: string;
  erroNadaParaEntregar: string;
  erroNadaParaLancar: string;
  celularOla: string;
  celularAgora: string;
  celularASeguir: string;
  celularPassou: string;
  celularFeito: string;
  celularNadaAgora: string;
  celularCaptei: string;
  celularNaoRolou: string;
  celularPular: string;
  celularDesfazer: string;
  celularObrigatorio: string;
  celularFoto: string;
  celularVideo: string;
  celularFotoEVideo: string;
  celularLinkInvalido: string;
  celularLinkInvalidoTexto: string;
  celularLinkExpirado: string;
  celularLinkExpiradoTexto: string;
  celularItemDeOutro: string;
  celularErroGenerico: string;
  equipeGavetaTitulo: string;
  equipeDoCadastro: string;
  equipeOuEscreva: string;
  equipeNome: string;
  equipeFuncao: string;
  equipeCache: string;
  equipeEscalar: string;
  equipeEscala: string;
  equipeVazia: string;
  equipeDaCasa: string;
  equipeCopiarLink: string;
  equipeLinkCopiado: string;
  equipeCopiarManual: string;
  equipeLinkAjuda: string;
  equipeChegou: string;
  equipeSaiu: string;
  equipeExtra: string;
  equipeErroSemNome: string;
  gavetaEquipe: string;
  gavetaKit: string;
  gavetaOcorrencia: string;
  kitTitulo: string;
  kitNaoVoltou: string;
  kitDoInventario: string;
  kitOuEscreva: string;
  kitNome: string;
  kitSemResponsavel: string;
  kitAdicionar: string;
  kitVazio: string;
  kitDoPatrimonio: string;
  kitSaiu: string;
  kitVoltou: string;
  ocorrenciaTitulo: string;
  ocorrenciaAjuda: string;
  ocorrenciaOutra: string;
  ocorrenciaRegistrar: string;
  ocorrenciaLog: string;
  ocorrenciaLogVazio: string;
  ocorrenciaAutorPainel: string;
  /** Os seis atalhos de dois toques da gaveta de Ocorrencia. */
  ocorrenciaAtalhos: Record<string, string>;
  /** Rotulo de cada tipo de linha do log (ver TipoOcorrencia). */
  ocorrenciaTipos: Record<string, string>;
  aoVivoFaltaAgora: string;
  aoVivoFaltaVazio: string;
  aoVivoPassouDaHora: string;
  aoVivoSemDono: string;
  aoVivoEmCampo: string;
  aoVivoNinguemEmCampo: string;
  aoVivoChegou: string;
  aoVivoNaoChegou: string;
  baseLabel: string;
  baseDoZero: string;
  baseModelo: string;
  baseAjuda: string;
  gavetaRealtime: string;
  realtimeTitulo: string;
  realtimeCorrendo: string;
  realtimeNovo: string;
  realtimePlaceholder: string;
  realtimeEditor: string;
  realtimeSemEditor: string;
  realtimePrazo: string;
  realtimeMin: string;
  realtimePedir: string;
  realtimeVazio: string;
  realtimeComecar: string;
  realtimeEntregar: string;
  realtimeParaProducao: string;
  realtimeCancelar: string;
  realtimeEstourou: string;
  realtimeNaProducao: string;
  realtimeLinkPlaceholder: string;
  /** Rotulo de cada estado do pedido (ver StatusRealtime). */
  realtimeStatus: Record<string, string>;
  gavetaAjustes: string;
  ajustesTitulo: string;
  ajustesAjuda: string;
  ajustesRodape: string;
  ajustesKit: string;
  ajustesKitAjuda: string;
  ajustesRealtime: string;
  ajustesRealtimeAjuda: string;
  ajustesPonto: string;
  ajustesPontoAjuda: string;
  ajustesCache: string;
  ajustesCacheAjuda: string;
  ajustesEntregas: string;
  ajustesEntregasAjuda: string;
  balancoNadaLigado: string;
  mapaTitulo: string;
  mapaAjuda: string;
  novoEventoAjuda: string;
  avancadoTitulo: string;
  prepTitulo: string;
  prepPronto: string;
  prepProntoAjuda: string;
  prepContagem: string;
  prepIrAoVivo: string;
  prepProximo: string;
  prepAmbientes: string;
  prepProgramacao: string;
  prepPauta: string;
  prepEquipe: string;
  prepKit: string;
  prepDicaAmbientes: string;
  prepDicaProgramacao: string;
  prepDicaPauta: string;
  prepDicaEquipe: string;
  prepDicaKit: string;
  prepAcaoEquipe: string;
  prepAcaoKit: string;
  duplicarUltimo: string;
  duplicarUltimoAjuda: string;
  emBreveRodape: string;
  emConstrucaoTitulo: string;
  emConstrucaoTexto: string;
}

export const eventos: EventosDict = {
  tituloPagina: "Eventos",
  subtituloPagina: "A operação de campo: ambientes, programação e a cobertura do que precisa ser captado.",
  emBreveEtiqueta: "Em breve",
  emBreveTituloA: "Saber, no meio do evento,",
  emBreveTituloB: "o que ainda falta captar.",
  consoleRec: "Gravando · módulo em construção",
  consoleTimecode: "TC 01:23:44:12",
  consoleAgora: "agora",
  numeroCaptado: "captado",
  numeroPendente: "pendente",
  numeroPerdido: "fora da janela",
  numeroAmbientes: "ambientes",
  novoEvento: "Novo evento",
  criarEvento: "Criar evento",
  listaVazia: "Nenhum evento",
  listaContagem: "{n} evento(s)",
  listaVaziaTitulo: "Nenhum evento cadastrado ainda.",
  listaVaziaTexto: "Crie o primeiro com os palcos que ele vai ter. A programação e a pauta de captação entram depois, dentro dele.",
  semCliente: "Sem cliente",
  semPauta: "sem pauta",
  numeroEquipe: "equipe",
  numeroCobertura: "cobertura",
  campoNome: "Nome do evento *",
  campoNomePlaceholder: "Festival de Verão 2026",
  campoCliente: "Cliente",
  campoLocal: "Local",
  campoLocalPlaceholder: "Arena da Praia",
  campoInicio: "Começa",
  campoFim: "Termina",
  campoAmbientes: "Palcos e ambientes",
  campoAmbientesAjuda: "Os lugares onde a equipe vai estar ao mesmo tempo. Dá para acrescentar depois.",
  campoAmbientesPlaceholder: "Palco 2, Lounge, Bastidores…",
  removerAmbienteDe: "Remover {ambiente}",
  erroEventoSemNome: "Dê um nome ao evento.",
  erroEventoSemData: "Informe quando o evento começa e termina.",
  erroEventoFimAntes: "O fim precisa ser depois do começo.",
  erroAmbienteSemNome: "Dê um nome ao ambiente.",
  status: {
    planejamento: "Planejamento",
    montagem: "Montagem",
    ao_vivo: "Ao vivo",
    pos: "Pós",
    encerrado: "Encerrado",
  },
  emBreveSubtitulo: "Três palcos ao mesmo tempo, a equipe espalhada, e a pergunta que não pode esperar o domingo: pegamos tudo? Este módulo responde isso enquanto o show ainda está acontecendo.",
  emBrevePreviaTitulo: "Grade de cobertura — prévia",
  legendaCaptado: "captado",
  legendaPendente: "pendente",
  legendaPerdido: "janela fechada",
  emBreveRecursosTitulo: "O que vem por aqui",
  emBreveAmbientesTitulo: "Ambientes simultâneos",
  emBreveAmbientesTexto: "Palco principal, palco 2, lounge, bastidores — cada um com a própria programação, todos na mesma tela.",
  emBreveProgramacaoTitulo: "Programação e booms",
  emBreveProgramacaoTexto: "A grade do evento, e os momentos de hora cravada: CO₂ à uma, pirotecnia às duas, confete no encerramento.",
  emBreveCoberturaTitulo: "Pauta de captação",
  emBreveCoberturaTexto: "A lista do que precisa existir: palco, público, drone, cada patrocinador, cada boom. Com foto, vídeo, ou os dois.",
  emBreveAoVivoTitulo: "Painel ao vivo",
  emBreveAoVivoTexto: "O que está pendente na janela que está passando agora — e o alerta quando ela está prestes a fechar.",
  emBreveEquipeTitulo: "Equipe com acesso temporário",
  emBreveEquipeTexto: "Cada pessoa recebe o próprio acesso, marca o que captou pelo celular, e o registro fica assinado. Expira no fim do evento.",
  emBreveEquipamentoTitulo: "Equipamento que sai e volta",
  emBreveEquipamentoTexto: "O que foi para o evento, com quem está e o que ainda não voltou — ligado ao inventário que você já mantém.",
  fasesTitulo: "Antes, durante e depois",
  faseAntesEtiqueta: "Antes",
  faseAntesTitulo: "Chegar com tudo decidido",
  faseAntesTexto: "Ambientes, programação, equipe escalada e a pauta de captação fechada. No dia, ninguém precisa perguntar o que é para fazer.",
  faseDuranteEtiqueta: "Durante",
  faseDuranteTitulo: "Enxergar o que falta, na hora",
  faseDuranteTexto: "A grade acende o que está pendente na janela que está correndo e avisa antes dela fechar. Cada pessoa marca do próprio celular.",
  faseDepoisEtiqueta: "Depois",
  faseDepoisTitulo: "Fechar sem depender da memória",
  faseDepoisTexto: "O que foi captado, por quem e a que horas — e o que não rolou, registrado. O material vai para a edição com a lista pronta.",
  pautaTitulo: "Pauta de captação — prévia",
  pautaSubtitulo: "A lista do que precisa existir quando o evento acabar. Cada linha tem lugar e hora.",
  pautaJanelaTitulo: "Na janela que está correndo",
  pautaFeedTitulo: "Últimas marcações",
  pautaColunaJanela: "janela",
  pautaColunaOnde: "onde",
  equipeTitulo: "Equipe em campo — prévia",
  equipeSubtitulo: "Quem está onde, agora. Cada pessoa entra com o próprio acesso e o que ela marca fica assinado.",
  equipeEmCampo: "em campo",
  equipeDeslocando: "deslocando",
  equipeFora: "fora",
  emBrevePosTitulo: "Fechamento e entrega",
  emBrevePosTexto: "No fim do evento, a lista do que existe e do que não existe — pronta para a edição, sem depender do que alguém lembrou.",
  emBreveCustosTitulo: "Custo da diária",
  emBreveCustosTexto: "Cachê de cada pessoa, extras do dia e o que sobrou — pronto para virar lançamento no Financeiro.",
  modoPlano: "Plano",
  modoPlanoQuando: "antes do evento",
  modoAoVivo: "Ao vivo",
  modoAoVivoQuando: "no dia",
  modoFechamento: "Fechamento",
  modoFechamentoQuando: "depois",
  gradePlano: "Grade · planejamento",
  gradeAoVivo: "Ao vivo · relógio correndo",
  gradeSemAmbientes: "Nenhum ambiente ainda. Crie o primeiro palco para a grade existir.",
  gradeCliqueParaCriar: "Clique num ponto vazio da faixa para criar um bloco ali — ou arraste para já desenhar a duração.",
  ancoraEncadeado: "Segue o anterior",
  ancoraCravado: "Hora cravada",
  ancoraEncadeadoAjuda: "Anda quando o bloco de cima atrasa. Só no mesmo ambiente.",
  ancoraCravadoAjuda: "Não se move nunca. Ativação contratada, virada da meia-noite, alvará de som, horário do artista.",
  tipoShow: "Show",
  tipoAtivacao: "Ativação",
  tipoBoom: "Boom",
  tipoOperacao: "Operação",
  darOPlay: "Dar o play",
  darOPlayAjuda: "Trava a grade e liga o relógio. O atraso da abertura entra em cascata.",
  encerrar: "Encerrar",
  encerrarAjuda: "A cobertura vira o balanço pronto.",
  logAtraso: "{bloco}: {minutos} min. {n} bloco(s) andaram junto.",
  logEmpurrado: "Empurrado junto: {blocos} ({minutos} min).",
  logPlay: "Play — o evento começou {minutos} min depois do marcado. A grade andou junto.",
  logPlayNaHora: "Play — o evento começou na hora marcada.",
  logEncerrado: "Evento encerrado.",
  colisaoTitulo: "O atraso criou conflito",
  colisaoSobreposicao: "{a} caiu em cima de {b}, no mesmo ambiente.",
  colisaoMesmaPessoa: "{a} caiu dentro de {b}, e a mesma pessoa está escalada nos dois.",
  colisaoOrdemTrocada: "{a} passou a acontecer antes de {b}.",
  colisaoEmpurrarTambem: "Empurrar também",
  colisaoDeixarComoEsta: "Deixar como está",
  fusoRegiaoAmericaDoSul: "América do Sul",
  fusoRegiaoAmericaDoNorte: "América do Norte",
  fusoRegiaoEuropa: "Europa",
  fusoLabel: "Fuso do evento",
  fusoAjuda: "Onde o evento acontece. Muda só como as horas são escritas — a linha AGORA é o relógio de verdade.",
  erroBlocoSemTitulo: "Dê um nome ao bloco.",
  erroBlocoSemInicio: "Informe quando o bloco começa.",
  erroBlocoNaoEncontrado: "Esse bloco não existe mais.",
  erroEventoNaoEncontrado: "Esse evento não existe mais.",
  erroOcorrenciaVazia: "Escreva o que aconteceu.",
  pautaPadrao: {
    planoGeralDoPalco: "Plano geral do palco",
    detalheDoArtista: "Detalhe do artista",
    publicoNaVirada: "Público na virada",
    bastidorDaBanda: "Bastidor da banda",
    marcaLegivel: "Marca legível na ativação",
    publicoInteragindo: "Público interagindo com a ativação",
    detalheDoProduto: "Detalhe do produto / brinde",
    oDisparo: "O disparo",
    reacaoDoPublico: "Reação do público",
    registroDaMontagem: "Registro da montagem",
  },
  blocoNovo: "Novo bloco",
  blocoEditar: "Bloco",
  blocoTitulo: "O que é",
  blocoTituloPlaceholder: "Show 1, Ativação da marca, CO₂…",
  blocoTipo: "Tipo",
  blocoAncora: "Este bloco anda se o anterior atrasar?",
  blocoQuando: "Começa",
  blocoDuracao: "dura",
  blocoOnde: "Ambiente",
  blocoSemAmbiente: "Sem ambiente",
  blocoQuemCobre: "Quem cobre",
  blocoSemResponsavel: "Ninguém ainda",
  blocoQuemCobreAjuda: "É o que permite o sistema avisar quando a mesma pessoa cai em dois blocos ao mesmo tempo.",
  atrasouTitulo: "Atrasou?",
  atrasoAbrirBloco: "Abrir bloco",
  eventoSemLocal: "Sem local",
  voltarParaEventos: "Voltar para Eventos",
  eventoNaoComecou: "O evento ainda não começou. A linha AGORA aparece quando você der o play.",
  balancoExiste: "Existe",
  balancoNaoExiste: "Não existe",
  balancoConta: "A conta",
  balancoDoisBotoes: "Dois botões",
  balancoProximoEvento: "E o próximo evento começa adiantado",
  balancoSemDestinatario: "Sem destinatário",
  balancoVazio: "Nada foi marcado como captado ainda.",
  balancoTudoCaptado: "Nada ficou para trás.",
  balancoPrevisto: "previsto",
  balancoRealizado: "realizado",
  balancoDiferenca: "extras do dia",
  balancoAtraso: "atraso do evento",
  balancoPessoas: "{n} na escala",
  balancoHoras: "{n} h de ponto",
  motivoSemMotivo: "Marcado como não rolou, sem motivo escrito.",
  motivoJanelaFechou: "A janela fechou sem ninguém marcar.",
  botaoCriarEntregas: "Criar as entregas",
  botaoCriarEntregasAjuda: "Cada destinatário vira uma tarefa, com a lista do que existe no briefing.",
  botaoLancarCustos: "Lançar os custos",
  botaoLancarCustosAjuda: "Cachês e extras do evento viram uma despesa, com vencimento no dia.",
  botaoSalvarTemplate: "Salvar como template",
  botaoSalvarTemplateAjuda: "Ambientes e programação prontos para o próximo. Pauta marcada, equipe e ponto não vão junto.",
  botaoJaFeito: "Já feito. Este botão não roda duas vezes.",
  entregasCriadas: "{n} entrega(s) criada(s) na Produção.",
  custosLancados: "Custos lançados no Financeiro.",
  templateSalvo: "Template salvo. Ele aparece na hora de criar o próximo evento.",
  entregaBriefing: "Material captado neste evento:",
  custoEquipe: "equipe",
  templateSufixo: "modelo",
  erroEntregasJaCriadas: "As entregas deste evento já foram criadas.",
  erroCustosJaLancados: "Os custos deste evento já foram lançados.",
  erroNadaParaEntregar: "Nada foi marcado como captado — não há o que entregar.",
  erroNadaParaLancar: "Ninguém na escala tem cachê lançado.",
  celularOla: "Olá, {nome}",
  celularAgora: "Agora",
  celularASeguir: "A seguir",
  celularPassou: "Passou da hora",
  celularFeito: "Feito",
  celularNadaAgora: "Nada agora. Fica de olho.",
  celularCaptei: "Captei",
  celularNaoRolou: "Não rolou",
  celularPular: "Pular",
  celularDesfazer: "Desfazer",
  celularObrigatorio: "Obrigatório",
  celularFoto: "foto",
  celularVideo: "vídeo",
  celularFotoEVideo: "foto e vídeo",
  celularLinkInvalido: "Link inválido",
  celularLinkInvalidoTexto: "Esse endereço não corresponde a nenhuma escala. Peça o link de novo para quem te chamou.",
  celularLinkExpirado: "Link encerrado",
  celularLinkExpiradoTexto: "O evento acabou ou o seu acesso foi desligado. Nada do que você marcou se perdeu.",
  celularItemDeOutro: "Esse item é de outra pessoa da equipe.",
  celularErroGenerico: "Não deu para marcar agora. Tenta de novo.",
  equipeGavetaTitulo: "Equipe do evento",
  equipeDoCadastro: "Puxar do cadastro da casa",
  equipeOuEscreva: "— ou escreva o nome abaixo —",
  equipeNome: "Nome",
  equipeFuncao: "Função",
  equipeCache: "Cachê do dia",
  equipeEscalar: "Escalar",
  equipeEscala: "Na escala",
  equipeVazia: "Ninguém escalado ainda.",
  equipeDaCasa: "do cadastro",
  equipeCopiarLink: "Copiar link",
  equipeLinkCopiado: "Copiado",
  equipeCopiarManual: "Copie o link e mande para a pessoa:",
  equipeLinkAjuda: "O link é pessoal e expira 12 h depois do fim do evento. É ele que faz o \"captei\" ficar assinado com um nome.",
  equipeChegou: "Chegou",
  equipeSaiu: "Saiu",
  equipeExtra: "Extra",
  equipeErroSemNome: "Escolha alguém do cadastro ou escreva um nome.",
  gavetaEquipe: "Equipe",
  gavetaKit: "Kit",
  gavetaOcorrencia: "Ocorrência",
  kitTitulo: "Kit do evento",
  kitNaoVoltou: "saíram e não voltaram",
  kitDoInventario: "Puxar do Inventário",
  kitOuEscreva: "— ou escreva o item abaixo —",
  kitNome: "O que é",
  kitSemResponsavel: "Sem responsável",
  kitAdicionar: "Adicionar",
  kitVazio: "Nada no kit ainda.",
  kitDoPatrimonio: "do patrimônio",
  kitSaiu: "Saiu",
  kitVoltou: "Voltou",
  ocorrenciaTitulo: "Ocorrência",
  ocorrenciaAjuda: "Toque no que aconteceu. Fica no log com hora e autor — é o que transforma \"o show atrasou\" em \"o som chegou 21h40\".",
  ocorrenciaOutra: "Outra coisa…",
  ocorrenciaRegistrar: "Registrar",
  ocorrenciaLog: "O que aconteceu neste evento",
  ocorrenciaLogVazio: "Nada registrado ainda.",
  ocorrenciaAutorPainel: "painel",
  ocorrenciaAtalhos: {
    chuva: "Choveu",
    artistaAtrasado: "Artista atrasado",
    equipamento: "Equipamento com problema",
    acessoNegado: "Acesso negado",
    publico: "Público acima do previsto",
    producao: "Mudança da produção",
  },
  ocorrenciaTipos: {
    atraso: "atraso",
    ocorrencia: "ocorrência",
    status: "status",
    captura: "captação",
    entrega: "entrega",
  },
  aoVivoFaltaAgora: "Falta captar agora",
  aoVivoFaltaVazio: "Nada pendente nesta janela. Respira.",
  aoVivoPassouDaHora: "passou da hora",
  aoVivoSemDono: "sem dono",
  aoVivoEmCampo: "Quem está em campo",
  aoVivoNinguemEmCampo: "Ninguém escalado ainda.",
  aoVivoChegou: "chegou",
  aoVivoNaoChegou: "não bateu ponto",
  baseLabel: "Começar de",
  baseDoZero: "Do zero",
  baseModelo: "modelo",
  baseAjuda: "Ambientes e programação vêm prontos, com os horários deslocados para a data nova. Pauta marcada, equipe e kit não vêm.",
  gavetaRealtime: "Realtime",
  realtimeTitulo: "Entrega realtime",
  realtimeCorrendo: "com o prazo correndo",
  realtimeNovo: "Novo pedido",
  realtimePlaceholder: "Ex.: teaser de 15s da abertura",
  realtimeEditor: "Quem edita",
  realtimeSemEditor: "Sem editor",
  realtimePrazo: "Prazo",
  realtimeMin: "min",
  realtimePedir: "Pedir",
  realtimeVazio: "Nenhum pedido ainda.",
  realtimeComecar: "Começou",
  realtimeEntregar: "Entregue",
  realtimeParaProducao: "→ Produção",
  realtimeCancelar: "Cancelar",
  realtimeEstourou: "estourou",
  realtimeNaProducao: "na Produção",
  realtimeLinkPlaceholder: "Link (opcional)",
  realtimeStatus: {
    pedido: "pedido",
    editando: "editando",
    entregue: "entregue",
    cancelado: "cancelado",
  },
  gavetaAjustes: "Ajustes",
  ajustesTitulo: "O que este evento usa",
  ajustesAjuda: "Tudo começa desligado. Ligue só o que este evento precisa — o resto nem aparece na tela.",
  ajustesRodape: "Desligar nunca apaga nada. O que já foi preenchido continua no banco e volta inteiro se a chave voltar.",
  ajustesKit: "Kit",
  ajustesKitAjuda: "A lista do que saiu e do que voltou. O número que ela mostra é quantos itens não voltaram.",
  ajustesRealtime: "Entrega realtime",
  ajustesRealtimeAjuda: "A fila de corte na hora: pedido, editor e o prazo correndo na tela.",
  ajustesPonto: "Ponto da equipe",
  ajustesPontoAjuda: "Chegou e saiu em um toque, e as bolinhas de quem está em campo no Ao Vivo.",
  ajustesCache: "Cachê e extras",
  ajustesCacheAjuda: "O dinheiro por pessoa, e o botão do Fechamento que leva isso para o Financeiro.",
  ajustesEntregas: "Entregas na Produção",
  ajustesEntregasAjuda: "No Fechamento, transforma o que foi captado em tarefa no quadro da Produção.",
  balancoNadaLigado: "Nenhuma saída ligada para este evento. Ligue entregas ou cachê nos Ajustes se quiser que o fechamento alimente a Produção ou o Financeiro.",
  mapaTitulo: "O que tem lá dentro",
  mapaAjuda: "Três modos, a mesma grade — a tela troca de pergunta, não de lugar. As gavetas abrem em qualquer um deles.",
  novoEventoAjuda: "O nome e os palcos bastam. O resto entra depois, dentro do evento.",
  avancadoTitulo: "Fuso e modelo",
  prepTitulo: "Preparação",
  prepPronto: "Pronto para o dia",
  prepProntoAjuda: "Palcos, programação, pauta e equipe estão de pé. O que vem agora é o evento.",
  prepContagem: "{feitos} de {total}",
  prepIrAoVivo: "Ir para o Ao vivo",
  prepProximo: "Próximo passo",
  prepAmbientes: "Palcos",
  prepProgramacao: "Programação",
  prepPauta: "Pauta",
  prepEquipe: "Equipe",
  prepKit: "Kit",
  prepDicaAmbientes: "Abra os Ajustes do evento e acrescente os palcos onde a equipe vai estar.",
  prepDicaProgramacao: "Arraste na faixa de um palco para desenhar o primeiro bloco — show, ativação ou boom.",
  prepDicaPauta: "Abra um bloco da grade e marque o que precisa ser captado nele.",
  prepDicaEquipe: "Escale quem vai estar em campo. Cada pessoa recebe um link próprio para o celular.",
  prepDicaKit: "Liste o equipamento que sai com a equipe — é assim que se sabe o que não voltou.",
  prepAcaoEquipe: "Escalar equipe",
  prepAcaoKit: "Montar o kit",
  duplicarUltimo: "Duplicar o último",
  duplicarUltimoAjuda: "Nasce com os palcos, a pauta e a escala do anterior. Você troca a data e o nome.",
  emBreveRodape: "Esta área ainda está em construção. Nada aqui é editável por enquanto.",
  emConstrucaoTitulo: "Módulo em construção — você está vendo a versão de trabalho.",
  emConstrucaoTexto: "As demais contas veem a página de \"em breve\" no lugar desta. Cada pedaço pronto aparece aqui primeiro.",
};
