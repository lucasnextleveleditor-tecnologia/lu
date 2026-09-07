export type TipoProduto = "principal" | "order_bump";

/**
 * Cadastro de produto principal / order bump — ver supabase/infoprodutos.sql
 * seção 1 (uma tabela só, com `tipo`, em vez de duas tabelas redundantes).
 *
 * `cliente_cadastro_id`/`cliente_id` seguem o MESMO padrão de
 * `MetaDiariaRow`/`TrafegoRegistroRow` (ver migração
 * `infoprodutos_por_cliente_e_trafego_tipo_resultado`): cada produto (e cada
 * anúncio/meta de calendário/fechamento) pertence a UM cliente — o espaço de
 * Info-Produtos inteiro passou a ser separado por cliente, nunca mais um
 * pool global misturado. `cliente_id` fica null aqui (não há portal do
 * cliente pra Info-Produtos ainda — ver comentário em `infoprodutos-actions.ts`).
 */
export interface ProdutoRow {
  id: string;
  cliente_cadastro_id: string | null; // uuid -> clientes.id
  cliente_id: string | null; // uuid -> profiles.id — sempre null por enquanto (sem portal do cliente pra Info-Produtos)
  nome: string;
  tipo: TipoProduto;
  valor: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type TipoCriativo = "imagem" | "video";

/**
 * Cadastro de Criativo — separado do lançamento diário de performance (ver
 * `criativos` em `supabase/criativos-cadastro.sql`). Cadastra uma vez
 * (nome + orçamento diário planejado), reaproveita em vários lançamentos de
 * `AnuncioTrackingRow` (`criativo_id`). `orcamento_diario` é só o valor
 * PADRÃO que pré-preenche "Investimento do Dia" num anúncio NOVO — nunca
 * entra em cálculo de lucro/receita, só o `investimento` gravado no
 * lançamento em si.
 */
export interface CriativoRow {
  id: string;
  cliente_cadastro_id: string | null; // uuid -> clientes.id
  nome: string;
  orcamento_diario: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

/** Um card de anúncio/lançamento diário — ligado a UM Criativo (cadastro, ver `CriativoRow`), UM produto principal + order bumps vendidos (ver `OrderBumpVendaLinha`) e a UM cliente (ver `ProdutoRow`). */
export interface AnuncioTrackingRow {
  id: string;
  cliente_cadastro_id: string | null; // uuid -> clientes.id
  cliente_id: string | null; // uuid -> profiles.id — sempre null por enquanto
  data: string; // ISO date (yyyy-mm-dd)
  semana_inicio: string; // ISO date — segunda-feira da semana de `data`
  /** @deprecated Texto livre antigo, antes de existir o cadastro de Criativos — mantido só pra exibir lançamentos feitos antes dessa migração (ver `criativo_id`). */
  nome_anuncio: string | null;
  criativo_id: string | null; // uuid -> criativos.id — obrigatório na tela pra lançamentos novos (ver AnuncioModal)
  criativo_path: string | null; // caminho no bucket "infoprodutos"
  criativo_tipo: TipoCriativo | null;
  produto_principal_id: string | null;
  order_bump_id: string | null;
  investimento: number;
  visualizacoes: number;
  cliques: number;
  vendas_principal: number;
  vendas_order_bump: number;
  receita_bruta: number; // calculada na criação, sempre editável depois
  /** Taxa da plataforma (Hotmart/Kiwify/etc) perdida NESSE lançamento — percentual sobre a receita bruta + valor fixo por venda. Pode ser 0 nos dois (ver `supabase/infoprodutos-taxa-plataforma.sql`); nunca null — sempre um número explícito. */
  taxa_percentual: number;
  taxa_fixa: number;
  created_at: string;
  updated_at: string;
}

/**
 * Uma linha de order bump vendido num anúncio — ver `anuncio_order_bump_vendas`
 * em `supabase/anuncio-order-bump-vendas.sql`. Um anúncio pode ter VÁRIAS
 * linhas (ex.: 1 unidade do produto X + 2 unidades do produto Y no mesmo
 * lançamento), por isso deixou de ser um único `order_bump_id` +
 * `vendas_order_bump` em `AnuncioTrackingRow` — esses dois campos continuam
 * na tabela só como AGREGADO (mantido automaticamente pela Server Action),
 * pra não quebrar quem lê a soma (fecharSemana, Relatórios, Dashboard 7 Dias).
 */
export interface OrderBumpVendaLinha {
  produtoId: string;
  nome: string;
  valor: number;
  quantidade: number;
}

/** `AnuncioTrackingRow` com a URL pública do criativo já resolvida (ver `getPublicUrl` no server), os nomes dos produtos e as linhas de order bump vendido, pra não cruzar tabela nenhuma em tela. */
export interface AnuncioComRelacoes extends AnuncioTrackingRow {
  criativo_url: string | null;
  /** Nome do `CriativoRow` vinculado (`criativo_id`) — null em lançamentos antigos sem Criativo cadastrado (ver `nome_anuncio`). */
  criativo_nome: string | null;
  produto_principal_nome: string | null;
  order_bump_nome: string | null;
  order_bump_vendas: OrderBumpVendaLinha[];
}

/** Meta de LUCRO LÍQUIDO (não faturamento) de um dia específico, setada no calendário — uma por cliente+dia (ver `ProdutoRow`). */
export interface MetaCalendarioRow {
  id: string;
  cliente_cadastro_id: string | null; // uuid -> clientes.id
  cliente_id: string | null; // uuid -> profiles.id — sempre null por enquanto
  data: string; // ISO date
  meta_lucro: number;
  created_at: string;
  updated_at: string;
}

/** Registro do "Fechamento da Semana" — trava reembolsos + lucro líquido real daquele período de 7 dias, uma por cliente+semana (ver `ProdutoRow`). */
export interface FechamentoSemanalRow {
  id: string;
  cliente_cadastro_id: string | null; // uuid -> clientes.id
  cliente_id: string | null; // uuid -> profiles.id — sempre null por enquanto
  semana_inicio: string; // ISO date (segunda-feira)
  semana_fim: string; // ISO date (domingo)
  receita_bruta_total: number;
  /** Receita já descontada da taxa da plataforma de cada anúncio somado (ver `calcularReceitaLiquida`) — é a base real do `lucro_liquido_real`, não a bruta. */
  receita_liquida_total: number;
  investimento_total: number;
  reembolsos: number;
  lucro_liquido_real: number;
  fechado_em: string;
  created_at: string;
}

/** Taxa padrão da plataforma por cliente (marca/infoproduto) — pré-preenche todo NOVO lançamento de anúncio, mas fica livre pra sobrescrever por lançamento (ver `AnuncioModal`). Ausência de linha pro cliente = padrão 0%/R$0,00. */
export interface TaxaPadraoRow {
  id: string;
  cliente_cadastro_id: string;
  taxa_percentual: number;
  taxa_fixa: number;
}
