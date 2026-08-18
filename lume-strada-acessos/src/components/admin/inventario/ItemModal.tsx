"use client";

import { useState, type FormEvent } from "react";
import type { CategoriaInventarioRow, ItemInventarioRow, StatusItemInventario } from "@/lib/types/database";
import { criarItem, atualizarItem, type ItemInput } from "@/app/admin/inventario/actions";
import { STATUS_ITEM_META, STATUS_ITEM_OPCOES, calcularDepreciacao } from "@/lib/utils/inventario";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ItemModalProps {
  item?: ItemInventarioRow | null;
  categorias: CategoriaInventarioRow[];
  onClose: () => void;
}

export function ItemModal({ item, categorias, onClose }: ItemModalProps) {
  const { dict } = useLocale();
  const [codigoEtiqueta, setCodigoEtiqueta] = useState(item?.codigo_etiqueta ?? "");
  const [categoriaId, setCategoriaId] = useState(item?.categoria_id ?? categorias[0]?.id ?? "");
  const [nomeItem, setNomeItem] = useState(item?.nome_item ?? "");
  const [status, setStatus] = useState<StatusItemInventario>(item?.status ?? "ativo");
  const [localizacao, setLocalizacao] = useState(item?.localizacao ?? "");
  const [dataAquisicao, setDataAquisicao] = useState(item?.data_aquisicao?.slice(0, 10) ?? "");
  const [valorPago, setValorPago] = useState(item?.valor_pago != null ? String(item.valor_pago) : "");
  const [valorAtual, setValorAtual] = useState(item?.valor_atual != null ? String(item.valor_atual) : "");
  const [responsavelAtual, setResponsavelAtual] = useState(item?.responsavel_atual ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editando = Boolean(item);

  // Prévia ao vivo da depreciação enquanto o admin digita — mesma lógica
  // usada na tag da listagem e no Dashboard Financeiro (`calcularDepreciacao`).
  const valorPagoNum = valorPago.trim() === "" ? null : Number(valorPago);
  const valorAtualNum = valorAtual.trim() === "" ? null : Number(valorAtual);
  const depreciacaoPreview =
    valorPagoNum != null && !Number.isNaN(valorPagoNum) && valorAtualNum != null && !Number.isNaN(valorAtualNum)
      ? calcularDepreciacao({ valor_pago: valorPagoNum, valor_atual: valorAtualNum })
      : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input: ItemInput = {
      codigoEtiqueta,
      categoriaId,
      nomeItem,
      status,
      localizacao: localizacao || null,
      dataAquisicao: dataAquisicao || null,
      valorPago: valorPagoNum,
      valorAtual: valorAtualNum,
      responsavelAtual: responsavelAtual || null,
    };

    const result = item ? await atualizarItem(item.id, input) : await criarItem(input);

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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{editando ? dict.inventario.editarItem : dict.inventario.novaEtiquetaItem}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        {categorias.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            {dict.inventario.cadastreCategoriaPrimeiro.replace("{tab}", dict.inventario.tabCategorias)}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.inventario.campoNumeroEtiqueta}</label>
                <Input
                  required
                  value={codigoEtiqueta}
                  onChange={(e) => setCodigoEtiqueta(e.target.value)}
                  placeholder={dict.inventario.placeholderEtiqueta}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.inventario.campoCategoriaObrigatorio}</label>
                <Select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.inventario.campoNomeItem}</label>
              <Input required value={nomeItem} onChange={(e) => setNomeItem(e.target.value)} placeholder={dict.inventario.placeholderNomeItem} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.common.status}</label>
                <Select value={status} onChange={(e) => setStatus(e.target.value as StatusItemInventario)}>
                  {STATUS_ITEM_OPCOES.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {STATUS_ITEM_META[opcao].label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.inventario.campoLocalizacao}</label>
                <Input value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} placeholder={dict.inventario.placeholderLocalizacao} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.inventario.campoDataAquisicao}</label>
              <Input required type="date" value={dataAquisicao} onChange={(e) => setDataAquisicao(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.inventario.campoValorPago}</label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  placeholder="0,00"
                />
                <p className="mt-1 text-[11px] text-ink-muted">{dict.inventario.hintValorPago}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.inventario.campoValorAtual}</label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorAtual}
                  onChange={(e) => setValorAtual(e.target.value)}
                  placeholder="0,00"
                />
                <p className="mt-1 text-[11px] text-ink-muted">{dict.inventario.hintValorAtual}</p>
              </div>
            </div>

            {depreciacaoPreview && (
              <div className="flex items-center justify-between rounded-lg border border-base-700 bg-base-950/40 px-3.5 py-2.5">
                <span className="text-xs text-ink-secondary">
                  {depreciacaoPreview.apreciou ? dict.inventario.valorizacaoLabel : dict.inventario.depreciacaoLabel}
                </span>
                <Badge
                  tone={depreciacaoPreview.apreciou ? "good" : "neutral"}
                  label={`${depreciacaoPreview.apreciou ? "+" : "-"}${fmtBRL(Math.abs(depreciacaoPreview.delta))} (${fmtPercent(Math.abs(depreciacaoPreview.percentual))})`}
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.inventario.campoResponsavelAtual}</label>
              <Input
                value={responsavelAtual}
                onChange={(e) => setResponsavelAtual(e.target.value)}
                placeholder={dict.inventario.placeholderResponsavel}
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={onClose}>
                {dict.common.cancelar}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : dict.inventario.cadastrarItem}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
