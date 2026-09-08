import type { Tone } from "@/lib/utils/tone";
import type { StatusOrcamento } from "@/lib/types/orcamentos";

/** Só o tone — o rótulo por extenso vem do dicionário (`dict.orcamentos.statusXxx`), pra sair traduzido em pt/en/es. */
export const STATUS_ORCAMENTO_TONE: Record<StatusOrcamento, Tone> = {
  rascunho: "neutral",
  enviado: "neutral",
  visualizado: "warning",
  aprovado: "good",
  recusado: "critical",
  expirado: "critical",
};

/** Ordem das colunas do Funil de Propostas (kanban, `OrcamentoKanbanBoard.tsx`) — mesma ordem já usada no filtro de status da lista (`OrcamentosManager.tsx`). */
export const STATUS_ORCAMENTO_ORDEM: StatusOrcamento[] = ["rascunho", "enviado", "visualizado", "aprovado", "recusado", "expirado"];

/** Gera uma URL absoluta do link público a partir do token — usa `NEXT_PUBLIC_SITE_URL` (mesma variável já usada pro callback de convite, ver `.env.local.example`), com fallback pro host da requisição atual quando ausente. */
export function urlPublicaOrcamento(token: string, origem?: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || origem || "";
  return `${base.replace(/\/$/, "")}/orcamento/${token}`;
}

/**
 * Tags livres (não FK — ver `orc_portfolio_itens.categoria_profissao`) pra
 * filtrar o portfólio por tipo de profissional/agência ao montar um
 * orçamento. Mesma lista dos 7 perfis previstos pra fase seguinte (tipos de
 * orçamento) — cadastrada aqui desde já pra já poder taguear o portfólio
 * enquanto aquela fase ainda não existe.
 */
export const CATEGORIAS_PORTFOLIO = [
  "filmmaker",
  "videomaker",
  "social_media",
  "storymaker",
  "designer",
  "fotografo",
  "agencia_marketing",
] as const;

export type CategoriaProfissaoPortfolio = (typeof CATEGORIAS_PORTFOLIO)[number];
