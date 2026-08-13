"use client";

import { useState, useTransition } from "react";
import type { ContaComSaldo } from "@/lib/types/financeiro";
import { removerConta } from "@/app/admin/financeiro/actions";
import { fmtBRL } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconWallet } from "@/components/ui/icons";
import { NovaContaModal } from "@/components/admin/financeiro/NovaContaModal";

export function ContasCard({ contas }: { contas: ContaComSaldo[] }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerConta(id);
      if (!result.ok) setError(result.error);
      setConfirmando(null);
    });
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconWallet className="h-4 w-4 text-ink-muted" />
          <h2 className="text-sm font-semibold">Contas &amp; Carteiras</h2>
        </div>
        <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setModalAberto(true)}>
          + Nova
        </Button>
      </div>

      {error && <p className="mb-3 text-xs text-danger">{error}</p>}

      {contas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">
          Nenhuma conta cadastrada ainda.
        </p>
      ) : (
        <div className="space-y-2">
          {contas.map((conta) => (
            <div
              key={conta.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-base-700 bg-base-950/40 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-primary">{conta.nome}</p>
                <p className="truncate text-xs text-ink-muted">
                  {conta.tipo || "Conta"} · {conta.contexto === "pessoal" ? "Pessoal" : "Profissional"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={
                    conta.saldo_atual < 0 ? "text-sm font-semibold text-danger" : "text-sm font-semibold text-ink-primary"
                  }
                >
                  {fmtBRL(conta.saldo_atual)}
                </span>
                {confirmando === conta.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleExcluir(conta.id)}
                      disabled={pending}
                      className="text-xs font-medium text-danger hover:underline"
                    >
                      Sim
                    </button>
                    <button onClick={() => setConfirmando(null)} disabled={pending} className="text-xs text-ink-muted hover:text-ink-primary">
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmando(conta.id)}
                    className="text-ink-muted transition hover:text-danger"
                    aria-label="Excluir conta"
                    title="Excluir conta (remove também as transações vinculadas)"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto && <NovaContaModal onClose={() => setModalAberto(false)} />}
    </Card>
  );
}
