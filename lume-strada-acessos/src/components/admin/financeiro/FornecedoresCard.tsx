"use client";

import { useState, useTransition } from "react";
import type { FornecedorRow } from "@/lib/types/financeiro";
import { removerFornecedor } from "@/app/admin/financeiro/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconShoppingBag } from "@/components/ui/icons";
import { NovoFornecedorModal } from "@/components/admin/financeiro/NovoFornecedorModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Cadastro de fornecedores — mesmo espírito/visual do `CategoriasCard`
 * (chips + "clique pra excluir"), bem mais simples porque fornecedor só tem
 * nome (sem tipo/cor/emoji). Existe pra dar uma forma de corrigir/remover um
 * fornecedor cadastrado errado — o cadastro em si acontece principalmente
 * pelo botão "+" dentro do `TransacaoModal` (`NovoFornecedorModal`), não
 * por aqui; este card só reaproveita o MESMO modal pro caso de já querer
 * cadastrar fornecedores de antemão, fora do fluxo de lançar uma transação.
 */
export function FornecedoresCard({ fornecedores }: { fornecedores: FornecedorRow[] }) {
  const { dict } = useLocale();
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerFornecedor(id);
      if (!result.ok) setError(result.error);
      setConfirmando(null);
    });
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconShoppingBag className="h-4 w-4 text-ink-muted" />
          <h2 className="text-sm font-semibold">{dict.financeiro.fornecedoresTitulo}</h2>
        </div>
        <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setModalAberto(true)}>
          {dict.financeiro.btnNovoFornecedor}
        </Button>
      </div>

      {error && <p className="mb-3 text-xs text-danger">{error}</p>}

      {fornecedores.length === 0 ? (
        <p className="rounded-lg border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">
          {dict.financeiro.fornecedoresVazio}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {fornecedores.map((fornecedor) => (
            <div key={fornecedor.id} className="group relative">
              {confirmando === fornecedor.id ? (
                <div className="flex items-center gap-1.5 rounded-full border border-status-critical/30 bg-status-critical/10 px-2.5 py-1 text-xs">
                  <span className="text-ink-primary">{dict.common.confirmarExclusao}</span>
                  <button onClick={() => handleExcluir(fornecedor.id)} disabled={pending} className="font-medium text-danger hover:underline">
                    {dict.common.sim}
                  </button>
                  <button onClick={() => setConfirmando(null)} disabled={pending} className="text-ink-muted hover:text-ink-primary">
                    {dict.common.nao}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmando(fornecedor.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-base-600 bg-base-800/50 px-2.5 py-1 text-xs font-medium text-ink-primary"
                  title={dict.financeiro.cliqueParaExcluirTitle}
                >
                  {fornecedor.nome}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modalAberto && <NovoFornecedorModal onClose={() => setModalAberto(false)} onCriado={() => setModalAberto(false)} />}
    </Card>
  );
}
