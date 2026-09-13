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
  gradeCliqueParaCriar: "Clique em qualquer ponto vazio da faixa para criar um bloco ali.",
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
  emBreveRodape: "Esta área ainda está em construção. Nada aqui é editável por enquanto.",
  emConstrucaoTitulo: "Módulo em construção — você está vendo a versão de trabalho.",
  emConstrucaoTexto: "As demais contas veem a página de \"em breve\" no lugar desta. Cada pedaço pronto aparece aqui primeiro.",
};
