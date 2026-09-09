"use client";

import { useState, type FormEvent } from "react";
import type { CargoRow, EquipeMembroRow } from "@/lib/types/cadastros";
import { criarCargo, atualizarCargo } from "@/app/admin/organograma/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type TipoVinculo = "vago" | "membro" | "livre";

interface CargoModalProps {
  departamentoId: string;
  equipeMembros: EquipeMembroRow[];
  cargo?: CargoRow | null;
  onClose: () => void;
}

function vinculoInicial(cargo?: CargoRow | null): TipoVinculo {
  if (cargo?.funcionario_id) return "membro";
  if (cargo?.nome_livre) return "livre";
  return "vago";
}

/** Cria/edita um cargo dentro de um departamento do Organograma — três estados de vínculo (Vago / Membro da Equipe / Nome Livre pra freelancer), ver `supabase/organograma.sql`. */
export function CargoModal({ departamentoId, equipeMembros, cargo, onClose }: CargoModalProps) {
  const { dict } = useLocale();
  const editando = Boolean(cargo);

  const [titulo, setTitulo] = useState(cargo?.titulo ?? "");
  const [vinculo, setVinculo] = useState<TipoVinculo>(vinculoInicial(cargo));
  const [funcionarioId, setFuncionarioId] = useState(cargo?.funcionario_id ?? "");
  const [nomeLivre, setNomeLivre] = useState(cargo?.nome_livre ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = {
      departamentoId,
      titulo,
      funcionarioId: vinculo === "membro" ? funcionarioId || null : null,
      nomeLivre: vinculo === "livre" ? nomeLivre || null : null,
    };
    const result = cargo ? await atualizarCargo(cargo.id, input) : await criarCargo(input);

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
          <h3 className="text-base font-semibold">{editando ? dict.cadastros.cargoModalTituloEditar : dict.cadastros.cargoModalTituloNovo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.tituloCargoLabel}</label>
            <Input required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={dict.cadastros.tituloCargoPlaceholder} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.vinculoCargoLabel}</label>
            <div className="grid grid-cols-3 gap-2">
              {(["vago", "membro", "livre"] as TipoVinculo[]).map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setVinculo(opcao)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs font-medium transition",
                    vinculo === opcao
                      ? "border-accent/60 bg-accent/10 text-ink-primary"
                      : "border-base-600 text-ink-secondary hover:border-ink-muted"
                  )}
                >
                  {opcao === "vago" ? dict.cadastros.vinculoVago : opcao === "membro" ? dict.cadastros.vinculoMembroEquipe : dict.cadastros.vinculoNomeLivre}
                </button>
              ))}
            </div>
          </div>

          {vinculo === "membro" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.membroEquipeSelectLabel}</label>
              <Select required value={funcionarioId} onChange={(e) => setFuncionarioId(e.target.value)}>
                <option value="">{dict.cadastros.selecioneUmMembro}</option>
                {equipeMembros.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {vinculo === "livre" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.nomeLivreLabel}</label>
              <Input value={nomeLivre} onChange={(e) => setNomeLivre(e.target.value)} placeholder={dict.cadastros.nomeLivrePlaceholder} />
            </div>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : dict.cadastros.criarCargoBtn}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
