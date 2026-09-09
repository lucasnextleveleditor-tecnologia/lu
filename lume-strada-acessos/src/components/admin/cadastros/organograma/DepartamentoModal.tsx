"use client";

import { useState, type FormEvent } from "react";
import type { DepartamentoRow } from "@/lib/types/cadastros";
import { criarDepartamento, atualizarDepartamento } from "@/app/admin/organograma/actions";
import { PALETA_CATEGORIAS } from "@/lib/utils/financeiro";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface DepartamentoModalProps {
  departamento?: DepartamentoRow | null;
  onClose: () => void;
  onCriado?: (id: string) => void;
}

/** Cria/edita um departamento (coluna do Organograma) — mesmo padrão de swatch de cor de `NovaCaixinhaModal.tsx`, reaproveitando a paleta categórica que já existe em Financeiro em vez de uma paleta nova só pra isso. */
export function DepartamentoModal({ departamento, onClose, onCriado }: DepartamentoModalProps) {
  const { dict } = useLocale();
  const editando = Boolean(departamento);

  const [nome, setNome] = useState(departamento?.nome ?? "");
  const [cor, setCor] = useState(departamento?.cor ?? PALETA_CATEGORIAS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = { nome, cor };
    const result = departamento ? await atualizarDepartamento(departamento.id, input) : await criarDepartamento(input);

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (!editando && "id" in result) onCriado?.((result as { id: string }).id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {editando ? dict.cadastros.departamentoModalTituloEditar : dict.cadastros.departamentoModalTituloNovo}
          </h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.nomeDepartamentoLabel}</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder={dict.cadastros.nomeDepartamentoPlaceholder} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.corDepartamentoLabel}</label>
            <div className="flex flex-wrap items-center gap-2">
              {PALETA_CATEGORIAS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setCor(hex)}
                  aria-label={dict.financeiro.escolherCorAria.replace("{hex}", hex)}
                  className={cn("h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-base-900 transition", cor === hex ? "ring-white" : "ring-transparent")}
                  style={{ backgroundColor: hex }}
                />
              ))}
              <label
                title={dict.cadastros.corPersonalizadaLabel}
                className="relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-full border border-dashed border-base-600"
                style={!PALETA_CATEGORIAS.includes(cor as (typeof PALETA_CATEGORIAS)[number]) ? { backgroundColor: cor, borderStyle: "solid" } : undefined}
              >
                <input
                  type="color"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label={dict.cadastros.corPersonalizadaLabel}
                />
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : dict.cadastros.criarDepartamentoBtn}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
