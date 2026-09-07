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

/** Gera uma URL absoluta do link público a partir do token — usa `NEXT_PUBLIC_SITE_URL` (mesma variável já usada pro callback de convite, ver `.env.local.example`), com fallback pro host da requisição atual quando ausente. */
export function urlPublicaOrcamento(token: string, origem?: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || origem || "";
  return `${base.replace(/\/$/, "")}/orcamento/${token}`;
}
