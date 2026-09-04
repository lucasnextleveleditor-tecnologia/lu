import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { calcularStatusExibicao, calcularTotalOrcamento } from "@/lib/types/orcamentos";
import type { OrcamentoRow, OrcItemRow } from "@/lib/types/orcamentos";

/**
 * Busca o orçamento pelo TOKEN da URL — sempre via Service Role
 * (`createAdminClient`), nunca pelo cliente autenticado normal: esta página
 * não tem login nenhum, então não existe sessão/RLS pra filtrar por
 * empresa. A única "autorização" aqui é conhecer o token em si (32 bytes
 * aleatórios, ver comentário de segurança em `supabase/orcamentos.sql`) —
 * por isso o filtro `.eq("token", token)` é o ÚNICO controle de acesso, e
 * precisa ser feito no código, nunca delegado a uma policy.
 *
 * Efeito colateral intencional: toda visita real (não é chamada de novo em
 * cada interação, só na carga inicial da página) incrementa
 * `visualizacoes_count`/`visualizado_em`, e promove o status de
 * `rascunho`/`enviado` pra `visualizado` — sinaliza pro admin que o cliente
 * abriu a proposta. Nunca regride um status já `aprovado`/`recusado`.
 */
export async function buscarOrcamentoPublicoPorToken(token: string) {
  const admin = createAdminClient();

  const { data: orcamento } = await admin
    .from("orcamentos")
    .select("*, companies(nome)")
    .eq("token", token)
    .single<OrcamentoRow & { companies: { nome: string } | null }>();
  if (!orcamento) return null;

  const { data: itens } = await admin
    .from("orc_itens")
    .select("*")
    .eq("orcamento_id", orcamento.id)
    .order("ordem")
    .overrideTypes<OrcItemRow[], { merge: false }>();

  const statusExibicao = calcularStatusExibicao(orcamento);
  const podeInteragir = statusExibicao === "enviado" || statusExibicao === "visualizado";

  if (podeInteragir) {
    // `podeInteragir` já garante status "enviado" ou "visualizado" aqui —
    // um rascunho nunca chega nesse bloco (ver comentário acima do link
    // público só funcionar depois de `enviarOrcamento`).
    await admin
      .from("orcamentos")
      .update({
        visualizado_em: orcamento.visualizado_em ?? new Date().toISOString(),
        visualizacoes_count: orcamento.visualizacoes_count + 1,
        status: "visualizado",
      })
      .eq("id", orcamento.id);
  }

  const { subtotal, desconto, total } = calcularTotalOrcamento(itens ?? [], orcamento.desconto_tipo, orcamento.desconto_valor);

  return {
    ...orcamento,
    empresaNome: orcamento.companies?.nome ?? null,
    itens: itens ?? [],
    subtotal,
    desconto,
    total,
    statusExibicao,
    podeInteragir,
  };
}
