import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { MetaDiariaRow, TrafegoRegistroRow } from "@/lib/types/database";
import type { ClienteRow } from "@/lib/types/cadastros";
import type { AnuncioComRelacoes, AnuncioTrackingRow, FechamentoSemanalRow, MetaCalendarioRow, ProdutoRow } from "@/lib/types/infoprodutos";
import { todayISO } from "@/lib/utils/format";
import { calcularResumoTrafego, type StatusTrafego } from "@/lib/utils/trafego";
import { TrafegoWorkspace } from "@/components/admin/trafego/TrafegoWorkspace";

export const dynamic = "force-dynamic";

interface TrafegoPageProps {
  searchParams: { data?: string };
}

const DATA_ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const BUCKET_INFOPRODUTOS = "infoprodutos";

/**
 * Painel de Tráfego & Metas — duas abas dentro do mesmo módulo/permissão
 * (`requireModulo("trafego")`): "Clientes" (fluxo já existente, inalterado
 * — [Cliente] -> [Meta do Dia] -> [Status do Tráfego]) e "Info-Produtos"
 * (novo — tracking de anúncios dos próprios infoprodutos da agência, com
 * calendário de metas de LUCRO LÍQUIDO e fechamento semanal com reembolsos).
 */
export default async function TrafegoPage({ searchParams }: TrafegoPageProps) {
  const data = searchParams.data && DATA_ISO_RE.test(searchParams.data) ? searchParams.data : todayISO();

  const { supabase } = await requireModuloOuRedirect("trafego");

  // ---------------------------------------------------------------------
  // Aba Clientes — a partir daqui, `clientes` é o cadastro completo
  // (`clientes`, não mais `profiles`/role=cliente): mostra TODO cliente
  // cadastrado, tenha ou não login gerado (mesma mudança de Produção — ver
  // `resolverVinculoCliente` em `app/admin/trafego/actions.ts`).
  // ---------------------------------------------------------------------
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .order("nome", { ascending: true })
    .overrideTypes<ClienteRow[], { merge: false }>();

  const clienteIds = (clientes ?? []).map((c) => c.id);

  const { data: metas } = clienteIds.length
    ? await supabase
        .from("metas_diarias")
        .select("*")
        .eq("data", data)
        .in("cliente_cadastro_id", clienteIds)
        .overrideTypes<MetaDiariaRow[], { merge: false }>()
    : { data: [] as MetaDiariaRow[] };

  const metaIds = (metas ?? []).map((m) => m.id);

  const { data: registros } = metaIds.length
    ? await supabase
        .from("trafego_registros")
        .select("*")
        .in("meta_id", metaIds)
        .order("created_at", { ascending: true })
        .overrideTypes<TrafegoRegistroRow[], { merge: false }>()
    : { data: [] as TrafegoRegistroRow[] };

  const metaPorCliente = new Map<string, MetaDiariaRow>();
  (metas ?? []).forEach((m) => {
    if (m.cliente_cadastro_id) metaPorCliente.set(m.cliente_cadastro_id, m);
  });

  const registrosPorMeta = new Map<string, TrafegoRegistroRow[]>();
  (registros ?? []).forEach((r) => {
    const lista = registrosPorMeta.get(r.meta_id) ?? [];
    lista.push(r);
    registrosPorMeta.set(r.meta_id, lista);
  });

  const contagemStatus: Record<StatusTrafego, number> = { sem_meta: 0, abaixo_da_meta: 0, no_caminho: 0, meta_batida: 0 };
  (clientes ?? []).forEach((cliente) => {
    const meta = metaPorCliente.get(cliente.id) ?? null;
    const registrosDoCliente = meta ? registrosPorMeta.get(meta.id) ?? [] : [];
    const resumo = calcularResumoTrafego(meta ? { valor_investido_meta: meta.valor_investido_meta } : null, registrosDoCliente);
    contagemStatus[resumo.status]++;
  });

  // ---------------------------------------------------------------------
  // Aba Info-Produtos — escala de ferramenta interna (poucas dezenas/
  // centenas de linhas), então busca tudo de uma vez e agrupa em memória no
  // client, mesmo padrão já usado em Produção/Comercial.
  // ---------------------------------------------------------------------
  const [produtosRes, anunciosRes, metasCalendarioRes, fechamentosRes] = await Promise.all([
    supabase.from("produtos").select("*").order("nome").overrideTypes<ProdutoRow[], { merge: false }>(),
    supabase.from("anuncios_tracking").select("*").order("data", { ascending: false }).overrideTypes<AnuncioTrackingRow[], { merge: false }>(),
    supabase.from("metas_calendario").select("*").overrideTypes<MetaCalendarioRow[], { merge: false }>(),
    supabase.from("fechamentos_semanais").select("*").overrideTypes<FechamentoSemanalRow[], { merge: false }>(),
  ]);

  const produtos = produtosRes.data ?? [];
  const produtosPorId = new Map(produtos.map((p) => [p.id, p]));

  const anuncios: AnuncioComRelacoes[] = (anunciosRes.data ?? []).map((a) => ({
    ...a,
    criativo_url: a.criativo_path ? supabase.storage.from(BUCKET_INFOPRODUTOS).getPublicUrl(a.criativo_path).data.publicUrl : null,
    produto_principal_nome: a.produto_principal_id ? produtosPorId.get(a.produto_principal_id)?.nome ?? null : null,
    order_bump_nome: a.order_bump_id ? produtosPorId.get(a.order_bump_id)?.nome ?? null : null,
  }));

  return (
    <TrafegoWorkspace
      data={data}
      clientes={clientes ?? []}
      metaPorCliente={Object.fromEntries(metaPorCliente)}
      registrosPorMeta={Object.fromEntries(registrosPorMeta)}
      contagemStatus={contagemStatus}
      produtos={produtos}
      anuncios={anuncios}
      metasCalendario={metasCalendarioRes.data ?? []}
      fechamentos={fechamentosRes.data ?? []}
    />
  );
}
