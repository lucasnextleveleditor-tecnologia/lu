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
  emBreveRodape: "Esta área ainda está em construção. Nada aqui é editável por enquanto.",
  emConstrucaoTitulo: "Módulo em construção — você está vendo a versão de trabalho.",
  emConstrucaoTexto: "As demais contas veem a página de \"em breve\" no lugar desta. Cada pedaço pronto aparece aqui primeiro.",
};
