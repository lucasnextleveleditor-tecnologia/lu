/**
 * Onboarding do cliente — o briefing estratégico preenchido quando ele entra.
 *
 * Uma linha por cliente (ver `supabase/cliente-onboarding.sql`), atualizada
 * ao longo do tempo. Não é histórico: quando a marca muda o tom de voz, a
 * linha muda. Ninguém quer ler a versão de dois anos atrás pra saber a cor
 * da marca hoje.
 */

export const OBJETIVOS_ONBOARDING = ["leads", "vendas", "branding", "comunidade", "outro"] as const;
export type ObjetivoOnboarding = (typeof OBJETIVOS_ONBOARDING)[number];

export const CANAIS_COMUNICACAO = ["whatsapp", "slack", "email", "telefone", "teams", "discord", "outro"] as const;
export type CanalComunicacao = (typeof CANAIS_COMUNICACAO)[number];

/** As redes que ganham campo próprio. Outras entram em "ferramentas_observacoes". */
export const REDES_SOCIAIS = ["instagram", "facebook", "tiktok", "youtube", "linkedin"] as const;
export type RedeSocial = (typeof REDES_SOCIAIS)[number];

export const TOTAL_DE_ETAPAS = 5;

export interface OnboardingRow {
  id: string;
  company_id: string;
  cliente_id: string;

  // Etapa 1 — Negócio e Estratégia
  oferta_principal: string | null;
  ticket_medio: number | null;
  proposta_unica_valor: string | null;
  publico_alvo: string | null;
  personas: string | null;
  jornada_vendas: string | null;
  concorrentes: string[];

  // Etapa 2 — Branding e Ativos
  manual_marca_url: string | null;
  manual_marca_path: string | null;
  paleta_cores: string[];
  tom_de_voz: string | null;
  diretrizes_marca: string | null;
  drive_ativos_url: string | null;

  // Etapa 3 — Metas e KPIs
  objetivo_principal: ObjetivoOnboarding | null;
  objetivo_descricao: string | null;
  roas_alvo: number | null;
  cpa_alvo: number | null;
  meta_leads_mes: number | null;
  meta_faturamento_mes: number | null;
  historico_marketing: string | null;

  // Etapa 4 — Acessos e Ferramentas
  meta_ads_id: string | null;
  google_ads_id: string | null;
  ga4_id: string | null;
  pixel_id: string | null;
  /** `{ instagram: "https://...", tiktok: "..." }` — chaves de `REDES_SOCIAIS`. */
  redes_sociais: Partial<Record<RedeSocial, string>>;
  site_url: string | null;
  cms_utilizado: string | null;
  /** ONDE está o acesso e quem administra. Credencial nunca é guardada aqui. */
  cms_observacoes: string | null;
  crm_utilizado: string | null;
  ferramentas_observacoes: string | null;

  // Etapa 5 — Operacional
  decisor_nome: string | null;
  decisor_cargo: string | null;
  decisor_email: string | null;
  /** Só dígitos com DDI — mesmo formato do gerador de link do WhatsApp. */
  aprovador_whatsapp: string | null;
  canal_comunicacao: CanalComunicacao | null;
  observacoes_operacionais: string | null;

  etapa_atual: number;
  concluido_em: string | null;
  criado_por: string | null;
  atualizado_por: string | null;
  created_at: string;
  updated_at: string;
}

/** Só o que o formulário escreve — o resto (id, company_id, datas) é do servidor. */
export type CamposDoOnboarding = Omit<
  OnboardingRow,
  "id" | "company_id" | "cliente_id" | "etapa_atual" | "concluido_em" | "criado_por" | "atualizado_por" | "created_at" | "updated_at"
>;

/**
 * Quais campos cada etapa pode gravar.
 *
 * Não é enfeite de organização: a action usa esta lista pra FILTRAR o que
 * chega do navegador. Sem ela, salvar a etapa 1 poderia carimbar
 * `concluido_em` ou mexer em campo de outra etapa — a RLS impede escrever na
 * empresa errada, mas não impede escrever na COLUNA errada.
 */
export const CAMPOS_POR_ETAPA: Record<number, readonly (keyof CamposDoOnboarding)[]> = {
  1: ["oferta_principal", "ticket_medio", "proposta_unica_valor", "publico_alvo", "personas", "jornada_vendas", "concorrentes"],
  2: ["manual_marca_url", "manual_marca_path", "paleta_cores", "tom_de_voz", "diretrizes_marca", "drive_ativos_url"],
  3: ["objetivo_principal", "objetivo_descricao", "roas_alvo", "cpa_alvo", "meta_leads_mes", "meta_faturamento_mes", "historico_marketing"],
  4: [
    "meta_ads_id", "google_ads_id", "ga4_id", "pixel_id", "redes_sociais",
    "site_url", "cms_utilizado", "cms_observacoes", "crm_utilizado", "ferramentas_observacoes",
  ],
  5: ["decisor_nome", "decisor_cargo", "decisor_email", "aprovador_whatsapp", "canal_comunicacao", "observacoes_operacionais"],
};

/**
 * O mínimo pra dar o briefing por concluído.
 *
 * Curto de propósito. Um checklist longo aqui faria a pessoa escrever
 * qualquer coisa nos campos só pra destravar o botão — e briefing preenchido
 * de qualquer jeito é pior do que briefing vazio, porque parece confiável.
 */
export const CAMPOS_ESSENCIAIS: readonly (keyof CamposDoOnboarding)[] = [
  "oferta_principal",
  "publico_alvo",
  "objetivo_principal",
  "decisor_nome",
  "canal_comunicacao",
];

/** Quantas etapas já têm ao menos um campo preenchido — a barra de progresso da lista. */
export function etapasPreenchidas(row: OnboardingRow | null): number {
  if (!row) return 0;
  let total = 0;
  for (const etapa of Object.keys(CAMPOS_POR_ETAPA)) {
    const campos = CAMPOS_POR_ETAPA[Number(etapa)] ?? [];
    const temAlgo = campos.some((campo) => {
      const valor = row[campo as keyof OnboardingRow];
      if (valor === null || valor === undefined || valor === "") return false;
      if (Array.isArray(valor)) return valor.length > 0;
      if (typeof valor === "object") return Object.keys(valor).length > 0;
      return true;
    });
    if (temAlgo) total++;
  }
  return total;
}

export function faltamEssenciais(row: OnboardingRow | null): (keyof CamposDoOnboarding)[] {
  if (!row) return [...CAMPOS_ESSENCIAIS];
  return CAMPOS_ESSENCIAIS.filter((campo) => {
    const valor = row[campo as keyof OnboardingRow];
    return valor === null || valor === undefined || valor === "";
  });
}
