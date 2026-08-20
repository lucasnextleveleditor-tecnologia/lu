"use client";

import { useState, type ComponentType } from "react";
import type { ClienteRow } from "@/lib/types/cadastros";
import type { EntregaComVersoes, FuncionarioRow, SubtarefaRow, TarefaComRelacoes, TipoServicoRow } from "@/lib/types/producao";
import { IconCalendar, IconColumns, IconList, IconPlus, IconSettings } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
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
  clientes: ClienteRow[];
  funcionarios: FuncionarioRow[];
  tiposServico: TipoServicoRow[];
}

export function ProducaoWorkspace({
  tarefas,
  subtarefasPorTarefa,
  entregasPorTarefa,
  clientes: clientesIniciais,
  funcionarios,
  tiposServico,
}: ProducaoWorkspaceProps) {
  const { dict } = useLocale();
  // Estado local (não só a prop) pra um cliente criado "na hora" (ver
  // `onClienteCriado` passado pra `TarefaModal`/`TarefaDetalheModal`)
  // aparecer no dropdown imediatamente, sem esperar o Server Component pai
  // re-renderizar (o `revalidatePath` de `criarCliente` já cuida disso na
  // PRÓXIMA navegação, mas essa atualização otimista evita o usuário achar
  // que o cliente "sumiu" até lá).
  const [clientes, setClientes] = useState(clientesIniciais);
  function handleClienteCriado(novo: Pick<ClienteRow, "id" | "nome" | "cor">) {
    setClientes((atual) => [...atual, { ...novo, documento: null, email: null, telefone: null, nome_responsavel: null, endereco: null, profile_id: null, created_at: "", updated_at: "" }].sort((a, b) => a.nome.localeCompare(b.nome)));
  }
  const VISOES: { value: Visao; label: string; icon: ComponentType<{ className?: string }> }[] = [
    { value: "kanban", label: dict.producao.visaoKanban, icon: IconColumns },
    { value: "lista", label: dict.producao.visaoLista, icon: IconList },
    { value: "calendario", label: dict.producao.visaoCalendario, icon: IconCalendar },
  ];
  const [visao, setVisao] = useState<Visao>("kanban");
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [novaTarefaData, setNovaTarefaData] = useState<string | undefined>(undefined);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [tarefaDetalheId, setTarefaDetalheId] = useState<string | null>(null);

  function abrirNovaTarefa(data?: string) {
    setNovaTarefaData(data);
    setModalNovaAberto(true);
  }

  const tarefaDetalhe = tarefas.find((t) => t.id === tarefaDetalheId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-base-700/70 bg-gradient-to-b from-base-900 to-base-950 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
          {VISOES.map((v) => (
            <button
              key={v.value}
              onClick={() => setVisao(v.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                visao === v.value
                  ? "bg-accent text-base-950 shadow-[0_2px_10px_-2px_rgba(255,255,255,0.35)]"
                  : "text-ink-muted hover:text-ink-primary"
              )}
            >
              <v.icon className="h-3.5 w-3.5" />
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setModalConfigAberto(true)} className="px-3 py-2 text-xs" title={dict.producao.configuracaoBotaoTitle}>
            <IconSettings className="h-4 w-4" />
          </Button>
          <Button onClick={() => abrirNovaTarefa()} className="shadow-[0_0_18px_-4px_rgba(255,255,255,0.35)]">
            <IconPlus className="h-4 w-4" />
            {dict.producao.novaTarefa}
          </Button>
        </div>
      </div>

      {visao === "kanban" && <KanbanBoard tarefas={tarefas} onAbrirTarefa={setTarefaDetalheId} />}
      {visao === "lista" && <ListaTarefas tarefas={tarefas} onAbrirTarefa={setTarefaDetalheId} />}
      {visao === "calendario" && <CalendarioTarefas tarefas={tarefas} onAbrirTarefa={setTarefaDetalheId} onNovaTarefa={abrirNovaTarefa} />}

      {modalNovaAberto && (
        <TarefaModal
          clientes={clientes}
          funcionarios={funcionarios}
          tiposServico={tiposServico}
          dataEntregaInicial={novaTarefaData}
          onClienteCriado={handleClienteCriado}
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
          onClienteCriado={handleClienteCriado}
          onClose={() => setTarefaDetalheId(null)}
        />
      )}
    </div>
  );
}
