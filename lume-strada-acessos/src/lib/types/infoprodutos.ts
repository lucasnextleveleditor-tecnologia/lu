export type TipoProduto = "principal" | "order_bump";

/** Cadastro de produto principal / order bump — ver supabase/infoprodutos.sql seção 1 (uma tabela só, com `tipo`, em vez de duas tabelas redundantes). */
export interface ProdutoRow {
  id: string;
  nome: string;
  tipo: TipoProduto;
  valor: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type TipoCriativo = "imagem" | "video";

/** Um card de anúncio/criativo rodando em um dia — ligado a UM produto principal + UM order bump (ver nota de simplificação no SQL). */
export interface AnuncioTrackingRow {
  id: string;
  data: string; // ISO date (yyyy-mm-dd)
  semana_inicio: string; // ISO date — segunda-feira da semana de `data`
  nome_anuncio: string | null;
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
  created_at: string;
  updated_at: string;
}

/** `AnuncioTrackingRow` com a URL pública do criativo já resolvida (ver `getPublicUrl` no server) e os nomes dos produtos, pra não cruzar tabela nenhuma em tela. */
export interface AnuncioComRelacoes extends AnuncioTrackingRow {
  criativo_url: string | null;
  produto_principal_nome: string | null;
  order_bump_nome: string | null;
}

/** Meta de LUCRO LÍQUIDO (não faturamento) de um dia específico, setada no calendário. */
export interface MetaCalendarioRow {
  id: string;
  data: string; // ISO date
  meta_lucro: number;
  created_at: string;
  updated_at: string;
}

/** Registro do "Fechamento da Semana" — trava reembolsos + lucro líquido real daquele período de 7 dias. */
export interface FechamentoSemanalRow {
  id: string;
  semana_inicio: string; // ISO date (segunda-feira)
  semana_fim: string; // ISO date (domingo)
  receita_bruta_total: number;
  investimento_total: number;
  reembolsos: number;
  lucro_liquido_real: number;
  fechado_em: string;
  created_at: string;
}
