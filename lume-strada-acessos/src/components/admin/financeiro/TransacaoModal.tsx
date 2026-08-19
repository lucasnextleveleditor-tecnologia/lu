"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  CartaoComLimite,
  CategoriaRow,
  ContaComSaldo,
  FinContexto,
  FinRecorrencia,
  FinTipoTransacao,
  MoedaEstrangeira,
  TransacaoComRelacoes,
} from "@/lib/types/financeiro";
import { atualizarTransacao, buscarCotacao, criarTransacao, criarTransacaoParcelada } from "@/app/admin/financeiro/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { DatePicker } from "@/components/ui/DatePicker";
import { fmtBRL, fmtMoedaEstrangeira } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface TransacaoModalProps {
  contas: ContaComSaldo[];
  cartoes: CartaoComLimite[];
  categorias: CategoriaRow[];
  contextoInicial: "todos" | FinContexto;
  /** Quando presente, o modal abre em modo edição pré-preenchido com essa transação (ver `TransacoesManager`). */
  transacaoParaEditar?: TransacaoComRelacoes | null;
  /** Tipo pré-selecionado ao ABRIR pra lançar uma nova transação (ex: telas de detalhe de Receitas/Despesas, que só listam um tipo) — ignorado em modo edição, onde o tipo vem sempre da transação. */
  tipoInicial?: FinTipoTransacao;
  onClose: () => void;
}

type MoedaSelecionada = "BRL" | MoedaEstrangeira;

const PREFIXO_MOEDA: Record<MoedaSelecionada, string> = { BRL: "R$", USD: "US$", EUR: "€" };

