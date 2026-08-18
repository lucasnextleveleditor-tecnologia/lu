"use client";

import { useState, type FormEvent } from "react";
import type { FinContexto } from "@/lib/types/financeiro";
import { criarCartao } from "@/app/admin/financeiro/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function NovoCartaoModal({ onClose }: { onClose: () => void }) {
  const { dict } = useLocale();
  const [nome, setNome] = useState("");
  const [limite, setLimite] = useState("");
  const [diaFechamento, setDiaFechamento] = useState("1");
  const [diaVencimento, setDiaVencimento] = useState("10");
  const [contexto, setContexto] = useState<FinContexto>("profissional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await criarCartao({
      nome,
      limite: Number(limite) || 0,
      diaFechamento: Number(diaFechamento) || 1,
      diaVencimento: Number(diaVencimento) || 1,
      contexto,
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
          <h3 className="text-base font-semibold">{dict.financeiro.novoCartaoTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.nomeObrigatorio}</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder={dict.financeiro.placeholderNomeCartao} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.limiteTotalLabel}</label>
              <Input required type="number" min="0" step="0.01" value={limite} onChange={(e) => setLimite(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.contextoLabel}</label>
              <Select value={contexto} onChange={(e) => setContexto(e.target.value as FinContexto)}>
                <option value="profissional">{dict.financeiro.contextoProfissional}</option>
                <option value="pessoal">{dict.financeiro.contextoPessoal}</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.diaFechamentoLabel}</label>
              <Input required type="number" min="1" max="31" value={diaFechamento} onChange={(e) => setDiaFechamento(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.diaVencimentoLabel}</label>
              <Input required type="number" min="1" max="31" value={diaVencimento} onChange={(e) => setDiaVencimento(e.target.value)} />
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : dict.financeiro.criarCartaoBtn}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
