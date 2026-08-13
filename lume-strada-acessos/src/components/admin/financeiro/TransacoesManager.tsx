"use client";

import { useMemo, useState, useTransition } from "react";
import type { CartaoComLimite, CategoriaRow, ContaComSaldo, StatusTransacao, TransacaoComRelacoes } from "@/lib/types/financeiro";
import { marcarPago, removerTransacao } from "@/app/admin/financeiro/actions";
import { calcularStatusTransacao } from "@/lib/types/financeiro";
import { STATUS_TRANSACAO_META } from "@/lib/utils/financeiro";
import { fmtBRL } from "@/lib/utils/format";
import { fmtData } from "@/lib/utils/status";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { IconArrowRightLeft, IconPlus } from "@/components/ui/icons";
import { TransacaoModal } from "@/components/admin/financeiro/TransacaoModal";

interface TransacoesManagerProps {
  transacoes: TransacaoComRelacoes[];
  contas: ContaComSaldo[];
  cartoes: CartaoComLimite[];
  categorias: CategoriaRow[];
  contexto: "todos" | "pessoal" | "profissional";
}

const TODOS = "todos";

export function TransacoesManager({ transacoes, contas, cartoes, categorias, contexto }: TransacoesManagerProps) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>(TODOS);
  const [filtroTipo, setFiltroTipo] = useState<string>(TODOS);
  const [modalAberto, setModalAberto] = useState(false);
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
        const alvo = `${t.descricao} ${t.categoria_nome ?? ""} ${t.conta_nome ?? ""} ${t.cartao_nome ?? ""}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });
  }, [transacoes, filtroStatus, filtroTipo, busca]);

  const vencidas = transacoes.filter((t) => calcularStatusTransacao(t) === "vencida").length;

  function handleTogglePago(t: TransacaoComRelacoes) {
    setError(null);
    startTransition(async () => {
      const result = await marcarPago(t.id, !t.pago);
      if (!result.ok) setError(result.error);
    });
  }

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerTransacao(id);
      if (!result.ok) setError(result.error);
      setConfirmando(null);
    });
  }

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-800 p-5">
        <div>
          <h2 className="text-sm font-semibold">Transações do Mês</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {transacoesFiltradas.length} de {transacoes.length} lançamento(s)
            {vencidas > 0 && (
              <>
                {" "}
                · <span className="font-medium text-danger">{vencidas} vencida(s)</span>
              </>
            )}
          </p>
        </div>
        <Button onClick={() => setModalAberto(true)} disabled={contas.length === 0 && cartoes.length === 0}>
          <IconPlus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-b border-base-800 p-5">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Buscar</label>
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Descrição, categoria, conta..." />
        </div>
        <div className="w-40">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Status</label>
          <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value={TODOS}>Todos</option>
            {(Object.keys(STATUS_TRANSACAO_META) as StatusTransacao[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_TRANSACAO_META[status].label}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Tipo</label>
          <Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value={TODOS}>Todos</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
            <option value="transferencia">Transferência</option>
          </Select>
        </div>
        {(filtroStatus !== TODOS || filtroTipo !== TODOS || busca) && (
          <Button
            variant="ghost"
            className="px-3 py-2 text-xs"
            onClick={() => {
              setBusca("");
              setFiltroStatus(TODOS);
              setFiltroTipo(TODOS);
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {error && <p className="px-5 pt-4 text-sm text-danger">{error}</p>}

      <div className="overflow-x-auto">
        {contas.length === 0 && cartoes.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            Cadastre uma conta ou cartão primeiro para começar a lançar transações.
          </div>
        ) : transacoesFiltradas.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            {transacoes.length === 0 ? "Nenhuma transação lançada nesse mês." : "Nenhuma transação corresponde aos filtros atuais."}
          </div>
        ) : (
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Descrição</th>
                <th className="px-0 py-3 font-medium">Origem</th>
                <th className="px-0 py-3 font-medium">Vencimento</th>
                <th className="px-0 py-3 font-medium">Status</th>
                <th className="px-0 py-3 font-medium text-right">Valor</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
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
                      </p>
                      {t.categoria_nome && <p className="text-xs text-ink-muted">{t.categoria_nome}</p>}
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
                      <span
                        className={
                          t.tipo === "receita"
                            ? "text-sm font-semibold text-status-good"
                            : t.tipo === "despesa"
                              ? "text-sm font-semibold text-ink-primary"
                              : "text-sm font-semibold text-ink-secondary"
                        }
                      >
                        {valorSinal}
                        {fmtBRL(t.valor)}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {confirmando === t.id ? (
                        <div className="flex justify-end gap-2">
                          <span className="text-xs text-ink-secondary">Excluir?</span>
                          <button
                            onClick={() => handleExcluir(t.id)}
                            disabled={pending}
                            className="text-xs font-medium text-danger hover:underline"
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setConfirmando(null)}
                            disabled={pending}
                            className="text-xs text-ink-muted hover:text-ink-primary"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleTogglePago(t)}
                            disabled={pending}
                            className="px-3 py-1.5 text-xs"
                            title="Baixa Inteligente — marca como paga/pendente"
                          >
                            {t.pago ? "Reabrir" : "Dar Baixa"}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => setConfirmando(t.id)}
                            disabled={pending}
                            className="px-3 py-1.5 text-xs"
                          >
                            Excluir
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

      {modalAberto && (
        <TransacaoModal
          contas={contas}
          cartoes={cartoes}
          categorias={categorias}
          contextoInicial={contexto}
          onClose={() => setModalAberto(false)}
        />
      )}
    </Card>
  );
}