export function TransacaoModal({
  contas,
  cartoes,
  categorias,
  contextoInicial,
  transacaoParaEditar,
  tipoInicial,
  onClose,
}: TransacaoModalProps) {
  const { dict } = useLocale();
  const TIPO_OPCOES: { value: FinTipoTransacao; label: string }[] = [
    { value: "despesa", label: dict.financeiro.despesaLabel },
    { value: "receita", label: dict.financeiro.receitaLabel },
    { value: "transferencia", label: dict.financeiro.transferenciaLabel },
  ];
  const editando = transacaoParaEditar ?? null;
  const [tipo, setTipo] = useState<FinTipoTransacao>(editando?.tipo ?? tipoInicial ?? "despesa");
  const [descricao, setDescricao] = useState(editando?.descricao ?? "");
  const [valorDigitado, setValorDigitado] = useState(editando?.valor_original ?? editando?.valor ?? 0);
  const [contexto, setContexto] = useState<FinContexto>(
    editando?.contexto ?? (contextoInicial === "todos" ? "profissional" : (contextoInicial as FinContexto))
  );
  const [fonte, setFonte] = useState<"conta" | "cartao">(editando?.cartao_id ? "cartao" : "conta");
  const [contaId, setContaId] = useState(editando?.conta_id ?? "");
  const [contaDestinoId, setContaDestinoId] = useState(editando?.conta_destino_id ?? "");
  const [cartaoId, setCartaoId] = useState(editando?.cartao_id ?? "");
  const [categoriaId, setCategoriaId] = useState(editando?.categoria_id ?? "");
  const [recorrente, setRecorrente] = useState(editando?.recorrente ?? false);
  const [recorrenciaIntervalo, setRecorrenciaIntervalo] = useState<FinRecorrencia>(editando?.recorrencia_intervalo ?? "mensal");
  const [dataVencimento, setDataVencimento] = useState(editando?.data_vencimento ?? new Date().toISOString().slice(0, 10));
  const [jaPaga, setJaPaga] = useState(editando?.pago ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-moeda — `valorDigitado` está sempre na moeda selecionada aqui
  // (BRL/USD/EUR); quando não é BRL, buscamos a cotação do dia e convertemos
  // pra BRL só na hora de salvar (ver `valorFinalBRL` abaixo). `valor`
  // salvo no banco é SEMPRE BRL — o resto é só registro informativo.
  const [moeda, setMoeda] = useState<MoedaSelecionada>(editando?.moeda_original ?? "BRL");
  const [taxaCambio, setTaxaCambio] = useState<number | null>(editando?.taxa_cambio ?? null);
  const [dataCotacao, setDataCotacao] = useState<string | null>(null);
  const [buscandoCotacao, setBuscandoCotacao] = useState(false);
  const [erroCotacao, setErroCotacao] = useState<string | null>(null);

  // Parcelamento — só disponível lançando uma despesa NOVA (não faz sentido
  // "parcelar" a edição de um lançamento avulso já existente).
  const [parcelado, setParcelado] = useState(false);
  const [numParcelas, setNumParcelas] = useState(2);

  const contasDoContexto = useMemo(() => contas.filter((c) => c.contexto === contexto), [contas, contexto]);
  const cartoesDoContexto = useMemo(() => cartoes.filter((c) => c.contexto === contexto), [cartoes, contexto]);
  const categoriasDoTipo = useMemo(
    () => categorias.filter((c) => tipo === "transferencia" || c.tipo === tipo),
    [categorias, tipo]
  );

  async function atualizarCotacao(moedaAlvo: MoedaEstrangeira) {
    setBuscandoCotacao(true);
    setErroCotacao(null);
    const resultado = await buscarCotacao(moedaAlvo);
    setBuscandoCotacao(false);
    if (!resultado.ok) {
      setErroCotacao(resultado.error);
      setTaxaCambio(null);
      return;
    }
    setTaxaCambio(resultado.taxa);
    setDataCotacao(resultado.dataCotacao);
  }

  useEffect(() => {
    if (moeda !== "BRL") atualizarCotacao(moeda);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moeda]);

  const valorFinalBRL = moeda === "BRL" ? valorDigitado : (taxaCambio ?? 0) * valorDigitado;
  const valorPorParcela = parcelado && numParcelas > 0 ? valorFinalBRL / numParcelas : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (tipo !== "transferencia" && fonte === "conta" && !contaId) {
      setError(dict.financeiro.selecioneContaErro);
      return;
    }
    if (tipo !== "transferencia" && fonte === "cartao" && !cartaoId) {
      setError(dict.financeiro.selecioneCartaoErro);
      return;
    }
    if (tipo === "transferencia" && (!contaId || !contaDestinoId)) {
      setError(dict.financeiro.selecioneOrigemDestinoErro);
      return;
    }
    if (moeda !== "BRL" && !taxaCambio) {
      setError(dict.financeiro.cotacaoNaoConfirmadaErro);
      return;
    }

    setLoading(true);

    if (!editando && parcelado) {
      const result = await criarTransacaoParcelada({
        descricao,
        valorTotal: valorFinalBRL,
        numParcelas,
        categoriaId: categoriaId || null,
        contexto,
        contaId: fonte === "conta" ? contaId : null,
        cartaoId: fonte === "cartao" ? cartaoId : null,
        dataPrimeiraParcela: dataVencimento,
        moedaOriginal: moeda === "BRL" ? null : moeda,
        valorOriginalTotal: moeda === "BRL" ? null : valorDigitado,
        taxaCambio: moeda === "BRL" ? null : taxaCambio,
      });
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
      return;
    }

    const payload = {
      tipo,
      descricao,
      valor: valorFinalBRL,
      categoriaId: tipo === "transferencia" ? null : categoriaId || null,
      contexto,
      contaId: tipo === "transferencia" ? contaId : fonte === "conta" ? contaId : null,
      contaDestinoId: tipo === "transferencia" ? contaDestinoId : null,
      cartaoId: tipo === "transferencia" ? null : fonte === "cartao" ? cartaoId : null,
      recorrente,
      recorrenciaIntervalo: recorrente ? recorrenciaIntervalo : null,
      dataVencimento,
      jaPaga,
      moedaOriginal: tipo === "transferencia" || moeda === "BRL" ? null : moeda,
      valorOriginal: tipo === "transferencia" || moeda === "BRL" ? null : valorDigitado,
      taxaCambio: tipo === "transferencia" || moeda === "BRL" ? null : taxaCambio,
    };
    const result = editando ? await atualizarTransacao(editando.id, payload) : await criarTransacao(payload);

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
          <h3 className="text-base font-semibold">{editando ? dict.financeiro.editarTransacaoTitulo : dict.financeiro.novaTransacaoTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo — pílulas, é o campo que mais muda o resto do formulário */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.tipoObrigatorio}</label>
            <div className="inline-flex w-full rounded-lg border border-base-700 bg-base-950/60 p-1">
              {TIPO_OPCOES.map((opcao) => (
                <button
                  key={opcao.value}
                  type="button"
                  onClick={() => {
                    setTipo(opcao.value);
                    setCategoriaId("");
                    if (opcao.value === "receita") setFonte("conta");
                  }}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                    tipo === opcao.value ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
                  )}
                >
                  {opcao.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.descricaoObrigatorio}</label>
            <Input
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={tipo === "transferencia" ? dict.financeiro.placeholderDescricaoTransferencia : dict.financeiro.placeholderDescricaoGeral}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">
                {parcelado ? dict.financeiro.valorTotalCompraLabel : dict.financeiro.valorObrigatorioLabel}
              </label>
              <CurrencyInput
                required
                prefixo={PREFIXO_MOEDA[moeda]}
                value={valorDigitado}
                onChange={setValorDigitado}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.contextoObrigatorio}</label>
              <Select
                value={contexto}
                onChange={(e) => {
                  setContexto(e.target.value as FinContexto);
                  setContaId("");
                  setContaDestinoId("");
                  setCartaoId("");
                }}
              >
                <option value="profissional">{dict.financeiro.contextoProfissional}</option>
                <option value="pessoal">{dict.financeiro.contextoPessoal}</option>
              </Select>
            </div>
          </div>

          {tipo !== "transferencia" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.moedaLancamentoLabel}</label>
              <div className="inline-flex w-full rounded-lg border border-base-700 bg-base-950/60 p-1">
                {(["BRL", "USD", "EUR"] as const).map((opcao) => (
                  <button
                    key={opcao}
                    type="button"
                    onClick={() => setMoeda(opcao)}
                    className={cn(
                      "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                      moeda === opcao ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
                    )}
                  >
                    {opcao === "BRL" ? dict.financeiro.moedaReal : opcao === "USD" ? dict.financeiro.moedaDolar : dict.financeiro.moedaEuro}
                  </button>
                ))}
              </div>
              {moeda !== "BRL" && (
                <div className="mt-2 rounded-lg border border-base-700 bg-base-950/40 px-3 py-2 text-xs">
                  {buscandoCotacao ? (
                    <span className="text-ink-muted">{dict.financeiro.buscandoCotacao}</span>
                  ) : erroCotacao ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-danger">{erroCotacao}</span>
                      <button
                        type="button"
                        onClick={() => atualizarCotacao(moeda)}
                        className="shrink-0 font-medium text-ink-primary hover:underline"
                      >
                        {dict.common.tentarDeNovo}
                      </button>
                    </div>
                  ) : taxaCambio ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-ink-secondary">
                        {dict.financeiro.cotacaoLabel} {fmtMoedaEstrangeira(1, moeda)} = {fmtBRL(taxaCambio)}
                        {dataCotacao ? ` (${dataCotacao})` : ""} · {dict.financeiro.equivaleALabel}{" "}
                        <span className="font-semibold text-ink-primary">{fmtBRL(valorFinalBRL)}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => atualizarCotacao(moeda)}
                        className="shrink-0 font-medium text-ink-primary hover:underline"
                      >
                        {dict.financeiro.atualizarBtn}
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {tipo !== "transferencia" && (
            <>
              {tipo === "despesa" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.pagarComLabel}</label>
                  <div className="inline-flex w-full rounded-lg border border-base-700 bg-base-950/60 p-1">
                    {(["conta", "cartao"] as const).map((opcao) => (
                      <button
                        key={opcao}
                        type="button"
                        onClick={() => setFonte(opcao)}
                        className={cn(
                          "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                          fonte === opcao ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
                        )}
                      >
                        {opcao === "conta" ? dict.financeiro.contaGenerica : dict.financeiro.cartaoCreditoOpcaoLabel}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {fonte === "conta" ? (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.contaObrigatorio}</label>
                  {contasDoContexto.length === 0 ? (
                    <p className="text-xs text-ink-muted">
                      {dict.financeiro.nenhumaContaContexto.replace(
                        "{contexto}",
                        (contexto === "pessoal" ? dict.financeiro.contextoPessoal : dict.financeiro.contextoProfissional).toLowerCase()
                      )}
                    </p>
                  ) : (
                    <Select required value={contaId} onChange={(e) => setContaId(e.target.value)}>
                      <option value="">{dict.common.selecione}</option>
                      {contasDoContexto.map((conta) => (
                        <option key={conta.id} value={conta.id}>
                          {conta.nome}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.cartaoObrigatorio}</label>
                  {cartoesDoContexto.length === 0 ? (
                    <p className="text-xs text-ink-muted">
                      {dict.financeiro.nenhumCartaoContexto.replace(
                        "{contexto}",
                        (contexto === "pessoal" ? dict.financeiro.contextoPessoal : dict.financeiro.contextoProfissional).toLowerCase()
                      )}
                    </p>
                  ) : (
                    <Select required value={cartaoId} onChange={(e) => setCartaoId(e.target.value)}>
                      <option value="">{dict.common.selecione}</option>
                      {cartoesDoContexto.map((cartao) => (
                        <option key={cartao.id} value={cartao.id}>
                          {cartao.nome}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.common.categoria}</label>
                <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                  <option value="">{dict.common.semCategoria}</option>
                  {categoriasDoTipo.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.emoji ? `${categoria.emoji} ${categoria.nome}` : categoria.nome}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Parcelamento — só na criação de uma despesa nova; editar um
                  lançamento avulso ou uma parcela específica não "reparcela"
                  nada, é só uma edição normal do valor/data desse lançamento. */}
              {tipo === "despesa" && !editando && (
                <div className="space-y-2 rounded-lg border border-base-700 bg-base-950/40 p-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
                    <input
                      type="checkbox"
                      checked={parcelado}
                      onChange={(e) => setParcelado(e.target.checked)}
                      className="h-4 w-4 rounded border-base-600 bg-base-900 accent-white"
                    />
                    {dict.financeiro.parcelarCompraLabel}
                  </label>
                  {parcelado && (
                    <>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.numeroParcelasLabel}</label>
                        <Input
                          required
                          type="number"
                          min={2}
                          max={60}
                          step={1}
                          value={numParcelas}
                          onChange={(e) => setNumParcelas(Math.max(2, Math.min(60, Number(e.target.value) || 2)))}
                        />
                      </div>
                      <p className="text-xs text-ink-muted">
                        {dict.financeiro.parcelaPreviewPrefixo.replace("{n}", String(numParcelas))}{" "}
                        <span className="font-medium text-ink-primary">{fmtBRL(valorPorParcela)}</span> {dict.financeiro.parcelaPreviewSufixo}
                      </p>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {tipo === "transferencia" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.contaOrigemLabel}</label>
                <Select required value={contaId} onChange={(e) => setContaId(e.target.value)}>
                  <option value="">{dict.common.selecione}</option>
                  {contasDoContexto.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.nome}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.contaDestinoLabel}</label>
                <Select required value={contaDestinoId} onChange={(e) => setContaDestinoId(e.target.value)}>
                  <option value="">{dict.common.selecione}</option>
                  {contasDoContexto
                    .filter((c) => c.id !== contaId)
                    .map((conta) => (
                      <option key={conta.id} value={conta.id}>
                        {conta.nome}
                      </option>
                    ))}
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">
                {parcelado ? dict.financeiro.dataPrimeiraParcelaLabel : dict.financeiro.dataVencimentoLabel}
              </label>
              <DatePicker required value={dataVencimento} onChange={setDataVencimento} />
            </div>
            {!parcelado && (
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={jaPaga}
                    onChange={(e) => setJaPaga(e.target.checked)}
                    className="h-4 w-4 rounded border-base-600 bg-base-900 accent-white"
                  />
                  {dict.financeiro.jaPagaLabel}
                </label>
              </div>
            )}
          </div>

          {tipo !== "transferencia" && !parcelado && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
                <input
                  type="checkbox"
                  checked={recorrente}
                  onChange={(e) => setRecorrente(e.target.checked)}
                  className="h-4 w-4 rounded border-base-600 bg-base-900 accent-white"
                />
                {dict.financeiro.transacaoRecorrenteLabel}
              </label>
              {recorrente && (
                <Select value={recorrenciaIntervalo} onChange={(e) => setRecorrenciaIntervalo(e.target.value as FinRecorrencia)}>
                  <option value="semanal">{dict.financeiro.semanalLabel}</option>
                  <option value="mensal">{dict.financeiro.mensalLabel}</option>
                  <option value="anual">{dict.financeiro.anualLabel}</option>
                </Select>
              )}
            </div>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : dict.financeiro.lancarTransacaoBtn}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
