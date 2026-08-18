/**
 * Strings verdadeiramente GENÉRICAS, reaproveitadas em vários módulos (botões
 * de ação, confirmações, estados vazios). Texto específico de um módulo
 * (ex: rótulo de um campo só do Financeiro) fica no dicionário DAQUELE
 * módulo, não aqui — `common` é só o vocabulário repetido em 3+ lugares
 * diferentes do app.
 */
export interface CommonDict {
  salvar: string;
  salvarAlteracoes: string;
  salvando: string;
  cancelar: string;
  editar: string;
  excluir: string;
  remover: string;
  adicionar: string;
  novo: string;
  confirmar: string;
  fechar: string;
  buscar: string;
  filtros: string;
  limparFiltros: string;
  selecione: string;
  semCategoria: string;
  acoes: string;
  sim: string;
  nao: string;
  tentarDeNovo: string;
  voltar: string;
  carregando: string;
  nenhumResultado: string;
  confirmarExclusao: string;
  status: string;
  ativo: string;
  inativo: string;
  data: string;
  descricao: string;
  nome: string;
  email: string;
  telefone: string;
  valor: string;
  categoria: string;
  todos: string;
  idioma: string;
  limpar: string;
  dataPlaceholder: string;
}

export const common: CommonDict = {
  salvar: "Salvar",
  salvarAlteracoes: "Salvar Alterações",
  salvando: "Salvando...",
  cancelar: "Cancelar",
  editar: "Editar",
  excluir: "Excluir",
  remover: "Remover",
  adicionar: "Adicionar",
  novo: "Novo",
  confirmar: "Confirmar",
  fechar: "Fechar",
  buscar: "Buscar",
  filtros: "Filtros",
  limparFiltros: "Limpar filtros",
  selecione: "Selecione...",
  semCategoria: "Sem categoria",
  acoes: "Ações",
  sim: "Sim",
  nao: "Não",
  tentarDeNovo: "Tentar de novo",
  voltar: "Voltar",
  carregando: "Carregando...",
  nenhumResultado: "Nenhum resultado encontrado.",
  confirmarExclusao: "Excluir?",
  status: "Status",
  ativo: "Ativo",
  inativo: "Inativo",
  data: "Data",
  descricao: "Descrição",
  nome: "Nome",
  email: "E-mail",
  telefone: "Telefone",
  valor: "Valor",
  categoria: "Categoria",
  todos: "Todos",
  idioma: "Idioma",
  limpar: "Limpar",
  dataPlaceholder: "dd/mm/aaaa",
};
