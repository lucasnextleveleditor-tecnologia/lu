/**
 * Módulo Orçamentos (`/admin/orcamentos`) — catálogo de serviços por
 * categoria (Marketing, Captação Audiovisual, Edição de Vídeos...),
 * construtor de proposta e o link público (`/orcamento/[token]`, sem
 * login) onde o cliente vê, personaliza itens opcionais e aprova/recusa.
 * Chaves com `{placeholder}` são preenchidas via `.replace()` no
 * componente — mesmo padrão do `financeiro.ts`.
 */
export interface OrcamentosDict {
  // Geral
  tituloPagina: string;
  subtituloPagina: string;
  novoOrcamentoBtn: string;
  catalogoBtn: string;
  voltarParaOrcamentos: string;

  // StatTiles
  statEmAberto: string;
  hintOrcamentosAbertos: string;
  statAprovadoMes: string;
  hintAprovadosDescricao: string;
  statTaxaAprovacao: string;
  hintTaxaAprovacaoDescricao: string;

  // Lista
  buscarPlaceholder: string;
  filtroStatusTodos: string;
  colTitulo: string;
  colDestinatario: string;
  colStatus: string;
  colValidade: string;
  colTotal: string;
  listaVaziaTitulo: string;
  listaVaziaDescricao: string;

  // Status
  statusRascunho: string;
  statusEnviado: string;
  statusVisualizado: string;
  statusAprovado: string;
  statusRecusado: string;
  statusExpirado: string;

  // Ações da lista/detalhe
  editarBtn: string;
  duplicarBtn: string;
  enviarBtn: string;
  reenviarBtn: string;
  copiarLinkBtn: string;
  linkCopiadoMsg: string;
  imprimirBtn: string;
  baixarPdfBtn: string;
  marcarAprovadoBtn: string;
  marcarRecusadoBtn: string;
  voltarParaRascunhoBtn: string;
  confirmarRemoverOrcamento: string;

  // Categorias (catálogo)
  categoriasTitulo: string;
  novaCategoriaBtn: string;
  editarCategoriaTitulo: string;
  novaCategoriaTitulo: string;
  nomeCategoriaLabel: string;
  placeholderNomeCategoria: string;
  emojiLabel: string;
  placeholderEmoji: string;
  confirmarRemoverCategoria: string;
  semCategoriaLabel: string;

  // Serviços (catálogo)
  servicosTitulo: string;
  novoServicoBtn: string;
  editarServicoTitulo: string;
  novoServicoTitulo: string;
  nomeServicoLabel: string;
  placeholderNomeServico: string;
  descricaoOpcionalLabel: string;
  placeholderDescricaoServico: string;
  categoriaLabel: string;
  valorPadraoLabel: string;
  unidadeLabel: string;
  unidadeUnico: string;
  unidadeHora: string;
  unidadeDia: string;
  unidadeMes: string;
  unidadePacote: string;
  servicoInativoBadge: string;
  ativarServicoBtn: string;
  desativarServicoBtn: string;
  confirmarRemoverServico: string;
  catalogoVazioTitulo: string;
  catalogoVazioDescricao: string;

  // Construtor de orçamento
  dadosDoOrcamentoTitulo: string;
  tituloOrcamentoLabel: string;
  placeholderTituloOrcamento: string;
  clienteExistenteLabel: string;
  clienteNenhum: string;
  nomeDestinatarioLabel: string;
  placeholderNomeDestinatario: string;
  emailDestinatarioLabel: string;
  whatsappDestinatarioLabel: string;
  validadeDiasLabel: string;
  hintValidadeDias: string;
  condicoesPagamentoLabel: string;
  placeholderCondicoesPagamento: string;
  observacoesLabel: string;
  placeholderObservacoesOrcamento: string;
  descontoLabel: string;
  descontoTipoNenhum: string;
  descontoTipoPercentual: string;
  descontoTipoFixo: string;

  escolhaCategoriaTitulo: string;
  buscarServicoPlaceholder: string;
  adicionarItemBtn: string;
  itensDoOrcamentoTitulo: string;
  itensVazioDescricao: string;
  quantidadeLabel: string;
  valorUnitarioLabel: string;
  itemOpcionalLabel: string;
  hintItemOpcional: string;
  removerItemBtn: string;
  itemPersonalizadoBtn: string;
  itemPersonalizadoTitulo: string;

  subtotalLabel: string;
  totalLabel: string;
  salvarRascunhoBtn: string;
  salvarEEnviarBtn: string;

