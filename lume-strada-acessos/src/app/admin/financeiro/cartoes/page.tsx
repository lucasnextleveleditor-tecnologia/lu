import Link from "next/link";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { OlhoValoresToggle } from "@/components/ui/OlhoValoresToggle";
import { IconCreditCard, IconChevronLeft } from "@/components/ui/icons";
import { MesNav } from "@/components/admin/financeiro/MesNav";
import { ContextoToggle } from "@/components/admin/financeiro/ContextoToggle";
import { CartoesCard } from "@/components/admin/financeiro/CartoesCard";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosFinanceiro, type FinanceiroSearchParams } from "@/app/admin/financeiro/data";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<FinanceiroSearchParams>;
}

const BASE_PATH = "/admin/financeiro/cartoes";

/** Aberta ao clicar no StatTile "Limite Disponível" da página principal do Financeiro. */
export default async function CartoesPage({ searchParams }: PageProps) {
  const { dict } = await getDictionary();
  const params = await searchParams;
  const { referencia, contexto, mesParamStr, contasComSaldo, cartoesFiltrados, limiteDisponivelTotal } =
    await buscarDadosFinanceiro(params);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/financeiro?mes=${mesParamStr}${contexto !== "todos" ? `&contexto=${contexto}` : ""}`}
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.financeiro.voltarParaFinanceiro}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{dict.financeiro.cartoesTituloPagina}</h1>
            <p className="mt-0.5 text-sm text-ink-muted">{dict.financeiro.cartoesSubtituloPagina}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <OlhoValoresToggle />
            <ContextoToggle referencia={referencia} contexto={contexto} basePath={BASE_PATH} />
            <MesNav referencia={referencia} contexto={contexto} basePath={BASE_PATH} />
          </div>
        </div>
      </div>

      <div className="sm:max-w-xs">
        <StatTile
          icon={IconCreditCard}
          label={dict.financeiro.statLimiteDisponivel}
          value={<ValorPrivado valor={fmtBRL(limiteDisponivelTotal)} />}
          hint={dict.financeiro.hintCartoesQtd.replace("{n}", String(cartoesFiltrados.length))}
        />
      </div>

      <div className="max-w-2xl">
        <CartoesCard cartoes={cartoesFiltrados} contas={contasComSaldo} referencia={referencia} />
      </div>
    </div>
  );
}
