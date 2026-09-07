"use client";

import { useState, type FormEvent } from "react";
import type { AnuncioComRelacoes, CriativoRow, TaxaPadraoRow } from "@/lib/types/infoprodutos";
import type { ProdutoRow } from "@/lib/types/infoprodutos";
import { criarAnuncio, atualizarAnuncio, type OrderBumpVendaInput } from "@/app/admin/trafego/infoprodutos-actions";
import { calcularReceitaBruta, calcularReceitaLiquida } from "@/lib/utils/infoprodutos";
import { fmtBRL } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { IconPlus, IconTrash } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface AnuncioModalProps {
  anuncio?: AnuncioComRelacoes | null;
  produtos: ProdutoRow[];
  criativos: CriativoRow[];
  clienteCadastroId: string;
  dataPadrao: string;
  taxaPadrao: TaxaPadraoRow | null;
  onClose: () => void;
}

/** Uma linha de order bump vendido dentro do formulário — `key` é só identidade de UI (React), nunca vai pro server. */
interface OrderBumpLinhaForm {
  key: number;
  produtoId: string;
  quantidade: string;
}

export function AnuncioModal({ anuncio, produtos, criativos, clienteCadastroId, dataPadrao, taxaPadrao, onClose }: AnuncioModalProps) {
  const { dict } = useLocale();
  const principais = produtos.filter((p) => p.tipo === "principal");
  const orderBumps = produtos.filter((p) => p.tipo === "order_bump");

  const [data, setData] = useState(anuncio?.data ?? dataPadrao);
  const [criativoId, setCriativoId] = useState(anuncio?.criativo_id ?? criativos[0]?.id ?? "");
  const [criativoErro, setCriativoErro] = useState<string | null>(null);
  const [produtoPrincipalId, setProdutoPrincipalId] = useState(anuncio?.produto_principal_id ?? principais[0]?.id ?? "");

  // Cada anúncio pode ter VÁRIAS linhas de order bump vendido (produto +
  // quantidade) — ex.: 1 unidade do produto X + 2 unidades do produto Y no
  // mesmo lançamento. `key` é só pra identidade de item de lista no React.
  const linhasIniciais: OrderBumpLinhaForm[] = (anuncio?.order_bump_vendas ?? []).map((v, i) => ({
    key: i,
    produtoId: v.produtoId,
    quantidade: String(v.quantidade),
  }));
  const [orderBumpLinhas, setOrderBumpLinhas] = useState<OrderBumpLinhaForm[]>(linhasIniciais);
  const [proximaChave, setProximaChave] = useState(linhasIniciais.length);

  // Pré-preenche o Investimento do Dia com o `orcamento_diario` do Criativo
  // selecionado, SÓ num anúncio NOVO (editando um já lançado, usa o valor
  // GRAVADO naquele lançamento — mesmo espírito da Taxa Padrão, ver abaixo).
  // `investimentoAuto` vira false assim que o usuário editar o campo direto,
  // ou trocar de Criativo depois de já ter mexido nele manualmente.
  const [investimentoAuto, setInvestimentoAuto] = useState(!anuncio);
  const [investimento, setInvestimento] = useState(
    String(anuncio?.investimento ?? criativos.find((c) => c.id === criativoId)?.orcamento_diario ?? "")
  );
  const [visualizacoes, setVisualizacoes] = useState(String(anuncio?.visualizacoes ?? ""));
  const [cliques, setCliques] = useState(String(anuncio?.cliques ?? ""));
  const [vendasPrincipal, setVendasPrincipal] = useState(String(anuncio?.vendas_principal ?? ""));
  const [receitaBruta, setReceitaBruta] = useState(String(anuncio?.receita_bruta ?? "0"));
  const [receitaAuto, setReceitaAuto] = useState(true); // enquanto true, recalcula sozinho; vira false assim que o usuário edita o campo direto
  // Pré-preenche da Taxa Padrão do cliente SÓ num anúncio novo — editando um
  // já lançado, usa o valor GRAVADO naquele lançamento (nunca o padrão atual,
  // que pode ter mudado depois).
  const [taxaPercentual, setTaxaPercentual] = useState(String(anuncio?.taxa_percentual ?? taxaPadrao?.taxa_percentual ?? 0));
  const [taxaFixa, setTaxaFixa] = useState(String(anuncio?.taxa_fixa ?? taxaPadrao?.taxa_fixa ?? 0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editando = Boolean(anuncio);

  const totalVendasOrderBump = orderBumpLinhas.reduce((acc, l) => acc + (Number(l.quantidade) || 0), 0);
  const totalVendas = (Number(vendasPrincipal) || 0) + totalVendasOrderBump;
  const receitaLiquida = calcularReceitaLiquida(Number(receitaBruta) || 0, Number(taxaPercentual) || 0, Number(taxaFixa) || 0, totalVendas);

  function recalcularReceita(novosValores: { vp?: string; principalId?: string; linhas?: OrderBumpLinhaForm[] }) {
    if (!receitaAuto) return;
    const vp = Number(novosValores.vp ?? vendasPrincipal) || 0;
    const pId = novosValores.principalId ?? produtoPrincipalId;
    const linhas = novosValores.linhas ?? orderBumpLinhas;
    const valorPrincipal = principais.find((p) => p.id === pId)?.valor ?? 0;
    const orderBumpsVendidos = linhas.map((l) => ({
      valor: orderBumps.find((p) => p.id === l.produtoId)?.valor ?? 0,
      quantidade: Number(l.quantidade) || 0,
    }));
    setReceitaBruta(String(calcularReceitaBruta(vp, valorPrincipal, orderBumpsVendidos)));
  }

  function adicionarLinhaOrderBump() {
    const novaLinha: OrderBumpLinhaForm = { key: proximaChave, produtoId: orderBumps[0]?.id ?? "", quantidade: "1" };
    const novasLinhas = [...orderBumpLinhas, novaLinha];
    setOrderBumpLinhas(novasLinhas);
    setProximaChave((k) => k + 1);
    recalcularReceita({ linhas: novasLinhas });
  }

  function removerLinhaOrderBump(key: number) {
    const novasLinhas = orderBumpLinhas.filter((l) => l.key !== key);
    setOrderBumpLinhas(novasLinhas);
    recalcularReceita({ linhas: novasLinhas });
  }

  function atualizarLinhaOrderBump(key: number, campo: "produtoId" | "quantidade", valor: string) {
    const novasLinhas = orderBumpLinhas.map((l) => (l.key === key ? { ...l, [campo]: valor } : l));
    setOrderBumpLinhas(novasLinhas);
    recalcularReceita({ linhas: novasLinhas });
  }

  function handleCriativoChange(novoId: string) {
    setCriativoId(novoId);
    if (novoId) setCriativoErro(null);
    // Só troca o Investimento sozinho enquanto o usuário não tiver editado
    // esse campo na mão (ver `investimentoAuto`) — nunca em edição de um
    // anúncio já lançado.
    if (investimentoAuto) {
      const orcamento = criativos.find((c) => c.id === novoId)?.orcamento_diario ?? 0;
      setInvestimento(String(orcamento));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!criativoId) {
      setCriativoErro(dict.trafego.selecioneCriativoErro);
      return;
    }
    setLoading(true);
    setError(null);

    const orderBumpVendas: OrderBumpVendaInput[] = orderBumpLinhas
      .filter((l) => l.produtoId && (Number(l.quantidade) || 0) > 0)
      .map((l) => ({ produtoId: l.produtoId, quantidade: Number(l.quantidade) || 0 }));

    const input = {
      data,
      criativoId,
      produtoPrincipalId: produtoPrincipalId || null,
      orderBumpVendas,
      investimento: Number(investimento) || 0,
      visualizacoes: Number(visualizacoes) || 0,
      cliques: Number(cliques) || 0,
      vendasPrincipal: Number(vendasPrincipal) || 0,
      receitaBruta: Number(receitaBruta) || 0,
      taxaPercentual: Number(taxaPercentual) || 0,
      taxaFixa: Number(taxaFixa) || 0,
    };

    const result = anuncio ? await atualizarAnuncio(anuncio.id, input) : await criarAnuncio(clienteCadastroId, input);

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
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.criativoObrigatorioLabel}</label>
              <Select
                required
                value={criativoId}
                onChange={(e) => handleCriativoChange(e.target.value)}
                className={criativoErro ? "border-danger" : undefined}
              >
                <option value="">{dict.common.selecione}</option>
                {criativos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
              {criativoErro && <p className="mt-1 text-xs text-danger">{criativoErro}</p>}
            </div>
          </div>

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
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.orderBumpsVendidosLabel}</label>
            {orderBumpLinhas.length === 0 && <p className="mb-2 text-xs text-ink-muted">{dict.trafego.nenhumOrderBumpVendidoTexto}</p>}
            <div className="space-y-2">
              {orderBumpLinhas.map((linha) => (
                <div key={linha.key} className="flex items-center gap-2">
                  <Select
                    className="flex-1"
                    value={linha.produtoId}
                    onChange={(e) => atualizarLinhaOrderBump(linha.key, "produtoId", e.target.value)}
                  >
                    <option value="">{dict.common.selecione}</option>
                    {orderBumps.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    className="w-20"
                    value={linha.quantidade}
                    onChange={(e) => atualizarLinhaOrderBump(linha.key, "quantidade", e.target.value)}
                    placeholder={dict.trafego.quantidadePlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => removerLinhaOrderBump(linha.key)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-muted transition hover:bg-base-800 hover:text-danger"
                    aria-label={dict.trafego.removerOrderBumpAria}
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={adicionarLinhaOrderBump}
              disabled={orderBumps.length === 0}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-accent hover:underline disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline"
            >
              <IconPlus className="h-3.5 w-3.5" />
              {dict.trafego.adicionarOrderBumpBotao}
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.investimentoDiaLabel}</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={investimento}
              onChange={(e) => {
                setInvestimentoAuto(false);
                setInvestimento(e.target.value);
              }}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.taxaPercentualLabel}</label>
              <Input type="number" min="0" step="0.01" value={taxaPercentual} onChange={(e) => setTaxaPercentual(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.taxaFixaLabel}</label>
              <Input type="number" min="0" step="0.01" value={taxaFixa} onChange={(e) => setTaxaFixa(e.target.value)} />
            </div>
            <p className="col-span-2 -mt-1 text-xs text-ink-muted">{dict.trafego.taxaAnuncioHint}</p>
          </div>

          <div className="rounded-xl border border-base-700 bg-base-950/60 p-3">
            <p className="text-xs uppercase tracking-wide text-ink-muted">{dict.trafego.receitaLiquidaLabel}</p>
            <p className={`mt-0.5 text-lg font-semibold ${receitaLiquida >= 0 ? "text-status-good" : "text-status-critical"}`}>
              {fmtBRL(receitaLiquida)}
            </p>
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
