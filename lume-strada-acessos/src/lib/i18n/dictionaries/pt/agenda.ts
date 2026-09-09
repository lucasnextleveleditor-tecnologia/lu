/**
 * Módulo "Agenda" do admin (`/admin/agenda`) — calendário mensal com
 * compromissos manuais (tabela `compromissos`, CRUD completo + arrastar pra
 * reagendar) e itens auto-surfados, só leitura, de Produção (captação/
 * entrega) e Comercial (próximo contato) — ver `AgendaCalendario.tsx` e
 * `src/app/admin/agenda/data.ts`.
 */
export interface AgendaDict {
  tituloPagina: string;
  subtituloPagina: string;
  novoCompromissoBtn: string;
  filtrarPorCliente: string;
  semClienteFiltro: string;
  semClientesCadastradosAjuda: string;
  tipoCaptacao: string;
  tipoReuniao: string;
  tipoEntrega: string;
  tipoPagamento: string;
  statEventosMesLabel: string;
  hintEventosMes: string;
  statCompromissosManuaisLabel: string;
  hintCompromissosManuais: string;
  statAutoLabel: string;
  hintAuto: string;
  googleCalendarBtn: string;
  emBreve: string;
  googleCalendarTooltip: string;
  mesAnterior: string;
  proximoMes: string;
  hoje: string;
  diasSemana: string[];
  maisEventos: string;
  diaVazioTitle: string;
  origemAutoDica: string;
  nadaAgendado: string;
  modalTituloNovo: string;
  modalTituloEditar: string;
  campoTitulo: string;
  placeholderTitulo: string;
  campoTipo: string;
  campoData: string;
  campoHora: string;
  campoCliente: string;
  clienteSemVinculoOpcao: string;
  novoClienteInline: string;
  campoNotas: string;
  placeholderNotas: string;
  salvarBtn: string;
  salvando: string;
  cancelarBtn: string;
  excluirBtn: string;
  excluindo: string;
  erroTituloObrigatorio: string;
  erroDataObrigatoria: string;
  erroSalvar: string;
  erroExcluir: string;
}

export const agenda: AgendaDict = {
  tituloPagina: "Agenda",
  subtituloPagina: "Compromissos manuais e datas de Produção/Comercial, tudo num calendário só.",
  novoCompromissoBtn: "Novo Compromisso",
  filtrarPorCliente: "Filtrar por Cliente",
  semClienteFiltro: "Sem Cliente",
  semClientesCadastradosAjuda: "Cadastre clientes em Cadastros → Clientes pra colori-los aqui.",
  tipoCaptacao: "Captação",
  tipoReuniao: "Reunião",
  tipoEntrega: "Entrega",
  tipoPagamento: "Pagamento",
  statEventosMesLabel: "Eventos no Mês",
  hintEventosMes: "{n} evento(s) agendado(s) neste mês",
  statCompromissosManuaisLabel: "Compromissos Manuais",
  hintCompromissosManuais: "Cadastrados direto na Agenda",
  statAutoLabel: "Vindos de Produção & Comercial",
  hintAuto: "Captações, entregas e follow-ups automáticos",
  googleCalendarBtn: "Conectar Google Agenda",
  emBreve: "Em breve",
  googleCalendarTooltip: "Integração com o Google Agenda chegando em breve.",
  mesAnterior: "Mês anterior",
  proximoMes: "Próximo mês",
  hoje: "Hoje",
  diasSemana: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  maisEventos: "+{n} mais",
  diaVazioTitle: "Nada agendado — clique pra adicionar",
  origemAutoDica: "Itens tracejados vêm de Produção/Comercial — clique pra abrir o módulo de origem.",
  nadaAgendado: "Nada agendado pra esse dia.",
  modalTituloNovo: "Novo Compromisso",
  modalTituloEditar: "Editar Compromisso",
  campoTitulo: "Título",
  placeholderTitulo: "Ex: Reunião de alinhamento",
  campoTipo: "Tipo",
  campoData: "Data",
  campoHora: "Hora (opcional)",
  campoCliente: "Cliente (opcional)",
  clienteSemVinculoOpcao: "Sem cliente vinculado",
  novoClienteInline: "Novo Cliente",
  campoNotas: "Notas (opcional)",
  placeholderNotas: "Detalhes adicionais...",
  salvarBtn: "Salvar Compromisso",
  salvando: "Salvando...",
  cancelarBtn: "Cancelar",
  excluirBtn: "Excluir Compromisso",
  excluindo: "Excluindo...",
  erroTituloObrigatorio: "Informe o título do compromisso.",
  erroDataObrigatoria: "Informe a data do compromisso.",
  erroSalvar: "Não foi possível salvar. Tente de novo.",
  erroExcluir: "Não foi possível excluir. Tente de novo.",
};
