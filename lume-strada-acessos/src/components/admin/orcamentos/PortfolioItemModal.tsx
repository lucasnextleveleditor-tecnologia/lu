"use client";

import { useState, type FormEvent } from "react";
import type { PortfolioItemComUrl } from "@/lib/types/orcamentos";
import { atualizarPortfolioItem } from "@/app/admin/orcamentos/portfolio-actions";
import { CATEGORIAS_PORTFOLIO } from "@/lib/utils/orcamentos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface PortfolioItemModalProps {
  item: PortfolioItemComUrl;
  onClose: () => void;
}

/** Edita só título + categoria de um item já enviado — o arquivo em si nunca troca aqui (pra trocar a mídia, remove e sobe de novo, mesma UX de `CriativoUploader`). */
export function PortfolioItemModal({ item, onClose }: PortfolioItemModalProps) {
  const { dict } = useLocale();
  const [titulo, setTitulo] = useState(item.titulo);
  const [categoria, setCategoria] = useState<string>(item.categoria_profissao ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await atualizarPortfolioItem(item.id, { titulo, categoriaProfissao: categoria || null });

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
          <h3 className="text-base font-semibold">{dict.orcamentos.portfolioEditarTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.portfolioTituloLabel}</label>
            <Input required autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={dict.orcamentos.placeholderPortfolioTitulo} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.portfolioCategoriaLabel}</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="h-10 w-full rounded-lg border border-base-600 bg-base-950 px-3 text-sm text-ink-primary outline-none transition focus:border-ink-muted"
            >
              <option value="">{dict.orcamentos.portfolioCategoriaNenhuma}</option>
              {CATEGORIAS_PORTFOLIO.map((c) => (
                <option key={c} value={c}>
                  {dict.orcamentos.categoriasProfissao[c]}
                </option>
              ))}
            </select>
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
