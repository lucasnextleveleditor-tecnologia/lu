"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrcCategoriaRow, ServicoComCategoria, DescontoTipo } from "@/lib/types/orcamentos";
import { CALCULADORA_HANDOFF_KEY, toneDaMargem, type ItemHandoffCalculadora } from "@/lib/utils/orcamentos";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { IconPlus, IconTrash, IconSearch, IconDollarSign, IconWallet, IconTrendingUp, IconPercent } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface ItemCalc {
  key: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  custoUnitario: number;
}

function novaChave(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`;
}

interface CalculadoraMargemProps {
  categorias: OrcCategoriaRow[];
  servicosComCategoria: ServicoComCategoria[];
}

/**
 * Simulador de preço/custo/margem — NADA aqui é persistido no banco, é só
 * estado em memória (por isso não tem "salvar"/"salvo automaticamente" em
 * lugar nenhum). O único jeito de uma simulação "virar algo real" é o botão
 * "Criar orçamento com esses itens", que só passa os nomes/quantidades/
 * valores de venda (nunca o custo, que é informação interna) pro construtor
 * via `CALCULADORA_HANDOFF_KEY` no `sessionStorage` — ver leitura em
 * `OrcamentoBuilder.tsx`.
 */
export function CalculadoraMargem({ categorias, servicosComCategoria }: CalculadoraMargemProps) {
  const { dict } = useLocale();
  const router = useRouter();

  const [itens, setItens] = useState<ItemCalc[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [buscaServico, setBuscaServico] = useState("");
  const [personalizadoAberto, setPersonalizadoAberto] = useState(false);
  const [pNome, setPNome] = useState("");
  const [pValor, setPValor] = useState(0);
  const [pCusto, setPCusto] = useState(0);

  const [descontoTipo, setDescontoTipo] = useState<DescontoTipo | "">("");
  const [descontoValor, setDescontoValor] = useState(0);

  const servicosFiltrados = useMemo(() => {
    const termo = buscaServico.trim().toLowerCase();
    return servicosComCategoria.filter((s) => {
      if (categoriaSelecionada && s.categoria_id !== categoriaSelecionada) return false;
      if (termo && !s.nome.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [servicosComCategoria, categoriaSelecionada, buscaServico]);

  const { subtotalVenda, subtotalCusto, desconto, totalVenda, lucro, margemPct } = useMemo(() => {
    const subtotalVenda = itens.reduce((acc, i) => acc + i.quantidade * i.valorUnitario, 0);
    const subtotalCusto = itens.reduce((acc, i) => acc + i.quantidade * i.custoUnitario, 0);
    const desconto = !descontoTipo ? 0 : descontoTipo === "percentual" ? subtotalVenda * (descontoValor / 100) : Math.min(descontoValor, subtotalVenda);
    const totalVenda = Math.max(0, subtotalVenda - desconto);
    const lucro = totalVenda - subtotalCusto;
    const margemPct = totalVenda > 0 ? (lucro / totalVenda) * 100 : 0;
    return { subtotalVenda, subtotalCusto, desconto, totalVenda, lucro, margemPct };
  }, [itens, descontoTipo, descontoValor]);

  const toneMargem = itens.length === 0 ? "neutral" : toneDaMargem(margemPct);

  function handleAdicionarServico(servico: ServicoComCategoria) {
    setItens((prev) => [...prev, { key: novaChave(), nome: servico.nome, quantidade: 1, valorUnitario: servico.valor_padrao, custoUnitario: servico.custo_padrao }]);
  }

  function handleAdicionarPersonalizado() {
    if (!pNome.trim()) return;
    setItens((prev) => [...prev, { key: novaChave(), nome: pNome.trim(), quantidade: 1, valorUnitario: pValor, custoUnitario: pCusto }]);
    setPNome("");
    setPValor(0);
    setPCusto(0);
    setPersonalizadoAberto(false);
  }

  function atualizarItem(key: string, patch: Partial<ItemCalc>) {
    setItens((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function removerItem(key: string) {
    setItens((prev) => prev.filter((i) => i.key !== key));
  }

  function handleCriarOrcamento() {
    const handoff: ItemHandoffCalculadora[] = itens.map((i) => ({ nome: i.nome, quantidade: i.quantidade, valorUnitario: i.valorUnitario }));
    try {
      sessionStorage.setItem(CALCULADORA_HANDOFF_KEY, JSON.stringify(handoff));
    } catch {
      // sessionStorage indisponível (modo privado, etc.) — segue pro construtor vazio mesmo assim, sem travar o fluxo.
    }
    router.push("/admin/orcamentos/novo");
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={IconDollarSign} label={dict.orcamentos.calcStatSubtotalVenda} value={fmtBRL(totalVenda)} />
        <StatTile icon={IconWallet} label={dict.orcamentos.calcStatCustoTotal} value={fmtBRL(subtotalCusto)} />
        <StatTile icon={IconTrendingUp} label={dict.orcamentos.calcStatLucro} value={fmtBRL(lucro)} tone={toneMargem} />
        <StatTile icon={IconPercent} label={dict.orcamentos.calcStatMargem} value={fmtPercent(margemPct / 100)} tone={toneMargem} />
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">{dict.orcamentos.calcAdicionarItensTitulo}</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={() => setCategoriaSelecionada(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              categoriaSelecionada === null ? "border-accent bg-accent/15 text-ink-primary" : "border-base-600 text-ink-secondary hover:text-ink-primary"
            )}
          >
            {dict.common.todos}
          </button>
          {categorias.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoriaSelecionada(c.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                categoriaSelecionada === c.id ? "border-accent bg-accent/15 text-ink-primary" : "border-base-600 text-ink-secondary hover:text-ink-primary"
              )}
            >
              {c.emoji ? `${c.emoji} ` : ""}
              {c.nome}
            </button>
          ))}
        </div>

        <div className="relative mb-3">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <Input value={buscaServico} onChange={(e) => setBuscaServico(e.target.value)} placeholder={dict.orcamentos.buscarServicoPlaceholder} className="pl-9" />
        </div>

        <div className="max-h-64 space-y-1.5 overflow-y-auto">
          {servicosFiltrados.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-base-800 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink-primary">{s.nome}</p>
                <p className="text-xs text-ink-muted">
                  {fmtBRL(s.valor_padrao)}
                  {s.custo_padrao > 0 && s.valor_padrao > 0 && ` · ${dict.orcamentos.margemAbreviada.replace("{pct}", (((s.valor_padrao - s.custo_padrao) / s.valor_padrao) * 100).toFixed(0))}`}
                </p>
              </div>
              <Button variant="ghost" className="shrink-0 gap-1 px-2.5 py-1 text-xs" onClick={() => handleAdicionarServico(s)}>
                <IconPlus className="h-3.5 w-3.5" />
                {dict.orcamentos.adicionarItemBtn}
              </Button>
            </div>
          ))}
          {servicosFiltrados.length === 0 && <p className="py-3 text-center text-xs text-ink-muted">{dict.common.nenhumResultado}</p>}
        </div>

        <div className="mt-3 border-t border-base-800 pt-3">
          {personalizadoAberto ? (
            <div className="space-y-2.5 rounded-lg border border-base-700 p-3">
              <p className="text-xs font-semibold text-ink-secondary">{dict.orcamentos.itemPersonalizadoTitulo}</p>
              <Input value={pNome} onChange={(e) => setPNome(e.target.value)} placeholder={dict.orcamentos.calcItemNomePlaceholder} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.calcColVendaUnit}</label>
                  <CurrencyInput value={pValor} onChange={setPValor} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.calcColCustoUnit}</label>
                  <CurrencyInput value={pCusto} onChange={setPCusto} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setPersonalizadoAberto(false)}>
                  {dict.common.cancelar}
                </Button>
                <Button className="px-3 py-1.5 text-xs" onClick={handleAdicionarPersonalizado}>
                  {dict.orcamentos.adicionarItemBtn}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" className="gap-1.5 text-xs" onClick={() => setPersonalizadoAberto(true)}>
              <IconPlus className="h-3.5 w-3.5" />
              {dict.orcamentos.itemPersonalizadoBtn}
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">{dict.orcamentos.calcItensTitulo}</h2>

        {itens.length === 0 ? (
          <p className="rounded-lg border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">{dict.orcamentos.calcItensVazio}</p>
        ) : (
          <div className="space-y-3">
            {itens.map((item) => {
              const margemItem = item.valorUnitario > 0 ? ((item.valorUnitario - item.custoUnitario) / item.valorUnitario) * 100 : 0;
              return (
                <div key={item.key} className="rounded-lg border border-base-800 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink-primary">{item.nome}</p>
                    <button onClick={() => removerItem(item.key)} className="shrink-0 rounded p-1 text-ink-muted hover:text-danger" aria-label={dict.orcamentos.removerItemBtn}>
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.quantidadeLabel}</label>
                      <Input type="number" min={1} value={item.quantidade} onChange={(e) => atualizarItem(item.key, { quantidade: Number(e.target.value) || 1 })} className="py-1.5 text-xs" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.calcColVendaUnit}</label>
                      <CurrencyInput value={item.valorUnitario} onChange={(v) => atualizarItem(item.key, { valorUnitario: v })} className="py-1" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.calcColCustoUnit}</label>
                      <CurrencyInput value={item.custoUnitario} onChange={(v) => atualizarItem(item.key, { custoUnitario: v })} className="py-1" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className={cn("text-xs font-medium", item.valorUnitario > 0 && `text-status-${toneDaMargem(margemItem)}`)}>
                      {item.valorUnitario > 0 ? dict.orcamentos.margemAbreviada.replace("{pct}", margemItem.toFixed(0)) : ""}
                    </p>
                    <p className="text-right text-sm font-semibold text-ink-primary">{fmtBRL(item.quantidade * item.valorUnitario)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">{dict.orcamentos.descontoLabel}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select value={descontoTipo} onChange={(e) => setDescontoTipo(e.target.value as DescontoTipo | "")}>
            <option value="">{dict.orcamentos.descontoTipoNenhum}</option>
            <option value="percentual">{dict.orcamentos.descontoTipoPercentual}</option>
            <option value="fixo">{dict.orcamentos.descontoTipoFixo}</option>
          </Select>
          {descontoTipo &&
            (descontoTipo === "percentual" ? (
              <Input type="number" min={0} max={100} value={descontoValor} onChange={(e) => setDescontoValor(Number(e.target.value) || 0)} />
            ) : (
              <CurrencyInput value={descontoValor} onChange={setDescontoValor} />
            ))}
        </div>
        {desconto > 0 && (
          <div className="mt-3 space-y-1 border-t border-base-800 pt-3 text-sm">
            <div className="flex justify-between text-ink-secondary">
              <span>{dict.orcamentos.subtotalLabel}</span>
              <span>{fmtBRL(subtotalVenda)}</span>
            </div>
            <div className="flex justify-between text-ink-secondary">
              <span>{dict.orcamentos.descontoLabel}</span>
              <span>−{fmtBRL(desconto)}</span>
            </div>
            <div className="flex justify-between border-t border-base-800 pt-1.5 font-semibold text-ink-primary">
              <span>{dict.orcamentos.totalLabel}</span>
              <span>{fmtBRL(totalVenda)}</span>
            </div>
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <p className="text-xs text-ink-muted">{dict.orcamentos.calcAvisoNaoSalva}</p>
        <Button disabled={itens.length === 0} onClick={handleCriarOrcamento} className="gap-1.5">
          <IconPlus className="h-4 w-4" />
          {dict.orcamentos.calcCriarOrcamentoBtn}
        </Button>
      </Card>
    </div>
  );
}
