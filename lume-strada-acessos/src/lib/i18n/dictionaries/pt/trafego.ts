/**
 * Módulo de Tráfego & Metas (`app/admin/trafego/`, `components/admin/trafego/`)
 * — duas abas dentro do mesmo módulo/permissão: "Clientes" (Meta do Dia +
 * status do tráfego lançado por cliente) e "Info-Produtos" (tracking de
 * anúncios dos infoprodutos da própria agência, calendário de metas de lucro
 * líquido e fechamento semanal com reembolsos). Uma única namespace porque as
 * duas abas moram no mesmo `TrafegoWorkspace.tsx`.
 *
 * As Server Actions (`app/admin/trafego/actions.ts` e
 * `infoprodutos-actions.ts`) ficam FORA do escopo desta leva — os erros que
 * elas retornam continuam em português.
 */
export interface TrafegoDict {
  tituloPagina: string;
  subtituloPagina: string;
  abaClientes: string;
  abaInfoProdutos: string;

  // Navegação de dia — usada em `DateNav.tsx` e `AnunciosManager.tsx`.
  diaAnterior: string;
  proximoDia: string;
  voltarParaHoje: string;
  hoje: string;

  // Preposições/separadores curtos reaproveitados em vários lugares.
  deTexto: string;
  dataRangeSeparador: string;
  valorPlaceholder: string;

  // Colunas do CSV exportado (`TrafegoWorkspace.tsx`, `ExportMenuButton`).
  csvColCliente: string;
  csvColInvestido: string;
  csvColLeadsGerados: string;
  csvColVendasGeradas: string;
  csvColCliques: string;
  csvColVisualizacoes: string;
  csvColMetaInvestimento: string;
  csvColCustoPorLead: string;
  escolhaTitulo: string;
  escolhaSubtitulo: string;
  caminhoInfoprodutoTitulo: string;
  caminhoInfoprodutoTexto: string;
  caminhoLeadsTitulo: string;
  caminhoLeadsTexto: string;
  escolhaRodape: string;
  trocarCaminho: string;
  leadsTitulo: string;
  leadsSubtitulo: string;
  csvColAnuncio: string;
  csvColInvestimento: string;
  csvColReceitaBruta: string;
  csvColVendas: string;

  // Aba Clientes (`ClientesTrafegoTab.tsx`).
  clientesDescricao: string;
  novoClienteBotao: string;
  statNoCaminho: string;
  statNoCaminhoHint: string;
  statMetaBatida: string;
  statMetaBatidaHint: string;
  statAbaixoMeta: string;
  statAbaixoMetaHint: string;
  statSemMeta: string;
  statSemMetaHint: string;
  nenhumClienteCadastrado: string;

  // Card de meta por cliente (`MetaCard.tsx`).
  semNome: string;
  metaInvestimentoLabel: string;
  metaLeadsLabel: string;
  objetivoDiaLabel: string;
  objetivoDiaPlaceholder: string;
  investidoLabel: string;
  leadsLabel: string;
  lancamentosDoDia: string;
  lancamentoSemNome: string;
  leadsSufixo: string;
  removerLancamento: string;
  campanhaPlaceholder: string;
  valorInvestidoPlaceholder: string;
  leadsPlaceholder: string;
  lancarBotao: string;
  tipoResultadoLeadsOpcao: string;
  tipoResultadoVendasOpcao: string;
  quantidadePlaceholder: string;
  vendasLabel: string;
  vendasSufixo: string;
  custoPorLeadLabel: string;
  custoPorVendaLabel: string;

  // Modal de anúncio (`AnuncioModal.tsx`).
  editarAnuncioTitulo: string;
  novoAnuncioTitulo: string;
  dataObrigatoriaLabel: string;
  /** @deprecated Campo de texto livre antigo, substituído pelo Select obrigatório de Criativo — ver `criativoObrigatorioLabel`. */
  nomeAnuncioLabel: string;
  /** @deprecated Ver `nomeAnuncioLabel`. */
  nomeAnuncioPlaceholder: string;
  criativoObrigatorioLabel: string;
  selecioneCriativoErro: string;
  produtoPrincipalLabel: string;
  orderBumpOpcionalLabel: string;
  nenhumOrderBump: string;
  /** Lista de order bumps vendidos nesse anúncio (produto + quantidade) — um anúncio pode ter várias linhas, ver `OrderBumpVendaLinha`. */
  orderBumpsVendidosLabel: string;
  nenhumOrderBumpVendidoTexto: string;
  adicionarOrderBumpBotao: string;
  removerOrderBumpAria: string;
  investimentoDiaLabel: string;
  visualizacoesLabel: string;
  cliquesLabel: string;
  vendasPrincipalLabel: string;
  vendasOrderBumpLabel: string;
  receitaBrutaLabel: string;
  receitaBrutaHint: string;
  criarAnuncioBotao: string;
  taxaPercentualLabel: string;
  taxaFixaLabel: string;
  taxaAnuncioHint: string;
  receitaLiquidaLabel: string;

