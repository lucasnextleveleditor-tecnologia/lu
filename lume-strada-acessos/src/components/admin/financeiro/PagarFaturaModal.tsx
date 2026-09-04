"use client";

import { useState, type FormEvent } from "react";
import type { CartaoComLimite, ContaComSaldo } from "@/lib/types/financeiro";
import { pagarFatura } from "@/app/admin/financeiro/actions";
import { fmtBRL } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useValoresVisiveis } from "@/lib/valores-visiveis/ValoresVisiveisProvider";

interface PagarFaturaModalProps {
  cartao: CartaoComLimite;
  contas: ContaComSaldo[];
  referencia: Date;
  onClose: () => void;
}

/** Pagar Fatura — soma tudo que está em aberto no cartão e debita de UMA conta escolhida, atomicamente (ver `pagar_fatura()` no schema). */
export function PagarFaturaModal({ cartao, contas, referencia, onClose }: PagarFaturaModalProps) {
  const { dict } = useLocale();
  const { visivel } = useValoresVisiveis();
  const contasDoContexto = contas.filter((c) => c.contexto === cartao.contexto);
  const [contaPagamentoId, setContaPagamentoId] = useState(contasDoContexto[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const periodoReferencia = `${referencia.getUTCFullYear()}-${String(referencia.getUTCMonth() + 1).padStart(2, "0")}-01`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!contaPagamentoId) {
      setError(dict.financeiro.selecioneContaPagamentoErro);
      return;
    }
    setLoading(true);
    setError(null);

    const result = await pagarFatura({
      cartaoId: cartao.id,
      contaPagamentoId,
      periodoReferencia,
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{dict.financeiro.pagarFaturaTitulo.replace("{nome}", cartao.nome)}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-base-700 bg-base-950/60 p-4">
          <p className="text-xs text-ink-secondary">{dict.financeiro.valorEmAbertoLabel}</p>
          <ValorPrivado valor={fmtBRL(cartao.limite_consumido)} className="mt-1 block text-2xl font-bold text-ink-primary" />
        </div>

        {contasDoContexto.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            {dict.financeiro.cadastreContaAntes.replace(
              "{contexto}",
              (cartao.contexto === "pessoal" ? dict.financeiro.contextoPessoal : dict.financeiro.contextoProfissional).toLowerCase()
            )}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.pagarComContaLabel}</label>
              <Select required value={contaPagamentoId} onChange={(e) => setContaPagamentoId(e.target.value)}>
                {contasDoContexto.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome} ({visivel ? fmtBRL(conta.saldo_atual) : "••••"})
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-ink-muted">{dict.financeiro.pagarFaturaHint}</p>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={onClose}>
                {dict.common.cancelar}
              </Button>
              <Button type="submit" disabled={loading || cartao.limite_consumido <= 0}>
                {loading ? dict.financeiro.pagandoLabel : dict.financeiro.confirmarPagamentoBtn}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
