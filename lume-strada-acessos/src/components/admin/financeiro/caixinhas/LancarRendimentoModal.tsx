"use client";

import { useState, type FormEvent } from "react";
import type { CaixinhaComSaldo } from "@/lib/types/financeiro";
import { lancarRendimentoCaixinha } from "@/app/admin/financeiro/caixinhas/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface LancarRendimentoModalProps {
  caixinha: CaixinhaComSaldo;
  onClose: () => void;
}

/**
 * "Lançar Rendimento" — o único jeito de aumentar o saldo da caixinha SEM
 * debitar conta nenhuma (juro creditado pela instituição financeira, não
 * uma transferência entre contas da agência). Ver
 * `lancar_rendimento_caixinha` no banco.
 */
export function LancarRendimentoModal({ caixinha, onClose }: LancarRendimentoModalProps) {
  const { dict } = useLocale();
  const t = dict.financeiro.caixinhas;
  const [valor, setValor] = useState(0);
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (valor <= 0) {
      setError(dict.financeiro.valorObrigatorioLabel);
      return;
    }

    setLoading(true);
    const result = await lancarRendimentoCaixinha({ caixinhaId: caixinha.id, valor, descricao });
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
          <h3 className="text-base font-semibold">{t.lancarRendimentoTitulo.replace("{nome}", caixinha.nome)}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <p className="mb-4 text-xs text-ink-muted">{t.lancarRendimentoHint}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.valorObrigatorioLabel}</label>
            <CurrencyInput required value={valor} onChange={setValor} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.descricaoOpcionalLabel}</label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={t.placeholderDescricaoRendimento} />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : t.confirmarRendimentoBtn}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
