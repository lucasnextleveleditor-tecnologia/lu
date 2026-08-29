"use client";

import { useState } from "react";
import type { FechamentoSemanalRow } from "@/lib/types/infoprodutos";
import { fecharSemana } from "@/app/admin/trafego/infoprodutos-actions";
import { fmtBRL } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface FechamentoModalProps {
  semanaInicio: string;
  semanaFim: string;
  receitaBrutaTotal: number;
  investimentoTotal: number;
  fechamentoExistente: FechamentoSemanalRow | null;
  clienteCadastroId: string;
  onClose: () => void;
}

/**
 * "Fechamento da Semana" — a matemática do lucro real: (Receita Bruta -
 * Investimento) - Reembolsos = Lucro Líquido Real. Os totais de receita/
 * investimento mostrados aqui vêm dos anúncios já lançados (client-side,
 * pra pré-visualização); o valor TRAVADO de verdade é recalculado no
 * servidor no momento do fechamento (`fecharSemana`), direto do banco.
 */
export function FechamentoModal({
  semanaInicio,
  semanaFim,
  receitaBrutaTotal,
  investimentoTotal,
  fechamentoExistente,
  clienteCadastroId,
  onClose,
}: FechamentoModalProps) {
  const { dict } = useLocale();
  const [reembolsos, setReembolsos] = useState(String(fechamentoExistente?.reembolsos ?? "0"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lucroBruto = receitaBrutaTotal - investimentoTotal;
  const lucroLiquidoPrevisto = lucroBruto - (Number(reembolsos) || 0);

  async function handleFechar() {
    setLoading(true);
    setError(null);
    const result = await fecharSemana(clienteCadastroId, semanaInicio, Number(reembolsos) || 0);
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
          <h3 className="text-base font-semibold">{fechamentoExistente ? dict.trafego.editarFechamentoTitulo : dict.trafego.fechamentoDaSemanaTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <p className="mb-4 text-xs text-ink-muted">
          {semanaInicio.split("-").reverse().join("/")} {dict.trafego.dataRangeSeparador} {semanaFim.split("-").reverse().join("/")}
        </p>

        <div className="mb-4 space-y-2 rounded-xl border border-base-800 bg-base-950/40 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-muted">{dict.trafego.receitaBrutaTotalLabel}</span>
            <span className="text-ink-primary">{fmtBRL(receitaBrutaTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">{dict.trafego.investimentoTotalLabel}</span>
            <span className="text-ink-primary">− {fmtBRL(investimentoTotal)}</span>
          </div>
          <div className="flex justify-between border-t border-base-800 pt-2">
            <span className="text-ink-muted">{dict.trafego.lucroBrutoLabel}</span>
            <span className="font-medium text-ink-primary">{fmtBRL(lucroBruto)}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.valorReembolsosLabel}</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={reembolsos}
            onChange={(e) => setReembolsos(e.target.value)}
            placeholder={dict.trafego.valorPlaceholder}
          />
          <p className="mt-1 text-xs text-ink-muted">{dict.trafego.estornosGarantiaHint}</p>
        </div>

        <div className="mb-5 rounded-xl border border-base-700 bg-base-950/60 p-4">
          <p className="text-xs uppercase tracking-wide text-ink-muted">{dict.trafego.lucroLiquidoRealLabel}</p>
          <p className={`mt-1 text-2xl font-bold ${lucroLiquidoPrevisto >= 0 ? "text-status-good" : "text-status-critical"}`}>
            {fmtBRL(lucroLiquidoPrevisto)}
          </p>
        </div>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {dict.common.cancelar}
          </Button>
          <Button type="button" onClick={handleFechar} disabled={loading}>
            {loading ? dict.trafego.fechandoTexto : fechamentoExistente ? dict.trafego.salvarCorrecaoBotao : dict.trafego.fecharSemanaBotao}
          </Button>
        </div>
      </div>
    </div>
  );
}
