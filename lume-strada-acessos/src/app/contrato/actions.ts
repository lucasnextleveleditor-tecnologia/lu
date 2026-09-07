"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContratoRow } from "@/lib/types/contratos";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Toda ação aqui é chamada SEM LOGIN, a partir da página pública
 * `/contrato/[token]` — o token é a única credencial. Cada função REFAZ a
 * checagem de estado no servidor, mesmo padrão de `app/orcamento/actions.ts`.
 */
async function buscarContratoAtivoPorToken(token: string): Promise<{ ok: true; admin: ReturnType<typeof createAdminClient>; contrato: ContratoRow } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const { data: contrato } = await admin.from("contratos").select("*").eq("token", token).single<ContratoRow>();
  if (!contrato) return { ok: false, error: "Contrato não encontrado." };

  if (contrato.status !== "enviado" && contrato.status !== "visualizado") {
    return { ok: false, error: "Este contrato não está mais disponível pra assinatura." };
  }
  return { ok: true, admin, contrato };
}

/** IP de quem está assinando, pra registro junto com nome/data — melhor esforço: cai pra `null` se o cabeçalho não vier (nunca bloqueia a assinatura por causa disso). */
async function ipDoRequisitante(): Promise<string | null> {
  try {
    const h = await headers();
    const encaminhado = h.get("x-forwarded-for");
    if (encaminhado) return encaminhado.split(",")[0]?.trim() || null;
    return h.get("x-real-ip");
  } catch {
    return null;
  }
}

/** Aceite simples — sem certificado digital: nome informado + data/hora do servidor + IP (melhor esforço) ficam gravados no contrato como registro da assinatura. */
export async function assinarContratoPublico(token: string, nomeAssinante: string): Promise<ActionResult> {
  try {
    if (!nomeAssinante.trim()) return { ok: false, error: "Informe seu nome pra confirmar a assinatura." };

    const contexto = await buscarContratoAtivoPorToken(token);
    if (!contexto.ok) return contexto;
    const { admin, contrato } = contexto;

    const ip = await ipDoRequisitante();
    const { error } = await admin
      .from("contratos")
      .update({ status: "assinado", assinado_em: new Date().toISOString(), assinado_nome: nomeAssinante.trim(), assinado_ip: ip })
      .eq("id", contrato.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/contrato/${token}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function recusarContratoPublico(token: string, motivo: string | null): Promise<ActionResult> {
  try {
    const contexto = await buscarContratoAtivoPorToken(token);
    if (!contexto.ok) return contexto;
    const { admin, contrato } = contexto;

    const { error } = await admin.from("contratos").update({ status: "recusado", recusado_em: new Date().toISOString(), motivo_recusa: motivo?.trim() || null }).eq("id", contrato.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/contrato/${token}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
