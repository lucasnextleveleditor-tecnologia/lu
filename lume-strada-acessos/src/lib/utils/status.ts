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

/**
 * Mesma ideia de `calcularStatus`, só que no nível da EMPRESA (licença),
 * não do usuário individual — ver `companies.status`/`companies.expires_at`
 * em `supabase/multitenant-migration.sql`. Os dois níveis são
 * INDEPENDENTES e ambos precisam estar "ativo" pra alguém entrar: uma
 * empresa suspensa barra todo mundo dela mesmo com perfis individuais
 * "ativo"; um funcionário suspenso continua barrado mesmo com a empresa em
 * dia. Only `admin`/`funcionario`/`cliente` passam por essa checagem —
 * `super_admin` não tem `company_id`, então nunca é afetado por ela (ver
 * `src/middleware.ts`).
 */
export function calcularStatusEmpresa(empresa: { status: "ativo" | "suspenso"; expires_at: string | null }): StatusAcesso {
  if (empresa.status === "suspenso") return "inativo";
  if (empresa.expires_at && new Date(empresa.expires_at).getTime() < Date.now()) {
    return "expirado";
  }
  return "ativo";
}

export function fmtData(iso: string | null): string {
  if (!iso) return "Sem expiração";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function fmtDataHora(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
