/**
 * Módulo de Produção & Tarefas (`app/admin/producao/`, `components/admin/producao/`)
 * — Kanban/Lista/Calendário de tarefas, checklist de subtarefas, entregas com
 * controle de versão/aprovação e o modal de configuração (Funcionários / Tipos
 * de Serviço).
 *
 * As chaves `status*`, `prioridade*` e `aprovacao*` traduzem os rótulos que,
 * em português, vêm de `STATUS_TAREFA_META` / `PRIORIDADE_TAREFA_META` /
 * `STATUS_APROVACAO_META` (`lib/utils/producao.ts`) — esse arquivo fica FORA
 * do escopo desta leva de tradução, então os componentes montam um mapa local
 * (chave do enum -> `dict.producao.xyz`) na hora de exibir o rótulo, mas
 * continuam usando o `tone` de `lib/utils/producao.ts` normalmente.
 */
export interface ProducaoDict {
  titulo: string;
  subtitulo: string;

  // Colunas do CSV exportado (`ExportMenuButton`, ver `app/admin/producao/page.tsx`).
  csvTitulo: string;
  csvStatus: string;
  csvResponsavel: string;
  csvCliente: string;
  csvPrioridade: string;
  csvDataEntrega: string;

  // Alternador de visão (`ProducaoWorkspace.tsx`).
  visaoKanban: string;
  visaoLista: string;
  visaoCalendario: string;
  configuracaoBotaoTitle: string;
  novaTarefa: string;

  // Kanban (`KanbanBoard.tsx`).
  kanbanLayoutLinha: string;
  kanbanLayoutGrade: string;
  nenhumaTarefaColuna: string;

  // Rótulos de status da tarefa (ordem de `STATUS_TAREFA_ORDEM`).
  statusBacklog: string;
  statusAFazer: string;
  statusEmProducao: string;
  statusRevisaoInterna: string;
  statusPreviewCliente: string;
  statusConcluida: string;

  // Rótulos de prioridade da tarefa.
  prioridadeBaixa: string;
  prioridadeNormal: string;
  prioridadeAlta: string;
  prioridadeUrgente: string;

  // Rótulos de aprovação de versão de entrega.
  aprovacaoPendente: string;
  aprovacaoAprovado: string;
  aprovacaoAlteracaoSolicitada: string;

  // Lista (`ListaTarefas.tsx`).
  buscarPlaceholder: string;
  prioridadeLabel: string;
  todasPrioridades: string;
  listaVazia: string;
  listaSemResultados: string;
  colTarefa: string;
  colCliente: string;
  colResponsavel: string;
  colPrazo: string;

  // Calendário (`CalendarioTarefas.tsx`).
  diasSemana: string[];
  mesAnterior: string;
  irParaHoje: string;
  proximoMes: string;
  maisTarefas: string;
  legendaAltaUrgente: string;
  legendaNormalBaixa: string;

  // Card do Kanban / prefixos de data (`TarefaCard.tsx`).
  subtarefas: string;
  captacaoPrefixo: string;
  atrasadaPrefixo: string;
  prazoPrefixo: string;
  tarefaAtrasada: string;

  // Formulário de tarefa (`TarefaModal.tsx` + `TarefaDetalheModal.tsx`).
  tituloCampoLabel: string;
  tituloPlaceholder: string;
  clienteLabel: string;
  clienteSemVinculo: string;
  tipoServicoLabel: string;
  responsavelLabel: string;
  responsavelSemVinculo: string;
  dataCaptacaoLabel: string;
  dataCaptacaoAjuda: string;
  prazoEntregaLabel: string;
  briefingLabel: string;
  briefingPlaceholder: string;
  criando: string;
  criarTarefa: string;

  // Modal de detalhe (`TarefaDetalheModal.tsx`).
  confirmarExclusaoTarefa: string;
  simExcluir: string;
  excluirTarefaBotao: string;
  salvo: string;

  // Checklist de subtarefas (`SubtarefasChecklist.tsx`).
  removerSubtarefaAria: string;
  subtarefaPlaceholder: string;
  adicionarAbrev: string;

  // Editor de texto rico (`RichTextEditor.tsx`).
  rtNegrito: string;
  rtItalico: string;
  rtSublinhado: string;
  rtListaNaoOrdenada: string;
  rtListaOrdenada: string;

  // Entregas & aprovação (`EntregasSection.tsx`).
  entregasTitulo: string;
  entregasVazia: string;
  entregaNomePlaceholder: string;
  novaEntregaBotao: string;
  excluirEntregaAria: string;
  excluirEntregaTitle: string;
  arquivoMuitoGrande: string;
  enviadoEmPrefixo: string;
  aprovar: string;
  motivoAlteracaoPlaceholder: string;
  solicitarAlteracao: string;
  nenhumArquivoEnviado: string;
  ocultarHistorico: string;
  verHistorico: string;
  historicoVersoesSufixo: string;
  enviarArquivoBotao: string;
  enviarLinkBotao: string;
  enviando: string;
  escolherArquivo: string;
  linkRotuloPlaceholder: string;
  enviarBotao: string;

  // Configurações de Produção (`ConfiguracaoProducaoModal.tsx`).
  configTitulo: string;
  funcionariosTitulo: string;
  funcionarioPlaceholder: string;
  tiposServicoTitulo: string;
  tipoServicoPlaceholder: string;
  gerenciar: string;
}

