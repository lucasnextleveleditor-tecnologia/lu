/**
 * Módulo Inventário & Patrimônio: sub-nav (abas Categorias / Itens & Etiquetas
 * / Dashboard Financeiro), KPIs do layout, CRUD de categorias e de itens
 * (modais + tabelas) e o Dashboard Financeiro (`DashboardPatrimonio`).
 * Textos com `{placeholder}` são preenchidos via `.replace("{chave}", valor)`
 * no componente (mesmo padrão de `login.acessoExpiradoData`).
 */
export interface InventarioDict {
  titulo: string;
  subtitulo: string;

  statCategorias: string;
  statCategoriasHint: string;
  statItensTotal: string;
  statItensTotalHint: string;
  statEmManutencao: string;
  statEmManutencaoHint: string;
  statBaixados: string;
  statBaixadosHint: string;

  tabCategorias: string;
  tabItensEtiquetas: string;
  tabDashboardFinanceiro: string;

  erroCarregarCategorias: string;
  erroCarregarItens: string;
  erroCarregarDashboard: string;

  editarCategoria: string;
  novaCategoria: string;
  campoNomeObrigatorio: string;
  placeholderNomeCategoria: string;
  campoCodigoObrigatorio: string;
  placeholderCodigo: string;
  hintCodigo: string;
  campoDescricaoOpcional: string;
  placeholderDescricaoCategoria: string;
  criarCategoria: string;

  categoriasCadastradas: string;
  novaCategoriaBotao: string;
  nenhumaCategoriaCadastrada: string;
  colunaCodigo: string;
  colunaItens: string;
  colunaCriadaEm: string;

  statValorInvestido: string;
  hintValorInvestido: string;
  itemAtivoSingular: string;
  itensAtivosPlural: string;
  statPatrimonioAtual: string;
  hintPatrimonioAtual: string;
  valorizacaoTotal: string;
  depreciacaoTotalLabel: string;
  sufixoDesvalorizacaoMedia: string;
  itemNaoEntraSingular: string;
  itensNaoEntramPlural: string;
  oItemSingular: string;
  osItensPlural: string;
  itensExcluidosAviso: string;
  tituloDistribuicaoCategoria: string;
  distribuicaoVazia: string;

  editarItem: string;
  novaEtiquetaItem: string;
  cadastreCategoriaPrimeiro: string;
  campoNumeroEtiqueta: string;
  placeholderEtiqueta: string;
  campoCategoriaObrigatorio: string;
  campoNomeItem: string;
  placeholderNomeItem: string;
  campoLocalizacao: string;
  placeholderLocalizacao: string;
  campoDataAquisicao: string;
  campoValorPago: string;
  hintValorPago: string;
  campoValorAtual: string;
  hintValorAtual: string;
  valorizacaoLabel: string;
  depreciacaoLabel: string;
  campoResponsavelAtual: string;
  placeholderResponsavel: string;
  cadastrarItem: string;

  itensContagem: string;
  novaEtiquetaBotao: string;
  placeholderBuscaItens: string;
  todosStatus: string;
  todasCategorias: string;
  cadastreCategoriaParaItens: string;
  nenhumItemCadastrado: string;
  nenhumItemComFiltros: string;
  colunaEtiqueta: string;
  colunaLocalizacao: string;
  colunaResponsavel: string;
  colunaAquisicao: string;
  colunaPagoAtual: string;
  colunaDepreciacao: string;
  semDados: string;
}

