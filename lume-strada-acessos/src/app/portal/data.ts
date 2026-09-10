import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { calcularStatusExibicao, calcularTotalOrcamento } from "@/lib/types/orcamentos";
import type { OrcamentoRow, OrcItemRow, PortfolioItemRow, PortfolioItemComUrl } from "@/lib/types/orcamentos";
import { calcularTotalContrato } from "@/lib/types/contratos";
import type { ContratoRow, ContratoItemRow } from "@/lib/types/contratos";
import type { PortalClienteData, TimelineEventoPortal } from "@/lib/types/portal";

const BUCKET_ORCAMENTOS_MIDIA = "orcamentos-midia";

/**
 * Busca o Portal do Cliente pelo TOKEN da URL — mesmo modelo de acesso já
 * usado em `app/orcamento/data.ts`/`app/contrato/data.ts`: Service Role
 * (`createAdminClient`), sem sessão/RLS nenhuma, o `.eq("portal_token",
 * token)` é o ÚNICO controle de acesso.
 *
 * Diferente das outras duas, esta rota NÃO tem efeito colateral nenhum
 * (não muda status de nada) — é uma tela agregadora, só leitura.
 */
export async function buscarPortalPorToken(token: string): Promise<PortalClienteData | null> {
  const admin = createAdminClient();

  const { data: cliente } = await admin
    .from("clientes")
    .select("id, nome, email, companies(nome)")
    .eq("portal_token", token)
    .single<{ id: string; nome: string; email: string | null; companies: { nome: string } | null }>();
  if (!cliente) return null;

  const [{ data: orcamentos }, { data: contratos }] = await Promise.all([
    admin.from("orcamentos").select("*").eq("cliente_id", cliente.id).order("created_at", { ascending: false }).overrideTypes<OrcamentoRow[], { merge: false }>(),
    admin.from("contratos").select("*").eq("cliente_id", cliente.id).order("created_at", { ascending: false }).overrideTypes<ContratoRow[], { merge: false }>(),
  ]);

  const orcamentosResolvidos = orcamentos ?? [];
  const contratosResolvidos = contratos ?? [];

  // Total de cada orçamento/contrato — mesmo batch-fetch-e-agrupa-em-memória
  // do portfólio abaixo, pra não fazer 1 query por linha da lista. `.in()`
  // com array vazio é seguro (Postgrest resolve pra "nenhuma linha", nunca
  // erro de sintaxe) — não precisa de branch condicional aqui.
  const [{ data: todosOrcItens }, { data: todosContratoItens }] = await Promise.all([
    admin
      .from("orc_itens")
      .select("*")
      .in(
        "orcamento_id",
        orcamentosResolvidos.map((o) => o.id)
      )
      .overrideTypes<OrcItemRow[], { merge: false }>(),
    admin
      .from("contratos_itens")
      .select("*")
      .in(
        "contrato_id",
        contratosResolvidos.map((c) => c.id)
      )
      .overrideTypes<ContratoItemRow[], { merge: false }>(),
  ]);

  // Portfólio agregado de TODOS os orçamentos do cliente, deduplicado (o
  // mesmo item de portfólio pode ter sido anexado a mais de um orçamento
  // dele ao longo do tempo) — mesmo join de `orcamento/data.ts`, só que
  // fanned-out pra vários `orcamento_id` em vez de um só.
  const { data: portfolioLinks } = await admin
    .from("orc_orcamento_portfolio")
    .select("orcamento_id, ordem, orc_portfolio_itens(*)")
    .in(
      "orcamento_id",
      orcamentosResolvidos.map((o) => o.id)
    )
    .order("ordem")
    .overrideTypes<{ orcamento_id: string; ordem: number; orc_portfolio_itens: PortfolioItemRow | null }[], { merge: false }>();

  const vistos = new Set<string>();
  const portfolio: PortfolioItemComUrl[] = (portfolioLinks ?? [])
    .map((link) => link.orc_portfolio_itens)
    .filter((item): item is PortfolioItemRow => !!item)
    .filter((item) => (vistos.has(item.id) ? false : (vistos.add(item.id), true)))
    .map((item) => ({
      ...item,
      url: item.path ? admin.storage.from(BUCKET_ORCAMENTOS_MIDIA).getPublicUrl(item.path).data.publicUrl : (item.link_url ?? ""),
      ehLink: !item.path && Boolean(item.link_url),
    }));

  const timeline: TimelineEventoPortal[] = [];
  for (const o of orcamentosResolvidos) {
    if (o.enviado_em) timeline.push({ origem: "orcamento", evento: "enviado", data: o.enviado_em, titulo: o.titulo, token: o.token });
    if (o.visualizado_em) timeline.push({ origem: "orcamento", evento: "visualizado", data: o.visualizado_em, titulo: o.titulo, token: o.token });
    if (o.aprovado_em) timeline.push({ origem: "orcamento", evento: "aprovado", data: o.aprovado_em, titulo: o.titulo, token: o.token });
    if (o.recusado_em) timeline.push({ origem: "orcamento", evento: "recusado", data: o.recusado_em, titulo: o.titulo, token: o.token });
  }
  for (const c of contratosResolvidos) {
    if (c.enviado_em) timeline.push({ origem: "contrato", evento: "enviado", data: c.enviado_em, titulo: c.titulo, token: c.token });
    if (c.visualizado_em) timeline.push({ origem: "contrato", evento: "visualizado", data: c.visualizado_em, titulo: c.titulo, token: c.token });
    if (c.assinado_em) timeline.push({ origem: "contrato", evento: "assinado", data: c.assinado_em, titulo: c.titulo, token: c.token });
    if (c.recusado_em) timeline.push({ origem: "contrato", evento: "recusado", data: c.recusado_em, titulo: c.titulo, token: c.token });
  }
  timeline.sort((a, b) => b.data.localeCompare(a.data));

  return {
    cliente: { nome: cliente.nome, email: cliente.email },
    empresaNome: cliente.companies?.nome ?? null,
    orcamentos: orcamentosResolvidos.map((o) => {
      const itensDoOrcamento = (todosOrcItens ?? []).filter((i) => i.orcamento_id === o.id);
      const { total } = calcularTotalOrcamento(itensDoOrcamento, o.desconto_tipo, o.desconto_valor);
      return { ...o, statusExibicao: calcularStatusExibicao(o), total };
    }),
    contratos: contratosResolvidos.map((c) => ({
      ...c,
      total: calcularTotalContrato((todosContratoItens ?? []).filter((i) => i.contrato_id === c.id)),
    })),
    portfolio,
    timeline,
  };
}
