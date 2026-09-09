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
  calculadoraBtn: string;
  contratosBtn: string;
  voltarParaOrcamentos: string;

  // Hub Comercial unificado (`/admin/comercial`, ver `ComercialHubTabs.tsx`)
  // — junta Leads (módulo "comercial") com Funil/Calculadora/Propostas
  // (módulo "orcamentos") numa tela só, com abas no lugar de dois destinos
  // separados no menu lateral.
  hubTitulo: string;
  hubSubtitulo: string;
  abaLeadsLabel: string;
  abaFunilLabel: string;
  abaCalculadoraLabel: string;
  abaPropostasLabel: string;
  configuracoesBtn: string;

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
  visaoFunil: string;
  visaoLista: string;
  funilColunaAutomatica: string;
  funilColunaVazia: string;
  funilColunaSomenteLeitura: string;

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
  gerarContratoBtn: string;
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
  custoPadraoLabel: string;
  custoPadraoHint: string;
  margemAbreviada: string;
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
  tipoDeOrcamentoLabel: string;
  usarItensDoModeloBtn: string;
  tipoServicoLabel: string;
  tipoServicoVazio: string;
  tipoServicoHint: string;
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

  // Proposta (texto de proposta + objetivos — Parte A do PDF profissional)
  propostaTitulo: string;
  propostaSubtitulo: string;
  textoPropostaLabel: string;
  placeholderTextoProposta: string;
  objetivosLabel: string;
  placeholderObjetivos: string;

  escolhaCategoriaTitulo: string;
  buscarServicoPlaceholder: string;
  adicionarItemBtn: string;
  itensDoOrcamentoTitulo: string;
  previewAoVivoTitulo: string;
  itensVazioDescricao: string;
  quantidadeLabel: string;
  valorUnitarioLabel: string;
  itemOpcionalLabel: string;
  hintItemOpcional: string;
  removerItemBtn: string;
  itemPersonalizadoBtn: string;
  itemPersonalizadoTitulo: string;
  portfolioAnexarTitulo: string;
  portfolioAnexarHint: string;

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
  nossosTrabalhosTitulo: string;
  propostaSecaoTitulo: string;
  objetivosSecaoTitulo: string;
  quemSomosTitulo: string;
  empresasAtendidasTitulo: string;
  ctaDecisaoTitulo: string;
  ctaDecisaoDescricao: string;

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

  // Portfólio + Marca da agência (Fase 1 do sistema guiado de Orçamentos/Contratos)
  portfolioBtn: string;
  portfolioTitulo: string;
  portfolioSubtitulo: string;
  portfolioAdicionarBtn: string;
  portfolioEnviando: string;
  portfolioVazioTitulo: string;
  portfolioVazioDescricao: string;
  portfolioEditarTitulo: string;
  portfolioTituloLabel: string;
  placeholderPortfolioTitulo: string;
  portfolioCategoriaLabel: string;
  portfolioCategoriaNenhuma: string;
  categoriasProfissao: Record<
    "filmmaker" | "videomaker" | "social_media" | "storymaker" | "designer" | "fotografo" | "agencia_marketing",
    string
  >;

  marcaAgenciaTitulo: string;
  marcaAgenciaSubtitulo: string;
  marcaLogoLabel: string;
  marcaLogoHint: string;
  marcaBannerLabel: string;
  marcaBannerHint: string;
  marcaRodapeLabel: string;
  marcaRodapeHint: string;
  marcaLogoEspecificacoes: string;
  marcaBannerEspecificacoes: string;
  marcaRodapeEspecificacoes: string;
  marcaApresentacaoResumoConfigurada: string;
  marcaApresentacaoResumoVazia: string;
  marcaApresentacaoRecolherBtn: string;
  marcaApresentacaoAvisoPadrao: string;
  portfolioGerenciarBtn: string;
  portfolioMarcaMovidaAviso: string;

  // Tipos de Orçamento / Modelos por profissão (Fase 2)
  tiposBtn: string;
  tiposSubtitulo: string;
  tiposItensTitulo: string;
  tiposItensVazio: string;
  tiposSalvarBtn: string;
  tiposSalvoMsg: string;

  // Institucional (capa do PDF profissional — Parte A)
  institucionalTitulo: string;
  institucionalSubtitulo: string;
  institucionalTextoLabel: string;
  institucionalTextoPlaceholder: string;
  institucionalTextoHint: string;
  institucionalClientesLabel: string;
  institucionalClientesPlaceholder: string;
  institucionalClientesHint: string;
  institucionalEncerramentoLabel: string;
  institucionalEncerramentoPlaceholder: string;
  institucionalEncerramentoHint: string;
  institucionalSalvarBtn: string;
  institucionalSalvoMsg: string;

  // Hub Orçamento + Contrato (Parte C — trava de fluxo)
  abaOrcamentoLabel: string;
  abaContratoLabel: string;
  abaContratoBloqueadaHint: string;

  // Calculadora de Margem
  calculadoraTitulo: string;
  calculadoraSubtitulo: string;
  calcStatSubtotalVenda: string;
  calcStatCustoTotal: string;
  calcStatLucro: string;
  calcStatMargem: string;
  calcAdicionarItensTitulo: string;
  calcItensTitulo: string;
  calcItensVazio: string;
  calcColVendaUnit: string;
  calcColCustoUnit: string;
  calcItemNomeLabel: string;
  calcItemNomePlaceholder: string;
  calcCriarOrcamentoBtn: string;
  calcAvisoNaoSalva: string;

  // Calculadora de Margem v2 — blocos de custo (Serviços/Equipamentos/
  // Impostos/Custo Fixo) + margem desejada calculando o preço pra trás, em
  // vez do modelo antigo de digitar venda E custo por item.
  calcBlocoServicosTitulo: string;
  calcBlocoEquipamentosTitulo: string;
  calcBlocoImpostosTitulo: string;
  calcBlocoCustoFixoTitulo: string;
  calcEquipamentoPlaceholder: string;
  calcEquipamentoVazio: string;
  calcEquipamentoPersonalizadoBtn: string;
  calcAliquotaLabel: string;
  calcCustoFixoBaseLabel: string;
  calcCustoFixoBaseHint: string;
  calcCustoFixoBaseVazioHint: string;
  calcCustoFixoPercentualLabel: string;
  calcMargemDesejadaLabel: string;
  calcMargemHint: string;
  calcValorFinalLabel: string;
  calcCustoOperacionalLabel: string;
  calcImpostoEstimadoLabel: string;
  calcDemonstrativoTitulo: string;
  calcAvisoImpostoMargemLimite: string;
  calcDicaFreelancer: string;
  calcSemServicosParaCriar: string;

  // Proposta Comercial Web v2 — capa (imagem de fundo + badge + escala),
  // resumo do projeto (diárias/equipe/itens de entrega), investimento em
  // colunas descritivas, cor de destaque por proposta, e logos de clientes +
  // contato comercial (empresa) — ver `supabase/orcamentos-proposta-completa.sql`.
  capaTitulo: string;
  capaSubtitulo: string;
  capaImagemLabel: string;
  capaImagemHint: string;
  capaSubtituloLabel: string;
  escalaTextoCapaLabel: string;
  escalaTextoCapaMenor: string;
  escalaTextoCapaPadrao: string;
  escalaTextoCapaMaior: string;
  quantidadeDiariasLabel: string;
  placeholderQuantidadeDiarias: string;
  equipeEscaladaLabel: string;
  placeholderEquipeEscalada: string;
  itensEntregaTitulo: string;
  itensEntregaVazio: string;
  itensEntregaColItem: string;
  itensEntregaColPrazo: string;
  colunasInvestimentoTitulo: string;
  colunasInvestimentoHint: string;
  colunasInvestimentoAdicionarBtn: string;
  colunasInvestimentoVazio: string;
  colunasInvestimentoTituloPlaceholder: string;
  colunasInvestimentoItensPlaceholder: string;
  corDestaqueTitulo: string;
  corDestaqueSubtitulo: string;
  corDestaqueLabel: string;
  corDestaqueLimparBtn: string;
  corDestaqueHint: string;
  corDestaquePaletaLabel: string;
  emailComercialLabel: string;
  siteComercialLabel: string;
  logosClientesTitulo: string;
  logosClientesSubtitulo: string;
  logoClienteSlotLabel: string;
  logosTamanhoLabel: string;

  // Dados jurídicos da empresa (razão social/CPF-CNPJ/endereço) — até aqui só
  // editáveis pelo super-admin; expostos aqui porque alimentam o rodapé
  // jurídico da proposta/PDF e a identificação da CONTRATADA nos contratos.
  dadosJuridicosTitulo: string;
  dadosJuridicosSubtitulo: string;
  razaoSocialLabel: string;
  placeholderRazaoSocial: string;
  cpfCnpjEmpresaLabel: string;
  placeholderCpfCnpjEmpresa: string;
  enderecoEmpresaLabel: string;
  placeholderEnderecoEmpresa: string;

  // Aprovação pública — nome + CPF de quem aprova, coletados na hora, pra já
  // vir pronto no momento de gerar o contrato (a assinatura desenhada na
  // tela fica pra uma etapa futura).
  cpfAprovadorLabel: string;
  placeholderCpfAprovador: string;
  cpfAprovadorHint: string;
  erroCpfObrigatorio: string;
  erroCpfInvalido: string;

  // Preview "sempre completo" do construtor (Proposta Comercial Web v2.1) —
  // com os campos reais vazios, mostra conteúdo de exemplo em vez de
  // esconder a seção, pra dar uma ideia real do resultado final enquanto a
  // pessoa ainda está montando a proposta. `modoExemplo` fica sempre `false`
  // na página pública de verdade — o cliente nunca vê texto de exemplo.
  previewExemploAviso: string;
  previewExemploTag: string;
  placeholderEmailDestinatario: string;
  placeholderWhatsappDestinatario: string;
  itensEntregaItemPlaceholder: string;
  itensEntregaPrazoPlaceholder: string;
  emailComercialPlaceholder: string;
  siteComercialPlaceholder: string;
  termosCondicoesTitulo: string;
  encerramentoTituloPadrao: string;
  qrCompartilharTitulo: string;
  qrCompartilharHint: string;
  exemplo: {
    tituloProjeto: string;
    objetivos: string;
    textoProposta: string;
    quantidade: string;
    equipe: string;
    condicoesPagamento: string;
    observacoes: string;
    textoInstitucional: string;
    clientesAtendidos: string[];
    textoEncerramento: string;
    itensEntrega: { item: string; prazo: string }[];
    colunasInvestimento: { titulo: string; itens: string }[];
    portfolioAviso: string;
  };
}

