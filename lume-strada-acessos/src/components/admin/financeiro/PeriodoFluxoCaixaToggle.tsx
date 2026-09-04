import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { OPCOES_DIAS, type DiasFluxoCaixa } from "@/app/admin/financeiro/fluxo-caixa/data";
import { getDictionary } from "@/lib/i18n/getDictionary";

interface PeriodoFluxoCaixaToggleProps {
  dias: DiasFluxoCaixa;
  contexto: string;
}

/** Alterna a janela de projeção (15/30/60/90 dias) — mesmo padrão de navegação por link (sem JS no cliente) de `ContextoToggle`. */
export async function PeriodoFluxoCaixaToggle({ dias, contexto }: PeriodoFluxoCaixaToggleProps) {
  const { dict } = await getDictionary();

  return (
    <div className="inline-flex rounded-lg border border-base-700 bg-base-900/60 p-1">
      {OPCOES_DIAS.map((opcao) => {
        const active = dias === opcao;
        const href = `/admin/financeiro/fluxo-caixa?dias=${opcao}${contexto !== "todos" ? `&contexto=${contexto}` : ""}`;
        return (
          <Link
            key={opcao}
            href={href}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition",
              active ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
            )}
          >
            {dict.financeiro.fluxoCaixa.periodoOpcaoDias.replace("{n}", String(opcao))}
          </Link>
        );
      })}
    </div>
  );
}
