"use client";

import { useMemo, useState, type FormEvent } from "react";
import type {
  CartaoComLimite,
  CategoriaRow,
  ContaComSaldo,
  FinContexto,
  FinRecorrencia,
  FinTipoTransacao,
  TransacaoComRelacoes,
} from "@/lib/types/financeiro";
import { atualizarTransacao, criarTransacao } from "@/app/admin/financeiro/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";

interface TransacaoModalProps {
  contas: ContaComSaldo[];
  cartoes: CartaoComLimite[];
  categorias: CategoriaRow[];
  contextoInicial: "todos" | FinContexto;
  /** Quando presente, o modal abre em modo edição pré-preenchido com essa transação (ver `TransacoesManager`). */
  transacaoParaEditar?: TransacaoComRelacoes | null;
  onClose: () => void;
}

const TIPO_OPCOES: { value: FinTipoTransacao; label: string }[] = [
  { value: "despesa", label: "Despesa" },
  { value: "receita", label: "Receita" },
  { value: "transferencia", label: "Transferência" },
];

export function TransacaoModal({ contas, cartoes, categorias, contextoInicial, transacaoParaEditar, onClose }: TransacaoModalProps) {
  const editando = transacaoParaEditar ?? null;
  const [tipo, setTipo] = useState<FinTipoTransacao>(editando?.tipo ?? "despesa");
  const [descricao, setDescricao] = useState(editando?.descricao ?? "");
  const [valor, setValor] = useState(editando ? String(editando.valor) : "");
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

  const contasDoContexto = useMemo(() => contas.filter((c) => c.contexto === contexto), [contas, contexto]);
  const cartoesDoContexto = useMemo(() => cartoes.filter((c) => c.contexto === contexto), [cartoes, contexto]);
  const categoriasDoTipo = useMemo(
    () => categorias.filter((c) => tipo === "transferencia" || c.tipo === tipo),
    [categorias, tipo]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (tipo !== "transferencia" && fonte === "conta" && !contaId) {
      setError("Selecione a conta.");
      return;
    }
    if (tipo !== "transferencia" && fonte === "cartao" && !cartaoId) {
      setError("Selecione o cartão.");
      return;
    }
    if (tipo === "transferencia" && (!contaId || !contaDestinoId)) {
      setError("Selecione a conta de origem e a de destino.");
      return;
    }

    setLoading(true);
    const payload = {
      tipo,
      descricao,
      valor: Number(valor) || 0,
      categoriaId: tipo === "transferencia" ? null : categoriaId || null,
      contexto,
      contaId: tipo === "transferencia" ? contaId : fonte === "conta" ? contaId : null,
      contaDestinoId: tipo === "transferencia" ? contaDestinoId : null,
      cartaoId: tipo === "transferencia" ? null : fonte === "cartao" ? cartaoId : null,
      recorrente,
      recorrenciaIntervalo: recorrente ? recorrenciaIntervalo : null,
      dataVencimento,
      jaPaga,
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
          <h3 className="text-base font-semibold">{editando ? "Editar Transação" : "Nova Transação"}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label="Fechar">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo — pílulas, é o campo que mais muda o resto do formulário */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Tipo *</label>
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
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Descrição *</label>
            <Input
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={tipo === "transferencia" ? "Ex: Transferência para reserva" : "Ex: Assinatura Adobe CC"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Valor (R$) *</label>
              <Input required type="number" min="0.01" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Contexto *</label>
              <Select
                value={contexto}
                onChange={(e) => {
                  setContexto(e.target.value as FinContexto);
                  setContaId("");
                  setContaDestinoId("");
                  setCartaoId("");
                }}
              >
                <option value="profissional">Profissional</option>
                <option value="pessoal">Pessoal</option>
              </Select>
            </div>
          </div>

          {tipo !== "transferencia" && (
            <>
              {tipo === "despesa" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Pagar com *</label>
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
                        {opcao === "conta" ? "Conta" : "Cartão de Crédito"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {fonte === "conta" ? (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Conta *</label>
                  {contasDoContexto.length === 0 ? (
                    <p className="text-xs text-ink-muted">Nenhuma conta {contexto} cadastrada ainda.</p>
                  ) : (
                    <Select required value={contaId} onChange={(e) => setContaId(e.target.value)}>
                      <option value="">Selecione...</option>
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
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Cartão *</label>
                  {cartoesDoContexto.length === 0 ? (
                    <p className="text-xs text-ink-muted">Nenhum cartão {contexto} cadastrado ainda.</p>
                  ) : (
                    <Select required value={cartaoId} onChange={(e) => setCartaoId(e.target.value)}>
                      <option value="">Selecione...</option>
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
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Categoria</label>
                <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                  <option value="">Sem categoria</option>
                  {categoriasDoTipo.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}

          {tipo === "transferencia" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Conta de Origem *</label>
                <Select required value={contaId} onChange={(e) => setContaId(e.target.value)}>
                  <option value="">Selecione...</option>
                  {contasDoContexto.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.nome}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Conta de Destino *</label>
                <Select required value={contaDestinoId} onChange={(e) => setContaDestinoId(e.target.value)}>
                  <option value="">Selecione...</option>
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
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Data de Vencimento *</label>
              <Input required type="date" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
                <input
                  type="checkbox"
                  checked={jaPaga}
                  onChange={(e) => setJaPaga(e.target.checked)}
                  className="h-4 w-4 rounded border-base-600 bg-base-900 accent-white"
                />
                Já paga / efetivada
              </label>
            </div>
          </div>

          {tipo !== "transferencia" && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
                <input
                  type="checkbox"
                  checked={recorrente}
                  onChange={(e) => setRecorrente(e.target.checked)}
                  className="h-4 w-4 rounded border-base-600 bg-base-900 accent-white"
                />
                Transação recorrente
              </label>
              {recorrente && (
                <Select value={recorrenciaIntervalo} onChange={(e) => setRecorrenciaIntervalo(e.target.value as FinRecorrencia)}>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                </Select>
              )}
            </div>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : editando ? "Salvar Alterações" : "Lançar Transação"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
