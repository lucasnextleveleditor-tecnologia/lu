"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { OrcamentoRow, StatusOrcamento } from "@/lib/types/orcamentos";
import { duplicarOrcamento, removerOrcamento } from "@/app/admin/orcamentos/actions";
import { STATUS_ORCAMENTO_TONE } from "@/lib/utils/orcamentos";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { IconPlus, IconCopy } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useRouter } from "next/navigation";

type OrcamentoDaLista = OrcamentoRow & { cliente_nome: string | null; total: number; statusExibicao: StatusOrcamento };

const TODOS = "todos";

export function OrcamentosManager({ orcamentos }: { orcamentos: OrcamentoDaLista[] }) {
  const { dict } = useLocale();
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>(TODOS);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const STATUS_LABEL: Record<StatusOrcamento, string> = {
    rascunho: dict.orcamentos.statusRascunho,
    enviado: dict.orcamentos.statusEnviado,
    visualizado: dict.orcamentos.statusVisualizado,
    aprovado: dict.orcamentos.statusAprovado,
    recusado: dict.orcamentos.statusRecusado,
    expirado: dict.orcamentos.statusExpirado,
  };

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return orcamentos.filter((o) => {
      if (filtroStatus !== TODOS && o.statusExibicao !== filtroStatus) return false;
      if (termo && !`${o.titulo} ${o.nome_destinatario}`.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [orcamentos, filtroStatus, busca]);

  function handleDuplicar(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await duplicarOrcamento(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/admin/orcamentos/${result.id}/editar`);
    });
  }

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerOrcamento(id);
      if (!result.ok) setError(result.error);
      setConfirmando(null);
    });
  }

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-end gap-3 border-b border-base-800 p-5">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.common.buscar}</label>
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={dict.orcamentos.buscarPlaceholder} />
        </div>
        <div className="w-48">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.common.status}</label>
          <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value={TODOS}>{dict.orcamentos.filtroStatusTodos}</option>
            {(Object.keys(STATUS_LABEL) as StatusOrcamento[]).map((s) => (
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
            <p className="text-sm font-medium text-ink-primary">{dict.orcamentos.listaVaziaTitulo}</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-ink-muted">{dict.orcamentos.listaVaziaDescricao}</p>
            <Link href="/admin/orcamentos/novo" className="mt-4 inline-flex">
              <Button className="gap-1.5">
                <IconPlus className="h-4 w-4" />
                {dict.orcamentos.novoOrcamentoBtn}
              </Button>
            </Link>
          </div>
        ) : (
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">{dict.orcamentos.colTitulo}</th>
                <th className="px-0 py-3 font-medium">{dict.orcamentos.colDestinatario}</th>
                <th className="px-0 py-3 font-medium">{dict.orcamentos.colStatus}</th>
                <th className="px-0 py-3 font-medium">{dict.orcamentos.colValidade}</th>
                <th className="px-0 py-3 font-medium text-right">{dict.orcamentos.colTotal}</th>
                <th className="px-5 py-3 font-medium text-right">{dict.common.acoes}</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td:first-child]:pl-5 [&>tr>td:last-child]:pr-5">
              {filtrados.map((o) => (
                <tr key={o.id} className="border-b border-base-800 last:border-0">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/orcamentos/${o.id}`} className="text-sm font-medium text-ink-primary hover:underline">
                      {o.titulo}
                    </Link>
                    {o.cliente_nome && <p className="text-xs text-ink-muted">{o.cliente_nome}</p>}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-ink-secondary">{o.nome_destinatario}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge tone={STATUS_ORCAMENTO_TONE[o.statusExibicao]} label={STATUS_LABEL[o.statusExibicao]} />
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-ink-muted">{o.data_expiracao ? fmtDataCurta(o.data_expiracao) : "—"}</span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-sm font-semibold text-ink-primary">{fmtBRL(o.total)}</span>
                  </td>
                  <td className="py-3 text-right">
                    {confirmando === o.id ? (
                      <div className="flex justify-end gap-2">
                        <span className="text-xs text-ink-secondary">{dict.common.confirmarExclusao}</span>
                        <button onClick={() => handleExcluir(o.id)} disabled={pending} className="text-xs font-medium text-danger hover:underline">
                          {dict.common.sim}
                        </button>
                        <button onClick={() => setConfirmando(null)} disabled={pending} className="text-xs text-ink-muted hover:text-ink-primary">
                          {dict.common.nao}
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/orcamentos/${o.id}/editar`}>
                          <Button variant="ghost" className="px-3 py-1.5 text-xs">
                            {dict.common.editar}
                          </Button>
                        </Link>
                        <Button variant="ghost" onClick={() => handleDuplicar(o.id)} disabled={pending} className="gap-1 px-3 py-1.5 text-xs">
                          <IconCopy className="h-3.5 w-3.5" />
                          {dict.orcamentos.duplicarBtn}
                        </Button>
                        <Button variant="danger" onClick={() => setConfirmando(o.id)} disabled={pending} className="px-3 py-1.5 text-xs">
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
