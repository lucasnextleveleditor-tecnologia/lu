/**
 * Módulo Financeiro (`/admin/financeiro`) — página principal, os três cards
 * de cadastro (Contas, Cartões, Categorias), navegação de mês/contexto, os
 * modais de criação/edição e o gerenciador de transações (com parcelamento e
 * lançamento multi-moeda com cotação ao vivo). Chaves com `{placeholder}`
 * são preenchidas via `.replace()` no componente — mesmo padrão do
 * `login.ts` (`acessoExpiradoData`). Fica de fora deste dicionário: as
 * mensagens de erro do Server Action (`app/admin/financeiro/actions.ts`,
 * fora de escopo dessa leva) e a saída das funções de formatação
 * (`fmtBRL`/`fmtData`/`fmtMoedaEstrangeira`), que ficam sempre em pt-BR.
 */
export interface FinanceiroDict {
  // Geral / reaproveitado em vários componentes do módulo
  tituloPagina: string;
  subtituloPagina: string;

  // Telas de detalhe por categoria (StatTiles clicáveis: /receitas, /despesas, /contas, /cartoes)
  voltarParaFinanceiro: string;
  receitasTituloPagina: string;
  receitasSubtituloPagina: string;
  despesasTituloPagina: string;
  despesasSubtituloPagina: string;
  contasTituloPagina: string;
  contasSubtituloPagina: string;
  cartoesTituloPagina: string;
  cartoesSubtituloPagina: string;
  statMesAnterior: string;
  contextoPessoal: string;
  contextoProfissional: string;
  contextoLabel: string;
  nomeObrigatorio: string;
  tipoObrigatorio: string;
  tipoLabel: string;
  despesaLabel: string;
  receitaLabel: string;
  transferenciaLabel: string;
  vencimentoLabel: string;
  contaCartaoLabel: string;
  parcelaLabel: string;
  moedaOriginalLabel: string;
  valorReaisLabel: string;
  origemLabel: string;
  contaGenerica: string;

  // Banner de preview (app/admin/financeiro/novo/page.tsx)
  previewAvisoTitulo: string;
  previewAvisoTexto: string;

  // Stat tiles (app/admin/financeiro/page.tsx)
  statSaldoContas: string;
  statLimiteDisponivel: string;
  statReceitasMes: string;
  statDespesasMes: string;
  hintContasQtd: string;
  hintCartoesQtd: string;
  hintLancadasNoPeriodo: string;

  // CartoesCard
  cartoesCreditoTitulo: string;
  btnNovoCartao: string;
  cartoesVazio: string;
  fechaDiaVenceDia: string;
  excluirCartaoAria: string;
  excluirCartaoTitle: string;
  usadoLabel: string;
  deLabel: string;
  disponivelLabel: string;
  pagarFaturaBtn: string;

  // CategoriasCard
  categoriasTitulo: string;
  btnNovaCategoria: string;
  categoriasVazio: string;
  cliqueParaExcluirTitle: string;

  // ContasCard
  contasCarteirasTitulo: string;
  btnNovaConta: string;
  contasVazio: string;
  excluirContaAria: string;
  excluirContaTitle: string;

  // MesNav
  mesAnteriorAria: string;
  proximoMesAria: string;
  voltarParaHoje: string;
  abrirCalendarioMesAria: string;
  anoAnteriorAria: string;
  proximoAnoAria: string;

  // NovaCategoriaModal
  novaCategoriaTitulo: string;
  placeholderNomeCategoria: string;
  emojiLabel: string;
  corLabel: string;
  escolherCorAria: string;
  criarCategoriaBtn: string;

  // NovaContaModal
  novaContaTitulo: string;
  editarContaTitulo: string;
  placeholderNomeConta: string;
  tipoOpcionalLabel: string;
  placeholderTipoConta: string;
  saldoInicialLabel: string;
  saldoInicialHint: string;
  criarContaBtn: string;
  editarContaAria: string;

