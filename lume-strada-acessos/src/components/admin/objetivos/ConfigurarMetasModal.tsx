"use client";

import { useState, type FormEvent } from "react";
import { salvarMetasFinanceiras } from "@/app/admin/objetivos/actions";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ConfigurarMetasModalProps {
  metaMensalAtual: number | null;
  metaAnualAtual: number | null;
  onClose: () => void;
}

/** Mesmo padrão de modal simples de configuração já usado em Produção (`ConfiguracaoProducaoModal`) e Financeiro (`NovaCaixinhaModal`) — dois `CurrencyInput`, salva via Server Action, fecha sozinho quando dá certo. */
export function ConfigurarMetasModal({ metaMensalAtual, metaAnualAtual, onClose }: ConfigurarMetasModalProps) {
  const { dict } = useLocale();
  const [metaMensal, setMetaMensal] = useState(metaMensalAtual ?? 0);
  const [metaAnual, setMetaAnual] = useState(metaAnualAtual ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await salvarMetasFinanceiras({
      metaMensal: metaMensal > 0 ? metaMensal : null,
      metaAnual: metaAnual > 0 ? metaAnual : null,
    });
    setLoading(false);
    if (!result.ok) {
      setError(dict.objetivos.erroSalvar);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-base font-semibold">{dict.objetivos.modalTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>
        <p className="mb-4 text-xs text-ink-muted">{dict.objetivos.modalSubtitulo}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.objetivos.metaMensalLabel}</label>
            <CurrencyInput value={metaMensal} onChange={setMetaMensal} />
            <p className="mt-1 text-[11px] text-ink-muted">{dict.objetivos.hintMetaMensal}</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.objetivos.metaAnualLabel}</label>
            <CurrencyInput value={metaAnual} onChange={setMetaAnual} />
            <p className="mt-1 text-[11px] text-ink-muted">{dict.objetivos.hintMetaAnual}</p>
          </div>
          <p className="text-[11px] text-ink-muted">{dict.objetivos.hintLimparMeta}</p>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : dict.common.salvarAlteracoes}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
