"use client";

import { useState, type FormEvent } from "react";
import type { ContaComSaldo, TransacaoComRelacoes } from "@/lib/types/financeiro";
import { marcarPago } from "@/app/admin/financeiro/actions";
import { fmtBRL } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useValoresVisiveis } from "@/lib/valores-visiveis/ValoresVisiveisProvider";

interface DarBaixaModalProps {
  transacao: TransacaoComRelacoes;
  contas: ContaComSaldo[];
  onConfirmado: () => void;
  onClose: () => void;
}

/**
 * Pergunta a conta bancária só na hora REAL de dar baixa — pedido explícito
 * do dono da conta: escolher a conta já no lançamento da transação é
 * bobagem quando ela ainda está pendente (as coisas podem mudar até lá, e
 * pode existir mais de uma conta pessoal/empresarial, fácil de errar). Só
 * aparece quando `TransacoesManager` detecta que a transação (sempre
 * despesa/receita pagas com "Conta" — cartão e transferência já têm conta
 * desde a criação) ainda não tem `conta_id`; se já tiver, dar baixa continua
 * instantâneo, sem perguntar de novo.
 */
export function DarBaixaModal({ transacao, contas, onConfirmado, onClose }: DarBaixaModalProps) {
  const { dict } = useLocale();
  const { visivel } = useValoresVisiveis();
  const contasDoContexto = contas.filter((c) => c.contexto === transacao.contexto);
  const [contaId, setContaId] = useState(contasDoContexto[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!contaId) return;
    setLoading(true);
    setError(null);

    const result = await marcarPago(transacao.id, true, contaId);

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onConfirmado();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">{dict.financeiro.darBaixaTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <p className="mb-4 text-sm text-ink-secondary">
          {dict.financeiro.darBaixaDescricao.replace("{descricao}", transacao.descricao).replace("{valor}", fmtBRL(transacao.valor))}
        </p>

        {contasDoContexto.length === 0 ? (
          <p className="text-sm text-ink-secondary">{dict.financeiro.nenhumaContaParaBaixa}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.contaQuePagouLabel}</label>
              <Select required value={contaId} onChange={(e) => setContaId(e.target.value)}>
                {contasDoContexto.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome} ({visivel ? fmtBRL(conta.saldo_atual) : "••••"})
                  </option>
                ))}
              </Select>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={onClose}>
                {dict.common.cancelar}
              </Button>
              <Button type="submit" disabled={loading || !contaId}>
                {loading ? dict.common.salvando : dict.financeiro.confirmarBaixaBtn}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
