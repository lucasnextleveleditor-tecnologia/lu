"use client";

import { useState, type FormEvent } from "react";
import type { FornecedorRow } from "@/lib/types/financeiro";
import { criarFornecedor } from "@/app/admin/financeiro/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface NovoFornecedorModalProps {
  onClose: () => void;
  /**
   * Chamado com o fornecedor recém-criado (id "real" do banco, resto
   * montado no cliente — o bastante pra já aparecer selecionado na lista
   * sem esperar o `revalidatePath` recarregar a página inteira). Quem chama
   * decide o que fazer: o `FornecedoresCard` (tela cheia) só fecha o modal;
   * o `TransacaoModal` (botão "+" ao lado do campo Fornecedor) adiciona à
   * lista local E já deixa selecionado, sem fechar o formulário de
   * transação por trás — esse é o pedido explícito que motivou este modal
   * existir como um componente à parte, empilhável por cima de outro modal.
   */
  onCriado: (fornecedor: FornecedorRow) => void;
}

/**
 * Modal de cadastro rápido de fornecedor — z-index acima de `TransacaoModal`
 * (`z-[60]` vs `z-50`) de propósito: pode abrir EMPILHADO por cima do
 * formulário de transação (ver `TransacaoModal`), então clicar fora dele só
 * fecha ELE (o próprio backdrop chama só o `onClose` deste componente); o
 * clique nunca chega ao backdrop do modal de trás porque o próprio card
 * interno do `TransacaoModal` já para a propagação (`e.stopPropagation()`),
 * e este componente é renderizado dentro daquele card.
 */
export function NovoFornecedorModal({ onClose, onCriado }: NovoFornecedorModalProps) {
  const { dict } = useLocale();
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await criarFornecedor({ nome });

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onCriado({ id: result.id, nome: nome.trim(), created_at: new Date().toISOString() });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-xs rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{dict.financeiro.novoFornecedorTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.nomeFornecedorObrigatorio}</label>
            <Input
              required
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={dict.financeiro.placeholderNomeFornecedor}
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : dict.financeiro.criarFornecedorBtn}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
