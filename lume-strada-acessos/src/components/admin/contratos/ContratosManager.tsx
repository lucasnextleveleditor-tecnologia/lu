"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { ContratoRow, StatusContrato } from "@/lib/types/contratos";
import { removerContrato } from "@/app/admin/contratos/actions";
import { STATUS_CONTRATO_TONE } from "@/lib/utils/contratos";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { IconPlus } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type ContratoDaLista = ContratoRow & { cliente_nome: string | null; orcamento_titulo: string | null; total: number };

const TODOS = "todos";

export function ContratosManager({ contratos }: { contratos: ContratoDaLista[] }) {
  const { dict } = useLocale();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>(TODOS);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const STATUS_LABEL: Record<StatusContrato, string> = {
    rascunho: dict.contratos.statusRascunho,
    enviado: dict.contratos.statusEnviado,
    visualizado: dict.contratos.statusVisualizado,
    assinado: dict.contratos.statusAssinado,
    recusado: dict.contratos.statusRecusado,
    cancelado: dict.contratos.statusCancelado,
  };

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return contratos.filter((c) => {
      if (filtroStatus !== TODOS && c.status !== filtroStatus) return false;
      if (termo && !`${c.titulo} ${c.nome_cliente}`.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [contratos, filtroStatus, busca]);

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerContrato(id);
      if (!result.ok) setError(result.error);
      setConfirmando(null);
    });
  }

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-end gap-3 border-b border-base-800 p-5">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.common.buscar}</label>
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={dict.contratos.buscarPlaceholder} />
        </div>
        <div className="w-48">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.common.status}</label>
          <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value={TODOS}>{dict.contratos.filtroStatusTodos}</option>
            {(Object.keys(STATUS_LABEL) as StatusContrato[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        {(busca || filtroStatus !== TODOS) && (
          <Button
            variant="ghost"
            className="px-3 py-2 text-xs"
            onClick={() => {
              setBusca("");
              setFiltroStatus(TODOS);
            }}
          >
            {dict.common.limparFiltros}
          </Button>
        )}
      </div>

      {error && <p className="px-5 pt-4 text-sm text-danger">{error}</p>}

      <div className="overflow-x-auto">
        {filtrados.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-ink-primary">{dict.contratos.listaVaziaTitulo}</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-ink-muted">{dict.contratos.listaVaziaDescricao}</p>
            <Link href="/admin/contratos/novo" className="mt-4 inline-flex">
              <Button className="gap-1.5">
                <IconPlus className="h-4 w-4" />
                {dict.contratos.novoContratoBtn}
              </Button>
            </Link>
          </div>
        ) : (
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">{dict.contratos.colTitulo}</th>
                <th className="px-0 py-3 font-medium">{dict.contratos.colCliente}</th>
                <th className="px-0 py-3 font-medium">{dict.contratos.colOrigem}</th>
                <th className="px-0 py-3 font-medium">{dict.orcamentos.colStatus}</th>
                <th className="px-0 py-3 font-medium text-right">{dict.contratos.colValor}</th>
                <th className="px-5 py-3 font-medium text-right">{dict.common.acoes}</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td:first-child]:pl-5 [&>tr>td:last-child]:pr-5">
              {filtrados.map((c) => (
                <tr key={c.id} className="border-b border-base-800 last:border-0">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/contratos/${c.id}`} className="text-sm font-medium text-ink-primary hover:underline">
                      {c.titulo}
                    </Link>
                    <p className="text-xs text-ink-muted">{fmtDataCurta(c.created_at.slice(0, 10))}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-ink-secondary">
                      {c.cliente_nome ?? c.nome_cliente}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-ink-muted">{c.orcamento_titulo ?? dict.contratos.origemAvulso}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge tone={STATUS_CONTRATO_TONE[c.status]} label={STATUS_LABEL[c.status]} />
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-sm font-semibold text-ink-primary">{fmtBRL(c.total)}</span>
                  </td>
                  <td className="py-3 text-right">
                    {confirmando === c.id ? (
                      <div className="flex justify-end gap-2">
                        <span className="text-xs text-ink-secondary">{dict.common.confirmarExclusao}</span>
                        <button onClick={() => handleExcluir(c.id)} disabled={pending} className="text-xs font-medium text-danger hover:underline">
                          {dict.common.sim}
                        </button>
                        <button onClick={() => setConfirmando(null)} disabled={pending} className="text-xs text-ink-muted hover:text-ink-primary">
                          {dict.common.nao}
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/contratos/${c.id}/editar`}>
                          <Button variant="ghost" className="px-3 py-1.5 text-xs">
                            {dict.common.editar}
                          </Button>
                        </Link>
                        <Button variant="danger" onClick={() => setConfirmando(c.id)} disabled={pending} className="px-3 py-1.5 text-xs">
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
      </div>
    </Card>
  );
}
