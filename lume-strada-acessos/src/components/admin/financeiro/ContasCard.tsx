"use client";

import { useState, useTransition } from "react";
import type { ContaComSaldo } from "@/lib/types/financeiro";
import { removerConta } from "@/app/admin/financeiro/actions";
import { fmtBRL } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { IconWallet } from "@/components/ui/icons";
import { NovaContaModal } from "@/components/admin/financeiro/NovaContaModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ContasCard({ contas }: { contas: ContaComSaldo[] }) {
  const { dict } = useLocale();
  const [modalAberto, setModalAberto] = useState(false);
  const [contaEditando, setContaEditando] = useState<ContaComSaldo | null>(null);
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
          <h2 className="text-sm font-semibold">{dict.financeiro.contasCarteirasTitulo}</h2>
        </div>
        <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setModalAberto(true)}>
          {dict.financeiro.btnNovaConta}
        </Button>
      </div>

      {error && <p className="mb-3 text-xs text-danger">{error}</p>}

      {contas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">
          {dict.financeiro.contasVazio}
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
                  {conta.tipo || dict.financeiro.contaGenerica} ·{" "}
                  {conta.contexto === "pessoal" ? dict.financeiro.contextoPessoal : dict.financeiro.contextoProfissional}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <ValorPrivado
                  valor={fmtBRL(conta.saldo_atual)}
                  className={
                    conta.saldo_atual < 0 ? "text-sm font-semibold text-danger" : "text-sm font-semibold text-ink-primary"
                  }
                />
                {confirmando === conta.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleExcluir(conta.id)}
                      disabled={pending}
                      className="text-xs font-medium text-danger hover:underline"
                    >
                      {dict.common.sim}
                    </button>
                    <button onClick={() => setConfirmando(null)} disabled={pending} className="text-xs text-ink-muted hover:text-ink-primary">
                      {dict.common.nao}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setContaEditando(conta)}
                      className="text-xs font-medium text-ink-muted transition hover:text-ink-primary"
                      aria-label={dict.financeiro.editarContaAria}
                      title={dict.financeiro.editarContaAria}
                    >
                      {dict.common.editar}
                    </button>
                    <button
                      onClick={() => setConfirmando(conta.id)}
                      className="text-ink-muted transition hover:text-danger"
                      aria-label={dict.financeiro.excluirContaAria}
                      title={dict.financeiro.excluirContaTitle}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto && <NovaContaModal onClose={() => setModalAberto(false)} />}
      {contaEditando && <NovaContaModal conta={contaEditando} onClose={() => setContaEditando(null)} />}
    </Card>
  );
}
