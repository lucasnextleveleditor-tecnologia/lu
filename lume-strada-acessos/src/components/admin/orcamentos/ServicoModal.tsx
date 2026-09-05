"use client";

import { useState, type FormEvent } from "react";
import type { OrcCategoriaRow, OrcServicoRow, UnidadeServico } from "@/lib/types/orcamentos";
import { criarServico, atualizarServico } from "@/app/admin/orcamentos/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ServicoModalProps {
  onClose: () => void;
  categorias: OrcCategoriaRow[];
  servico?: OrcServicoRow;
}

export function ServicoModal({ onClose, categorias, servico }: ServicoModalProps) {
  const { dict } = useLocale();
  const editando = !!servico;
  const [categoriaId, setCategoriaId] = useState(servico?.categoria_id ?? "");
  const [nome, setNome] = useState(servico?.nome ?? "");
  const [descricao, setDescricao] = useState(servico?.descricao ?? "");
  const [valorPadrao, setValorPadrao] = useState(servico?.valor_padrao ?? 0);
  const [unidade, setUnidade] = useState<UnidadeServico>(servico?.unidade ?? "unico");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = { categoriaId: categoriaId || null, nome, descricao: descricao.trim() || null, valorPadrao, unidade };
    const result = editando ? await atualizarServico(servico.id, input) : await criarServico(input);

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{editando ? dict.orcamentos.editarServicoTitulo : dict.orcamentos.novoServicoTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.nomeServicoLabel}</label>
            <Input required autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder={dict.orcamentos.placeholderNomeServico} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.descricaoOpcionalLabel}</label>
            <Textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={dict.orcamentos.placeholderDescricaoServico} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.categoriaLabel}</label>
              <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                <option value="">{dict.orcamentos.semCategoriaLabel}</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji ? `${c.emoji} ` : ""}
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.unidadeLabel}</label>
              <Select value={unidade} onChange={(e) => setUnidade(e.target.value as UnidadeServico)}>
                <option value="unico">{dict.orcamentos.unidadeUnico}</option>
                <option value="hora">{dict.orcamentos.unidadeHora}</option>
                <option value="dia">{dict.orcamentos.unidadeDia}</option>
                <option value="mes">{dict.orcamentos.unidadeMes}</option>
                <option value="pacote">{dict.orcamentos.unidadePacote}</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.valorPadraoLabel}</label>
            <CurrencyInput value={valorPadrao} onChange={setValorPadrao} className="max-w-[220px]" />
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
