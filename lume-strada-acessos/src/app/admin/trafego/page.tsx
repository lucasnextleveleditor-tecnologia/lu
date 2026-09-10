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
import Link from "next/link";
import type { MetaDiariaRow, TrafegoRegistroRow } from "@/lib/types/database";
import { todayISO } from "@/lib/utils/format";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { TrafegoWorkspace } from "@/components/admin/trafego/TrafegoWorkspace";
import { TrafegoLeadsWorkspace } from "@/components/admin/trafego/TrafegoLeadsWorkspace";
import { IconTag, IconTarget, IconChevronRight } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

const BUCKET_INFOPRODUTOS = "infoprodutos";

/**
 * A porta de Tráfego & Metas.
 *
 * São dois trabalhos diferentes, e quem chega já sabe qual dos dois veio
 * fazer. Anunciar um INFOPRODUTO envolve produto, order bump, taxa de
 * plataforma, receita e fechamento semanal. Anunciar para captar LEADS não
 * envolve nada disso — é meta de investimento, gasto do dia e custo por
 * lead. Uma tela só, com tudo junto, obrigava quem veio acompanhar leads a
 * atravessar cadastros de produto que não existem no caso dele.
 *
 * Por isso a escolha vem antes, na URL (`?fluxo=`), e a BUSCA DE DADOS é
 * condicionada a ela: quem entra em leads não paga as consultas de
 * infoproduto, e vice-versa. Sem `?fluxo=` nada é buscado — só a escolha.
 *
 * O cadastro de cliente é o mesmo nos dois caminhos: o cliente que vende um
 * curso hoje pode estar captando lead amanhã.
 *
 * ---
 *
 * Histórico — só a aba Info-Produtos (tracking de anúncios
 * dos próprios infoprodutos da agência, com calendário de metas de LUCRO
 * LÍQUIDO e fechamento semanal com reembolsos). A antiga aba "Clientes"
 * (fluxo por-cliente com Meta do Dia/status do tráfego) foi retirada da
 * tela a pedido do dono da conta — ele já cadastra e organiza tudo pelo
 * seletor de Cliente aqui dentro de Info-Produtos, então a outra aba virou
 * uma segunda tela pra fazer a mesma coisa. `metas_diarias`/`trafego_registros`
 * (tabelas de `schema.sql`) e `ClientesTrafegoTab.tsx` continuam intactos no
 * banco/código, só não são mais buscados/renderizados aqui.
 */
type Fluxo = "infoproduto" | "leads";

function fluxoDe(valor: string | undefined): Fluxo | null {
  return valor === "infoproduto" || valor === "leads" ? valor : null;
}

export default async function TrafegoPage({
  searchParams,
}: {
  searchParams: Promise<{ fluxo?: string; data?: string }>;
}) {
  const { supabase } = await requireModuloOuRedirect("trafego");
  const params = await searchParams;
  const fluxo = fluxoDe(params.fluxo);

  if (!fluxo) return <EscolherFluxo />;
  if (fluxo === "leads") return <CaminhoLeads supabase={supabase} data={params.data || todayISO()} />;

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

/**
 * A escolha. Dois caminhos e mais nada: sem números nem lista por baixo
 * competindo pela atenção de quem ainda não disse o que veio fazer.
 */
async function EscolherFluxo() {
  const { dict } = await getDictionary();
  const t = dict.trafego;

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="mb-8">
        <h1 className="text-lg font-semibold tracking-tight">{t.escolhaTitulo}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{t.escolhaSubtitulo}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CaminhoCard
          href="/admin/trafego?fluxo=infoproduto"
          icone={<IconTag className="h-5 w-5" />}
          titulo={t.caminhoInfoprodutoTitulo}
          texto={t.caminhoInfoprodutoTexto}
        />
        <CaminhoCard
          href="/admin/trafego?fluxo=leads"
          icone={<IconTarget className="h-5 w-5" />}
          titulo={t.caminhoLeadsTitulo}
          texto={t.caminhoLeadsTexto}
        />
      </div>

      <p className="mt-5 text-center text-xs text-ink-muted">{t.escolhaRodape}</p>
    </div>
  );
}

function CaminhoCard({ href, icone, titulo, texto }: { href: string; icone: React.ReactNode; titulo: string; texto: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-base-700 bg-base-900/60 p-5 transition hover:border-accent/40 hover:bg-base-900"
    >
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-base-800 text-accent transition group-hover:bg-accent/10">
        {icone}
      </span>
      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
        {titulo}
        <IconChevronRight className="h-3.5 w-3.5 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{texto}</p>
    </Link>
  );
}

/**
 * O caminho de LEADS: nada de produto, order bump ou fechamento semanal.
 *
 * As metas do dia e os lançamentos são buscados só do dia escolhido — é a
 * unidade de trabalho desta tela, e trazer o histórico inteiro para mostrar
 * um dia seria desperdício que só cresce.
 */
async function CaminhoLeads({
  supabase,
  data,
}: {
  supabase: Awaited<ReturnType<typeof requireModuloOuRedirect>>["supabase"];
  data: string;
}) {
  const [clientesRes, metasRes] = await Promise.all([
    supabase.from("clientes").select("*").order("nome", { ascending: true }).overrideTypes<ClienteRow[], { merge: false }>(),
    supabase.from("metas_diarias").select("*").eq("data", data).overrideTypes<MetaDiariaRow[], { merge: false }>(),
  ]);

  const metas = metasRes.data ?? [];
  // Chaveado por `cliente_cadastro_id`, que é o vínculo de verdade (existe
  // com ou sem login). `cliente_id` só sobrevive em linha antiga, de antes do
  // cadastro de clientes — por isso entra como segunda opção, e não como
  // primeira.
  const metaPorCliente: Record<string, MetaDiariaRow> = {};
  for (const meta of metas) {
    const chave = meta.cliente_cadastro_id ?? meta.cliente_id;
    if (chave) metaPorCliente[chave] = meta;
  }

  // Os lançamentos são buscados pelas metas do dia — sem meta não há
  // lançamento para mostrar, então não há o que buscar.
  const registrosPorMeta: Record<string, TrafegoRegistroRow[]> = {};
  if (metas.length > 0) {
    const { data: registros } = await supabase
      .from("trafego_registros")
      .select("*")
      .in(
        "meta_id",
        metas.map((m) => m.id)
      )
      .order("created_at", { ascending: true })
      .overrideTypes<TrafegoRegistroRow[], { merge: false }>();
    for (const registro of registros ?? []) {
      const lista = registrosPorMeta[registro.meta_id] ?? [];
      lista.push(registro);
      registrosPorMeta[registro.meta_id] = lista;
    }
  }

  return (
    <TrafegoLeadsWorkspace
      data={data}
      clientes={clientesRes.data ?? []}
      metaPorCliente={metaPorCliente}
      registrosPorMeta={registrosPorMeta}
    />
  );
}
