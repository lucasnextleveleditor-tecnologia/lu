import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContratoRow, ContratoItemRow } from "@/lib/types/contratos";
import { calcularTotalContrato } from "@/lib/types/contratos";

/**
 * Busca o contrato pelo TOKEN da URL — sempre via Service Role
 * (`createAdminClient`), nunca pelo cliente autenticado normal: esta página
 * não tem login, não existe sessão/RLS pra filtrar por empresa. A única
 * "autorização" aqui é conhecer o token em si (32 bytes aleatórios, mesmo
 * padrão de `orcamentos.token`) — o filtro `.eq("token", token)` é o ÚNICO
 * controle de acesso, feito no código, nunca delegado a uma policy.
 *
 * Efeito colateral intencional: toda visita real promove `enviado` pra
 * `visualizado` (nunca regride um status já `assinado`/`recusado`/
 * `cancelado`) — mesmo princípio de `buscarOrcamentoPublicoPorToken`.
 */
export async function buscarContratoPublicoPorToken(token: string) {
  const admin = createAdminClient();

  const { data: contrato } = await admin.from("contratos").select("*, companies(nome)").eq("token", token).single<ContratoRow & { companies: { nome: string } | null }>();
  if (!contrato) return null;

  const { data: itens } = await admin.from("contratos_itens").select("*").eq("contrato_id", contrato.id).order("ordem").overrideTypes<ContratoItemRow[], { merge: false }>();

  const podeAssinar = contrato.status === "enviado" || contrato.status === "visualizado";

  if (contrato.status === "enviado") {
    await admin.from("contratos").update({ visualizado_em: contrato.visualizado_em ?? new Date().toISOString(), status: "visualizado" }).eq("id", contrato.id);
  }

  return {
    ...contrato,
    empresaNome: contrato.companies?.nome ?? null,
    itens: itens ?? [],
    total: calcularTotalContrato(itens ?? []),
    podeAssinar,
  };
}
