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
  emBreveTitulo: string;
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
  emBreveTitulo: "Saber, no meio do evento, o que ainda falta captar.",
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