  // NovoCartaoModal
  novoCartaoTitulo: string;
  editarCartaoTitulo: string;
  placeholderNomeCartao: string;
  limiteTotalLabel: string;
  diaFechamentoLabel: string;
  diaVencimentoLabel: string;
  criarCartaoBtn: string;
  editarCartaoAria: string;

  // PagarFaturaModal
  selecioneContaPagamentoErro: string;
  pagarFaturaTitulo: string;
  valorEmAbertoLabel: string;
  cadastreContaAntes: string;
  pagarComContaLabel: string;
  pagarFaturaHint: string;
  pagandoLabel: string;
  confirmarPagamentoBtn: string;

  // TransacaoModal
  editarTransacaoTitulo: string;
  novaTransacaoTitulo: string;
  descricaoObrigatorio: string;
  placeholderDescricaoTransferencia: string;
  placeholderDescricaoGeral: string;
  valorTotalCompraLabel: string;
  valorObrigatorioLabel: string;
  contextoObrigatorio: string;
  moedaLancamentoLabel: string;
  moedaReal: string;
  moedaDolar: string;
  moedaEuro: string;
  buscandoCotacao: string;
  cotacaoLabel: string;
  equivaleALabel: string;
  atualizarBtn: string;
  pagarComLabel: string;
  cartaoCreditoOpcaoLabel: string;
  contaObrigatorio: string;
  nenhumaContaContexto: string;
  cartaoObrigatorio: string;
  nenhumCartaoContexto: string;
  parcelarCompraLabel: string;
  numeroParcelasLabel: string;
  parcelaPreviewPrefixo: string;
  parcelaPreviewSufixo: string;
  contaOrigemLabel: string;
  contaDestinoLabel: string;
  dataPrimeiraParcelaLabel: string;
  dataVencimentoLabel: string;
  jaPagaLabel: string;
  transacaoRecorrenteLabel: string;
  semanalLabel: string;
  mensalLabel: string;
  anualLabel: string;
  selecioneContaErro: string;
  selecioneCartaoErro: string;
  selecioneOrigemDestinoErro: string;
  cotacaoNaoConfirmadaErro: string;
  lancarTransacaoBtn: string;

  // TransacoesManager
  transacoesDoMesTitulo: string;
  lancamentosContagem: string;
  vencidasContagem: string;
  placeholderBusca: string;
  semContaOuCartaoVazio: string;
  semTransacoesMes: string;
  semTransacoesFiltro: string;
  lancadoEmLabel: string;
  baixaInteligenteTitle: string;
  reabrirBtn: string;
  darBaixaBtn: string;
}

