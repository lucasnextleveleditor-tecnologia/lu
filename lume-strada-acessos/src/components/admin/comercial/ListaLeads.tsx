"use client";

import { useMemo, useState } from "react";
import type { LeadComRelacoes } from "@/lib/types/comercial";
import { ORIGEM_LEAD_META, STATUS_LEAD_META, STATUS_LEAD_ORDEM, isFollowUpAtrasado } from "@/lib/utils/comercial";
import { fmtBRL } from "@/lib/utils/format";
import { fmtData } from "@/lib/utils/status";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface ListaLeadsProps {
  leads: LeadComRelacoes[];
  onAbrirLead: (id: string) => void;
}

const TODOS = "todos";

export function ListaLeads({ leads, onAbrirLead }: ListaLeadsProps) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>(TODOS);

  const leadsFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return leads.filter((l) => {
      if (filtroStatus !== TODOS && l.status !== filtroStatus) return false;
      if (termo) {
        const alvo = `${l.nome} ${l.email ?? ""} ${l.whatsapp ?? ""} ${l.tipo_servico_nome ?? ""}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });
  }, [leads, filtroStatus, busca]);

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-end gap-3 border-b border-base-800 p-5">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Buscar</label>
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, e-mail, WhatsApp, serviço..." />
        </div>
        <div className="w-48">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Status</label>
          <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value={TODOS}>Todos</option>
            {STATUS_LEAD_ORDEM.map((status) => (
              <option key={status} value={status}>
                {STATUS_LEAD_META[status].label}
              </option>
            ))}
          </Select>
        </div>
        {(filtroStatus !== TODOS || busca) && (
          <Button
            variant="ghost"
            className="px-3 py-2 text-xs"
            onClick={() => {
              setBusca("");
              setFiltroStatus(TODOS);
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        {leadsFiltrados.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            {leads.length === 0 ? "Nenhum lead cadastrado ainda." : "Nenhum lead corresponde aos filtros atuais."}
          </div>
        ) : (
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Lead</th>
                <th className="px-0 py-3 font-medium">Origem</th>
                <th className="px-0 py-3 font-medium">Próx. Contato</th>
                <th className="px-0 py-3 font-medium text-right">Valor Estimado</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td:first-child]:pl-5 [&>tr>td:last-child]:pr-5">
              {leadsFiltrados.map((l) => {
                const statusMeta = STATUS_LEAD_META[l.status];
                const atrasado = isFollowUpAtrasado(l);
                return (
                  <tr
                    key={l.id}
                    onClick={() => onAbrirLead(l.id)}
                    className="cursor-pointer border-b border-base-800 last:border-0 hover:bg-base-900/60"
                  >
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-ink-primary">{l.nome}</p>
                      {l.tipo_servico_nome && <p className="text-xs text-ink-muted">{l.tipo_servico_nome}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-ink-secondary">{l.origem ? ORIGEM_LEAD_META[l.origem].label : "—"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={atrasado ? "text-xs font-medium text-danger" : "text-xs text-ink-muted"}>
                        {l.proximo_contato_em ? fmtData(l.proximo_contato_em) : "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="text-xs text-ink-secondary">{l.valor_estimado != null ? fmtBRL(l.valor_estimado) : "—"}</span>
                    </td>
                    <td className="py-3 text-right">
                      <Badge tone={statusMeta.tone} label={statusMeta.label} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