  // Lista/gestão de anúncios (`AnunciosManager.tsx`).
  novoAnuncioBotao: string;
  cadastreProdutoPrincipalPrimeiro: string;
  investimentoDoDiaCard: string;
  receitaBrutaDoDiaCard: string;
  receitaLiquidaDoDiaCard: string;
  lucroBrutoDoDiaCard: string;
  cadastreProdutoPrincipalAviso: string;
  nenhumAnuncioNoDia: string;
  anuncioSemNome: string;
  semProdutoPrincipalTexto: string;
  investAbrevLabel: string;
  receitaAbrevLabel: string;
  receitaLiquidaAbrevLabel: string;
  viewsAbrevLabel: string;
  cliquesAbrevLabel: string;
  vendasPrincAbrevLabel: string;
  vendasBumpAbrevLabel: string;
  lucroAbrevLabel: string;

  // Calendário de metas (`CalendarioMetas.tsx`).
  diasSemanaAbrev: string[];
  mesAnteriorAria: string;
  proximoMesAria: string;
  metaLucroDoDiaTitulo: string;
  metaLucroLiquidoLabel: string;
  metaSalva: string;
  salvarMetaBotao: string;

  // Upload de criativo (`CriativoUploader.tsx`).
  arquivoMuitoGrande: string;
  removerCriativoAria: string;
  enviandoTexto: string;
  enviarPrintOuMp4: string;
  criativoAltTexto: string;
  criativoPorLink: string;
  criativoLinkHint: string;

  // Dashboard dos últimos 7 dias (`Dashboard7Dias.tsx`).
  metaDeLucroLabel: string;
  lucroGeradoLabel: string;
  ultimos7DiasTitulo: string;
  metaDaSemanaLabel: string;
  lucroDaSemanaLabel: string;
  metaDeHojeStat: string;
  lucroLiquidoNoBolsoHint: string;
  lucroDeHojeStat: string;
  aindaBrutoHint: string;
  somaUltimos7DiasHint: string;
  semanasPendentesStat: string;
  aguardandoFechamentoHint: string;
  fechamentoPorSemanaTitulo: string;
  nenhumAnuncioLancadoAinda: string;
  receitaPalavra: string;
  investimentoPalavra: string;
  reembolsosPalavra: string;
  lucroLiquidoRealLabel: string;
  lucroBrutoLabel: string;
  fecharSemanaBotao: string;

  // Modal de fechamento semanal (`FechamentoModal.tsx`).
  editarFechamentoTitulo: string;
  fechamentoDaSemanaTitulo: string;
  receitaBrutaTotalLabel: string;
  receitaLiquidaTotalLabel: string;
  investimentoTotalLabel: string;
  valorReembolsosLabel: string;
  estornosGarantiaHint: string;
  fechandoTexto: string;
  salvarCorrecaoBotao: string;

  // Sub-abas do workspace de Info-Produtos (`InfoProdutosWorkspace.tsx`) — e
  // o seletor de cliente que separa todo o espaço de Info-Produtos por
  // cliente (ver comentário no componente).
  visaoGeralAba: string;
  anunciosAba: string;
  criativosAba: string;
  calendarioMetasAba: string;
  produtosAba: string;
  infoProdutosClienteLabel: string;
  nenhumClienteParaInfoprodutos: string;

  // Modal de produto (`ProdutoModal.tsx`).
  editarProdutoTitulo: string;
  novoProdutoTitulo: string;
  nomeProdutoLabel: string;
  nomeProdutoPlaceholder: string;
  tipoLabel: string;
  orderBumpOpcao: string;
  valorReaisLabel: string;
  criarProdutoBotao: string;

  // Lista/gestão de produtos (`ProdutosManager.tsx`).
  nenhumProdutoCadastrado: string;
  produtoHeader: string;
  desativarBotao: string;
  ativarBotao: string;
  produtosCadastradosContagem: string;
  novoProdutoBotao: string;
  produtosPrincipaisTitulo: string;
  orderBumpsTitulo: string;

