import type { ProfileRow } from "@/lib/types/database";
import type { Tone } from "@/lib/utils/tone";

export type StatusAcesso = "ativo" | "inativo" | "expirado";

/**
 * Deriva o status visual de um usuário a partir de dois campos independentes:
 *  - `active`     -> suspensão MANUAL feita pelo admin (botão Suspender/Reativar)
 *  - `expires_at` -> data de expiração automática (comparada com "agora")
 *
 * Regra de precedência: suspensão manual sempre vence — um admin pode
 * suspender alguém mesmo que a data de expiração ainda esteja no futuro.
 * Nunca gravamos "status" como coluna: ele é sempre CALCULADO a partir
 * desses dois campos, então nunca fica dessincronizado.
 */
export function calcularStatus(profile: Pick<ProfileRow, "active" | "expires_at">): StatusAcesso {
  if (!profile.active) return "inativo";
  if (profile.expires_at && new Date(profile.expires_at).getTime() < Date.now()) {
    return "expirado";
  }
  return "ativo";
}

// Mapeamento pro tone fixo (ver lib/utils/tone.ts): ativo é "bom", expirado é
// "crítico" (precisa de ação — renovar), inativo é "neutro" — foi uma decisão
// deliberada do admin (suspensão manual), não uma severidade de dado, então
// não usa a escala good/warning/critical.
export const STATUS_META: Record<StatusAcesso, { label: string; tone: Tone }> = {
  ativo: { label: "Ativo", tone: "good" },
  inativo: { label: "Inativo", tone: "neutral" },
  expirado: { label: "Expirado", tone: "critical" },
};

export function temAcessoLiberado(profile: Pick<ProfileRow, "active" | "expires_at">): boolean {
  return calcularStatus(profile) === "ativo";
}

export function fmtData(iso: string | null): string {
  if (!iso) return "Sem expiração";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function fmtDataHora(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
