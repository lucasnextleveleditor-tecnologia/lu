import type { Tone } from "@/lib/utils/tone";

/**
 * Aviso de tamanho pro criativo do anúncio, ANTES de começar o upload — o
 * upload de verdade vai direto do navegador pro Supabase Storage via signed
 * URL (ver `criarUploadAssinadoCriativo` em
 * `src/app/admin/trafego/infoprodutos-actions.ts`); quem garante o limite
 * de fato é o `file_size_limit` do bucket "infoprodutos" (ver
 * `supabase/correcoes-auditoria.sql`). Mantenha os dois valores em sincronia.
 */
export const CRIATIVO_TAMANHO_MAX_BYTES = 80 * 1024 * 1024; // 80MB — criativo de anúncio pode ser vídeo MP4

// ----------------------------------------------------------------------------
// Semana (segunda a domingo) — a unidade do "Fechamento". Matemática de data
// em UTC (mesmo padrão de `lib/utils/dashboard.ts`) pra nunca escorregar de
// dia por causa de fuso horário.
// ----------------------------------------------------------------------------

/** Segunda-feira da semana que contém `dataISO` (yyyy-mm-dd). */
export function segundaFeiraISO(dataISO: string): string {
  const d = new Date(`${dataISO}T00:00:00Z`);
  const diaDaSemana = d.getUTCDay(); // 0 = domingo, 1 = segunda, ... 6 = sábado
  const diasDesdeSegunda = (diaDaSemana + 6) % 7; // domingo (0) fica a 6 dias da segunda anterior
  d.setUTCDate(d.getUTCDate() - diasDesdeSegunda);
  return d.toISOString().slice(0, 10);
}

/** Domingo (último dia) da semana que começa em `segundaISO`. */
export function domingoISO(segundaISO: string): string {
  const d = new Date(`${segundaISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

/** Quantos dias já se passaram desde `dataISO` até hoje (>=0; negativo nunca acontece pra datas passadas). */
function diasDesde(dataISO: string): number {
  const hoje = new Date();
  const hojeUTC = Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate());
  const alvo = new Date(`${dataISO}T00:00:00Z`).getTime();
  return Math.floor((hojeUTC - alvo) / 86_400_000);
}

// ----------------------------------------------------------------------------
// Grade de calendário mensal — duplicado de propósito de `lib/utils/
// dashboard.ts` (mesma decisão documentada lá: cada módulo é entregue
// separado e não depende de arquivo interno de outro módulo).
// ----------------------------------------------------------------------------
export function addMeses(referencia: Date, delta: number): Date {
  return new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth() + delta, 1));
}

export function fmtMesAno(referencia: Date): string {
  // `timeZone: "UTC"` é obrigatório aqui — ver comentário equivalente em
  // `lib/utils/producao.ts`. Sem isso, num fuso atrás de UTC (Brasil,
  // UTC-3) o cabeçalho de mês fica sempre um mês pra trás do real.
  const label = referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function gradeDoMes(referencia: Date): (string | null)[][] {
  const ano = referencia.getUTCFullYear();
  const mes = referencia.getUTCMonth();
  const primeiroDiaSemana = new Date(Date.UTC(ano, mes, 1)).getUTCDay();
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

// ----------------------------------------------------------------------------
// Receita Bruta — cálculo automático (vendas × valor do produto) no momento
// de criar/editar um card de anúncio. Só o VALOR INICIAL sugerido — depois
// de criado, o campo fica livre pro usuário sobrescrever (ver requisito de
// "Cálculo Automático com Override").
// ----------------------------------------------------------------------------
export function calcularReceitaBruta(
  vendasPrincipal: number,
  valorPrincipal: number,
  vendasOrderBump: number,
  valorOrderBump: number
): number {
  return vendasPrincipal * valorPrincipal + vendasOrderBump * valorOrderBump;
}

// ----------------------------------------------------------------------------
// Status do Período de Garantia — nunca gravado, sempre CALCULADO a partir
// de `semana_fim` + a existência (ou não) de um `FechamentoSemanalRow` —
// mesmo padrão de `calcularStatus`/StatusAcesso em lib/utils/status.ts.
// ----------------------------------------------------------------------------
export type StatusPeriodo = "garantia" | "pronto_fechar" | "fechado";

const JANELA_GARANTIA_DIAS = 7;

export function calcularStatusPeriodo(semanaFim: string, fechado: boolean): StatusPeriodo {
  if (fechado) return "fechado";
  return diasDesde(semanaFim) >= JANELA_GARANTIA_DIAS ? "pronto_fechar" : "garantia";
}

export const STATUS_PERIODO_META: Record<StatusPeriodo, { label: string; tone: Tone }> = {
  garantia: { label: "Em Período de Garantia", tone: "neutral" },
  pronto_fechar: { label: "Pronta para Fechar", tone: "warning" },
  fechado: { label: "Fechada", tone: "good" },
};

// ----------------------------------------------------------------------------
// Meta de Lucro — "Meta Batida" vs "Abaixo da Meta" (mesmo par de rótulos do
// módulo de Tráfego por-cliente, agora medido em LUCRO LÍQUIDO, não
// investimento).
// ----------------------------------------------------------------------------
export function metaBatida(lucro: number, meta: number): boolean {
  return meta > 0 ? lucro >= meta : lucro > 0;
}

export const STATUS_META_LUCRO: Record<"batida" | "abaixo", { label: string; tone: Tone }> = {
  batida: { label: "Meta Batida", tone: "good" },
  abaixo: { label: "Abaixo da Meta", tone: "critical" },
};
