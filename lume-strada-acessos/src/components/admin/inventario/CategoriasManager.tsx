"use client";

import { useState, useTransition } from "react";
import type { CategoriaInventarioRow } from "@/lib/types/database";
import { removerCategoria } from "@/app/admin/inventario/actions";
import { fmtDataHora } from "@/lib/utils/status";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CategoriaModal } from "@/components/admin/inventario/CategoriaModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface CategoriasManagerProps {
  categorias: CategoriaInventarioRow[];
  totalItensPorCategoria: Record<string, number>;
}

export function CategoriasManager({ categorias, totalItensPorCategoria }: CategoriasManagerProps) {
  const { dict } = useLocale();
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaInventarioRow | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function abrirEdicao(categoria: CategoriaInventarioRow) {
    setCategoriaEditando(categoria);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setCategoriaEditando(null);
  }

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerCategoria(id);
      if (!result.ok) setError(result.error);
      setConfirmandoExclusao(null);
    });
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-ink-muted">{dict.inventario.categoriasCadastradas.replace("{count}", String(categorias.length))}</p>
        <Button onClick={() => setModalAberto(true)}>{dict.inventario.novaCategoriaBotao}</Button>
      </div>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <Card className="overflow-x-auto p-0">
        {categorias.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">{dict.inventario.nenhumaCategoriaCadastrada}</div>
        ) : (
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-6 py-3 font-medium">{dict.common.categoria}</th>
                <th className="px-0 py-3 font-medium">{dict.inventario.colunaCodigo}</th>
                <th className="px-0 py-3 font-medium">{dict.inventario.colunaItens}</th>
                <th className="px-0 py-3 font-medium">{dict.inventario.colunaCriadaEm}</th>
                <th className="px-6 py-3 font-medium text-right">{dict.common.acoes}</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td:first-child]:pl-6 [&>tr>td:last-child]:pr-6">
              {categorias.map((categoria) => (
                <tr key={categoria.id} className="border-b border-base-800 last:border-0">
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-ink-primary">{categoria.nome}</p>
                    {categoria.descricao && <p className="text-xs text-ink-muted">{categoria.descricao}</p>}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="rounded border border-base-600 px-1.5 py-0.5 font-mono text-xs text-ink-secondary">
                      {categoria.codigo}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-ink-secondary">{totalItensPorCategoria[categoria.id] ?? 0}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-xs text-ink-muted">{fmtDataHora(categoria.created_at)}</p>
                  </td>
                  <td className="py-3 text-right">
                    {confirmandoExclusao === categoria.id ? (
                      <div className="flex justify-end gap-2">
                        <span className="text-xs text-ink-secondary">{dict.common.confirmarExclusao}</span>
                        <button
                          onClick={() => handleExcluir(categoria.id)}
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
                        <Button variant="ghost" onClick={() => abrirEdicao(categoria)} className="px-3 py-1.5 text-xs">
                          {dict.common.editar}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setConfirmandoExclusao(categoria.id)}
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

      {modalAberto && <CategoriaModal categoria={categoriaEditando} onClose={fecharModal} />}
    </div>
  );
}
