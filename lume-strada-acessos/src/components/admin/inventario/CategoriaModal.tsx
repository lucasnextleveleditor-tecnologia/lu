"use client";

import { useState, type FormEvent } from "react";
import type { CategoriaInventarioRow } from "@/lib/types/database";
import { criarCategoria, atualizarCategoria } from "@/app/admin/inventario/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface CategoriaModalProps {
  categoria?: CategoriaInventarioRow | null;
  onClose: () => void;
}

export function CategoriaModal({ categoria, onClose }: CategoriaModalProps) {
  const { dict } = useLocale();
  const [nome, setNome] = useState(categoria?.nome ?? "");
  const [codigo, setCodigo] = useState(categoria?.codigo ?? "");
  const [descricao, setDescricao] = useState(categoria?.descricao ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editando = Boolean(categoria);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = { nome, codigo, descricao: descricao || null };
    const result = categoria ? await atualizarCategoria(categoria.id, input) : await criarCategoria(input);

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
          <h3 className="text-base font-semibold">{editando ? dict.inventario.editarCategoria : dict.inventario.novaCategoria}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.inventario.campoNomeObrigatorio}</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder={dict.inventario.placeholderNomeCategoria} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.inventario.campoCodigoObrigatorio}</label>
            <Input
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder={dict.inventario.placeholderCodigo}
              className="uppercase"
              maxLength={20}
            />
            <p className="mt-1 text-xs text-ink-muted">{dict.inventario.hintCodigo}</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.inventario.campoDescricaoOpcional}</label>
            <textarea
              value={descricao ?? ""}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={dict.inventario.placeholderDescricaoCategoria}
              rows={3}
              className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : dict.inventario.criarCategoria}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
