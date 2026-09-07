"use client";

import { useState, type FormEvent } from "react";
import type { CriativoRow } from "@/lib/types/infoprodutos";
import { criarCriativo, atualizarCriativo } from "@/app/admin/trafego/infoprodutos-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface CriativoModalProps {
  criativo?: CriativoRow | null;
  clienteCadastroId: string;
  onClose: () => void;
}

/** Cadastro de Criativo (nome + orçamento diário padrão) — mesmo padrão de `ProdutoModal.tsx`, ver `CriativoRow`. */
export function CriativoModal({ criativo, clienteCadastroId, onClose }: CriativoModalProps) {
  const { dict } = useLocale();
  const [nome, setNome] = useState(criativo?.nome ?? "");
  const [orcamentoDiario, setOrcamentoDiario] = useState(String(criativo?.orcamento_diario ?? ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editando = Boolean(criativo);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = { nome, orcamentoDiario: Number(orcamentoDiario) || 0 };
    const result = criativo ? await atualizarCriativo(criativo.id, input) : await criarCriativo(clienteCadastroId, input);

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
          <h3 className="text-base font-semibold">{editando ? dict.trafego.editarCriativoTitulo : dict.trafego.novoCriativoTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.nomeCriativoLabel}</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder={dict.trafego.nomeCriativoPlaceholder} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.orcamentoDiarioLabel}</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              required
              value={orcamentoDiario}
              onChange={(e) => setOrcamentoDiario(e.target.value)}
              placeholder={dict.trafego.valorPlaceholder}
            />
            <p className="mt-1 text-xs text-ink-muted">{dict.trafego.orcamentoDiarioHint}</p>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : dict.trafego.criarCriativoBotao}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
