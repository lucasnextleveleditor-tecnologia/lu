"use client";

import { useState, type FormEvent } from "react";
import type { AnuncioComRelacoes } from "@/lib/types/infoprodutos";
import type { ProdutoRow } from "@/lib/types/infoprodutos";
import { criarAnuncio, atualizarAnuncio } from "@/app/admin/trafego/infoprodutos-actions";
import { calcularReceitaBruta } from "@/lib/utils/infoprodutos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface AnuncioModalProps {
  anuncio?: AnuncioComRelacoes | null;
  produtos: ProdutoRow[];
  dataPadrao: string;
  onClose: () => void;
}

const SEM_ORDER_BUMP = "__nenhum__";

export function AnuncioModal({ anuncio, produtos, dataPadrao, onClose }: AnuncioModalProps) {
  const { dict } = useLocale();
  const principais = produtos.filter((p) => p.tipo === "principal");
  const orderBumps = produtos.filter((p) => p.tipo === "order_bump");

  const [data, setData] = useState(anuncio?.data ?? dataPadrao);
  const [nomeAnuncio, setNomeAnuncio] = useState(anuncio?.nome_anuncio ?? "");
  const [produtoPrincipalId, setProdutoPrincipalId] = useState(anuncio?.produto_principal_id ?? principais[0]?.id ?? "");
  const [orderBumpId, setOrderBumpId] = useState(anuncio?.order_bump_id ?? SEM_ORDER_BUMP);
  const [investimento, setInvestimento] = useState(String(anuncio?.investimento ?? ""));
  const [visualizacoes, setVisualizacoes] = useState(String(anuncio?.visualizacoes ?? ""));
  const [cliques, setCliques] = useState(String(anuncio?.cliques ?? ""));
  const [vendasPrincipal, setVendasPrincipal] = useState(String(anuncio?.vendas_principal ?? ""));
  const [vendasOrderBump, setVendasOrderBump] = useState(String(anuncio?.vendas_order_bump ?? ""));
  const [receitaBruta, setReceitaBruta] = useState(String(anuncio?.receita_bruta ?? "0"));
  const [receitaAuto, setReceitaAuto] = useState(true); // enquanto true, recalcula sozinho; vira false assim que o usuário edita o campo direto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editando = Boolean(anuncio);

  function recalcularReceita(novosValores: { vp?: string; vob?: string; principalId?: string; bumpId?: string }) {
    if (!receitaAuto) return;
    const vp = Number(novosValores.vp ?? vendasPrincipal) || 0;
    const vob = Number(novosValores.vob ?? vendasOrderBump) || 0;
    const pId = novosValores.principalId ?? produtoPrincipalId;
    const bId = novosValores.bumpId ?? orderBumpId;
    const valorPrincipal = principais.find((p) => p.id === pId)?.valor ?? 0;
    const valorBump = bId !== SEM_ORDER_BUMP ? orderBumps.find((p) => p.id === bId)?.valor ?? 0 : 0;
    setReceitaBruta(String(calcularReceitaBruta(vp, valorPrincipal, vob, valorBump)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = {
      data,
      nomeAnuncio: nomeAnuncio || null,
      produtoPrincipalId: produtoPrincipalId || null,
      orderBumpId: orderBumpId !== SEM_ORDER_BUMP ? orderBumpId : null,
      investimento: Number(investimento) || 0,
      visualizacoes: Number(visualizacoes) || 0,
      cliques: Number(cliques) || 0,
      vendasPrincipal: Number(vendasPrincipal) || 0,
      vendasOrderBump: Number(vendasOrderBump) || 0,
      receitaBruta: Number(receitaBruta) || 0,
    };

    const result = anuncio ? await atualizarAnuncio(anuncio.id, input) : await criarAnuncio(input);

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
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{editando ? dict.trafego.editarAnuncioTitulo : dict.trafego.novoAnuncioTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.dataObrigatoriaLabel}</label>
              <DatePicker required value={data} onChange={setData} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.nomeAnuncioLabel}</label>
              <Input value={nomeAnuncio} onChange={(e) => setNomeAnuncio(e.target.value)} placeholder={dict.trafego.nomeAnuncioPlaceholder} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.produtoPrincipalLabel}</label>
              <Select
                value={produtoPrincipalId}
                onChange={(e) => {
                  setProdutoPrincipalId(e.target.value);
                  recalcularReceita({ principalId: e.target.value });
                }}
              >
                <option value="">{dict.common.selecione}</option>
                {principais.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.orderBumpOpcionalLabel}</label>
              <Select
                value={orderBumpId}
                onChange={(e) => {
                  setOrderBumpId(e.target.value);
                  recalcularReceita({ bumpId: e.target.value });
                }}
              >
                <option value={SEM_ORDER_BUMP}>{dict.trafego.nenhumOrderBump}</option>
                {orderBumps.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.investimentoDiaLabel}</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={investimento}
              onChange={(e) => setInvestimento(e.target.value)}
              placeholder={dict.trafego.valorPlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.visualizacoesLabel}</label>
              <Input type="number" min="0" step="1" value={visualizacoes} onChange={(e) => setVisualizacoes(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.cliquesLabel}</label>
              <Input type="number" min="0" step="1" value={cliques} onChange={(e) => setCliques(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.vendasPrincipalLabel}</label>
              <Input
                type="number"
                min="0"
                step="1"
                value={vendasPrincipal}
                onChange={(e) => {
                  setVendasPrincipal(e.target.value);
                  recalcularReceita({ vp: e.target.value });
                }}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.vendasOrderBumpLabel}</label>
              <Input
                type="number"
                min="0"
                step="1"
                value={vendasOrderBump}
                onChange={(e) => {
                  setVendasOrderBump(e.target.value);
                  recalcularReceita({ vob: e.target.value });
                }}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.receitaBrutaLabel}</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={receitaBruta}
              onChange={(e) => {
                setReceitaAuto(false);
                setReceitaBruta(e.target.value);
              }}
            />
            <p className="mt-1 text-xs text-ink-muted">{dict.trafego.receitaBrutaHint}</p>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : dict.trafego.criarAnuncioBotao}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
