"use client";

import { useMemo, useState, useTransition } from "react";
import type {
  CartaoComLimite,
  CategoriaRow,
  ContaComSaldo,
  FornecedorRow,
  StatusTransacao,
  TransacaoComRelacoes,
} from "@/lib/types/financeiro";
import { marcarPago, removerTransacao, removerTransacaoComEscopo, type EscopoExclusaoRecorrencia } from "@/app/admin/financeiro/actions";
import { calcularStatusTransacao } from "@/lib/types/financeiro";
import { STATUS_TRANSACAO_META } from "@/lib/utils/financeiro";
import { fmtBRL, fmtMoedaEstrangeira } from "@/lib/utils/format";
import { fmtData } from "@/lib/utils/status";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { IconArrowRightLeft, IconPlus } from "@/components/ui/icons";
import { TransacaoModal } from "@/components/admin/financeiro/TransacaoModal";
import { DarBaixaModal } from "@/components/admin/financeiro/DarBaixaModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface TransacoesManagerProps {
  transacoes: TransacaoComRelacoes[];
  contas: ContaComSaldo[];
  cartoes: CartaoComLimite[];
  categorias: CategoriaRow[];
  fornecedores: FornecedorRow[];
  contexto: "todos" | "pessoal" | "profissional";
  /** Presente nas telas de detalhe de Receitas/Despesas (`/admin/financeiro/receitas|despesas`) — trava o filtro nesse tipo (esconde o seletor de Tipo, já que a lista inteira é só daquele tipo) e pré-seleciona o mesmo tipo ao lançar uma transação nova. */
  tipoFixo?: "receita" | "despesa";
}

const TODOS = "todos";

