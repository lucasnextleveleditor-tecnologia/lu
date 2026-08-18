import Link from "next/link";
import { addMeses, mesParam } from "@/lib/utils/financeiro";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { OlhoValoresToggle } from "@/components/ui/OlhoValoresToggle";
import { IconTrendingUp, IconAlertTriangle, IconChevronLeft } from "@/components/ui/icons";
import { MesNav } from "@/components/admin/financeiro/MesNav";
import { ContextoToggle } from "@/components/admin/financeiro/ContextoToggle";
import { TransacoesManager } from "@/components/admin/financeiro/TransacoesManager";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosFinanceiro, type FinanceiroSearchParams } from "@/app/admin/financeiro/data";

interface CategoriaTransacaoPageProps {
  tipo: "receita" | "despesa";
  searchParams: FinanceiroSearchParams;
}

/**
 * Tela de detalhe de UM tipo de lançamento (Receitas ou Despesas) — aberta
 * ao clicar no StatTile correspondente na página principal do Financeiro
 * (ver `page.tsx`). Reaproveita `buscarDadosFinanceiro` (mesma fonte de
 * dados da página principal) e o `TransacoesManager` já existente, só que
 * travado num tipo só (`tipoFixo`) — visão geral, edição, cadastro novo e
 * um comparativo simples com o mês anterior, tudo na mesma tela, sem
 * duplicar a lógica de listagem/edição de transação que já existe.
 */
export async function CategoriaTransacaoPage({ tipo, searchParams }: CategoriaTransacaoPageProps) {
  const { dict } = await getDictionary();
  const dados = await buscarDadosFinanceiro(searchParams);
  const { referencia, contexto, mesParamStr, categorias, transacoes, contasFiltradas, cartoesFiltrados, receitasDoMes, despesasDoMes } =
    dados;

  const mesAnteriorRef = addMeses(referencia, -1);
  const dadosMesAnterior = await buscarDadosFinanceiro({
    mes: mesParam(mesAnteriorRef),
    ...(contexto !== "todos" ? { contexto } : {}),
  });

  const totalDoMes = tipo === "receita" ? receitasDoMes : despesasDoMes;
  const totalMesAnterior = tipo === "receita" ? dadosMesAnterior.receitasDoMes : dadosMesAnterior.despesasDoMes;
  const transacoesDoTipo = transacoes.filter((t) => t.tipo === tipo);

  const basePath = tipo === "receita" ? "/admin/financeiro/receitas" : "/admin/financeiro/despesas";
  const titulo = tipo === "receita" ? dict.financeiro.receitasTituloPagina : dict.financeiro.despesasTituloPagina;
  const subtitulo = tipo === "receita" ? dict.financeiro.receitasSubtituloPagina : dict.financeiro.despesasSubtituloPagina;
  const statLabel = tipo === "receita" ? dict.financeiro.statReceitasMes : dict.financeiro.statDespesasMes;
  const Icon = tipo === "receita" ? IconTrendingUp : IconAlertTriangle;

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
            <h1 className="text-lg font-semibold tracking-tight">{titulo}</h1>
            <p className="mt-0.5 text-sm text-ink-muted">{subtitulo}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <OlhoValoresToggle />
            <ContextoToggle referencia={referencia} contexto={contexto} basePath={basePath} />
            <MesNav referencia={referencia} contexto={contexto} basePath={basePath} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <StatTile
          icon={Icon}
          label={statLabel}
          value={<ValorPrivado valor={fmtBRL(totalDoMes)} />}
          tone={tipo === "receita" ? "good" : "neutral"}
        />
        <StatTile icon={Icon} label={dict.financeiro.statMesAnterior} value={<ValorPrivado valor={fmtBRL(totalMesAnterior)} />} />
      </div>

      <TransacoesManager
        transacoes={transacoesDoTipo}
        contas={contasFiltradas}
        cartoes={cartoesFiltrados}
        categorias={categorias}
        contexto={contexto}
        tipoFixo={tipo}
      />
    </div>
  );
}
