import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { ClienteRow } from "@/lib/types/cadastros";
import type {
  AnuncioComRelacoes,
  AnuncioTrackingRow,
  CriativoRow,
  FechamentoSemanalRow,
  MetaCalendarioRow,
  OrderBumpVendaLinha,
  ProdutoRow,
  TaxaPadraoRow,
} from "@/lib/types/infoprodutos";
import { TrafegoWorkspace } from "@/components/admin/trafego/TrafegoWorkspace";

export const dynamic = "force-dynamic";

const BUCKET_INFOPRODUTOS = "infoprodutos";

/**
 * Painel de Tráfego & Metas — só a aba Info-Produtos (tracking de anúncios
 * dos próprios infoprodutos da agência, com calendário de metas de LUCRO
 * LÍQUIDO e fechamento semanal com reembolsos). A antiga aba "Clientes"
 * (fluxo por-cliente com Meta do Dia/status do tráfego) foi retirada da
 * tela a pedido do dono da conta — ele já cadastra e organiza tudo pelo
 * seletor de Cliente aqui dentro de Info-Produtos, então a outra aba virou
 * uma segunda tela pra fazer a mesma coisa. `metas_diarias`/`trafego_registros`
 * (tabelas de `schema.sql`) e `ClientesTrafegoTab.tsx` continuam intactos no
 * banco/código, só não são mais buscados/renderizados aqui.
 */
export default async function TrafegoPage() {
  const { supabase } = await requireModuloOuRedirect("trafego");

  // `clientes` é o cadastro completo (`clientes`, não `profiles`/role=cliente)
  // — é o que alimenta o seletor de Cliente dentro de Info-Produtos.
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .order("nome", { ascending: true })
    .overrideTypes<ClienteRow[], { merge: false }>();

  // Escala de ferramenta interna (poucas dezenas/centenas de linhas), então
  // busca tudo de uma vez e agrupa em memória no client, mesmo padrão já
  // usado em Produção/Comercial.
  const [produtosRes, criativosRes, anunciosRes, metasCalendarioRes, fechamentosRes, taxasPadraoRes, orderBumpVendasRes] = await Promise.all([
    supabase.from("produtos").select("*").order("nome").overrideTypes<ProdutoRow[], { merge: false }>(),
    supabase.from("criativos").select("*").order("nome").overrideTypes<CriativoRow[], { merge: false }>(),
    supabase.from("anuncios_tracking").select("*").order("data", { ascending: false }).overrideTypes<AnuncioTrackingRow[], { merge: false }>(),
    supabase.from("metas_calendario").select("*").overrideTypes<MetaCalendarioRow[], { merge: false }>(),
    supabase.from("fechamentos_semanais").select("*").overrideTypes<FechamentoSemanalRow[], { merge: false }>(),
    supabase.from("infoprodutos_taxas_padrao").select("*").overrideTypes<TaxaPadraoRow[], { merge: false }>(),
    supabase
      .from("anuncio_order_bump_vendas")
      .select("anuncio_id, produto_id, quantidade")
      .overrideTypes<{ anuncio_id: string; produto_id: string; quantidade: number }[], { merge: false }>(),
  ]);

  const produtos = produtosRes.data ?? [];
  const produtosPorId = new Map(produtos.map((p) => [p.id, p]));
  const criativos = criativosRes.data ?? [];
  const criativosPorId = new Map(criativos.map((c) => [c.id, c]));

  // Linhas de order bump vendido (produto + quantidade), agrupadas por anúncio
  // — um anúncio pode ter várias (ver `OrderBumpVendaLinha`).
  const orderBumpVendasPorAnuncio = new Map<string, OrderBumpVendaLinha[]>();
  for (const linha of orderBumpVendasRes.data ?? []) {
    const produto = produtosPorId.get(linha.produto_id);
    const lista = orderBumpVendasPorAnuncio.get(linha.anuncio_id) ?? [];
    lista.push({ produtoId: linha.produto_id, nome: produto?.nome ?? "?", valor: produto?.valor ?? 0, quantidade: linha.quantidade });
    orderBumpVendasPorAnuncio.set(linha.anuncio_id, lista);
  }

  const anuncios: AnuncioComRelacoes[] = (anunciosRes.data ?? []).map((a) => ({
    ...a,
    criativo_url: a.criativo_path ? supabase.storage.from(BUCKET_INFOPRODUTOS).getPublicUrl(a.criativo_path).data.publicUrl : null,
    criativo_nome: a.criativo_id ? criativosPorId.get(a.criativo_id)?.nome ?? null : null,
    produto_principal_nome: a.produto_principal_id ? produtosPorId.get(a.produto_principal_id)?.nome ?? null : null,
    order_bump_nome: a.order_bump_id ? produtosPorId.get(a.order_bump_id)?.nome ?? null : null,
    order_bump_vendas: orderBumpVendasPorAnuncio.get(a.id) ?? [],
  }));

  return (
    <TrafegoWorkspace
      clientes={clientes ?? []}
      produtos={produtos}
      criativos={criativos}
      anuncios={anuncios}
      metasCalendario={metasCalendarioRes.data ?? []}
      fechamentos={fechamentosRes.data ?? []}
      taxasPadrao={taxasPadraoRes.data ?? []}
    />
  );
}
