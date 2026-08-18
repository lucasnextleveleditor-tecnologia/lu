import { CategoriaTransacaoPage } from "@/components/admin/financeiro/CategoriaTransacaoPage";
import type { FinanceiroSearchParams } from "@/app/admin/financeiro/data";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<FinanceiroSearchParams>;
}

/** Aberta ao clicar no StatTile "Despesas do Mês" da página principal do Financeiro — ver `CategoriaTransacaoPage`. */
export default async function DespesasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <CategoriaTransacaoPage tipo="despesa" searchParams={params} />;
}
