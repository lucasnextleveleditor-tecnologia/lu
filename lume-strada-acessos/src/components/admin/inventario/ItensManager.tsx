"use client";

import { useMemo, useState, useTransition } from "react";
import type { CategoriaInventarioRow, ItemInventarioComCategoria } from "@/lib/types/database";
import { removerItem } from "@/app/admin/inventario/actions";
import { STATUS_ITEM_META, STATUS_ITEM_OPCOES, calcularDepreciacao } from "@/lib/utils/inventario";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { fmtData } from "@/lib/utils/status";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ItemModal } from "@/components/admin/inventario/ItemModal";

interface ItensManagerProps {
  itens: ItemInventarioComCategoria[];
  categorias: CategoriaInventarioRow[];
}

const TODOS = "todos";

export function ItensManager({ itens, categorias }: ItensManagerProps) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>(TODOS);
  const [filtroCategoria, setFiltroCategoria] = useState<string>(TODOS);

  const [modalAberto, setModalAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState<ItemInventarioComCategoria | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Filtros rápidos client-side — a lista já veio inteira do servidor, então
  // trocar status/categoria/busca é instantâneo, sem round-trip, ideal pra
  // uma auditoria visual (bater os olhos e alternar filtros rapidamente).
  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return itens.filter((item) => {
      if (filtroStatus !== TODOS && item.status !== filtroStatus) return false;
      if (filtroCategoria !== TODOS && item.categoria_id !== filtroCategoria) return false;
      if (termo) {
        const alvo = `${item.codigo_etiqueta} ${item.nome_item} ${item.responsavel_atual ?? ""} ${item.localizacao ?? ""}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });
  }, [itens, filtroStatus, filtroCategoria, busca]);

  function abrirEdicao(item: ItemInventarioComCategoria) {
    setItemEditando(item);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setItemEditando(null);
  }

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerItem(id);
      if (!result.ok) setError(result.error);
      setConfirmandoExclusao(null);
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {itensFiltrados.length} de {itens.length} item(ns)
        </p>
        <Button onClick={() => setModalAberto(true)} disabled={categorias.length === 0}>
          + Nova Etiqueta
        </Button>
      </div>

      <Card className="mb-4 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Buscar</label>
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Etiqueta, item, responsável ou localização..."
          />
        </div>
        <div className="w-44">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Status</label>
          <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value={TODOS}>Todos os status</option>
            {STATUS_ITEM_OPCOES.map((opcao) => (
              <option key={opcao} value={opcao}>
                {STATUS_ITEM_META[opcao].label}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-52">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Categoria</label>
          <Select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value={TODOS}>Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </Select>
        </div>
        {(filtroStatus !== TODOS || filtroCategoria !== TODOS || busca) && (
          <Button
            variant="ghost"
            className="px-3 py-2 text-xs"
            onClick={() => {
              setBusca("");
              setFiltroStatus(TODOS);
              setFiltroCategoria(TODOS);
            }}
          >
            Limpar filtros
          </Button>
        )}
      </Card>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <Card className="overflow-x-auto p-0">
        {categorias.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            Cadastre uma categoria primeiro para começar a lançar itens de inventário.
          </div>
        ) : itensFiltrados.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            {itens.length === 0 ? "Nenhum item cadastrado ainda." : "Nenhum item corresponde aos filtros atuais."}
          </div>
        ) : (
          <table className="w-full min-w-[1080px] text-left">
            <thead>
              <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-6 py-3 font-medium">Etiqueta</th>
                <th className="px-0 py-3 font-medium">Categoria</th>
                <th className="px-0 py-3 font-medium">Status</th>
                <th className="px-0 py-3 font-medium">Localização</th>
                <th className="px-0 py-3 font-medium">Responsável</th>
                <th className="px-0 py-3 font-medium">Aquisição</th>
                <th className="px-0 py-3 font-medium">Pago / Atual</th>
                <th className="px-0 py-3 font-medium">Depreciação</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td:first-child]:pl-6 [&>tr>td:last-child]:pr-6">
              {itensFiltrados.map((item) => {
                const statusMeta = STATUS_ITEM_META[item.status];
                const depreciacao = calcularDepreciacao(item);
                return (
                  <tr key={item.id} className="border-b border-base-800 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-mono text-xs text-ink-secondary">{item.codigo_etiqueta}</p>
                      <p className="text-sm font-medium text-ink-primary">{item.nome_item}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-ink-secondary">{item.categoria_nome}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={statusMeta.tone} label={statusMeta.label} />
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-ink-secondary">{item.localizacao || "—"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-ink-secondary">{item.responsavel_atual || "—"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-ink-muted">{item.data_aquisicao ? fmtData(item.data_aquisicao) : "—"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      {item.valor_pago != null || item.valor_atual != null ? (
                        <span className="text-xs text-ink-secondary">
                          {item.valor_pago != null ? fmtBRL(item.valor_pago) : "—"} /{" "}
                          {item.valor_atual != null ? fmtBRL(item.valor_atual) : "—"}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {depreciacao ? (
                        <Badge
                          tone={depreciacao.apreciou ? "good" : "neutral"}
                          label={`${depreciacao.apreciou ? "+" : "-"}${fmtBRL(Math.abs(depreciacao.delta))} (${fmtPercent(Math.abs(depreciacao.percentual))})`}
                        />
                      ) : (
                        <span className="text-xs text-ink-muted">Sem dados</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {confirmandoExclusao === item.id ? (
                        <div className="flex justify-end gap-2">
                          <span className="text-xs text-ink-secondary">Excluir?</span>
                          <button
                            onClick={() => handleExcluir(item.id)}
                            disabled={pending}
                            className="text-xs font-medium text-danger hover:underline"
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setConfirmandoExclusao(null)}
                            disabled={pending}
                            className="text-xs text-ink-muted hover:text-ink-primary"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => abrirEdicao(item)} className="px-3 py-1.5 text-xs">
                            Editar
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => setConfirmandoExclusao(item.id)}
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
      </Card>

      {modalAberto && <ItemModal item={itemEditando} categorias={categorias} onClose={fecharModal} />}
    </div>
  );
}