export const producao: ProducaoDict = {
  titulo: "Produção & Tarefas",
  subtitulo: "Board de produção, subtarefas e entregas com controle de versão e aprovação.",

  csvTitulo: "Título",
  csvStatus: "Status",
  csvResponsavel: "Responsável",
  csvCliente: "Cliente",
  csvPrioridade: "Prioridade",
  csvDataEntrega: "Data de Entrega",

  visaoKanban: "Kanban",
  visaoLista: "Lista",
  visaoCalendario: "Calendário",
  configuracaoBotaoTitle: "Funcionários e Tipos de Serviço",
  novaTarefa: "Nova Tarefa",

  kanbanLayoutLinha: "Colunas em linha (rola pro lado)",
  kanbanLayoutGrade: "Colunas em grade (sem rolar pro lado)",
  nenhumaTarefaColuna: "Nenhuma tarefa aqui",

  statusBacklog: "Backlog",
  statusAFazer: "A Fazer",
  statusEmProducao: "Em Produção",
  statusRevisaoInterna: "Revisão Interna",
  statusPreviewCliente: "Preview Cliente",
  statusConcluida: "Concluído",

  prioridadeBaixa: "Baixa",
  prioridadeNormal: "Normal",
  prioridadeAlta: "Alta",
  prioridadeUrgente: "Urgente",

  aprovacaoPendente: "Aguardando Revisão",
  aprovacaoAprovado: "Aprovado",
  aprovacaoAlteracaoSolicitada: "Alteração Solicitada",

  buscarPlaceholder: "Título, cliente, responsável...",
  prioridadeLabel: "Prioridade",
  todasPrioridades: "Todas",
  listaVazia: "Nenhuma tarefa cadastrada ainda.",
  listaSemResultados: "Nenhuma tarefa corresponde aos filtros atuais.",
  colTarefa: "Tarefa",
  colCliente: "Cliente",
  colResponsavel: "Responsável",
  colPrazo: "Prazo",

  diasSemana: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  mesAnterior: "Mês anterior",
  irParaHoje: "Hoje",
  proximoMes: "Próximo mês",
  maisTarefas: "+{n} mais",
  legendaAltaUrgente: "Alta/Urgente",
  legendaNormalBaixa: "Normal/Baixa",

  subtarefas: "Subtarefas",
  captacaoPrefixo: "Captação: ",
  atrasadaPrefixo: "Atrasada · ",
  prazoPrefixo: "Prazo: ",
  tarefaAtrasada: "Tarefa atrasada",

  tituloCampoLabel: "Título *",
  tituloPlaceholder: "Ex: Edição do vídeo institucional",
  clienteLabel: "Cliente",
  clienteSemVinculo: "Sem cliente vinculado",
  tipoServicoLabel: "Tipo de Serviço",
  responsavelLabel: "Responsável",
  responsavelSemVinculo: "Sem responsável",
  dataCaptacaoLabel: "Data de Captação",
  dataCaptacaoAjuda: "Dia da gravação/filmagem.",
  prazoEntregaLabel: "Prazo de Entrega",
  briefingLabel: "Briefing",
  briefingPlaceholder: "Detalhes completos da tarefa...",
  criando: "Criando...",
  criarTarefa: "Criar Tarefa",

  confirmarExclusaoTarefa: "Excluir esta tarefa?",
  simExcluir: "Sim, excluir",
  excluirTarefaBotao: "Excluir Tarefa",
  salvo: "Salvo",

  removerSubtarefaAria: "Remover subtarefa",
  subtarefaPlaceholder: "Ex: Decupagem",
  adicionarAbrev: "+ Add",

  rtNegrito: "B",
  rtItalico: "I",
  rtSublinhado: "S",
  rtListaNaoOrdenada: "• Lista",
  rtListaOrdenada: "1. Lista",

  entregasTitulo: "Entregas & Aprovação",
  entregasVazia: 'Nenhuma entrega criada ainda — crie um slot pra enviar arquivos ou links (ex: "Vídeo Final").',
  entregaNomePlaceholder: "Nome da entrega (ex: Vídeo Final)",
  novaEntregaBotao: "+ Nova Entrega",
  excluirEntregaAria: "Excluir entrega",
  excluirEntregaTitle: "Excluir entrega (todas as versões)",
  arquivoMuitoGrande: "Arquivo muito grande (máximo 50MB).",
  enviadoEmPrefixo: "Enviado em ",
  aprovar: "Aprovar",
  motivoAlteracaoPlaceholder: "O que precisa mudar?",
  solicitarAlteracao: "Solicitar Alteração",
  nenhumArquivoEnviado: "Nenhum arquivo/link enviado ainda.",
  ocultarHistorico: "Ocultar",
  verHistorico: "Ver",
  historicoVersoesSufixo: "histórico de versões",
  enviarArquivoBotao: "+ Enviar Arquivo",
  enviarLinkBotao: "+ Enviar Link",
  enviando: "Enviando...",
  escolherArquivo: "Escolher arquivo",
  linkRotuloPlaceholder: "Rótulo (ex: Preview Vimeo)",
  enviarBotao: "Enviar",

  configTitulo: "Configurações de Produção",
  funcionariosTitulo: "Funcionários (Responsável)",
  funcionarioPlaceholder: "Ex: Ana Paula",
  tiposServicoTitulo: "Tipos de Serviço",
  tipoServicoPlaceholder: "Ex: Edição de Vídeo",
  gerenciar: "Gerenciar",
};
