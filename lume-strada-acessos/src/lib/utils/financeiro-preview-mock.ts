import type { ComponentType, SVGProps } from "react";
import {
  IconCar,
  IconCoffee,
  IconCreditCard,
  IconDollarSign,
  IconHeart,
  IconHome,
  IconShoppingBag,
  IconWallet,
} from "@/components/ui/icons";

/**
 * Dados MOCKADOS (fictícios) só pra visualizar o novo layout do Financeiro
 * (inspirado no Mobills) antes de integrar com o Supabase de verdade — ver
 * `src/app/admin/financeiro/novo/page.tsx`. Nada aqui bate em banco; a
 * página real (`/admin/financeiro`, `financeiro/actions.ts`) continua
 * intocada. Quando o layout for aprovado, este arquivo é substituído pelos
 * dados reais (`fin_contas`, `fin_categorias`, `fin_transacoes`, etc.).
 *
 * As 7 cores das categorias de despesa vêm da paleta categórica validada
 * pela skill interna de dataviz (ordem fixa, nunca ciclada) — rodada contra
 * a superfície escura real do app (`#09090b`, tokens `base-900`/`base-950`):
 * todos os 6 checks (banda de luminosidade, piso de croma, separação CVD
 * ΔE 8.4+, piso visão normal ΔE 19.3+, contraste ≥3:1) passaram. As cores
 * de status (`good/warning/serious/critical/neutral`) NÃO entram aqui —
 * ficam reservadas só para estado (pago/pendente/vencido).
 */

export type CategoriaIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface CategoriaPreview {
  id: string;
  nome: string;
  tipo: "receita" | "despesa";
  /** `null` para categorias de receita — elas não entram no donut de despesas. */
  cor: string | null;
  icon: CategoriaIcon;
}

export interface ContaPreview {
  id: string;
  nome: string;
  tipo: string;
  icon: CategoriaIcon;
  saldoAtual: number;
  saldoPrevisto: number;
}

export interface CartaoPreview {
  id: string;
  nome: string;
  limite: number;
  faturaAberta: number;
  faturaFechadaValor: number;
  faturaFechadaPaga: boolean;
  vencimento: string; // "dd/mm"
}

export interface TransacaoPreview {
  id: string;
  tipo: "receita" | "despesa";
  descricao: string;
  valor: number;
  data: string; // ISO yyyy-mm-dd
  categoriaId: string;
  contaId: string;
  pago: boolean;
}

// Ordem fixa — slots 1..7 da paleta categórica validada (dark, superfície #09090b).
export const CATEGORIAS_PREVIEW: CategoriaPreview[] = [
  { id: "cat-moradia", nome: "Moradia", tipo: "despesa", cor: "#3987e5", icon: IconHome },
  { id: "cat-transporte", nome: "Transporte", tipo: "despesa", cor: "#d95926", icon: IconCar },
  { id: "cat-alimentacao", nome: "Alimentação", tipo: "despesa", cor: "#199e70", icon: IconCoffee },
  { id: "cat-lazer", nome: "Lazer", tipo: "despesa", cor: "#c98500", icon: IconCoffee },
  { id: "cat-saude", nome: "Saúde", tipo: "despesa", cor: "#d55181", icon: IconHeart },
  { id: "cat-compras", nome: "Compras", tipo: "despesa", cor: "#008300", icon: IconShoppingBag },
  { id: "cat-outros", nome: "Outros", tipo: "despesa", cor: "#9085e9", icon: IconShoppingBag },
  { id: "cat-salario", nome: "Salário", tipo: "receita", cor: null, icon: IconDollarSign },
  { id: "cat-freelance", nome: "Freelance", tipo: "receita", cor: null, icon: IconDollarSign },
];

export const CONTAS_PREVIEW: ContaPreview[] = [
  { id: "conta-nubank", nome: "Nubank", tipo: "Conta Corrente", icon: IconWallet, saldoAtual: 4820.5, saldoPrevisto: 5340.1 },
  { id: "conta-inter", nome: "Inter", tipo: "Conta Corrente", icon: IconWallet, saldoAtual: 1275.3, saldoPrevisto: 980.0 },
  { id: "conta-carteira", nome: "Carteira", tipo: "Dinheiro", icon: IconWallet, saldoAtual: 230.0, saldoPrevisto: 230.0 },
];

export const CARTOES_PREVIEW: CartaoPreview[] = [
  { id: "cartao-nubank", nome: "Nubank Ultravioleta", limite: 8000, faturaAberta: 1342.9, faturaFechadaValor: 2891.4, faturaFechadaPaga: false, vencimento: "10/09" },
  { id: "cartao-inter", nome: "Inter Gold", limite: 3500, faturaAberta: 412.0, faturaFechadaValor: 968.2, faturaFechadaPaga: true, vencimento: "05/09" },
];

function catId(nome: string): string {
  return CATEGORIAS_PREVIEW.find((c) => c.nome === nome)!.id;
}

