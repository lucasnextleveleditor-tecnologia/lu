"use client";

import type { FuncionarioRow, TarefaComRelacoes } from "@/lib/types/producao";
import { TarefaCard } from "@/components/admin/producao/TarefaCard";
import { IconClipboardList, IconUsers } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ProducaoPorFuncionarioProps {
  tarefas: TarefaComRelacoes[];
  funcionarios: FuncionarioRow[];
  onAbrirTarefa: (id: string) => void;
}

/**
 * Visão "Por Funcionário" — mesmas tarefas do Kanban/Lista, só que agrupadas
 * em uma coluna por responsável (uma pra cada `FuncionarioRow` ativo, mais
 * "Sem Responsável" pras tarefas sem `responsavel_id`). Só leitura por
 * enquanto — pra mover uma tarefa de responsável, ainda é pelo modal de
 * detalhe (mesmo dropdown "Responsável" que já existe lá); dá pra virar
 * drag-and-drop depois se fizer falta, seguindo o mesmo padrão do
 * `KanbanBoard.tsx`.
 *
 * É a quarta opção do alternador de visão já existente em
 * `ProducaoWorkspace.tsx` — de propósito NÃO um menu novo, só mais um botão
 * ao lado de Kanban/Lista/Calendário.
 */
export function ProducaoPorFuncionario({ tarefas, funcionarios, onAbrirTarefa }: ProducaoPorFuncionarioProps) {
  const { dict } = useLocale();

  const funcionariosAtivos = funcionarios.filter((f) => f.ativo);
  const semResponsavel = tarefas.filter((t) => !t.responsavel_id || !funcionariosAtivos.some((f) => f.id === t.responsavel_id));

  const colunas = [
    ...funcionariosAtivos.map((f) => ({ id: f.id, nome: f.nome, tarefas: tarefas.filter((t) => t.responsavel_id === f.id) })),
    ...(semResponsavel.length > 0 ? [{ id: "__sem_responsavel__", nome: dict.producao.semResponsavelColuna, tarefas: semResponsavel }] : []),
  ];

  function iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/);
    const primeira = partes[0]?.[0] ?? "";
    const ultima = partes.length > 1 ? partes[partes.length - 1]![0] : "";
    return (primeira + ultima).toUpperCase();
  }

  if (colunas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-base-800/70 bg-base-950/50 py-16 text-center">
        <IconUsers className="h-6 w-6 text-ink-muted/60" />
        <p className="text-sm text-ink-muted">{dict.producao.listaVazia}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {colunas.map((coluna) => (
        <div
          key={coluna.id}
          className="flex w-72 shrink-0 flex-col rounded-2xl border border-base-800/70 bg-base-950/50 p-3 backdrop-blur-sm"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-base-600 bg-gradient-to-br from-base-700 to-base-800 text-[9px] font-semibold text-ink-secondary">
                {coluna.id === "__sem_responsavel__" ? "—" : iniciais(coluna.nome)}
              </span>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{coluna.nome}</p>
            </div>
            <span className="rounded-full border border-base-700/60 bg-gradient-to-b from-base-800 to-base-900 px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
              {coluna.tarefas.length}
            </span>
          </div>

          <div className="flex min-h-[80px] flex-1 flex-col gap-2.5">
            {coluna.tarefas.map((tarefa) => (
              <TarefaCard key={tarefa.id} tarefa={tarefa} onClick={() => onAbrirTarefa(tarefa.id)} />
            ))}
            {coluna.tarefas.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-base-900/40 py-8 text-center">
                <IconClipboardList className="h-5 w-5 text-ink-muted/60" />
                <p className="text-xs text-ink-muted">{dict.producao.nenhumaTarefaColuna}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
