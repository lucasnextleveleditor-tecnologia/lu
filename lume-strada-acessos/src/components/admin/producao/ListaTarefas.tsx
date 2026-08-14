"use client";

import { useMemo, useState } from "react";
import type { TarefaComRelacoes } from "@/lib/types/producao";
import { PRIORIDADE_TAREFA_META, STATUS_TAREFA_META, STATUS_TAREFA_ORDEM, isTarefaAtrasada } from "@/lib/utils/producao";
import { fmtData } from "@/lib/utils/status";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PillTag } from "@/components/admin/producao/PillTag";
import { IconClipboardList } from "@/components/ui/icons";

interface ListaTarefasProps {
  tarefas: TarefaComRelacoes[];
  onAbrirTarefa: (id: string) => void;
}

const TODOS = "todos";
type CampoOrdenacao = "data_entrega" | "responsavel_nome";

export function ListaTarefas({ tarefas, onAbrirTarefa }: ListaTarefasProps) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>(TODOS);
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>(TODOS);
  const [ordenarPor, setOrdenarPor] = useState<CampoOrdenacao>("data_entrega");
  const [ordemAsc, setOrdemAsc] = useState(true);

  function alternarOrdenacao(campo: CampoOrdenacao) {
    if (ordenarPor === campo) setOrdemAsc((v) => !v);
    else {
      setOrdenarPor(campo);
      setOrdemAsc(true);
    }
  }

  const tarefasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtradas = tarefas.filter((t) => {
      if (filtroStatus !== TODOS && t.status !== filtroStatus) return false;
      if (filtroPrioridade !== TODOS && t.prioridade !== filtroPrioridade) return false;
      if (termo) {
        const alvo = `${t.titulo} ${t.cliente_nome ?? ""} ${t.responsavel_nome ?? ""} ${t.tipo_servico_nome ?? ""}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });

    const ordenadas = [...filtradas].sort((a, b) => {
      const va = a[ordenarPor] ?? "";
      const vb = b[ordenarPor] ?? "";
      if (va === vb) return 0;
      const cmp = va < vb ? -1 : 1;
      return ordemAsc ? cmp : -cmp;
    });

    return ordenadas;
  }, [tarefas, filtroStatus, filtroPrioridade, busca, ordenarPor, ordemAsc]);

  return (
    // Sombra de elevação num wrapper FORA do `Card`: o `Card` compartilhado
    // já tem seu próprio `shadow-[...]` de reflexo interno — duas classes
    // `shadow-[...]` no MESMO elemento não somam, só uma vence.
    <div className="rounded-2xl shadow-[0_24px_60px_-36px_rgba(0,0,0,0.7)]">
    <Card className="overflow-hidden bg-gradient-to-b from-base-800/30 to-transparent p-0">
      <div className="flex flex-wrap items-end gap-3 border-b border-base-800/70 bg-gradient-to-b from-base-800/30 to-transparent p-5">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Buscar</label>
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Título, cliente, responsável..." />
        </div>
        <div className="w-44">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Status</label>
          <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value={TODOS}>Todos</option>
            {STATUS_TAREFA_ORDEM.map((status) => (
              <option key={status} value={status}>
                {STATUS_TAREFA_META[status].label}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-36">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Prioridade</label>
          <Select value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)}>
            <option value={TODOS}>Todas</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="normal">Normal</option>
            <option value="baixa">Baixa</option>
          </Select>
        </div>
        {(filtroStatus !== TODOS || filtroPrioridade !== TODOS || busca) && (
          <Button
            variant="ghost"
            className="px-3 py-2 text-xs"
            onClick={() => {
              setBusca("");
              setFiltroStatus(TODOS);
              setFiltroPrioridade(TODOS);
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        {tarefasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-14 text-center">
            <IconClipboardList className="h-6 w-6 text-ink-muted/60" />
            <p className="text-sm text-ink-muted">
              {tarefas.length === 0 ? "Nenhuma tarefa cadastrada ainda." : "Nenhuma tarefa corresponde aos filtros atuais."}
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-base-800/70 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Tarefa</th>
                <th className="px-0 py-3 font-medium">Cliente</th>
                <th className="px-0 py-3 font-medium">
                  <button onClick={() => alternarOrdenacao("responsavel_nome")} className="flex items-center gap-1 hover:text-ink-primary">
                    Responsável {ordenarPor === "responsavel_nome" && (ordemAsc ? "↑" : "↓")}
                  </button>
                </th>
                <th className="px-0 py-3 font-medium">
                  <button onClick={() => alternarOrdenacao("data_entrega")} className="flex items-center gap-1 hover:text-ink-primary">
                    Prazo {ordenarPor === "data_entrega" && (ordemAsc ? "↑" : "↓")}
                  </button>
                </th>
                <th className="px-0 py-3 font-medium">Prioridade</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td:first-child]:pl-5 [&>tr>td:last-child]:pr-5">
              {tarefasFiltradas.map((t) => {
                const statusMeta = STATUS_TAREFA_META[t.status];
                const prioridadeMeta = PRIORIDADE_TAREFA_META[t.prioridade];
                const atrasada = isTarefaAtrasada(t);
                return (
                  <tr
                    key={t.id}
                    onClick={() => onAbrirTarefa(t.id)}
                    className="cursor-pointer border-b border-base-800/70 transition-colors duration-200 last:border-0 hover:bg-gradient-to-r hover:from-base-800/50 hover:via-base-800/15 hover:to-transparent"
                  >
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-ink-primary">{t.titulo}</p>
                      {t.tipo_servico_nome && <p className="text-xs text-ink-muted">{t.tipo_servico_nome}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-ink-secondary">{t.cliente_nome || "—"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-ink-secondary">{t.responsavel_nome || "—"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={atrasada ? "text-xs font-semibold text-danger" : "text-xs text-ink-muted"}>
                        {t.data_entrega ? fmtData(t.data_entrega) : "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <PillTag tone={prioridadeMeta.tone} label={prioridadeMeta.label} />
                    </td>
                    <td className="py-3 text-right">
                      <PillTag tone={statusMeta.tone} label={statusMeta.label} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
    </div>
  );
}
