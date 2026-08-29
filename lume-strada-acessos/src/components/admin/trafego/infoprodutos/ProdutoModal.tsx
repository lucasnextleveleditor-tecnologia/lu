"use client";

import { useState, type FormEvent } from "react";
import type { ProdutoRow, TipoProduto } from "@/lib/types/infoprodutos";
import { criarProduto, atualizarProduto } from "@/app/admin/trafego/infoprodutos-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ProdutoModalProps {
  produto?: ProdutoRow | null;
  clienteCadastroId: string;
  onClose: () => void;
}

export function ProdutoModal({ produto, clienteCadastroId, onClose }: ProdutoModalProps) {
  const { dict } = useLocale();
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [tipo, setTipo] = useState<TipoProduto>(produto?.tipo ?? "principal");
  const [valor, setValor] = useState(String(produto?.valor ?? ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editando = Boolean(produto);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = { nome, tipo, valor: Number(valor) || 0 };
    const result = produto ? await atualizarProduto(produto.id, input) : await criarProduto(clienteCadastroId, input);

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
          <h3 className="text-base font-semibold">{editando ? dict.trafego.editarProdutoTitulo : dict.trafego.novoProdutoTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.nomeProdutoLabel}</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder={dict.trafego.nomeProdutoPlaceholder} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.tipoLabel}</label>
              <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoProduto)}>
                <option value="principal">{dict.trafego.produtoPrincipalLabel}</option>
                <option value="order_bump">{dict.trafego.orderBumpOpcao}</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.valorReaisLabel}</label>
              <Input type="number" min="0" step="0.01" required value={valor} onChange={(e) => setValor(e.target.value)} placeholder="97.00" />
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : dict.trafego.criarProdutoBotao}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