  // Modal de criativo (`CriativoModal.tsx`) e lista/gestão (`CriativosManager.tsx`)
  // — cadastro de Criativos, separado do lançamento diário de anúncios.
  editarCriativoTitulo: string;
  novoCriativoTitulo: string;
  nomeCriativoLabel: string;
  nomeCriativoPlaceholder: string;
  orcamentoDiarioLabel: string;
  orcamentoDiarioHint: string;
  criarCriativoBotao: string;
  nenhumCriativoCadastrado: string;
  criativoHeader: string;
  criativosCadastradosContagem: string;
  novoCriativoBotao: string;
  cadastreCriativoPrimeiro: string;
  cadastreCriativoAviso: string;

  // Taxa padrão da plataforma (`TaxaPlataformaCard.tsx`).
  taxaPadraoTitulo: string;
  taxaPadraoDescricao: string;
  salvarTaxaPadraoBotao: string;
  taxaPadraoSalvaTexto: string;
}

export const trafego: TrafegoDict = {
  tituloPagina: "Tráfego & Metas",
  subtituloPagina: "Tráfego por cliente e o tracking de anúncios dos seus próprios infoprodutos.",
  abaClientes: "Clientes",
  abaInfoProdutos: "Info-Produtos",

  diaAnterior: "Dia anterior",
  proximoDia: "Próximo dia",
  voltarParaHoje: "Voltar para hoje",
  hoje: "Hoje",

  deTexto: "de",
  dataRangeSeparador: "a",
  valorPlaceholder: "0,00",

  csvColCliente: "Cliente",
  csvColInvestido: "Investido (R$)",
  csvColLeadsGerados: "Leads Gerados",
  csvColVendasGeradas: "Vendas Geradas",
  csvColCliques: "Cliques",
  csvColVisualizacoes: "Visualizações",
  csvColMetaInvestimento: "Meta de Investimento (R$)",
  csvColCustoPorLead: "Custo por Lead (R$)",
  escolhaTitulo: "Tráfego & Metas",
  escolhaSubtitulo: "O que você está anunciando?",
  caminhoInfoprodutoTitulo: "Infoproduto",
  caminhoInfoprodutoTexto: "Produto digital que você vende pelo anúncio: cadastro de produtos e order bumps, criativos, lançamentos diários com receita e vendas, calendário de metas de lucro e fechamento semanal.",
  caminhoLeadsTitulo: "Tráfego para leads",
  caminhoLeadsTexto: "Anúncio de captação: meta de investimento por cliente e por dia, quanto já foi gasto, quantos leads saíram e a que custo. Sem produto, sem order bump.",
  escolhaRodape: "O mesmo cliente pode aparecer nos dois — é o mesmo cadastro.",
  trocarCaminho: "Trocar de caminho",
  leadsTitulo: "Tráfego para leads",
  leadsSubtitulo: "Meta do dia, investimento e leads gerados, cliente por cliente.",
  csvColAnuncio: "Anúncio",
  csvColInvestimento: "Investimento (R$)",
  csvColReceitaBruta: "Receita Bruta (R$)",
  csvColVendas: "Vendas",

  clientesDescricao: "Cada card liga o cliente à Meta do Dia e ao status atual do tráfego lançado.",
  novoClienteBotao: "Novo Cliente",
  statNoCaminho: "No Caminho",
  statNoCaminhoHint: "≥60% da meta do dia",
  statMetaBatida: "Meta Batida",
  statMetaBatidaHint: "100% ou mais investido",
  statAbaixoMeta: "Abaixo da Meta",
  statAbaixoMetaHint: "Precisa de atenção",
  statSemMeta: "Sem Meta Definida",
  statSemMetaHint: "Nenhuma meta lançada hoje",
  nenhumClienteCadastrado: "Nenhum cliente cadastrado ainda.",

  semNome: "Sem nome",
  metaInvestimentoLabel: "Meta de investimento (R$/dia)",
  metaLeadsLabel: "Meta de leads (opcional)",
  objetivoDiaLabel: "Objetivo do dia (opcional)",
  objetivoDiaPlaceholder: "Ex: Lançamento da campanha X",
  investidoLabel: "Investido:",
  leadsLabel: "Leads:",
  lancamentosDoDia: "Lançamentos do dia",
  lancamentoSemNome: "Lançamento sem nome",
  leadsSufixo: "lead(s)",
  removerLancamento: "Remover lançamento",
  campanhaPlaceholder: "Campanha (opcional)",
  valorInvestidoPlaceholder: "R$ investido",
  leadsPlaceholder: "Leads",
  lancarBotao: "Lançar",
  tipoResultadoLeadsOpcao: "Leads",
  tipoResultadoVendasOpcao: "Vendas",
  quantidadePlaceholder: "Qtd.",
  vendasLabel: "Vendas:",
  vendasSufixo: "venda(s)",
  custoPorLeadLabel: "Custo/Lead:",
  custoPorVendaLabel: "Custo/Venda:",

  editarAnuncioTitulo: "Editar Anúncio",
  novoAnuncioTitulo: "Novo Anúncio do Dia",
  dataObrigatoriaLabel: "Data *",
  nomeAnuncioLabel: "Nome do Anúncio / Criativo",
  nomeAnuncioPlaceholder: "Ex: Criativo A - Depoimento",
  criativoObrigatorioLabel: "Criativo *",
  selecioneCriativoErro: "Selecione um Criativo.",
  produtoPrincipalLabel: "Produto Principal",
  orderBumpOpcionalLabel: "Order Bump (opcional)",
  nenhumOrderBump: "Nenhum",
  orderBumpsVendidosLabel: "Order Bumps Vendidos",
  nenhumOrderBumpVendidoTexto: "Nenhum order bump vendido nesse anúncio.",
  adicionarOrderBumpBotao: "Adicionar Order Bump",
  removerOrderBumpAria: "Remover order bump",
  investimentoDiaLabel: "Investimento do Dia (R$)",
  visualizacoesLabel: "Visualizações",
  cliquesLabel: "Cliques",
  vendasPrincipalLabel: "Vendas — Produto Principal",
  vendasOrderBumpLabel: "Vendas — Order Bump",
  receitaBrutaLabel: "Receita Bruta Gerada (R$)",
  receitaBrutaHint:
    "Calculado automaticamente pelas vendas × valor do produto — edite aqui se a plataforma (Hotmart/Kiwify) mostrar um valor diferente.",
  criarAnuncioBotao: "Criar Anúncio",
  taxaPercentualLabel: "Taxa da Plataforma (%)",
  taxaFixaLabel: "Taxa Fixa por Venda (R$)",
  taxaAnuncioHint: "Pode deixar 0 nos dois campos se a plataforma não cobrar nada nessa venda.",
  receitaLiquidaLabel: "Receita Líquida (já com a taxa descontada)",

  novoAnuncioBotao: "Novo Anúncio",
  cadastreProdutoPrincipalPrimeiro: "Cadastre um Produto Principal primeiro",
  investimentoDoDiaCard: "Investimento do Dia",
  receitaBrutaDoDiaCard: "Receita Bruta do Dia",
  receitaLiquidaDoDiaCard: "Receita Líquida do Dia",
  lucroBrutoDoDiaCard: "Lucro Bruto do Dia",
  cadastreProdutoPrincipalAviso: 'Cadastre pelo menos um Produto Principal na aba "Produtos" antes de lançar um anúncio.',
  nenhumAnuncioNoDia: "Nenhum anúncio lançado nesse dia ainda.",
  anuncioSemNome: "Anúncio sem nome",
  semProdutoPrincipalTexto: "Sem produto principal",
  investAbrevLabel: "Invest.:",
  receitaAbrevLabel: "Receita:",
  receitaLiquidaAbrevLabel: "Líquida:",
  viewsAbrevLabel: "Views:",
  cliquesAbrevLabel: "Cliques:",
  vendasPrincAbrevLabel: "Vendas Princ.:",
  vendasBumpAbrevLabel: "Vendas Bump:",
  lucroAbrevLabel: "Lucro:",

  diasSemanaAbrev: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  mesAnteriorAria: "Mês anterior",
  proximoMesAria: "Próximo mês",
  metaLucroDoDiaTitulo: "Meta de Lucro do Dia",
  metaLucroLiquidoLabel: "Meta de lucro líquido (R$)",
  metaSalva: "Meta salva.",
  salvarMetaBotao: "Salvar Meta",

  arquivoMuitoGrande: "Arquivo muito grande (máximo 80MB).",
  removerCriativoAria: "Remover criativo",
  enviandoTexto: "Enviando...",
  enviarPrintOuMp4: "Enviar Print ou MP4",
  criativoAltTexto: "Criativo do anúncio",
  criativoPorLink: "ou cole o link do vídeo",
  criativoLinkHint: "YouTube, Vimeo, Loom, Streamable, Instagram, TikTok, Drive ou Dropbox. Vídeo por link não ocupa o armazenamento da conta.",

  metaDeLucroLabel: "Meta de Lucro",
  lucroGeradoLabel: "Lucro Gerado",
  ultimos7DiasTitulo: "Últimos 7 Dias",
  metaDaSemanaLabel: "Meta da Semana",
  lucroDaSemanaLabel: "Lucro da Semana",
  metaDeHojeStat: "Meta de Hoje",
  lucroLiquidoNoBolsoHint: "Lucro líquido no bolso",
  lucroDeHojeStat: "Lucro de Hoje",
  aindaBrutoHint: "Ainda bruto, se não fechado",
  somaUltimos7DiasHint: "Soma dos últimos 7 dias",
  semanasPendentesStat: "Semanas Pendentes",
  aguardandoFechamentoHint: "Aguardando Fechamento",
  fechamentoPorSemanaTitulo: "Fechamento por Semana",
  nenhumAnuncioLancadoAinda: "Nenhum anúncio lançado ainda — a lista de semanas aparece aqui.",
  receitaPalavra: "Receita",
  investimentoPalavra: "Investimento",
  reembolsosPalavra: "Reembolsos",
  lucroLiquidoRealLabel: "Lucro Líquido Real",
  lucroBrutoLabel: "Lucro Bruto",
  fecharSemanaBotao: "Fechar Semana",

  editarFechamentoTitulo: "Editar Fechamento",
  fechamentoDaSemanaTitulo: "Fechamento da Semana",
  receitaBrutaTotalLabel: "Receita Bruta Total",
  receitaLiquidaTotalLabel: "Receita Líquida Total",
  investimentoTotalLabel: "Investimento Total",
  valorReembolsosLabel: "Valor de Reembolsos / Chargebacks (R$)",
  estornosGarantiaHint: "Estornos da garantia de 7 dias desse período.",
  fechandoTexto: "Fechando...",
  salvarCorrecaoBotao: "Salvar Correção",

  visaoGeralAba: "Visão Geral",
  anunciosAba: "Anúncios",
  criativosAba: "Criativos",
  calendarioMetasAba: "Calendário de Metas",
  produtosAba: "Infoprodutos",
  infoProdutosClienteLabel: "Cliente",
  nenhumClienteParaInfoprodutos: "Cadastre um cliente antes de usar o Info-Produtos.",

  editarProdutoTitulo: "Editar Produto",
  novoProdutoTitulo: "Novo Produto",
  nomeProdutoLabel: "Nome do Produto *",
  nomeProdutoPlaceholder: "Ex: Pack de Presets Cinema",
  tipoLabel: "Tipo *",
  orderBumpOpcao: "Order Bump",
  valorReaisLabel: "Valor (R$) *",
  criarProdutoBotao: "Criar Produto",

  nenhumProdutoCadastrado: "Nenhum produto cadastrado ainda.",
  produtoHeader: "Produto",
  desativarBotao: "Desativar",
  ativarBotao: "Ativar",
  produtosCadastradosContagem: "{count} produto(s) cadastrado(s)",
  novoProdutoBotao: "Novo Produto",
  produtosPrincipaisTitulo: "Produtos Principais",
  orderBumpsTitulo: "Order Bumps",

  editarCriativoTitulo: "Editar Criativo",
  novoCriativoTitulo: "Novo Criativo",
  nomeCriativoLabel: "Nome do Criativo *",
  nomeCriativoPlaceholder: "Ex: Criativo A - Depoimento",
  orcamentoDiarioLabel: "Orçamento Diário (R$)",
  orcamentoDiarioHint: "Pré-preenche o Investimento do Dia num anúncio novo com esse Criativo — você pode ajustar por lançamento, nunca entra direto no cálculo de lucro.",
  criarCriativoBotao: "Criar Criativo",
  nenhumCriativoCadastrado: "Nenhum criativo cadastrado ainda.",
  criativoHeader: "Criativo",
  criativosCadastradosContagem: "{count} criativo(s) cadastrado(s)",
  novoCriativoBotao: "Novo Criativo",
  cadastreCriativoPrimeiro: "Cadastre um Criativo primeiro",
  cadastreCriativoAviso: 'Cadastre pelo menos um Criativo na aba "Criativos" antes de lançar um anúncio.',

  taxaPadraoTitulo: "Taxa Padrão da Plataforma",
  taxaPadraoDescricao:
    "Preenche sozinha todo novo lançamento de anúncio desse cliente (dá pra ajustar por lançamento se uma venda específica tiver taxa diferente).",
  salvarTaxaPadraoBotao: "Salvar Taxa Padrão",
  taxaPadraoSalvaTexto: "Salvo.",
};