export const financeiro: FinanceiroDict = {
  tituloPagina: "Financeiro",
  subtituloPagina: "Contas, cartões e lançamentos da agência.",

  voltarParaFinanceiro: "Voltar pro Financeiro",
  receitasTituloPagina: "Receitas",
  receitasSubtituloPagina: "Todas as receitas lançadas no período, com opção de editar, cadastrar novas e comparar com o mês anterior.",
  despesasTituloPagina: "Despesas",
  despesasSubtituloPagina: "Todas as despesas lançadas no período, com opção de editar, cadastrar novas e comparar com o mês anterior.",
  contasTituloPagina: "Contas & Carteiras",
  contasSubtituloPagina: "Todas as contas e carteiras cadastradas, com o saldo sempre atualizado.",
  cartoesTituloPagina: "Cartões de Crédito",
  cartoesSubtituloPagina: "Todos os cartões cadastrados, com limite disponível e fatura.",
  statMesAnterior: "Mês Anterior",
  contextoPessoal: "Pessoal",
  contextoProfissional: "Profissional",
  contextoLabel: "Contexto",
  nomeObrigatorio: "Nome *",
  tipoObrigatorio: "Tipo *",
  tipoLabel: "Tipo",
  despesaLabel: "Despesa",
  receitaLabel: "Receita",
  transferenciaLabel: "Transferência",
  vencimentoLabel: "Vencimento",
  contaCartaoLabel: "Conta/Cartão",
  parcelaLabel: "Parcela",
  moedaOriginalLabel: "Moeda Original",
  valorReaisLabel: "Valor (R$)",
  origemLabel: "Origem",
  contaGenerica: "Conta",

  previewAvisoTitulo: "Preview do novo Financeiro.",
  previewAvisoTexto:
    "Layout final com dados fictícios — nada aqui é salvo no banco ainda. A página em uso continua em",

  statSaldoContas: "Saldo em Contas",
  statLimiteDisponivel: "Limite Disponível",
  statReceitasMes: "Receitas do Mês",
  statDespesasMes: "Despesas do Mês",
  hintContasQtd: "{n} conta(s)",
  hintCartoesQtd: "{n} cartão(ões)",
  hintLancadasNoPeriodo: "Lançadas no período",

  cartoesCreditoTitulo: "Cartões de Crédito",
  btnNovoCartao: "+ Novo",
  cartoesVazio: "Nenhum cartão cadastrado ainda.",
  fechaDiaVenceDia: "Fecha dia {fechamento} · Vence dia {vencimento}",
  excluirCartaoAria: "Excluir cartão",
  excluirCartaoTitle: "Excluir cartão (remove também as transações vinculadas)",
  usadoLabel: "Usado:",
  deLabel: "de",
  disponivelLabel: "Disponível:",
  pagarFaturaBtn: "Pagar Fatura",

  categoriasTitulo: "Categorias",
  btnNovaCategoria: "+ Nova",
  categoriasVazio: "Nenhuma categoria cadastrada ainda.",
  cliqueParaExcluirTitle: "Clique para excluir",

  contasCarteirasTitulo: "Contas & Carteiras",
  btnNovaConta: "+ Nova",
  contasVazio: "Nenhuma conta cadastrada ainda.",
  excluirContaAria: "Excluir conta",
  excluirContaTitle: "Excluir conta (remove também as transações vinculadas)",

  mesAnteriorAria: "Mês anterior",
  proximoMesAria: "Próximo mês",
  voltarParaHoje: "Voltar para hoje",
  abrirCalendarioMesAria: "Abrir calendário de mês/ano",
  anoAnteriorAria: "Ano anterior",
  proximoAnoAria: "Próximo ano",

  novaCategoriaTitulo: "Nova Categoria",
  placeholderNomeCategoria: "Ex: Software & Assinaturas",
  emojiLabel: "Emoji",
  corLabel: "Cor",
  escolherCorAria: "Escolher cor {hex}",
  criarCategoriaBtn: "Criar Categoria",

  novaContaTitulo: "Nova Conta / Carteira",
  editarContaTitulo: "Editar Conta / Carteira",
  placeholderNomeConta: "Ex: Conta Corrente Nubank",
  tipoOpcionalLabel: "Tipo (opcional)",
  placeholderTipoConta: "Corrente, Poupança...",
  saldoInicialLabel: "Saldo Inicial (R$)",
  saldoInicialHint: "O saldo atual é sempre recalculado a partir das transações lançadas.",
  criarContaBtn: "Criar Conta",
  editarContaAria: "Editar conta",

  novoCartaoTitulo: "Novo Cartão de Crédito",
  editarCartaoTitulo: "Editar Cartão de Crédito",
  placeholderNomeCartao: "Ex: Nubank Empresarial",
  limiteTotalLabel: "Limite Total (R$) *",
  diaFechamentoLabel: "Dia do Fechamento *",
  diaVencimentoLabel: "Dia do Vencimento *",
  criarCartaoBtn: "Criar Cartão",
  editarCartaoAria: "Editar cartão",

  selecioneContaPagamentoErro: "Selecione a conta de onde vai sair o pagamento.",
  pagarFaturaTitulo: "Pagar Fatura — {nome}",
  valorEmAbertoLabel: "Valor em aberto (não incluído em fatura já paga)",
  cadastreContaAntes: "Cadastre ao menos uma conta {contexto} antes de pagar a fatura.",
  pagarComContaLabel: "Pagar com qual conta? *",
  pagarFaturaHint: 'Isso lança uma despesa "Pagamento de fatura" nessa conta e libera o limite consumido do cartão.',
  pagandoLabel: "Pagando...",
  confirmarPagamentoBtn: "Confirmar Pagamento",

  editarTransacaoTitulo: "Editar Transação",
  novaTransacaoTitulo: "Nova Transação",
  descricaoObrigatorio: "Descrição *",
  placeholderDescricaoTransferencia: "Ex: Transferência para reserva",
  placeholderDescricaoGeral: "Ex: Assinatura Adobe CC",
  valorTotalCompraLabel: "Valor Total da Compra *",
  valorObrigatorioLabel: "Valor *",
  contextoObrigatorio: "Contexto *",
  moedaLancamentoLabel: "Moeda de Lançamento",
  moedaReal: "Real (R$)",
  moedaDolar: "Dólar (US$)",
  moedaEuro: "Euro (€)",
  buscandoCotacao: "Buscando cotação do dia...",
  cotacaoLabel: "Cotação:",
  equivaleALabel: "Equivale a",
  atualizarBtn: "Atualizar",
  pagarComLabel: "Pagar com *",
  cartaoCreditoOpcaoLabel: "Cartão de Crédito",
  contaObrigatorio: "Conta *",
  nenhumaContaContexto: "Nenhuma conta {contexto} cadastrada ainda.",
  cartaoObrigatorio: "Cartão *",
  nenhumCartaoContexto: "Nenhum cartão {contexto} cadastrado ainda.",
  parcelarCompraLabel: "Parcelar essa compra",
  numeroParcelasLabel: "Número de Parcelas *",
  parcelaPreviewPrefixo: "{n}x de",
  parcelaPreviewSufixo:
    "— a 1ª parcela vence na data escolhida abaixo, as seguintes uma por mês. Todas nascem pendentes; dê baixa em cada uma conforme forem sendo pagas.",
  contaOrigemLabel: "Conta de Origem *",
  contaDestinoLabel: "Conta de Destino *",
  dataPrimeiraParcelaLabel: "Data da 1ª Parcela *",
  dataVencimentoLabel: "Data de Vencimento *",
  jaPagaLabel: "Já paga / efetivada",
  transacaoRecorrenteLabel: "Transação recorrente",
  semanalLabel: "Semanal",
  mensalLabel: "Mensal",
  anualLabel: "Anual",
  selecioneContaErro: "Selecione a conta.",
  selecioneCartaoErro: "Selecione o cartão.",
  selecioneOrigemDestinoErro: "Selecione a conta de origem e a de destino.",
  cotacaoNaoConfirmadaErro: "Não conseguimos confirmar a cotação do dia — tente atualizar antes de salvar.",
  lancarTransacaoBtn: "Lançar Transação",

  transacoesDoMesTitulo: "Transações do Mês",
  lancamentosContagem: "{filtradas} de {total} lançamento(s)",
  vencidasContagem: "{vencidas} vencida(s)",
  placeholderBusca: "Descrição, categoria, conta...",
  semContaOuCartaoVazio: "Cadastre uma conta ou cartão primeiro para começar a lançar transações.",
  semTransacoesMes: "Nenhuma transação lançada nesse mês.",
  semTransacoesFiltro: "Nenhuma transação corresponde aos filtros atuais.",
  lancadoEmLabel: "Lançado em",
  baixaInteligenteTitle: "Baixa Inteligente — marca como paga/pendente",
  reabrirBtn: "Reabrir",
  darBaixaBtn: "Dar Baixa",
};
