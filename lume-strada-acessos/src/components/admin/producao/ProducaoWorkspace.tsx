"use client";

import { useState, type ComponentType } from "react";
import type { ProfileRow } from "@/lib/types/database";
import type { EntregaComVersoes, FuncionarioRow, SubtarefaRow, TarefaComRelacoes, TipoServicoRow } from "@/lib/types/producao";
import { IconCalendar, IconColumns, IconList, IconPlus, IconSettings } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { KanbanBoard } from "@/components/admin/producao/KanbanBoard";
import { ListaTarefas } from "@/components/admin/producao/ListaTarefas";
import { CalendarioTarefas } from "@/components/admin/producao/CalendarioTarefas";
import { TarefaModal } from "@/components/admin/producao/TarefaModal";
import { TarefaDetalheModal } from "@/components/admin/producao/TarefaDetalheModal";
import { ConfiguracaoProducaoModal } from "@/components/admin/producao/ConfiguracaoProducaoModal";

type Visao = "kanban" | "lista" | "calendario";

interface ProducaoWorkspaceProps {
  tarefas: TarefaComRelacoes[];
  subtarefasPorTarefa: Record<string, SubtarefaRow[]>;
  entregasPorTarefa: Record<string, EntregaComVersoes[]>;
  clientes: Pick<ProfileRow, "id" | "email" | "full_name">[];
  funcionarios: FuncionarioRow[];
  tiposServico: TipoServicoRow[];
}

const VISOES: { value: Visao; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: "kanban", label: "Kanban", icon: IconColumns },
  { value: "lista", label: "Lista", icon: IconList },
  { value: "calendario", label: "Calendário", icon: IconCalendar },
];

export function ProducaoWorkspace({
  tarefas,
  subtarefasPorTarefa,
  entregasPorTarefa,
  clientes,
  funcionarios,
  tiposServico,
}: ProducaoWorkspaceProps) {
  const [visao, setVisao] = useState<Visao>("kanban");
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [tarefaDetalheId, setTarefaDetalheId] = useState<string | null>(null);

  const tarefaDetalhe = tarefas.find((t) => t.id === tarefaDetalheId) ?? null;

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
          <Button variant="ghost" onClick={() => setModalConfigAberto(true)} className="px-3 py-2 text-xs" title="Funcionários e Tipos de Serviço">
            <IconSettings className="h-4 w-4" />
          </Button>
          <Button onClick={() => setModalNovaAberto(true)}>
            <IconPlus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {visao === "kanban" && <KanbanBoard tarefas={tarefas} onAbrirTarefa={setTarefaDetalheId} />}
      {visao === "lista" && <ListaTarefas tarefas={tarefas} onAbrirTarefa={setTarefaDetalheId} />}
      {visao === "calendario" && <CalendarioTarefas tarefas={tarefas} onAbrirTarefa={setTarefaDetalheId} />}

      {modalNovaAberto && (
        <TarefaModal
          clientes={clientes}
          funcionarios={funcionarios}
          tiposServico={tiposServico}
          onClose={() => setModalNovaAberto(false)}
        />
      )}

      {modalConfigAberto && (
        <ConfiguracaoProducaoModal funcionarios={funcionarios} tiposServico={tiposServico} onClose={() => setModalConfigAberto(false)} />
      )}

      {tarefaDetalhe && (
        <TarefaDetalheModal
          tarefa={tarefaDetalhe}
          subtarefas={subtarefasPorTarefa[tarefaDetalhe.id] ?? []}
          entregas={entregasPorTarefa[tarefaDetalhe.id] ?? []}
          clientes={clientes}
          funcionarios={funcionarios}
          tiposServico={tiposServico}
          onClose={() => setTarefaDetalheId(null)}
        />
      )}
    </div>
  );
}
