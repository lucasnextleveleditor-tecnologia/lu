import { IconAlertTriangle } from "@/components/ui/icons";

/** Placeholder de carregamento — usado por todo relatório do Hub enquanto a Server Action do módulo ainda não respondeu. */
export function RelatorioSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[126px] animate-pulse rounded-2xl border border-base-700 bg-base-900/60" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-base-700 bg-base-900/60" />
    </div>
  );
}

/** Estado vazio/erro compartilhado — mesmo cartão tracejado já usado em `VisaoGeral`/`AprovacoesPendentes`, reaproveitado aqui pra manter a mesma linguagem visual em todo "nada pra mostrar" do painel. */
export function RelatorioEmptyState({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-base-700 p-10 text-center">
      <IconAlertTriangle className="h-5 w-5 text-ink-muted" />
      <p className="text-sm font-medium text-ink-primary">{titulo}</p>
      <p className="max-w-sm text-xs text-ink-muted">{descricao}</p>
    </div>
  );
}
