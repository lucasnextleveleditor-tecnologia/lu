import Link from "next/link";
import { fmtBRL } from "@/lib/utils/format";
import { TONE_META } from "@/lib/utils/tone";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Meter } from "@/components/ui/Meter";
import { IconWallet } from "@/components/ui/icons";

interface FinanceiroDoMesCardProps {
  receitas: number;
  despesas: number;
}

/**
 * Comparativo simples de receitas x despesas do mês corrente (contexto
 * "profissional", mesmo cálculo de `src/app/admin/financeiro/page.tsx`) —
 * as duas barras dividem a MESMA escala (maior dos dois valores), pra dar
 * pra comparar magnitude de cara, sem precisar de biblioteca de gráfico.
 * Receita usa o mesmo verde de "entrada de dinheiro" já usado em
 * `CategoriaChip`; despesa fica neutra (cinza) — não é um estado "ruim",
 * só a outra ponta da comparação, então não leva tone de alerta.
 */
export function FinanceiroDoMesCard({ receitas, despesas }: FinanceiroDoMesCardProps) {
  const saldo = receitas - despesas;
  const maiorValor = Math.max(receitas, despesas, 1);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconWallet className="h-4 w-4 text-ink-muted" />
          <h2 className="text-sm font-semibold">Financeiro do Mês</h2>
        </div>
        <Link href="/admin/financeiro" className="text-xs font-medium text-ink-secondary hover:text-ink-primary hover:underline">
          Ver Financeiro
        </Link>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-ink-secondary">
            <span>Receitas</span>
            <span className="font-medium text-ink-primary">{fmtBRL(receitas)}</span>
          </div>
          <Meter pct={receitas / maiorValor} tone="good" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-ink-secondary">
            <span>Despesas</span>
            <span className="font-medium text-ink-primary">{fmtBRL(despesas)}</span>
          </div>
          <Meter pct={despesas / maiorValor} tone="neutral" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-base-800 pt-3">
        <span className="text-xs text-ink-secondary">Saldo do mês</span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", TONE_META[saldo >= 0 ? "good" : "critical"].dotClassName)} />
          {fmtBRL(saldo)}
        </span>
      </div>
    </Card>
  );
}
