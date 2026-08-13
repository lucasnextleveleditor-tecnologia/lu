import type { PrioridadeTarefa, StatusAprovacaoVersao, StatusTarefa, SubtarefaRow, TarefaRow } from "@/lib/types/producao";
import type { Tone } from "@/lib/utils/tone";

/** Ordem fixa das colunas do Kanban — a mesma ordem é usada no dropdown de status da Lista/detalhe. */
export const STATUS_TAREFA_ORDEM: StatusTarefa[] = [
  "backlog",
  "a_fazer",
  "em_producao",
  "revisao_interna",
  "preview_cliente",
  "concluida",
];

export const STATUS_TAREFA_META: Record<StatusTarefa, { label: string; tone: Tone }> = {
  backlog: { label: "Backlog", tone: "neutral" },
  a_fazer: { label: "A Fazer", tone: "neutral" },
  em_producao: { label: "Em Produção", tone: "warning" },
  revisao_interna: { label: "Revisão Interna", tone: "warning" },
  preview_cliente: { label: "Preview Cliente", tone: "warning" },
  concluida: { label: "Concluído", tone: "good" },
};

export const PRIORIDADE_TAREFA_ORDEM: PrioridadeTarefa[] = ["baixa", "normal", "alta", "urgente"];

export const PRIORIDADE_TAREFA_META: Record<PrioridadeTarefa, { label: string; tone: Tone }> = {
  baixa: { label: "Baixa", tone: "neutral" },
  normal: { label: "Normal", tone: "neutral" },
  alta: { label: "Alta", tone: "warning" },
  urgente: { label: "Urgente", tone: "critical" },
};

export const STATUS_APROVACAO_META: Record<StatusAprovacaoVersao, { label: string; tone: Tone }> = {
  pendente: { label: "Aguardando Revisão", tone: "warning" },
  aprovado: { label: "Aprovado", tone: "good" },
  alteracao_solicitada: { label: "Alteração Solicitada", tone: "critical" },
};

export function isTarefaAtrasada(tarefa: Pick<TarefaRow, "data_entrega" | "status">): boolean {
  if (!tarefa.data_entrega || tarefa.status === "concluida") return false;
  return tarefa.data_entrega < new Date().toISOString().slice(0, 10);
}

export function calcularProgressoSubtarefas(subtarefas: Pick<SubtarefaRow, "concluida">[]): {
  concluidas: number;
  total: number;
  pct: number;
} {
  const total = subtarefas.length;
  const concluidas = subtarefas.filter((s) => s.concluida).length;
  return { concluidas, total, pct: total > 0 ? concluidas / total : 0 };
}

/** "1.2 MB" / "340 KB" / "820 B" — tamanho de arquivo legível, usado nos cards de versão de entrega. */
export function fmtTamanhoArquivo(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Navegação de mês (visão Calendário) — mesma lógica de `lib/utils/financeiro.ts`
// duplicada aqui de propósito: os módulos são entregues um de cada vez e não
// devem depender de arquivos internos um do outro.
export function addMeses(referencia: Date, delta: number): Date {
  return new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth() + delta, 1));
}

export function fmtMesAno(referencia: Date): string {
  const label = referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function mesParam(referencia: Date): string {
  return `${referencia.getFullYear()}-${String(referencia.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMesParam(param: string | undefined): Date {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [ano, mes] = param.split("-").map(Number);
    return new Date(Date.UTC(ano!, mes! - 1, 1));
  }
  const hoje = new Date();
  return new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1));
}

/** Matriz de semanas (cada dia como ISO yyyy-mm-dd, ou null pra preencher a semana fora do mês) — base da grade do Calendário. */
export function gradeDoMes(referencia: Date): (string | null)[][] {
  const ano = referencia.getUTCFullYear();
  const mes = referencia.getUTCMonth();
  const primeiroDiaSemana = new Date(Date.UTC(ano, mes, 1)).getUTCDay(); // 0 = domingo
  const totalDias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();

  const celulas: (string | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => {
      const dia = i + 1;
      return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    }),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  const semanas: (string | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  return semanas;
}