// Transações mockadas cobrindo julho e agosto/2026 (mês atual) — o bastante
// pra validar o agrupamento por dia, o subtotal diário e a navegação de mês
// trocando o conjunto exibido.
export const TRANSACOES_PREVIEW: TransacaoPreview[] = [
  // Agosto/2026
  { id: "t1", tipo: "receita", descricao: "Salário", valor: 6200, data: "2026-08-05", categoriaId: catId("Salário"), contaId: "conta-nubank", pago: true },
  { id: "t2", tipo: "despesa", descricao: "Aluguel", valor: 1850, data: "2026-08-05", categoriaId: catId("Moradia"), contaId: "conta-nubank", pago: true },
  { id: "t3", tipo: "despesa", descricao: "Condomínio", valor: 420, data: "2026-08-05", categoriaId: catId("Moradia"), contaId: "conta-nubank", pago: true },
  { id: "t4", tipo: "despesa", descricao: "Supermercado Extra", valor: 386.24, data: "2026-08-07", categoriaId: catId("Alimentação"), contaId: "conta-nubank", pago: true },
  { id: "t5", tipo: "despesa", descricao: "Uber", valor: 34.5, data: "2026-08-07", categoriaId: catId("Transporte"), contaId: "conta-carteira", pago: true },
  { id: "t6", tipo: "despesa", descricao: "iFood", valor: 95.5, data: "2026-08-07", categoriaId: catId("Alimentação"), contaId: "conta-nubank", pago: true },
  { id: "t7", tipo: "receita", descricao: "Projeto freelance — landing page", valor: 1400, data: "2026-08-09", categoriaId: catId("Freelance"), contaId: "conta-inter", pago: true },
  { id: "t8", tipo: "despesa", descricao: "Academia", valor: 129.9, data: "2026-08-09", categoriaId: catId("Saúde"), contaId: "conta-nubank", pago: true },
  { id: "t9", tipo: "despesa", descricao: "Farmácia", valor: 78.3, data: "2026-08-09", categoriaId: catId("Saúde"), contaId: "conta-carteira", pago: true },
  { id: "t10", tipo: "despesa", descricao: "Cinema", valor: 62.0, data: "2026-08-11", categoriaId: catId("Lazer"), contaId: "conta-inter", pago: true },
  { id: "t11", tipo: "despesa", descricao: "Assinatura streaming", valor: 44.9, data: "2026-08-11", categoriaId: catId("Lazer"), contaId: "conta-nubank", pago: true },
  { id: "t12", tipo: "despesa", descricao: "Combustível", valor: 210.0, data: "2026-08-12", categoriaId: catId("Transporte"), contaId: "conta-nubank", pago: true },
  { id: "t13", tipo: "despesa", descricao: "Tênis novo", valor: 349.9, data: "2026-08-12", categoriaId: catId("Compras"), contaId: "conta-nubank", pago: false },
  { id: "t14", tipo: "despesa", descricao: "Presente aniversário", valor: 150.0, data: "2026-08-12", categoriaId: catId("Outros"), contaId: "conta-carteira", pago: false },
  { id: "t15", tipo: "despesa", descricao: "Internet", valor: 129.9, data: "2026-08-14", categoriaId: catId("Moradia"), contaId: "conta-nubank", pago: false },
  { id: "t16", tipo: "despesa", descricao: "Plano de celular", valor: 59.9, data: "2026-08-14", categoriaId: catId("Moradia"), contaId: "conta-nubank", pago: false },
  { id: "t17", tipo: "despesa", descricao: "Padaria", valor: 28.4, data: "2026-08-14", categoriaId: catId("Alimentação"), contaId: "conta-carteira", pago: true },
  { id: "t18", tipo: "despesa", descricao: "Fatura Nubank Ultravioleta", valor: 1342.9, data: "2026-08-25", categoriaId: catId("Compras"), contaId: "conta-nubank", pago: false },

  // Julho/2026 — pra navegação de mês ter o que mostrar ao voltar "‹".
  { id: "t19", tipo: "receita", descricao: "Salário", valor: 6200, data: "2026-07-05", categoriaId: catId("Salário"), contaId: "conta-nubank", pago: true },
  { id: "t20", tipo: "despesa", descricao: "Aluguel", valor: 1850, data: "2026-07-05", categoriaId: catId("Moradia"), contaId: "conta-nubank", pago: true },
  { id: "t21", tipo: "despesa", descricao: "Supermercado", valor: 412.6, data: "2026-07-08", categoriaId: catId("Alimentação"), contaId: "conta-nubank", pago: true },
  { id: "t22", tipo: "despesa", descricao: "Consulta médica", valor: 250.0, data: "2026-07-15", categoriaId: catId("Saúde"), contaId: "conta-inter", pago: true },
  { id: "t23", tipo: "despesa", descricao: "Show", valor: 180.0, data: "2026-07-18", categoriaId: catId("Lazer"), contaId: "conta-nubank", pago: true },
  { id: "t24", tipo: "despesa", descricao: "Manutenção do carro", valor: 540.0, data: "2026-07-22", categoriaId: catId("Transporte"), contaId: "conta-nubank", pago: true },
];

export function categoriaPorId(id: string): CategoriaPreview {
  return CATEGORIAS_PREVIEW.find((c) => c.id === id)!;
}

export function contaPorId(id: string): ContaPreview {
  return CONTAS_PREVIEW.find((c) => c.id === id)!;
}