export const inventario: InventarioDict = {
  titulo: "Inventário & Patrimônio",
  subtitulo: "Categorias de bens e etiquetas do patrimônio da agência.",

  statCategorias: "Categorias",
  statCategoriasHint: "Grupos de bens cadastrados",
  statItensTotal: "Itens no Total",
  statItensTotalHint: "Etiquetas ativas no sistema",
  statEmManutencao: "Em Manutenção",
  statEmManutencaoHint: "Fora de uso temporariamente",
  statBaixados: "Baixados",
  statBaixadosHint: "Descartados/fora de operação",

  tabCategorias: "Categorias",
  tabItensEtiquetas: "Itens & Etiquetas",
  tabDashboardFinanceiro: "Dashboard Financeiro",

  erroCarregarCategorias: "Erro ao carregar categorias: ",
  erroCarregarItens: "Erro ao carregar itens: ",
  erroCarregarDashboard: "Erro ao carregar o dashboard: ",

  editarCategoria: "Editar Categoria",
  novaCategoria: "Nova Categoria",
  campoNomeObrigatorio: "Nome *",
  placeholderNomeCategoria: "Ex: Informática",
  campoCodigoObrigatorio: "Código de Identificação *",
  placeholderCodigo: "Ex: INFO",
  hintCodigo: "Curto e único — usado pra identificar a categoria rapidamente.",
  campoDescricaoOpcional: "Descrição (opcional)",
  placeholderDescricaoCategoria: "Do que essa categoria trata",
  criarCategoria: "Criar Categoria",

  categoriasCadastradas: "{count} categoria(s) cadastrada(s)",
  novaCategoriaBotao: "+ Nova Categoria",
  nenhumaCategoriaCadastrada: "Nenhuma categoria cadastrada ainda.",
  colunaCodigo: "Código",
  colunaItens: "Itens",
  colunaCriadaEm: "Criada em",

  statValorInvestido: "Valor Total Investido",
  hintValorInvestido: "Soma do valor pago — {count} {itemLabel}",
  itemAtivoSingular: "item ativo",
  itensAtivosPlural: "itens ativos",
  statPatrimonioAtual: "Patrimônio Atual",
  hintPatrimonioAtual: "Valor de mercado hoje dos bens ativos",
  valorizacaoTotal: "Valorização Total",
  depreciacaoTotalLabel: "Depreciação Total",
  sufixoDesvalorizacaoMedia: "de desvalorização média",
  itemNaoEntraSingular: "item ativo não entra",
  itensNaoEntramPlural: "itens ativos não entram",
  oItemSingular: "o item",
  osItensPlural: "os itens",
  itensExcluidosAviso:
    "{count} {itemLabel} nesses números por falta de valor pago e/ou valor atual — edite {itemArtigo} na aba {tab} pra completar.",
  tituloDistribuicaoCategoria: "Patrimônio Atual por Categoria",
  distribuicaoVazia:
    "Nenhum item ativo com valor pago e valor atual preenchidos ainda — cadastre os dois valores nos itens pra ver a distribuição aqui.",

  editarItem: "Editar Item",
  novaEtiquetaItem: "Nova Etiqueta / Item",
  cadastreCategoriaPrimeiro: "Cadastre ao menos uma categoria na aba {tab} antes de adicionar itens.",
  campoNumeroEtiqueta: "Número da Etiqueta / Código *",
  placeholderEtiqueta: "Ex: LSF-0042",
  campoCategoriaObrigatorio: "Categoria *",
  campoNomeItem: "Nome do Item *",
  placeholderNomeItem: "Ex: Câmera Sony FX3",
  campoLocalizacao: "Localização",
  placeholderLocalizacao: "Ex: Matriz Araras",
  campoDataAquisicao: "Data de Aquisição *",
  campoValorPago: "Valor Pago (R$) *",
  hintValorPago: "Quanto foi investido na aquisição.",
  campoValorAtual: "Valor Atual (R$) *",
  hintValorAtual: "Valor de mercado hoje.",
  valorizacaoLabel: "Valorização",
  depreciacaoLabel: "Depreciação",
  campoResponsavelAtual: "Responsável Atual",
  placeholderResponsavel: "Colaborador ou setor — Ex: Estúdio A",
  cadastrarItem: "Cadastrar Item",

  itensContagem: "{filtrados} de {total} item(ns)",
  novaEtiquetaBotao: "+ Nova Etiqueta",
  placeholderBuscaItens: "Etiqueta, item, responsável ou localização...",
  todosStatus: "Todos os status",
  todasCategorias: "Todas as categorias",
  cadastreCategoriaParaItens: "Cadastre uma categoria primeiro para começar a lançar itens de inventário.",
  nenhumItemCadastrado: "Nenhum item cadastrado ainda.",
  nenhumItemComFiltros: "Nenhum item corresponde aos filtros atuais.",
  colunaEtiqueta: "Etiqueta",
  colunaLocalizacao: "Localização",
  colunaResponsavel: "Responsável",
  colunaAquisicao: "Aquisição",
  colunaPagoAtual: "Pago / Atual",
  colunaDepreciacao: "Depreciação",
  semDados: "Sem dados",
};
