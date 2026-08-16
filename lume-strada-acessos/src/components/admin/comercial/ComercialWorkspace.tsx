"use client";

import { useState, type ComponentType } from "react";
import type { AnotacaoRow, LeadComRelacoes } from "@/lib/types/comercial";
import type { TipoServicoRow } from "@/lib/types/producao";
import { IconColumns, IconList, IconPlus } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import { cn } from "@/lib/utils/cn";
import { STATUS_LEAD_META } from "@/lib/utils/comercial";
import { LeadKanbanBoard } from "@/components/admin/comercial/LeadKanbanBoard";
import { ListaLeads } from "@/components/admin/comercial/ListaLeads";
import { LeadModal } from "@/components/admin/comercial/LeadModal";
import { LeadDetalheModal } from "@/components/admin/comercial/LeadDetalheModal";

type Visao = "kanban" | "lista";

interface ComercialWorkspaceProps {
  leads: LeadComRelacoes[];
  anotacoesPorLead: Record<string, AnotacaoRow[]>;
  tiposServico: TipoServicoRow[];
}

const VISOES: { value: Visao; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: "kanban", label: "Funil", icon: IconColumns },
  { value: "lista", label: "Lista", icon: IconList },
];

export function ComercialWorkspace({ leads, anotacoesPorLead, tiposServico }: ComercialWorkspaceProps) {
  const [visao, setVisao] = useState<Visao>("kanban");
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [leadDetalheId, setLeadDetalheId] = useState<string | null>(null);

  const leadDetalhe = leads.find((l) => l.id === leadDetalheId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-base-700 bg-base-900/60 p-1">
          {VISOES.map((v) => (
            <button
              key={v.value}
              onClick={() => setVisao(v.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                visao === v.value ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
              )}
            >
              <v.icon className="h-3.5 w-3.5" />
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ExportMenuButton
            targetId="comercial-export-area"
            nomeArquivo="comercial-leads"
            dadosCSV={leads.map((l) => ({
              nome: l.nome,
              status: STATUS_LEAD_META[l.status].label,
              origem: l.origem ?? "",
              valorEstimado: (l.valor_estimado ?? 0).toFixed(2),
              proximoContato: l.proximo_contato_em ?? "",
              criadoEm: l.created_at.slice(0, 10),
            }))}
            colunasCSV={[
              { chave: "nome", rotulo: "Nome" },
              { chave: "status", rotulo: "Etapa do Funil" },
              { chave: "origem", rotulo: "Origem" },
              { chave: "valorEstimado", rotulo: "Valor Estimado (R$)" },
              { chave: "proximoContato", rotulo: "Próximo Contato" },
              { chave: "criadoEm", rotulo: "Criado em" },
            ]}
          />
          <Button onClick={() => setModalNovoAberto(true)}>
            <IconPlus className="h-4 w-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      <div id="comercial-export-area">
        {visao === "kanban" && <LeadKanbanBoard leads={leads} onAbrirLead={setLeadDetalheId} />}
        {visao === "lista" && <ListaLeads leads={leads} onAbrirLead={setLeadDetalheId} />}
      </div>

      {modalNovoAberto && <LeadModal tiposServico={tiposServico} onClose={() => setModalNovoAberto(false)} />}

      {leadDetalhe && (
        <LeadDetalheModal
          lead={leadDetalhe}
          anotacoes={anotacoesPorLead[leadDetalhe.id] ?? []}
          tiposServico={tiposServico}
          onClose={() => setLeadDetalheId(null)}
        />
      )}
    </div>
  );
}
