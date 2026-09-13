"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StatusCaptura } from "@/lib/types/eventos";

/**
 * O toque do celular de quem está em campo.
 *
 * Sem sessão e sem RLS — a autorização é o token, exatamente como na leitura
 * (ver `data.ts`). Por isso a validação aqui é feita à mão e na ordem certa:
 *
 *   1. o token existe, está ativo e não venceu;
 *   2. a captura é DESTE evento;
 *   3. e ela é dela ou não tem dono.
 *
 * Sem o passo 2 e 3, um token válido de um evento viraria permissão para
 * marcar qualquer item de qualquer agência — o filtro por token sozinho
 * autentica a PESSOA, não autoriza o ALVO.
 */

export type ResultadoMarcacao = { ok: true } | { ok: false; error: string };

export async function marcarPorToken(
  token: string,
  capturaId: string,
  status: StatusCaptura
): Promise<ResultadoMarcacao> {
  try {
    if (!token || token.length < 16) return { ok: false, error: "LINK_INVALIDO" };

    const admin = createAdminClient();

    const { data: pessoa } = await admin
      .from("ev_equipe")
      .select("id, evento_id, nome, ativo, token_expira_em")
      .eq("token", token)
      .maybeSingle<{ id: string; evento_id: string; nome: string; ativo: boolean; token_expira_em: string | null }>();

    if (!pessoa) return { ok: false, error: "LINK_INVALIDO" };
    if (!pessoa.ativo) return { ok: false, error: "LINK_EXPIRADO" };
    if (pessoa.token_expira_em && new Date(pessoa.token_expira_em).getTime() < Date.now()) {
      return { ok: false, error: "LINK_EXPIRADO" };
    }

    const { data: captura } = await admin
      .from("ev_capturas")
      .select("id, evento_id, responsavel_id, titulo, company_id")
      .eq("id", capturaId)
      .maybeSingle<{ id: string; evento_id: string; responsavel_id: string | null; titulo: string; company_id: string }>();

    if (!captura || captura.evento_id !== pessoa.evento_id) return { ok: false, error: "ITEM_NAO_ENCONTRADO" };
    if (captura.responsavel_id && captura.responsavel_id !== pessoa.id) return { ok: false, error: "ITEM_DE_OUTRA_PESSOA" };

    const agora = new Date().toISOString();

    const { error } = await admin
      .from("ev_capturas")
      .update({
        status,
        // Desmarcar limpa a assinatura: um item de volta para "pendente" não
        // pode continuar dizendo que alguém o captou às 23h12.
        marcado_por: status === "pendente" ? null : pessoa.id,
        marcado_em: status === "pendente" ? null : agora,
      })
      .eq("id", capturaId);

    if (error) return { ok: false, error: error.message };

    // O log do evento. É isto que faz o "captei" valer como registro em vez de
    // um risco numa lista: hora e autor, sempre.
    if (status !== "pendente") {
      await admin.from("ev_ocorrencias").insert({
        company_id: captura.company_id,
        evento_id: pessoa.evento_id,
        tipo: "captura",
        texto: `${captura.titulo} — ${status === "captado" ? "captado" : "não rolou"}`,
        autor_equipe_id: pessoa.id,
      });
    }

    // As duas telas: a do celular e a do painel ao vivo. É o que faz o toque
    // do freela acender na timeline de quem está na base.
    revalidatePath(`/evento/${token}`);
    revalidatePath(`/admin/eventos/${pessoa.evento_id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
