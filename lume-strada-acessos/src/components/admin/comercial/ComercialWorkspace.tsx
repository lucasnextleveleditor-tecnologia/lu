"use client";

import { useState, type ComponentType } from "react";
import type { AnotacaoRow, LeadComRelacoes } from "@/lib/types/comercial";
import type { TipoServicoRow } from "@/lib/types/producao";
import { IconColumns, IconList, IconPlus } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
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
        <Button onClick={() => setModalNovoAberto(true)}>
          <IconPlus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {visao === "kanban" && <LeadKanbanBoard leads={leads} onAbrirLead={setLeadDetalheId} />}
      {visao === "lista" && <ListaLeads leads={leads} onAbrirLead={setLeadDetalheId} />}

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
