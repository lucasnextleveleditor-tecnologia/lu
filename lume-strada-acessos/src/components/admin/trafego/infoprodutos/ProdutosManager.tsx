"use client";

import { useMemo, useState, useTransition } from "react";
import type { ProdutoRow } from "@/lib/types/infoprodutos";
import { alternarAtivoProduto, removerProduto } from "@/app/admin/trafego/infoprodutos-actions";
import { fmtBRL } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProdutoModal } from "@/components/admin/trafego/infoprodutos/ProdutoModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ProdutosManagerProps {
  produtos: ProdutoRow[];
  clienteCadastroId: string;
}

export function ProdutosManager({ produtos, clienteCadastroId }: ProdutosManagerProps) {
  const { dict } = useLocale();
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<ProdutoRow | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const principais = useMemo(() => produtos.filter((p) => p.tipo === "principal"), [produtos]);
  const orderBumps = useMemo(() => produtos.filter((p) => p.tipo === "order_bump"), [produtos]);

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerProduto(id);
      if (!result.ok) setError(result.error);
      setConfirmandoExclusao(null);
    });
  }

  function handleToggleAtivo(produto: ProdutoRow) {
    setError(null);
    startTransition(async () => {
      const result = await alternarAtivoProduto(produto.id, !produto.ativo);
      if (!result.ok) setError(result.error);
    });
  }

  function abrirEdicao(produto: ProdutoRow) {
    setProdutoEditando(produto);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setProdutoEditando(null);
  }

  function Grupo({ titulo, itens }: { titulo: string; itens: ProdutoRow[] }) {
    return (
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{titulo}</p>
        <Card className="overflow-x-auto p-0">
          {itens.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-muted">{dict.trafego.nenhumProdutoCadastrado}</div>
          ) : (
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-6 py-3 font-medium">{dict.trafego.produtoHeader}</th>
                  <th className="px-0 py-3 font-medium">{dict.common.valor}</th>
                  <th className="px-0 py-3 font-medium">{dict.common.status}</th>
                  <th className="px-6 py-3 font-medium text-right">{dict.common.acoes}</th>
                </tr>
              </thead>
              <tbody className="[&>tr>td:first-child]:pl-6 [&>tr>td:last-child]:pr-6">
                {itens.map((produto) => (
                  <tr key={produto.id} className="border-b border-base-800 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-ink-primary">{produto.nome}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm text-ink-secondary">{fmtBRL(produto.valor)}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={produto.ativo ? "good" : "neutral"} label={produto.ativo ? dict.common.ativo : dict.common.inativo} />
                    </td>
                    <td className="py-3 text-right">
                      {confirmandoExclusao === produto.id ? (
                        <div className="flex justify-end gap-2">
                          <span className="text-xs text-ink-secondary">{dict.common.confirmarExclusao}</span>
                          <button
                            onClick={() => handleExcluir(produto.id)}
                            disabled={pending}
                            className="text-xs font-medium text-danger hover:underline"
                          >
                            {dict.common.sim}
                          </button>
                          <button
                            onClick={() => setConfirmandoExclusao(null)}
                            disabled={pending}
                            className="text-xs text-ink-muted hover:text-ink-primary"
                          >
                            {dict.common.nao}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => handleToggleAtivo(produto)} disabled={pending} className="px-3 py-1.5 text-xs">
                            {produto.ativo ? dict.trafego.desativarBotao : dict.trafego.ativarBotao}
                          </Button>
                          <Button variant="ghost" onClick={() => abrirEdicao(produto)} className="px-3 py-1.5 text-xs">
                            {dict.common.editar}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => setConfirmandoExclusao(produto.id)}
                            disabled={pending}
                            className="px-3 py-1.5 text-xs"
                          >
                            {dict.common.excluir}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{dict.trafego.produtosCadastradosContagem.replace("{count}", String(produtos.length))}</p>
        <Button onClick={() => setModalAberto(true)}>+ {dict.trafego.novoProdutoBotao}</Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Grupo titulo={dict.trafego.produtosPrincipaisTitulo} itens={principais} />
      <Grupo titulo={dict.trafego.orderBumpsTitulo} itens={orderBumps} />

      {modalAberto && <ProdutoModal produto={produtoEditando} clienteCadastroId={clienteCadastroId} onClose={fecharModal} />}
    </div>
  );
}
