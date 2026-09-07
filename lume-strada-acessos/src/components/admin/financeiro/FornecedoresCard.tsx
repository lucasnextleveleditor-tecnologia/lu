"use client";

import { useState, useTransition } from "react";
import type { FornecedorRow } from "@/lib/types/financeiro";
import { removerFornecedor } from "@/app/admin/financeiro/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconShoppingBag, IconPencil, IconTrash } from "@/components/ui/icons";
import { NovoFornecedorModal } from "@/components/admin/financeiro/NovoFornecedorModal";
import { EditarFornecedorModal } from "@/components/admin/financeiro/EditarFornecedorModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Cadastro de fornecedores — vive na tela própria `/admin/financeiro/fornecedores`
 * (fora do dashboard principal, ver pedido de "tirar a poluição visual").
 * Cada linha mostra o nome + um resumo dos dados de contato já preenchidos
 * (se houver — todos opcionais, ver `FornecedorRow`); o lápis abre
 * `EditarFornecedorModal` pra completar/editar esses dados a qualquer
 * momento, sem burocracia nenhuma no cadastro rápido (`NovoFornecedorModal`,
 * usado aqui no botão "+ Novo" e também dentro de "Nova Transação") — que
 * continua pedindo só o nome.
 */
export function FornecedoresCard({ fornecedores }: { fornecedores: FornecedorRow[] }) {
  const { dict } = useLocale();
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<FornecedorRow | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerFornecedor(id);
      if (!result.ok) setError(result.error);
      setConfirmando(null);
    });
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconShoppingBag className="h-4 w-4 text-ink-muted" />
          <h2 className="text-sm font-semibold">{dict.financeiro.fornecedoresTitulo}</h2>
        </div>
        <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setModalAberto(true)}>
          {dict.financeiro.btnNovoFornecedor}
        </Button>
      </div>

      {error && <p className="mb-3 text-xs text-danger">{error}</p>}

      {fornecedores.length === 0 ? (
        <p className="rounded-lg border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">
          {dict.financeiro.fornecedoresVazio}
        </p>
      ) : (
        <div className="divide-y divide-base-700/60">
          {fornecedores.map((fornecedor) => {
            const resumo = [fornecedor.responsavel, fornecedor.telefone, fornecedor.email].filter(Boolean).join(" · ");
            return (
              <div key={fornecedor.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                {confirmando === fornecedor.id ? (
                  <div className="flex w-full items-center justify-between gap-1.5 text-xs">
                    <span className="truncate text-ink-primary">{dict.common.confirmarExclusao}</span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <button onClick={() => handleExcluir(fornecedor.id)} disabled={pending} className="font-medium text-danger hover:underline">
                        {dict.common.sim}
                      </button>
                      <button onClick={() => setConfirmando(null)} disabled={pending} className="text-ink-muted hover:text-ink-primary">
                        {dict.common.nao}
                      </button>
                    </span>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setEditando(fornecedor)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-medium text-ink-primary">{fornecedor.nome}</p>
                      {resumo && <p className="truncate text-xs text-ink-muted">{resumo}</p>}
                    </button>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => setEditando(fornecedor)}
                        className="rounded-md p-1.5 text-ink-muted transition hover:text-ink-primary"
                        title={dict.financeiro.editarFornecedorAria}
                        aria-label={dict.financeiro.editarFornecedorAria}
                      >
                        <IconPencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmando(fornecedor.id)}
                        className="rounded-md p-1.5 text-ink-muted transition hover:text-danger"
                        title={dict.financeiro.excluirFornecedorAria}
                        aria-label={dict.financeiro.excluirFornecedorAria}
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalAberto && <NovoFornecedorModal onClose={() => setModalAberto(false)} onCriado={() => setModalAberto(false)} />}
      {editando && <EditarFornecedorModal fornecedor={editando} onClose={() => setEditando(null)} />}
    </Card>
  );
}
