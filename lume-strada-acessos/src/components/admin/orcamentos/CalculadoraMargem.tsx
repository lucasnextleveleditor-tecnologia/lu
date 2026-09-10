"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrcCategoriaRow, ServicoComCategoria } from "@/lib/types/orcamentos";
import type { EquipamentoParaCalculadora } from "@/app/admin/orcamentos/calculadora-data";
import { CALCULADORA_HANDOFF_KEY, toneDaMargem, type ItemHandoffCalculadora } from "@/lib/utils/orcamentos";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { IconPlus, IconTrash, IconSearch, IconDollarSign, IconWallet, IconTrendingUp, IconPercent, IconBox, IconAlertTriangle, IconDownload } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

import { cn } from "@/lib/utils/cn";

/** Uma linha de custo — serve tanto pra Serviços quanto pra Equipamentos (mesmo formato, duas listas separadas). */
interface ItemCusto {
  key: string;
  nome: string;
  quantidade: number;
  custoUnitario: number;
}

function novaChave(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`;
}

interface CalculadoraMargemProps {
  categorias: OrcCategoriaRow[];
  servicosComCategoria: ServicoComCategoria[];
  equipamentos: EquipamentoParaCalculadora[];
  /** Estimativa vinda do Financeiro (soma das despesas recorrentes, já convertidas pra equivalente mensal) — só um PONTO DE PARTIDA pro campo "Base de custo fixo mensal", que continua editável. */
  custoFixoMensalEstimado: number;
}

/**
 * Simulador de precificação — NADA aqui é persistido no banco, é só estado
 * em memória (por isso não tem "salvar"/"salvo automaticamente" em lugar
 * nenhum). Modelo: em vez de digitar preço de venda por item, você lança só
 * CUSTOS (Serviços, Equipamentos, Impostos, Custo Fixo/Fee) e escolhe a
 * margem desejada — a calculadora resolve pra trás o preço final que cobre
 * custo + imposto + a margem escolhida (fórmula clássica de precificação:
 * `preço = custo / (1 - imposto% - margem%)`, já que lucro = preço×(1-imposto%) - custo
 * e queremos lucro = preço×margem%).
 *
 * O único jeito de uma simulação "virar algo real" é "Criar orçamento com
 * esses itens": o preço final calculado é distribuído proporcionalmente ao
 * custo de cada SERVIÇO (equipamentos/imposto/custo fixo são só insumo do
 * cálculo — não viram linha separada na proposta do cliente) e passado pro
 * construtor via `CALCULADORA_HANDOFF_KEY` no `sessionStorage` — ver leitura
 * em `OrcamentoBuilder.tsx`.
 */
export function CalculadoraMargem({ categorias, servicosComCategoria, equipamentos, custoFixoMensalEstimado }: CalculadoraMargemProps) {
  const { dict, fmtMoeda } = useLocale();
  const router = useRouter();

  const [itensServico, setItensServico] = useState<ItemCusto[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [buscaServico, setBuscaServico] = useState("");
  const [personalizadoServicoAberto, setPersonalizadoServicoAberto] = useState(false);
  const [pNomeServico, setPNomeServico] = useState("");
  const [pCustoServico, setPCustoServico] = useState(0);

  const [itensEquipamento, setItensEquipamento] = useState<ItemCusto[]>([]);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState("");
  const [personalizadoEquipamentoAberto, setPersonalizadoEquipamentoAberto] = useState(false);
  const [pNomeEquipamento, setPNomeEquipamento] = useState("");
  const [pCustoEquipamento, setPCustoEquipamento] = useState(0);

  const [impostosAtivo, setImpostosAtivo] = useState(false);
  const [aliquotaImposto, setAliquotaImposto] = useState(0);

  const [custoFixoAtivo, setCustoFixoAtivo] = useState(false);
  const [custoFixoBase, setCustoFixoBase] = useState(custoFixoMensalEstimado);
  const [custoFixoPercentual, setCustoFixoPercentual] = useState(0);

  const [margemDesejada, setMargemDesejada] = useState(30);

  const [baixando, setBaixando] = useState(false);
  const [erroPdf, setErroPdf] = useState<string | null>(null);

  const servicosFiltrados = useMemo(() => {
    const termo = buscaServico.trim().toLowerCase();
    return servicosComCategoria.filter((s) => {
      if (categoriaSelecionada && s.categoria_id !== categoriaSelecionada) return false;
      if (termo && !s.nome.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [servicosComCategoria, categoriaSelecionada, buscaServico]);

  const {
    custoServicos,
    custoEquipamentos,
    custoFixoRateado,
    custoOperacionalTotal,
    margemMaisImposto,
    excedeLimite,
    valorFinalDoProjeto,
    impostoValor,
    lucroEstimado,
  } = useMemo(() => {
    const custoServicos = itensServico.reduce((acc, i) => acc + i.quantidade * i.custoUnitario, 0);
    const custoEquipamentos = itensEquipamento.reduce((acc, i) => acc + i.quantidade * i.custoUnitario, 0);
    const custoFixoRateado = custoFixoAtivo ? custoFixoBase * (custoFixoPercentual / 100) : 0;
    const custoOperacionalTotal = custoServicos + custoEquipamentos + custoFixoRateado;

    const aliquota = impostosAtivo ? aliquotaImposto : 0;
    const margemMaisImposto = aliquota + margemDesejada;
    const excedeLimite = margemMaisImposto >= 99;
    // Nunca deixa o denominador chegar perto de zero — passado do limite o
    // valor deixa de ser confiável (ver aviso na tela), mas não pode virar
    // Infinity/NaN e quebrar a renderização.
    const denominador = Math.max(0.01, 1 - margemMaisImposto / 100);
    const valorFinalDoProjeto = custoOperacionalTotal / denominador;
    const impostoValor = valorFinalDoProjeto * (aliquota / 100);
    const lucroEstimado = valorFinalDoProjeto - custoOperacionalTotal - impostoValor;

    return { custoServicos, custoEquipamentos, custoFixoRateado, custoOperacionalTotal, margemMaisImposto, excedeLimite, valorFinalDoProjeto, impostoValor, lucroEstimado };
  }, [itensServico, itensEquipamento, custoFixoAtivo, custoFixoBase, custoFixoPercentual, impostosAtivo, aliquotaImposto, margemDesejada]);

  const toneMargem = toneDaMargem(margemDesejada);

  function handleAdicionarServicoCatalogo(servico: ServicoComCategoria) {
    setItensServico((prev) => [...prev, { key: novaChave(), nome: servico.nome, quantidade: 1, custoUnitario: servico.custo_padrao }]);
  }

  function handleAdicionarServicoPersonalizado() {
    if (!pNomeServico.trim()) return;
    setItensServico((prev) => [...prev, { key: novaChave(), nome: pNomeServico.trim(), quantidade: 1, custoUnitario: pCustoServico }]);
    setPNomeServico("");
    setPCustoServico(0);
    setPersonalizadoServicoAberto(false);
  }

  function handleAdicionarEquipamentoInventario(id: string) {
    const equipamento = equipamentos.find((e) => e.id === id);
    if (!equipamento) return;
    setItensEquipamento((prev) => [...prev, { key: novaChave(), nome: equipamento.nome, quantidade: 1, custoUnitario: equipamento.valorReferencia }]);
    setEquipamentoSelecionado("");
  }

  function handleAdicionarEquipamentoPersonalizado() {
    if (!pNomeEquipamento.trim()) return;
    setItensEquipamento((prev) => [...prev, { key: novaChave(), nome: pNomeEquipamento.trim(), quantidade: 1, custoUnitario: pCustoEquipamento }]);
    setPNomeEquipamento("");
    setPCustoEquipamento(0);
    setPersonalizadoEquipamentoAberto(false);
  }

  function atualizarItem(lista: "servico" | "equipamento", key: string, patch: Partial<ItemCusto>) {
    const setter = lista === "servico" ? setItensServico : setItensEquipamento;
    setter((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function removerItem(lista: "servico" | "equipamento", key: string) {
    const setter = lista === "servico" ? setItensServico : setItensEquipamento;
    setter((prev) => prev.filter((i) => i.key !== key));
  }

  /**
   * Baixa a simulação em PDF.
   *
   * O documento é montado NO SERVIDOR, como texto de verdade (mesmo motor
   * dos PDFs de orçamento e contrato), e não por captura de tela: foto de
   * tela corta o que passa da dobra e corta nome longo no "...". Aqui a
   * lista pagina sozinha e o nome do item quebra em quantas linhas precisar.
   *
   * Como a simulação não existe no banco, os números vão no corpo da
   * requisição — não há id para o servidor buscar.
   */
  async function handleBaixarPdf() {
    if (baixando) return;
    setBaixando(true);
    setErroPdf(null);
    try {
      const resposta = await fetch("/api/orcamentos/calculadora/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itensServico: itensServico.map((i) => ({ nome: i.nome, quantidade: i.quantidade, custoUnitario: i.custoUnitario })),
          itensEquipamento: itensEquipamento.map((i) => ({ nome: i.nome, quantidade: i.quantidade, custoUnitario: i.custoUnitario })),
          custoServicos,
          custoEquipamentos,
          impostosAtivo,
          aliquotaImposto,
          custoFixoAtivo,
          custoFixoBase,
          custoFixoPercentual,
          custoFixoRateado,
          margemDesejada,
          custoOperacionalTotal,
          impostoValor,
          lucroEstimado,
          valorFinalDoProjeto,
        }),
      });
      if (!resposta.ok) throw new Error(String(resposta.status));

      const blob = await resposta.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dia = new Date().toISOString().slice(0, 10);
      link.download = `simulacao-precificacao-${dia}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Solta a memória do blob só depois do clique — revogar antes cancela
      // o download em alguns navegadores.
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setErroPdf(dict.orcamentos.calcPdfErro);
    } finally {
      setBaixando(false);
    }
  }

  function handleCriarOrcamento() {
    if (custoServicos <= 0 || excedeLimite) return;
    // Distribui o Valor Final do Projeto proporcionalmente ao custo de cada
    // SERVIÇO — equipamentos/impostos/custo fixo são insumo do cálculo, não
    // linha separada na proposta do cliente.
    const fator = valorFinalDoProjeto / custoServicos;
    const handoff: ItemHandoffCalculadora[] = itensServico.map((i) => ({
      nome: i.nome,
      quantidade: i.quantidade,
      valorUnitario: Math.round(i.custoUnitario * fator * 100) / 100,
    }));
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
        <StatTile icon={IconDollarSign} label={dict.orcamentos.calcValorFinalLabel} value={fmtMoeda(valorFinalDoProjeto)} tone={toneMargem} />
        <StatTile icon={IconWallet} label={dict.orcamentos.calcCustoOperacionalLabel} value={fmtMoeda(custoOperacionalTotal)} />
        <StatTile icon={IconPercent} label={dict.orcamentos.calcImpostoEstimadoLabel} value={fmtMoeda(impostoValor)} />
        <StatTile icon={IconTrendingUp} label={dict.orcamentos.calcStatLucro} value={fmtMoeda(lucroEstimado)} tone={toneMargem} />
      </div>

      {excedeLimite && (
        <div className="flex items-start gap-2 rounded-lg border border-status-critical/40 bg-status-critical/10 px-4 py-3 text-sm text-status-critical">
          <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {dict.orcamentos.calcAvisoImpostoMargemLimite}
        </div>
      )}

      {/* Serviços (mão de obra) */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold">{dict.orcamentos.calcBlocoServicosTitulo}</h2>
        <p className="mb-3 rounded-lg border border-base-700 bg-base-900/40 px-3 py-2.5 text-xs text-ink-secondary">💡 {dict.orcamentos.calcDicaFreelancer}</p>

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
                <p className="text-xs text-ink-muted">{fmtMoeda(s.custo_padrao)}</p>
              </div>
              <Button variant="ghost" className="shrink-0 gap-1 px-2.5 py-1 text-xs" onClick={() => handleAdicionarServicoCatalogo(s)}>
                <IconPlus className="h-3.5 w-3.5" />
                {dict.orcamentos.adicionarItemBtn}
              </Button>
            </div>
          ))}
          {servicosFiltrados.length === 0 && <p className="py-3 text-center text-xs text-ink-muted">{dict.common.nenhumResultado}</p>}
        </div>

        <div className="mt-3 border-t border-base-800 pt-3">
          {personalizadoServicoAberto ? (
            <div className="space-y-2.5 rounded-lg border border-base-700 p-3">
              <p className="text-xs font-semibold text-ink-secondary">{dict.orcamentos.itemPersonalizadoTitulo}</p>
              <Input value={pNomeServico} onChange={(e) => setPNomeServico(e.target.value)} placeholder={dict.orcamentos.calcItemNomePlaceholder} />
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.calcColCustoUnit}</label>
                <CurrencyInput value={pCustoServico} onChange={setPCustoServico} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setPersonalizadoServicoAberto(false)}>
                  {dict.common.cancelar}
                </Button>
                <Button className="px-3 py-1.5 text-xs" onClick={handleAdicionarServicoPersonalizado}>
                  {dict.orcamentos.adicionarItemBtn}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" className="gap-1.5 text-xs" onClick={() => setPersonalizadoServicoAberto(true)}>
              <IconPlus className="h-3.5 w-3.5" />
              {dict.orcamentos.itemPersonalizadoBtn}
            </Button>
          )}
        </div>

        {itensServico.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-base-800 pt-4">
            <p className="text-xs font-semibold text-ink-secondary">{dict.orcamentos.calcItensTitulo}</p>
            {itensServico.map((item) => (
              <ItemCustoRow key={item.key} item={item} dict={dict} onChange={(patch) => atualizarItem("servico", item.key, patch)} onRemover={() => removerItem("servico", item.key)} />
            ))}
          </div>
        )}
        {itensServico.length === 0 && <p className="mt-4 rounded-lg border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">{dict.orcamentos.calcItensVazio}</p>}

        <p className="mt-3 text-right text-sm text-ink-secondary">
          {dict.orcamentos.subtotalLabel}: <span className="font-semibold text-ink-primary">{fmtMoeda(custoServicos)}</span>
        </p>
      </Card>

      {/* Equipamentos */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <IconBox className="h-4 w-4 text-ink-muted" />
            {dict.orcamentos.calcBlocoEquipamentosTitulo}
          </h2>
          <span className="text-sm font-semibold text-ink-primary">{fmtMoeda(custoEquipamentos)}</span>
        </div>

        {itensEquipamento.length === 0 && <p className="mb-3 text-xs text-ink-muted">{dict.orcamentos.calcEquipamentoVazio}</p>}
        {itensEquipamento.length > 0 && (
          <div className="mb-3 space-y-2">
            {itensEquipamento.map((item) => (
              <ItemCustoRow key={item.key} item={item} dict={dict} onChange={(patch) => atualizarItem("equipamento", item.key, patch)} onRemover={() => removerItem("equipamento", item.key)} />
            ))}
          </div>
        )}

        <Select
          value={equipamentoSelecionado}
          onChange={(e) => {
            setEquipamentoSelecionado(e.target.value);
            if (e.target.value) handleAdicionarEquipamentoInventario(e.target.value);
          }}
        >
          <option value="">{dict.orcamentos.calcEquipamentoPlaceholder}</option>
          {equipamentos.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.nome} — {fmtMoeda(eq.valorReferencia)}
            </option>
          ))}
        </Select>

        <div className="mt-3 border-t border-base-800 pt-3">
          {personalizadoEquipamentoAberto ? (
            <div className="space-y-2.5 rounded-lg border border-base-700 p-3">
              <Input value={pNomeEquipamento} onChange={(e) => setPNomeEquipamento(e.target.value)} placeholder={dict.orcamentos.calcItemNomeLabel} />
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.calcColCustoUnit}</label>
                <CurrencyInput value={pCustoEquipamento} onChange={setPCustoEquipamento} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setPersonalizadoEquipamentoAberto(false)}>
                  {dict.common.cancelar}
                </Button>
                <Button className="px-3 py-1.5 text-xs" onClick={handleAdicionarEquipamentoPersonalizado}>
                  {dict.orcamentos.adicionarItemBtn}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" className="gap-1.5 text-xs" onClick={() => setPersonalizadoEquipamentoAberto(true)}>
              <IconPlus className="h-3.5 w-3.5" />
              {dict.orcamentos.calcEquipamentoPersonalizadoBtn}
            </Button>
          )}
        </div>
      </Card>

      {/* Impostos */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{dict.orcamentos.calcBlocoImpostosTitulo}</h2>
          <Switch checked={impostosAtivo} onChange={setImpostosAtivo} label={dict.orcamentos.calcBlocoImpostosTitulo} />
        </div>
        {impostosAtivo && (
          <div className="mt-3 max-w-xs">
            <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.calcAliquotaLabel}</label>
            <Input type="number" min={0} max={100} value={aliquotaImposto} onChange={(e) => setAliquotaImposto(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} />
          </div>
        )}
      </Card>

      {/* Custo Fixo / Fee */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{dict.orcamentos.calcBlocoCustoFixoTitulo}</h2>
          <Switch checked={custoFixoAtivo} onChange={setCustoFixoAtivo} label={dict.orcamentos.calcBlocoCustoFixoTitulo} />
        </div>
        {custoFixoAtivo && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.calcCustoFixoBaseLabel}</label>
              <CurrencyInput value={custoFixoBase} onChange={setCustoFixoBase} />
              <p className="mt-1 text-[11px] text-ink-muted">{custoFixoMensalEstimado > 0 ? dict.orcamentos.calcCustoFixoBaseHint : dict.orcamentos.calcCustoFixoBaseVazioHint}</p>
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.calcCustoFixoPercentualLabel}</label>
              <Input type="number" min={0} max={100} value={custoFixoPercentual} onChange={(e) => setCustoFixoPercentual(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} />
            </div>
          </div>
        )}
      </Card>

      {/* Margem desejada */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{dict.orcamentos.calcMargemDesejadaLabel}</h2>
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", `bg-status-${toneMargem}/15 text-status-${toneMargem}`)}>{margemDesejada}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={margemDesejada}
          onChange={(e) => setMargemDesejada(Number(e.target.value))}
          className="w-full accent-[rgb(var(--color-accent))]"
        />
        <div className="mt-1 flex justify-between text-[11px] text-ink-muted">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
        <p className="mt-2 text-xs text-ink-muted">{dict.orcamentos.calcMargemHint}</p>
      </Card>

      {/* Demonstrativo de cálculo */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold">{dict.orcamentos.calcDemonstrativoTitulo}</h2>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-ink-secondary">
            <span>{dict.orcamentos.calcValorFinalLabel}</span>
            <span>+{fmtMoeda(valorFinalDoProjeto)}</span>
          </div>
          <div className="flex justify-between text-ink-secondary">
            <span>{dict.orcamentos.calcCustoOperacionalLabel}</span>
            <span>−{fmtMoeda(custoOperacionalTotal)}</span>
          </div>
          <div className="flex justify-between text-ink-secondary">
            <span>{dict.orcamentos.calcImpostoEstimadoLabel}</span>
            <span>−{fmtMoeda(impostoValor)}</span>
          </div>
          <div className="flex justify-between border-t border-base-800 pt-1.5 font-semibold text-ink-primary">
            <span>{dict.orcamentos.calcStatLucro}</span>
            <span>={fmtMoeda(lucroEstimado)}</span>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="text-xs text-ink-muted">{dict.orcamentos.calcAvisoNaoSalva}</p>
        {custoServicos <= 0 && <p className="text-xs text-status-warning">{dict.orcamentos.calcSemServicosParaCriar}</p>}
        {erroPdf && <p className="text-xs text-danger">{erroPdf}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled={custoServicos <= 0 || excedeLimite} onClick={handleCriarOrcamento} className="gap-1.5">
            <IconPlus className="h-4 w-4" />
            {dict.orcamentos.calcCriarOrcamentoBtn}
          </Button>
          {/* Baixar não exige serviço lançado (dá para levar uma simulação só
              de equipamentos), mas exige um cálculo válido — PDF com o valor
              estourado não serve para nada. */}
          <Button
            variant="ghost"
            disabled={baixando || excedeLimite || (custoOperacionalTotal <= 0 && itensServico.length === 0 && itensEquipamento.length === 0)}
            onClick={() => void handleBaixarPdf()}
            className="gap-1.5"
          >
            <IconDownload className="h-4 w-4" />
            {baixando ? dict.orcamentos.calcBaixandoPdf : dict.orcamentos.calcBaixarPdfBtn}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ItemCustoRow({
  item,
  dict,
  onChange,
  onRemover,
}: {
  item: ItemCusto;
  dict: ReturnType<typeof useLocale>["dict"];
  onChange: (patch: Partial<ItemCusto>) => void;
  onRemover: () => void;
}) {
  const { fmtMoeda } = useLocale();
  return (
    <div className="rounded-lg border border-base-800 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink-primary">{item.nome}</p>
        <button onClick={onRemover} className="shrink-0 rounded p-1 text-ink-muted hover:text-danger" aria-label={dict.orcamentos.removerItemBtn}>
          <IconTrash className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.quantidadeLabel}</label>
          <Input type="number" min={1} value={item.quantidade} onChange={(e) => onChange({ quantidade: Number(e.target.value) || 1 })} className="py-1.5 text-xs" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.calcColCustoUnit}</label>
          <CurrencyInput value={item.custoUnitario} onChange={(v) => onChange({ custoUnitario: v })} className="py-1" />
        </div>
      </div>
      <p className="mt-2 text-right text-sm font-semibold text-ink-primary">{fmtMoeda(item.quantidade * item.custoUnitario)}</p>
    </div>
  );
}
