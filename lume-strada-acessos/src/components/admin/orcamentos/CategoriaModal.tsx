"use client";

import { useState, type FormEvent } from "react";
import type { OrcCategoriaRow } from "@/lib/types/orcamentos";
import { criarCategoria, atualizarCategoria } from "@/app/admin/orcamentos/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface CategoriaModalProps {
  onClose: () => void;
  categoria?: OrcCategoriaRow;
}

export function CategoriaModal({ onClose, categoria }: CategoriaModalProps) {
  const { dict } = useLocale();
  const editando = !!categoria;
  const [nome, setNome] = useState(categoria?.nome ?? "");
  const [emoji, setEmoji] = useState(categoria?.emoji ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = { nome, emoji: emoji.trim() || null };
    const result = editando ? await atualizarCategoria(categoria.id, input) : await criarCategoria(input);

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{editando ? dict.orcamentos.editarCategoriaTitulo : dict.orcamentos.novaCategoriaTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.nomeCategoriaLabel}</label>
              <Input required autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder={dict.orcamentos.placeholderNomeCategoria} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.emojiLabel}</label>
              <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder={dict.orcamentos.placeholderEmoji} className="w-16 text-center" maxLength={4} />
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : dict.common.salvar}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
