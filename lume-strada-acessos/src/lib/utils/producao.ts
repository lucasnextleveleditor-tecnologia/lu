import type { PrioridadeTarefa, StatusAprovacaoVersao, StatusTarefa, SubtarefaRow, TarefaRow } from "@/lib/types/producao";
import type { Tone } from "@/lib/utils/tone";
import { todayISO } from "@/lib/utils/format";
import { resolverMidiaDeLink, type TipoPreviewMidia } from "@/lib/utils/midia-link";

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

export type TipoPreviewLink = TipoPreviewMidia;

/**
 * Resolve um link de entrega (`prod_entrega_versoes.link_url`) para uma URL
 * embutível.
 *
 * A lógica em si mora em `lib/utils/midia-link.ts`, compartilhada com o
 * portfólio de orçamentos e com o criativo de anúncio — antes cada um tinha
 * a sua, e só esta aqui sabia de Drive. Manter uma lista só significa que
 * ensinar um serviço novo (YouTube, Vimeo, Loom...) vale para o sistema
 * inteiro de uma vez.
 *
 * O link original continua visível ao lado na tela, como combinado: esta
 * função decide SE dá para embutir e COM QUE URL, nunca promete que o
 * serviço vai deixar carregar.
 */
export function resolverPreviewLink(url: string): { tipo: TipoPreviewLink; src: string } | null {
  const midia = resolverMidiaDeLink(url);
  return midia ? { tipo: midia.tipo, src: midia.src } : null;
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

/** Soma dias a uma data, em UTC — como todo cálculo de data do sistema. */
export function addDias(referencia: Date, delta: number): Date {
  const d = new Date(referencia.getTime());
  d.setUTCDate(d.getUTCDate() + delta);
  return d;
}

/**
 * A SEGUNDA-FEIRA da semana de `referencia`.
 *
 * Semana começando na segunda, e não no domingo como a grade do mês. Não é
 * descuido: a visão semanal existe para olhar a SEMANA DE TRABALHO, e ninguém
 * planeja entrega pensando "domingo é o começo". A grade mensal continua
 * domingo-primeiro porque lá o que se lê é o desenho do mês inteiro, e é assim
 * que todo calendário de parede desenha.
 */
export function inicioDaSemana(referencia: Date): Date {
  const diaDaSemana = referencia.getUTCDay(); // 0 = domingo
  const recuo = diaDaSemana === 0 ? 6 : diaDaSemana - 1;
  const d = addDias(referencia, -recuo);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Os sete dias da semana de `inicio`, como ISO yyyy-mm-dd. */
export function diasDaSemanaDe(inicio: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => addDias(inicio, i).toISOString().slice(0, 10));
}

/**
 * "07 – 13 de set." — o intervalo da semana, no idioma de quem está olhando.
 *
 * `formatRange` do `Intl` faz o trabalho fino sozinho: quando a semana cruza o
 * mês, ele escreve "28 de set. – 4 de out." em vez de repetir o mês; quando
 * cruza o ano, acrescenta o ano. Escrever isso na mão daria três `if` e uma
 * regra diferente por idioma. O `catch` existe porque `formatRange` é recente
 * — num runtime antigo, duas datas coladas por travessão ainda se leem.
 */
export function fmtIntervaloSemana(inicio: Date, fim: Date, locale: string): string {
  const opcoes: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", timeZone: "UTC" };
  try {
    return new Intl.DateTimeFormat(locale, opcoes).formatRange(inicio, fim);
  } catch {
    const f = new Intl.DateTimeFormat(locale, opcoes);
    return `${f.format(inicio)} – ${f.format(fim)}`;
  }
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