export const orcamentos: OrcamentosDict = {
  tituloPagina: "Orçamentos",
  subtituloPagina: "Monte propostas comerciais a partir do seu catálogo de serviços e acompanhe o funil de aprovação.",
  novoOrcamentoBtn: "Novo Orçamento",
  catalogoBtn: "Catálogo de Serviços",
  calculadoraBtn: "Calculadora de Margem",
  contratosBtn: "Contratos",
  voltarParaOrcamentos: "Voltar pros Orçamentos",

  hubTitulo: "Comercial",
  hubSubtitulo: "Leads, funil de propostas, calculadora de margem e todos os seus orçamentos num só lugar.",
  abaLeadsLabel: "Leads",
  abaFunilLabel: "Funil",
  abaCalculadoraLabel: "Calculadora",
  abaPropostasLabel: "Propostas",
  configuracoesBtn: "Configurações",

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
  visaoFunil: "Funil",
  visaoLista: "Lista",
  funilColunaAutomatica: "Muda sozinho (visualização/validade)",
  funilColunaVazia: "Nenhum orçamento aqui.",
  funilColunaSomenteLeitura: "Esse status muda sozinho (quando o cliente visualiza o link, ou quando a validade vence) — não dá pra arrastar um orçamento pra cá.",

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
  gerarContratoBtn: "Gerar Contrato",
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
  placeholderNomeServico: "Ex: Sessão de fotos, Gestão de redes sociais, Consultoria de marca",
  descricaoOpcionalLabel: "Descrição (opcional)",
  placeholderDescricaoServico: "O que está incluso, prazos, entregáveis...",
  categoriaLabel: "Categoria",
  valorPadraoLabel: "Valor padrão",
  custoPadraoLabel: "Custo estimado (opcional)",
  custoPadraoHint: "Usado só na Calculadora de Margem pra sugerir o custo automaticamente — nunca aparece pro cliente nem entra no PDF.",
  margemAbreviada: "margem {pct}%",
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
  tipoDeOrcamentoLabel: "Tipo de orçamento",
  usarItensDoModeloBtn: "Usar itens do modelo",
  tipoServicoLabel: "Tipo de Serviço",
  tipoServicoVazio: "Nenhum específico",
  tipoServicoHint: "Opcional — se escolhido, sugere o mesmo tipo de serviço ao gerar o contrato deste orçamento.",
  tituloOrcamentoLabel: "Título da proposta",
  placeholderTituloOrcamento: "Ex: Nome do Projeto — Empresa XYZ",
  clienteExistenteLabel: "Cliente já cadastrado (opcional)",
  clienteNenhum: "Nenhum — proposta avulsa",
  nomeDestinatarioLabel: "Nome do destinatário",
  placeholderNomeDestinatario: "Ex: Maria Souza",
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

  propostaTitulo: "Resumo do Projeto",
  propostaSubtitulo: "Opcional — objetivo, escopo, duração, equipe e itens de entrega deste orçamento, exibidos na proposta.",
  textoPropostaLabel: "Descrição do escopo",
  placeholderTextoProposta: "O que será realizado neste projeto? Aparece na proposta e na página do PDF.",
  objetivosLabel: "Objetivo da Produção/Projeto",
  placeholderObjetivos: "Descreva aqui o objetivo desta produção — o que buscamos entregar com este projeto.",

  escolhaCategoriaTitulo: "Escolha o tipo de serviço",
  buscarServicoPlaceholder: "Buscar serviço no catálogo...",
  adicionarItemBtn: "Adicionar",
  itensDoOrcamentoTitulo: "Itens do Orçamento",
  previewAoVivoTitulo: "Preview ao vivo — o que o cliente vê",
  itensVazioDescricao: "Nenhum item adicionado ainda — escolha uma categoria acima e adicione serviços do catálogo.",
  quantidadeLabel: "Qtd.",
  valorUnitarioLabel: "Valor unitário",
  itemOpcionalLabel: "Item opcional (o cliente pode marcar/desmarcar)",
  hintItemOpcional: "Itens opcionais aparecem como um adicional que o próprio cliente decide incluir ou não na proposta.",
  removerItemBtn: "Remover",
  itemPersonalizadoBtn: "Item personalizado",
  itemPersonalizadoTitulo: "Adicionar item personalizado",
  portfolioAnexarTitulo: "Anexar Portfólio",
  portfolioAnexarHint: "Escolha fotos e vídeos do seu portfólio pra mostrar junto com essa proposta.",
  portfolioGerenciarBtn: "Gerenciar itens de portfólio",

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
  nossosTrabalhosTitulo: "Nossos Trabalhos",
  propostaSecaoTitulo: "Descrição do Escopo",
  objetivosSecaoTitulo: "Objetivo do Projeto",
  quemSomosTitulo: "Quem Somos",
  empresasAtendidasTitulo: "Empresas que já atendemos",
  ctaDecisaoTitulo: "E aí, seguimos?",
  ctaDecisaoDescricao: "Dá uma olhada com calma nos detalhes acima e nos conta como prefere seguir.",

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

  portfolioBtn: "Portfólio",
  portfolioTitulo: "Itens de Portfólio",
  portfolioSubtitulo: "Fotos e vídeos dos seus trabalhos, reutilizáveis em vários orçamentos.",
  portfolioAdicionarBtn: "Adicionar Item",
  portfolioEnviando: "Enviando...",
  portfolioVazioTitulo: "Nenhum item de portfólio ainda.",
  portfolioVazioDescricao: "Envie fotos ou vídeos dos seus trabalhos — eles ficam disponíveis pra anexar em qualquer orçamento.",
  portfolioMarcaMovidaAviso: "Logo, banner, rodapé e texto de apresentação agora ficam direto na tela de criação do orçamento — abra um orçamento novo ou em edição pra configurar.",
  portfolioEditarTitulo: "Editar Item de Portfólio",
  portfolioTituloLabel: "Título",
  placeholderPortfolioTitulo: "Ex: Making of — Campanha Verão",
  portfolioCategoriaLabel: "Categoria (opcional)",
  portfolioCategoriaNenhuma: "Qualquer categoria",
  categoriasProfissao: {
    filmmaker: "Filmmaker",
    videomaker: "Videomaker",
    social_media: "Social Media",
    storymaker: "Storymaker",
    designer: "Designer",
    fotografo: "Fotógrafo",
    agencia_marketing: "Agência de Marketing",
  },

  marcaAgenciaTitulo: "Marca & Apresentação",
  marcaAgenciaSubtitulo: "Logo, banner, rodapé e textos de apresentação — configure uma vez e vale pra todo orçamento e contrato enviado aos seus clientes.",
  marcaLogoLabel: "Logo",
  marcaLogoHint: "Aparece no topo de orçamentos e contratos.",
  marcaBannerLabel: "Banner de topo",
  marcaBannerHint: "Imagem larga usada na capa do orçamento/contrato.",
  marcaRodapeLabel: "Rodapé",
  marcaRodapeHint: "Imagem de assinatura/contato no fim do documento.",
  marcaLogoEspecificacoes: "Quadrada, mínimo 400×400px. PNG com fundo transparente funciona melhor. Formatos aceitos: PNG, JPG, WEBP ou GIF — até 3MB.",
  marcaBannerEspecificacoes: "Retangular (paisagem), recomendado 1600×500px. Formatos aceitos: PNG, JPG, WEBP ou GIF — até 3MB.",
  marcaRodapeEspecificacoes: "Faixa larga e baixa, recomendado 1600×220px. Formatos aceitos: PNG, JPG, WEBP ou GIF — até 3MB.",
  marcaApresentacaoResumoConfigurada: "Configurada — aplicada automaticamente em todo orçamento",
  marcaApresentacaoResumoVazia: "Ainda não configurada — adicione logo, banner e um texto de apresentação",
  marcaApresentacaoRecolherBtn: "Recolher",
  marcaApresentacaoAvisoPadrao: "Depois de salvo, isso vale automaticamente pra todos os próximos orçamentos — e você pode voltar aqui e editar quando quiser.",

  tiposBtn: "Modelos",
  tiposSubtitulo: "Monte um modelo de proposta pra cada tipo de trabalho — itens padrão, condições de pagamento e validade já vêm preenchidos ao escolher esse tipo num orçamento novo.",
  tiposItensTitulo: "Itens padrão do modelo",
  tiposItensVazio: "Nenhum item padrão ainda — adicione os serviços que costumam entrar nesse tipo de trabalho.",
  tiposSalvarBtn: "Salvar Modelo",
  tiposSalvoMsg: "Modelo salvo!",

  institucionalTitulo: "Sobre a Empresa",
  institucionalSubtitulo: "Texto de apresentação e clientes já atendidos — aparecem na capa institucional do PDF de orçamento.",
  institucionalTextoLabel: "Sobre a empresa",
  institucionalTextoPlaceholder: "Ex: Muito prazer, somos a Empresa X, fazemos Y, já trabalhamos com diversas empresas...",
  institucionalTextoHint: "Texto de apresentação que aparece na capa do PDF de orçamento.",
  institucionalClientesLabel: "Empresas que já atendemos",
  institucionalClientesPlaceholder: "Uma empresa por linha",
  institucionalClientesHint: "Uma empresa/cliente por linha — aparece como lista na capa do PDF.",
  institucionalEncerramentoLabel: "Mensagem de encerramento",
  institucionalEncerramentoPlaceholder: "Ex: Foi um prazer te atender! Esperamos ter um ótimo trabalho juntos.",
  institucionalEncerramentoHint: "Aparece no final da proposta (PDF e link público), como um agradecimento padrão pra todo orçamento enviado.",
  institucionalSalvarBtn: "Salvar",
  institucionalSalvoMsg: "Salvo!",

  abaOrcamentoLabel: "Orçamento",
  abaContratoLabel: "Contrato",
  abaContratoBloqueadaHint: "Aprove o orçamento pra liberar o contrato.",

  calculadoraTitulo: "Calculadora de Margem",
  calculadoraSubtitulo: "Lance seus custos, escolha a margem desejada e deixe a calculadora sugerir o preço final — nada aqui é salvo automaticamente.",
  calcStatSubtotalVenda: "Total (venda)",
  calcStatCustoTotal: "Custo total",
  calcStatLucro: "Lucro estimado",
  calcStatMargem: "Margem",
  calcAdicionarItensTitulo: "Adicionar serviços à simulação",
  calcItensTitulo: "Serviços da Simulação",
  calcItensVazio: "Nenhum serviço ainda — adicione do catálogo ou um item personalizado pra começar a simular.",
  calcColVendaUnit: "Venda unit.",
  calcColCustoUnit: "Custo unit.",
  calcItemNomeLabel: "Nome do item",
  calcItemNomePlaceholder: "Ex: Sessão de 2h",
  calcCriarOrcamentoBtn: "Criar orçamento com esses itens",
  calcAvisoNaoSalva: "Essa simulação não é salva em lugar nenhum — se você sair da página, os números somem. Quando fechar o preço, use \"Criar orçamento com esses itens\" pra levar tudo pro construtor de verdade.",

  calcBlocoServicosTitulo: "Serviços (mão de obra)",
  calcBlocoEquipamentosTitulo: "Equipamentos",
  calcBlocoImpostosTitulo: "Impostos",
  calcBlocoCustoFixoTitulo: "Custo Fixo / Fee",
  calcEquipamentoPlaceholder: "+ Adicionar equipamento do inventário...",
  calcEquipamentoVazio: "Nenhum equipamento vinculado ainda.",
  calcEquipamentoPersonalizadoBtn: "Equipamento fora do inventário",
  calcAliquotaLabel: "Alíquota de impostos (%)",
  calcCustoFixoBaseLabel: "Base de custo fixo mensal",
  calcCustoFixoBaseHint: "Somado automaticamente das suas despesas recorrentes no Financeiro — edite se quiser simular outro valor.",
  calcCustoFixoBaseVazioHint: "Nenhuma despesa recorrente encontrada no Financeiro — digite uma estimativa manual.",
  calcCustoFixoPercentualLabel: "% rateado para este projeto",
  calcMargemDesejadaLabel: "Margem desejada",
  calcMargemHint: "Recalcula o valor final do projeto abaixo, em tempo real.",
  calcValorFinalLabel: "Valor final do projeto",
  calcCustoOperacionalLabel: "Custo operacional total",
  calcImpostoEstimadoLabel: "Imposto estimado",
  calcDemonstrativoTitulo: "Demonstrativo de cálculo",
  calcAvisoImpostoMargemLimite: "Imposto + margem não pode passar de 99% — ajuste os valores pra calcular um preço válido.",
  calcDicaFreelancer: "Trabalha sozinho(a)? Lembre-se de incluir seu próprio tempo como um custo de serviço aqui — o Lucro Estimado é o que sobra pra reinvestir no negócio, não o seu salário.",
  calcSemServicosParaCriar: "Adicione pelo menos um serviço pra poder criar um orçamento a partir dessa simulação.",

  capaTitulo: "Capa da Proposta",
  capaSubtitulo: "Imagem de fundo, badge e escala de texto exibidos na capa desta proposta específica.",
  capaImagemLabel: "Imagem de fundo (tela inteira)",
  capaImagemHint: "Paisagem, alta resolução — vira o fundo da capa da proposta web.",
  capaSubtituloLabel: "Subtítulo / Badge da capa",
  escalaTextoCapaLabel: "Ajuste de escala do texto",
  escalaTextoCapaMenor: "0.8× menor",
  escalaTextoCapaPadrao: "1.0 padrão",
  escalaTextoCapaMaior: "1.2× maior",
  quantidadeDiariasLabel: "Duração ou quantidade do serviço",
  placeholderQuantidadeDiarias: "Ex: 3 diárias, 10 horas, 5 posts, 1 pacote mensal",
  equipeEscaladaLabel: "Equipe envolvida (separada por vírgula)",
  placeholderEquipeEscalada: "Ex: 1 Fotógrafo, 2 Designers, 1 Social Media",
  itensEntregaTitulo: "Itens de Entrega",
  itensEntregaVazio: "Nenhum item de entrega ainda — adicione o que será entregue e o prazo de cada um.",
  itensEntregaColItem: "Item de entrega",
  itensEntregaColPrazo: "Prazo",
  colunasInvestimentoTitulo: "Investimento — Colunas Descritivas",
  colunasInvestimentoHint: "Blocos como \"Equipe & Equipamento\" ou \"Pós-Produção\" — descritivos, exibidos ao lado do valor total já calculado nos itens acima.",
  colunasInvestimentoAdicionarBtn: "Adicionar Coluna",
  colunasInvestimentoVazio: "Nenhuma coluna ainda — opcional, use pra detalhar o que está incluso sem repetir os itens com preço.",
  colunasInvestimentoTituloPlaceholder: "Ex: Equipe & Equipamento",
  colunasInvestimentoItensPlaceholder: "Um item por linha...",
  corDestaqueTitulo: "Cor de Destaque",
  corDestaqueSubtitulo: "Aplicada em títulos, bordas e detalhes desta proposta web — não muda o resto do painel.",
  corDestaqueLabel: "Cor de destaque",
  corDestaqueLimparBtn: "Limpar",
  corDestaqueHint: "Deixe em branco pra usar a cor padrão do sistema.",
  corDestaquePaletaLabel: "Paleta rápida",
  emailComercialLabel: "E-mail comercial",
  siteComercialLabel: "Site",
  logosClientesTitulo: "Logos de Clientes",
  logosClientesSubtitulo: "Até 6 logos de marcas/clientes já atendidos — exibidos junto do \"Quem Somos\" na proposta.",
  logoClienteSlotLabel: "Logo {n}",
  logosTamanhoLabel: "Tamanho dos logos",

  dadosJuridicosTitulo: "Dados Jurídicos da Empresa",
  dadosJuridicosSubtitulo: "Razão social, CNPJ/CPF e endereço — aparecem no rodapé jurídico da proposta e identificam sua empresa nos contratos gerados.",
  razaoSocialLabel: "Razão social / Nome legal",
  placeholderRazaoSocial: "Ex: Nome Ltda.",
  cpfCnpjEmpresaLabel: "CNPJ ou CPF",
  placeholderCpfCnpjEmpresa: "Ex: 00.000.000/0001-00",
  enderecoEmpresaLabel: "Endereço completo",
  placeholderEnderecoEmpresa: "Ex: Rua Exemplo, 123 — Bairro, Cidade/UF, 00000-000",

  cpfAprovadorLabel: "Seu CPF",
  placeholderCpfAprovador: "000.000.000-00",
  cpfAprovadorHint: "Usado só pra já preparar o contrato depois — não aparece em nenhum outro lugar.",
  erroCpfObrigatorio: "Informe seu CPF pra confirmar a aprovação.",
  erroCpfInvalido: "Esse CPF não parece válido — confira os números.",

  previewExemploAviso: "Exemplo de como sua proposta vai ficar — preencha os campos ao lado pra trocar pelo conteúdo real.",
  previewExemploTag: "exemplo",
  placeholderEmailDestinatario: "cliente@empresa.com",
  placeholderWhatsappDestinatario: "(11) 91234-5678",
  itensEntregaItemPlaceholder: "Ex: Arquivo final em alta resolução",
  itensEntregaPrazoPlaceholder: "Ex: 10 dias úteis",
  emailComercialPlaceholder: "comercial@suaempresa.com",
  siteComercialPlaceholder: "www.suaempresa.com",
  termosCondicoesTitulo: "Termos e Condições",
  encerramentoTituloPadrao: "Essa proposta já tem a sua cara",
  qrCompartilharTitulo: "Continue no seu celular",
  qrCompartilharHint: "Aponte a câmera pra abrir essa proposta na tela do seu celular.",
  exemplo: {
    tituloProjeto: "Nome do Projeto — Cliente Exemplo",
    objetivos: "Aumentar o reconhecimento da marca e gerar mais oportunidades de negócio nos próximos 3 meses.",
    textoProposta: "Um passo a passo completo do que será entregue, desde o planejamento inicial até a entrega final — ajustado ao objetivo e ao público deste projeto.",
    quantidade: "3 diárias / 10 horas",
    equipe: "1 Coordenador(a), 2 Especialistas, 1 Assistente",
    condicoesPagamento: "50% na aprovação da proposta, 50% na entrega final.",
    observacoes: "Valores válidos para o escopo descrito — qualquer alteração é orçada à parte.",
    textoInstitucional: "Somos uma equipe apaixonada por transformar ideias em resultado — cada projeto é tratado com o mesmo cuidado do primeiro.",
    clientesAtendidos: ["Empresa Alfa", "Empresa Beta", "Empresa Gama"],
    textoEncerramento: "Cada detalhe dessa proposta foi pensado pra você — chama a gente pra conversar sobre os próximos passos.",
    itensEntrega: [
      { item: "Planejamento e briefing alinhado", prazo: "3 dias úteis" },
      { item: "Primeira entrega para aprovação", prazo: "10 dias úteis" },
      { item: "Entrega final revisada", prazo: "15 dias úteis" },
    ],
    colunasInvestimento: [
      { titulo: "Equipe & Execução", itens: "Profissionais especializados\nCoordenação do projeto\nReuniões de alinhamento" },
      { titulo: "Pós-Produção & Entrega", itens: "Revisões inclusas\nArquivos em alta qualidade\nEntrega no prazo combinado" },
    ],
    portfolioAviso: "Exemplo de foto ou vídeo do seu portfólio",
  },
};
