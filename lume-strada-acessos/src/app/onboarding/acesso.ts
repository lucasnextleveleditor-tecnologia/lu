import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CAMPOS_POR_ETAPA,
  TOTAL_DE_ETAPAS,
  faltamEssenciais,
  type CamposDoOnboarding,
  type OnboardingRow,
} from "@/lib/types/onboarding";

/**
 * O briefing preenchido pelo PRÓPRIO CLIENTE, por link, sem login.
 *
 * Mesmo desenho de `/orcamento/[token]` e `/assinar/[token]`: quem responde
 * não tem conta no sistema — é o cliente que acabou de fechar contrato, ou o
 * sócio dele que cuida do marketing. Exigir cadastro antes de responder um
 * briefing mataria o uso, e a resposta escrita pelo cliente vale mais do que
 * a transcrição feita pela agência depois da reunião.
 *
 * Como não há `auth.uid()`, não há RLS que se aplique: tudo aqui roda com
 * Service Role, que ignora RLS por definição. Então a porta é guardada NA
 * APLICAÇÃO, e são quatro trancas, todas conferidas a cada requisição:
 *
 *   1. o token existe (64 caracteres aleatórios — não se adivinha);
 *   2. o link foi de fato ENVIADO (`link_enviado_em`), senão todo briefing
 *      criado nasceria com uma porta pública que ninguém pediu;
 *   3. o prazo não venceu (`token_expira_em`);
 *   4. só os campos daquela etapa são gravados — nunca `concluido_em`,
 *      nunca `token`, nunca `company_id`.
 *
 * A quarta é a que importa mais aqui: sem ela, quem tem o link poderia
 * mandar qualquer coluna da tabela junto com a resposta.
 */

export interface AcessoOnboarding {
  onboarding: OnboardingRow;
  clienteNome: string;
  nomeApp: string;
}

/** Só o que a tela pública precisa — nada de `token`, `company_id` ou ids internos. */
export interface OnboardingPublico {
  onboarding: Omit<OnboardingRow, "token" | "company_id" | "criado_por" | "atualizado_por">;
  clienteNome: string;
}

function expirado(row: Pick<OnboardingRow, "token_expira_em">): boolean {
  if (!row.token_expira_em) return false;
  return new Date(row.token_expira_em).getTime() < Date.now();
}

/**
 * Abre o briefing a partir do token.
 *
 * Devolve `null` para token inexistente, link não enviado E link vencido —
 * os três casos, de propósito, com a MESMA resposta. Diferenciar ("este link
 * venceu" vs "este link não existe") contaria a quem está tentando adivinhar
 * que ele acertou um token válido.
 */
export async function buscarOnboardingPorToken(token: string): Promise<AcessoOnboarding | null> {
  if (!token || token.length < 32) return null;
  const admin = createAdminClient();

  const { data: onboarding } = await admin
    .from("cliente_onboarding")
    .select("*")
    .eq("token", token)
    .maybeSingle<OnboardingRow>();

  if (!onboarding || !onboarding.link_enviado_em || expirado(onboarding)) return null;

  const [clienteRes, empresaRes] = await Promise.all([
    admin.from("clientes").select("nome").eq("id", onboarding.cliente_id).maybeSingle<{ nome: string }>(),
    admin.from("companies").select("nome_app").eq("id", onboarding.company_id).maybeSingle<{ nome_app: string | null }>(),
  ]);

  return {
    onboarding,
    clienteNome: clienteRes.data?.nome ?? "",
    nomeApp: empresaRes.data?.nome_app || "App Gestão",
  };
}

/** O mesmo, já sem os campos que não devem atravessar para o navegador. */
export function paraOPublico(acesso: AcessoOnboarding): OnboardingPublico {
  const { token, company_id, criado_por, atualizado_por, ...resto } = acesso.onboarding;
  void token;
  void company_id;
  void criado_por;
  void atualizado_por;
  return { onboarding: resto, clienteNome: acesso.clienteNome };
}

export type ResultadoPublico = { ok: true } | { ok: false; error: string; faltando?: string[] };

/**
 * Grava uma etapa vinda do link público.
 *
 * O `pick` contra `CAMPOS_POR_ETAPA` é a tranca número 4 — e aqui ela pesa
 * mais do que no lado da equipe, porque do lado de cá quem manda a
 * requisição é alguém de fora, que a gente não conhece e não autenticou.
 */
export async function salvarEtapaPublica(
  token: string,
  etapa: number,
  dados: Partial<CamposDoOnboarding>,
  respondidoPor: string
): Promise<ResultadoPublico> {
  const acesso = await buscarOnboardingPorToken(token);
  if (!acesso) return { ok: false, error: "Link inválido ou expirado." };
  if (acesso.onboarding.concluido_em) return { ok: false, error: "Este formulário já foi enviado." };
  if (!Number.isInteger(etapa) || etapa < 1 || etapa > TOTAL_DE_ETAPAS) {
    return { ok: false, error: "Etapa inválida." };
  }

  const permitidos = CAMPOS_POR_ETAPA[etapa] ?? [];
  const payload: Record<string, unknown> = {};
  for (const campo of permitidos) {
    if (campo in dados) payload[campo] = dados[campo] ?? null;
  }

  payload.etapa_atual = Math.max(acesso.onboarding.etapa_atual ?? 1, etapa);
  if (respondidoPor.trim()) payload.respondido_por_nome = respondidoPor.trim().slice(0, 120);

  const admin = createAdminClient();
  // Filtra pelo TOKEN, não pelo id: o id nunca chega ao navegador, e assim
  // não há como pedir a gravação de um briefing e apontar para outro.
  const { error } = await admin.from("cliente_onboarding").update(payload).eq("token", token);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Fecha o briefing pelo lado do cliente. Mesma conferência de essenciais do lado da equipe. */
export async function concluirPublico(token: string, respondidoPor: string): Promise<ResultadoPublico> {
  const acesso = await buscarOnboardingPorToken(token);
  if (!acesso) return { ok: false, error: "Link inválido ou expirado." };
  if (acesso.onboarding.concluido_em) return { ok: false, error: "Este formulário já foi enviado." };

  const faltando = faltamEssenciais(acesso.onboarding);
  if (faltando.length > 0) return { ok: false, error: "", faltando: faltando as string[] };

  const admin = createAdminClient();
  const agora = new Date().toISOString();
  const { error } = await admin
    .from("cliente_onboarding")
    .update({
      concluido_em: agora,
      respondido_em: agora,
      respondido_por_nome: respondidoPor.trim().slice(0, 120) || acesso.onboarding.respondido_por_nome,
    })
    .eq("token", token);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