export function TransacoesManager({ transacoes, contas, cartoes, categorias, fornecedores, contexto, tipoFixo }: TransacoesManagerProps) {
  const { dict } = useLocale();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>(TODOS);
  const [filtroTipo, setFiltroTipo] = useState<string>(tipoFixo ?? TODOS);
  const [modalAberto, setModalAberto] = useState(false);
  const [transacaoEditando, setTransacaoEditando] = useState<TransacaoComRelacoes | null>(null);
  const [dandoBaixa, setDandoBaixa] = useState<TransacaoComRelacoes | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const transacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return transacoes.filter((t) => {
      const status = calcularStatusTransacao(t);
      if (filtroStatus !== TODOS && status !== filtroStatus) return false;
      if (filtroTipo !== TODOS && t.tipo !== filtroTipo) return false;
      if (termo) {
        const alvo = `${t.descricao} ${t.fornecedor_nome ?? ""} ${t.categoria_nome ?? ""} ${t.conta_nome ?? ""} ${t.cartao_nome ?? ""}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });
  }, [transacoes, filtroStatus, filtroTipo, busca]);

  const vencidas = transacoes.filter((t) => calcularStatusTransacao(t) === "vencida").length;

  /**
   * Dar Baixa numa despesa/receita paga com "Conta" que ainda não tem
   * `conta_id` (nunca lançou "Já paga", nem foi editada com conta desde
   * então) — pergunta a conta agora, ao invés de já ter perguntado lá na
   * criação (ver `DarBaixaModal`/pedido do dono da conta). Cartão,
   * transferência ou qualquer transação que já tenha conta vinculada
   * continuam dando baixa/reabrindo na hora, sem perguntar nada.
   */
  function handleTogglePago(t: TransacaoComRelacoes) {
    if (!t.pago && !t.conta_id && !t.cartao_id && t.tipo !== "transferencia") {
      setDandoBaixa(t);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await marcarPago(t.id, !t.pago);
      if (!result.ok) setError(result.error);
    });
  }

  /**
   * Transação avulsa: exclui direto (sem escopo — não há série pra
   * considerar). Transação recorrente (`recorrencia_grupo_id` presente): o
   * admin escolhe o escopo no próprio confirm inline (ver JSX abaixo) —
   * "só esta" / "esta e as futuras" / "esta, as futuras e as anteriores".
   */
  function handleExcluir(t: TransacaoComRelacoes, escopo: EscopoExclusaoRecorrencia) {
    setError(null);
    startTransition(async () => {
      const result = t.recorrencia_grupo_id ? await removerTransacaoComEscopo(t.id, escopo) : await removerTransacao(t.id);
      if (!result.ok) setError(result.error);
      setConfirmando(null);
    });
  }

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-800 p-5">
        <div>
          <h2 className="text-sm font-semibold">{dict.financeiro.transacoesDoMesTitulo}</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {dict.financeiro.lancamentosContagem
              .replace("{filtradas}", String(transacoesFiltradas.length))
              .replace("{total}", String(transacoes.length))}
            {vencidas > 0 && (
              <>
                {" "}
                ·{" "}
                <span className="font-medium text-danger">
                  {dict.financeiro.vencidasContagem.replace("{vencidas}", String(vencidas))}
                </span>
              </>
            )}
          </p>
        </div>
        <Button onClick={() => setModalAberto(true)} disabled={contas.length === 0 && cartoes.length === 0}>
          <IconPlus className="h-4 w-4" />
          {dict.financeiro.novaTransacaoTitulo}
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-b border-base-800 p-5">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.common.buscar}</label>
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={dict.financeiro.placeholderBusca} />
        </div>
        <div className="w-40">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.common.status}</label>
          <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value={TODOS}>{dict.common.todos}</option>
            {(Object.keys(STATUS_TRANSACAO_META) as StatusTransacao[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_TRANSACAO_META[status].label}
              </option>
            ))}
          </Select>
        </div>
        {!tipoFixo && (
          <div className="w-40">
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.tipoLabel}</label>
            <Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value={TODOS}>{dict.common.todos}</option>
              <option value="receita">{dict.financeiro.receitaLabel}</option>
              <option value="despesa">{dict.financeiro.despesaLabel}</option>
              <option value="transferencia">{dict.financeiro.transferenciaLabel}</option>
            </Select>
          </div>
        )}
        {(filtroStatus !== TODOS || (!tipoFixo && filtroTipo !== TODOS) || busca) && (
          <Button
            variant="ghost"
            className="px-3 py-2 text-xs"
            onClick={() => {
              setBusca("");
              setFiltroStatus(TODOS);
              setFiltroTipo(tipoFixo ?? TODOS);
            }}
          >
            {dict.common.limparFiltros}
          </Button>
        )}
      </div>

      {error && <p className="px-5 pt-4 text-sm text-danger">{error}</p>}

      <div className="overflow-x-auto">
        {contas.length === 0 && cartoes.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            {dict.financeiro.semContaOuCartaoVazio}
          </div>
        ) : transacoesFiltradas.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            {transacoes.length === 0 ? dict.financeiro.semTransacoesMes : dict.financeiro.semTransacoesFiltro}
          </div>
        ) : (
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">{dict.common.descricao}</th>
                <th className="px-0 py-3 font-medium">{dict.financeiro.origemLabel}</th>
                <th className="px-0 py-3 font-medium">{dict.financeiro.vencimentoLabel}</th>
                <th className="px-0 py-3 font-medium">{dict.common.status}</th>
                <th className="px-0 py-3 font-medium text-right">{dict.common.valor}</th>
                <th className="px-5 py-3 font-medium text-right">{dict.common.acoes}</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td:first-child]:pl-5 [&>tr>td:last-child]:pr-5">
              {transacoesFiltradas.map((t) => {
                const status = calcularStatusTransacao(t);
                const statusMeta = STATUS_TRANSACAO_META[status];
                const isTransferencia = t.tipo === "transferencia";
                const valorSinal = t.tipo === "receita" ? "+" : t.tipo === "despesa" ? "-" : "";
                return (
                  <tr key={t.id} className="border-b border-base-800 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-ink-primary">
                        {isTransferencia && <IconArrowRightLeft className="h-3.5 w-3.5 shrink-0 text-ink-muted" />}
                        {t.descricao}
                        {t.parcela_total && t.parcela_total > 1 && (
                          <span className="rounded-full border border-base-600 px-1.5 py-0.5 text-[10px] font-medium text-ink-secondary">
                            {t.parcela_numero}/{t.parcela_total}
                          </span>
                        )}
                      </p>
                      {(() => {
                        const detalhes = [t.fornecedor_nome !== t.descricao ? t.fornecedor_nome : null, t.categoria_nome].filter(
                          Boolean
                        );
                        return (
                          <p className="text-xs text-ink-muted">
                            {detalhes.join(" · ")}
                            {detalhes.length > 0 && t.moeda_original && " · "}
                            {t.moeda_original && t.valor_original !== null && (
                              <>
                                {dict.financeiro.lancadoEmLabel}{" "}
                                <ValorPrivado valor={fmtMoedaEstrangeira(t.valor_original, t.moeda_original)} />
                              </>
                            )}
                          </p>
                        );
                      })()}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-ink-secondary">
                        {isTransferencia ? `${t.conta_nome} → ${t.conta_destino_nome}` : t.cartao_nome || t.conta_nome || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-ink-muted">{fmtData(t.data_vencimento)}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={statusMeta.tone} label={statusMeta.label} />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <ValorPrivado
                        valor={`${valorSinal}${fmtBRL(t.valor)}`}
                        className={
                          t.tipo === "receita"
                            ? "text-sm font-semibold text-status-good"
                            : t.tipo === "despesa"
                              ? "text-sm font-semibold text-ink-primary"
                              : "text-sm font-semibold text-ink-secondary"
                        }
                      />
                    </td>
                    <td className="py-3 text-right">
                      {confirmando === t.id ? (
                        t.recorrencia_grupo_id ? (
                          <div className="flex flex-col items-end gap-1.5 py-1">
                            <span className="text-xs text-ink-secondary">{dict.financeiro.excluirRecorrenciaPergunta}</span>
                            <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                              <button
                                onClick={() => handleExcluir(t, "somente_esta")}
                                disabled={pending}
                                className="text-xs font-medium text-danger hover:underline"
                              >
                                {dict.financeiro.excluirSomenteEstaBtn}
                              </button>
                              <button
                                onClick={() => handleExcluir(t, "esta_e_futuras")}
                                disabled={pending}
                                className="text-xs font-medium text-danger hover:underline"
                              >
                                {dict.financeiro.excluirEstaEFuturasBtn}
                              </button>
                              <button
                                onClick={() => handleExcluir(t, "todas")}
                                disabled={pending}
                                className="text-xs font-medium text-danger hover:underline"
                              >
                                {dict.financeiro.excluirTodasDaSerieBtn}
                              </button>
                              <button
                                onClick={() => setConfirmando(null)}
                                disabled={pending}
                                className="text-xs text-ink-muted hover:text-ink-primary"
                              >
                                {dict.common.cancelar}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <span className="text-xs text-ink-secondary">{dict.common.confirmarExclusao}</span>
                            <button
                              onClick={() => handleExcluir(t, "somente_esta")}
                              disabled={pending}
                              className="text-xs font-medium text-danger hover:underline"
                            >
                              {dict.common.sim}
                            </button>
                            <button
                              onClick={() => setConfirmando(null)}
                              disabled={pending}
                              className="text-xs text-ink-muted hover:text-ink-primary"
                            >
                              {dict.common.nao}
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => setTransacaoEditando(t)}
                            disabled={pending}
                            className="px-3 py-1.5 text-xs"
                          >
                            {dict.common.editar}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleTogglePago(t)}
                            disabled={pending}
                            className="px-3 py-1.5 text-xs"
                            title={dict.financeiro.baixaInteligenteTitle}
                          >
                            {t.pago ? dict.financeiro.reabrirBtn : dict.financeiro.darBaixaBtn}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => setConfirmando(t.id)}
                            disabled={pending}
                            className="px-3 py-1.5 text-xs"
                          >
                            {dict.common.excluir}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {(modalAberto || transacaoEditando) && (
        <TransacaoModal
          contas={contas}
          cartoes={cartoes}
          categorias={categorias}
          fornecedores={fornecedores}
          contextoInicial={contexto}
          transacaoParaEditar={transacaoEditando}
          tipoInicial={tipoFixo}
          onClose={() => {
            setModalAberto(false);
            setTransacaoEditando(null);
          }}
        />
      )}

      {dandoBaixa && (
        <DarBaixaModal
          transacao={dandoBaixa}
          contas={contas}
          onConfirmado={() => setDandoBaixa(null)}
          onClose={() => setDandoBaixa(null)}
        />
      )}
    </Card>
  );
}
