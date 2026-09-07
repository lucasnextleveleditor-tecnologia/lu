"use client";

import { CONTAS_PREVIEW } from "@/lib/utils/financeiro-preview-mock";
import { fmtBRL } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { IconPlus } from "@/components/ui/icons";

interface ContasPreviewProps {
  onAdicionarDespesa: (contaId: string) => void;
}

/** Grade de contas ao estilo Mobills — card "+ Nova Conta" tracejado sempre no fim da grade. */
export function ContasPreview({ onAdicionarDespesa }: ContasPreviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {CONTAS_PREVIEW.map((conta) => {
        const Icon = conta.icon;
        return (
          <Card key={conta.id} className="p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-800 text-ink-secondary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-primary">{conta.nome}</p>
                <p className="truncate text-xs text-ink-muted">{conta.tipo}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-ink-muted">Saldo Atual</p>
                <p className={`mt-0.5 text-lg font-semibold ${conta.saldoAtual < 0 ? "text-danger" : "text-ink-primary"}`}>
                  {fmtBRL(conta.saldoAtual)}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">Saldo Previsto</p>
                <p className={`mt-0.5 text-lg font-semibold ${conta.saldoPrevisto < 0 ? "text-danger" : "text-ink-secondary"}`}>
                  {fmtBRL(conta.saldoPrevisto)}
                </p>
              </div>
            </div>

            <button
              onClick={() => onAdicionarDespesa(conta.id)}
              className="mt-4 w-full rounded-lg border border-base-700 py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            >
              + Adicionar Despesa
            </button>
          </Card>
        );
      })}

      <button
        type="button"
        title="Cadastro de nova conta entra na próxima etapa, junto da integração com o banco de dados"
        className="flex min-h-[172px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-base-700 text-ink-muted transition hover:border-ink-secondary hover:text-ink-secondary"
      >
        <IconPlus className="h-6 w-6" />
        <span className="text-sm font-medium">Nova Conta</span>
      </button>
    </div>
  );
}