  // Página pública
  propostaComercialTitulo: string;
  validoAte: string;
  expiradoAvisoTitulo: string;
  expiradoAvisoDescricao: string;
  aprovadoAvisoTitulo: string;
  aprovadoAvisoDescricao: string;
  recusadoAvisoTitulo: string;
  itensInclusosTitulo: string;
  itensOpcionaisTitulo: string;
  hintItensOpcionaisPublico: string;
  condicoesDePagamentoTitulo: string;
  observacoesTitulo: string;

  aprovarOrcamentoBtn: string;
  recusarOrcamentoBtn: string;
  confirmarAprovacaoTitulo: string;
  confirmarAprovacaoDescricao: string;
  seuNomeLabel: string;
  placeholderSeuNome: string;
  confirmarAprovacaoBtn: string;
  confirmarRecusaTitulo: string;
  motivoRecusaOpcionalLabel: string;
  placeholderMotivoRecusa: string;
  confirmarRecusaBtn: string;

  rodapePublico: string;
  linkInvalidoTitulo: string;
  linkInvalidoDescricao: string;
}

export const orcamentos: OrcamentosDict = {
  tituloPagina: "Orçamentos",
  subtituloPagina: "Monte propostas comerciais a partir do seu catálogo de serviços e acompanhe o funil de aprovação.",
  novoOrcamentoBtn: "Novo Orçamento",
  catalogoBtn: "Catálogo de Serviços",
  voltarParaOrcamentos: "Voltar pros Orçamentos",

  statEmAberto: "Em Aberto",
  hintOrcamentosAbertos: "{n} orçamento(s) enviado(s) aguardando resposta",
  statAprovadoMes: "Aprovado no Mês",
  hintAprovadosDescricao: "Soma dos orçamentos aprovados este mês",
  statTaxaAprovacao: "Taxa de Aprovação",
  hintTaxaAprovacaoDescricao: "Entre os orçamentos já decididos (aprovados ou recusados)",

  buscarPlaceholder: "Buscar por título ou destinatário...",
  filtroStatusTodos: "Todos os status",
  colTitulo: "Título",
  colDestinatario: "Destinatário",
  colStatus: "Status",
  colValidade: "Validade",
  colTotal: "Total",
  listaVaziaTitulo: "Nenhum orçamento criado ainda.",
  listaVaziaDescricao: "Monte sua primeira proposta a partir do catálogo de serviços — categorize por Marketing, Captação, Edição e o que mais fizer sentido pra sua produtora.",

  statusRascunho: "Rascunho",
  statusEnviado: "Enviado",
  statusVisualizado: "Visualizado",
  statusAprovado: "Aprovado",
  statusRecusado: "Recusado",
  statusExpirado: "Expirado",

  editarBtn: "Editar",
  duplicarBtn: "Duplicar",
  enviarBtn: "Enviar pro Cliente",
  reenviarBtn: "Reenviar",
  copiarLinkBtn: "Copiar Link",
  linkCopiadoMsg: "Link copiado!",
  imprimirBtn: "Imprimir",
  baixarPdfBtn: "Baixar PDF",
  marcarAprovadoBtn: "Marcar como Aprovado",
  marcarRecusadoBtn: "Marcar como Recusado",
  voltarParaRascunhoBtn: "Voltar pra Rascunho",
  confirmarRemoverOrcamento: "Excluir este orçamento? Essa ação não pode ser desfeita.",

  categoriasTitulo: "Categorias",
  novaCategoriaBtn: "Nova Categoria",
  editarCategoriaTitulo: "Editar Categoria",
  novaCategoriaTitulo: "Nova Categoria",
  nomeCategoriaLabel: "Nome",
  placeholderNomeCategoria: "Ex: Motion Graphics & Animação",
  emojiLabel: "Ícone (emoji)",
  placeholderEmoji: "🎬",
  confirmarRemoverCategoria: "Excluir esta categoria? Os serviços dela ficam sem categoria, sem serem apagados.",
  semCategoriaLabel: "Sem categoria",

  servicosTitulo: "Serviços",
  novoServicoBtn: "Novo Serviço",
  editarServicoTitulo: "Editar Serviço",
  novoServicoTitulo: "Novo Serviço",
  nomeServicoLabel: "Nome do serviço",
  placeholderNomeServico: "Ex: Edição de vídeo institucional",
  descricaoOpcionalLabel: "Descrição (opcional)",
  placeholderDescricaoServico: "O que está incluso, prazos, entregáveis...",
  categoriaLabel: "Categoria",
  valorPadraoLabel: "Valor padrão",
  unidadeLabel: "Unidade",
  unidadeUnico: "Valor único",
  unidadeHora: "Por hora",
  unidadeDia: "Por diária",
  unidadeMes: "Por mês",
  unidadePacote: "Por pacote",
  servicoInativoBadge: "Inativo",
  ativarServicoBtn: "Ativar",
  desativarServicoBtn: "Desativar",
  confirmarRemoverServico: "Excluir este serviço do catálogo?",
  catalogoVazioTitulo: "Nenhum serviço cadastrado ainda.",
  catalogoVazioDescricao: "Cadastre os serviços da sua produtora com valor padrão — eles aparecem no painel de seleção ao montar um orçamento novo.",

  dadosDoOrcamentoTitulo: "Dados do Orçamento",
  tituloOrcamentoLabel: "Título da proposta",
  placeholderTituloOrcamento: "Ex: Vídeo Institucional — Empresa XYZ",
  clienteExistenteLabel: "Cliente já cadastrado (opcional)",
  clienteNenhum: "Nenhum — proposta avulsa",
  nomeDestinatarioLabel: "Nome do destinatário",
  placeholderNomeDestinatario: "Pra quem é essa proposta?",
  emailDestinatarioLabel: "E-mail",
  whatsappDestinatarioLabel: "WhatsApp",
  validadeDiasLabel: "Validade (dias)",
  hintValidadeDias: "A contar da data de envio — depois disso o link expira automaticamente.",
  condicoesPagamentoLabel: "Condições de pagamento",
  placeholderCondicoesPagamento: "Ex: 50% na aprovação, 50% na entrega",
  observacoesLabel: "Observações / termos",
  placeholderObservacoesOrcamento: "Qualquer informação adicional que deva aparecer na proposta",
  descontoLabel: "Desconto",
  descontoTipoNenhum: "Sem desconto",
  descontoTipoPercentual: "Percentual (%)",
  descontoTipoFixo: "Valor fixo (R$)",

  escolhaCategoriaTitulo: "Escolha o tipo de serviço",
  buscarServicoPlaceholder: "Buscar serviço no catálogo...",
  adicionarItemBtn: "Adicionar",
  itensDoOrcamentoTitulo: "Itens do Orçamento",
  itensVazioDescricao: "Nenhum item adicionado ainda — escolha uma categoria acima e adicione serviços do catálogo.",
  quantidadeLabel: "Qtd.",
  valorUnitarioLabel: "Valor unitário",
  itemOpcionalLabel: "Item opcional (o cliente pode marcar/desmarcar)",
  hintItemOpcional: "Itens opcionais aparecem como um adicional que o próprio cliente decide incluir ou não na proposta.",
  removerItemBtn: "Remover",
  itemPersonalizadoBtn: "Item personalizado",
  itemPersonalizadoTitulo: "Adicionar item personalizado",

  subtotalLabel: "Subtotal",
  totalLabel: "Total",
  salvarRascunhoBtn: "Salvar Rascunho",
  salvarEEnviarBtn: "Salvar e Enviar",

  propostaComercialTitulo: "Proposta Comercial",
  validoAte: "Válido até {data}",
  expiradoAvisoTitulo: "Esta proposta expirou",
  expiradoAvisoDescricao: "O prazo de validade passou — entre em contato pra pedir uma proposta atualizada.",
  aprovadoAvisoTitulo: "Proposta aprovada",
  aprovadoAvisoDescricao: "Aprovada por {nome} em {data}. Em breve entraremos em contato pra dar sequência.",
  recusadoAvisoTitulo: "Proposta recusada",
  itensInclusosTitulo: "Itens Inclusos",
  itensOpcionaisTitulo: "Itens Opcionais",
  hintItensOpcionaisPublico: "Marque os itens adicionais que você quer incluir na proposta — o total é atualizado na hora.",
  condicoesDePagamentoTitulo: "Condições de Pagamento",
  observacoesTitulo: "Observações",

  aprovarOrcamentoBtn: "Aprovar Orçamento",
  recusarOrcamentoBtn: "Recusar",
  confirmarAprovacaoTitulo: "Confirmar aprovação",
  confirmarAprovacaoDescricao: "Ao confirmar, você aprova esta proposta nos termos e valores apresentados.",
  seuNomeLabel: "Seu nome",
  placeholderSeuNome: "Digite seu nome completo",
  confirmarAprovacaoBtn: "Confirmar Aprovação",
  confirmarRecusaTitulo: "Recusar proposta",
  motivoRecusaOpcionalLabel: "Motivo (opcional)",
  placeholderMotivoRecusa: "Conta pra gente o que pesou na decisão, se quiser",
  confirmarRecusaBtn: "Confirmar Recusa",

  rodapePublico: "Proposta gerada por {empresa}.",
  linkInvalidoTitulo: "Link não encontrado",
  linkInvalidoDescricao: "Este link de orçamento não existe ou foi removido.",
};
