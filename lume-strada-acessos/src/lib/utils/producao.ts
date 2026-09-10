import type { PrioridadeTarefa, StatusAprovacaoVersao, StatusTarefa, SubtarefaRow, TarefaRow } from "@/lib/types/producao";
import type { Tone } from "@/lib/utils/tone";
import { todayISO } from "@/lib/utils/format";

/**
 * Limite de tamanho pra upload de versão de entrega — só um AVISO pro
 * usuário antes de começar o upload (o upload real vai direto do navegador
 * pro Supabase Storage via signed URL, ver `criarUploadAssinadoVersao` em
 * `src/app/admin/producao/actions.ts`). O limite que de fato vale é o
 * `file_size_limit` configurado no bucket "producao" (ver
 * `supabase/correcoes-auditoria.sql`) — se os dois valores um dia
 * divergirem, o Storage recusa e o usuário vê o erro dele, só que depois de
 * esperar o upload inteiro. Mantenha os dois em sincronia.
 */
export const ENTREGA_TAMANHO_MAX_BYTES = 50 * 1024 * 1024; // 50MB

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
  return tarefa.data_entrega < todayISO();
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

export type TipoPreviewLink = "iframe" | "imagem" | "video";

/**
 * Resolve um link de entrega (`prod_entrega_versoes.link_url`) pra uma URL de
 * PREVIEW embutível, quando possível — pra `EntregasSection.tsx` mostrar o
 * material sem precisar clicar/abrir em outra aba. O link original sempre
 * continua visível ao lado, como fallback (ver pedido do usuário: "o link
 * fica ali caso aconteça algum erro") — essa função só decide SE dá pra
 * embutir e COM QUE URL, nunca decide se o iframe efetivamente carrega (um
 * arquivo do Drive fora de "Qualquer pessoa com o link" ainda mostra a tela
 * de permissão do Google dentro do iframe, o que é esperado).
 *
 * Suporta: Google Drive (arquivo avulso e pasta), Google Docs/Sheets/Slides,
 * e qualquer URL que aponte direto pra uma imagem/vídeo (inclusive Dropbox
 * com `?dl=`, trocado por `?raw=1`). Fora isso, devolve `null` — nesse caso
 * a UI mostra só o link, sem tentar embutir domínio arbitrário.
 */
export function resolverPreviewLink(url: string): { tipo: TipoPreviewLink; src: string } | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");

  if (host === "drive.google.com") {
    const arquivo = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (arquivo) return { tipo: "iframe", src: `https://drive.google.com/file/d/${arquivo[1]}/preview` };
    const pasta = u.pathname.match(/\/drive\/folders\/([^/?]+)/);
    if (pasta) return { tipo: "iframe", src: `https://drive.google.com/embeddedfolderview?id=${pasta[1]}#list` };
    const id = u.searchParams.get("id");
    if (id) return { tipo: "iframe", src: `https://drive.google.com/file/d/${id}/preview` };
    return null;
  }

  if (host === "docs.google.com") {
    const m = u.pathname.match(/\/(document|spreadsheets|presentation)\/d\/([^/]+)/);
    if (m) {
      const [, tipoDoc, id] = m;
      const sufixo = tipoDoc === "presentation" ? "embed" : "preview";
      return { tipo: "iframe", src: `https://docs.google.com/${tipoDoc}/d/${id}/${sufixo}` };
    }
    return null;
  }

  if (host === "dropbox.com" && /\.(png|jpe?g|gif|webp)$/i.test(u.pathname)) {
    const raw = new URL(url);
    raw.searchParams.delete("dl");
    raw.searchParams.set("raw", "1");
    return { tipo: "imagem", src: raw.toString() };
  }

  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(u.pathname)) return { tipo: "imagem", src: url };
  if (/\.(mp4|webm|mov)$/i.test(u.pathname)) return { tipo: "video", src: url };

  return null;
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
  // `timeZone: "UTC"` é obrigatório aqui: `referencia` é sempre meia-noite
  // UTC do dia 1º (ver `addMeses`/`parseMesParam`) — sem forçar UTC no
  // formatador, o navegador usa o fuso LOCAL pra decidir o mês, e num fuso
  // atrás de UTC (Brasil, UTC-3) meia-noite UTC do dia 1º já caiu na NOITE
  // do último dia do mês ANTERIOR, então o cabeçalho mostrava sempre um mês
  // pra trás do real (bug reportado: calendário de Produção abrindo em
  // "Julho" com o mês corrente sendo Agosto). Mesmo fix já usado em
  // `components/ui/DatePicker.tsx`.
  const label = referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
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
