import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { notFound } from "next/navigation";
import type { OrcamentoRow, OrcCategoriaRow, OrcServicoRow, OrcItemRow, ServicoComCategoria } from "@/lib/types/orcamentos";
import { calcularStatusExibicao, calcularTotalOrcamento } from "@/lib/types/orcamentos";

export interface OrcamentosSearchParams {
  status?: string;
  busca?: string;
}

function enriquecerServicos(servicos: OrcServicoRow[], categorias: OrcCategoriaRow[]): ServicoComCategoria[] {
  const nomeCategoria = new Map(categorias.map((c) => [c.id, c.nome]));
  return servicos.map((s) => ({ ...s, categoria_nome: s.categoria_id ? (nomeCategoria.get(s.categoria_id) ?? null) : null }));
}

/**
 * Busca + monta TODOS os dados da tela principal de Orçamentos — lista com
 * status/total já calculados, categorias e catálogo (pro modal de criação
 * rápida), e os totalizadores dos StatTiles do topo. Mesmo princípio de
 * `buscarDadosFinanceiro`: um único lugar que sabe montar esse objeto.
 */
export async function buscarDadosOrcamentos(searchParams: OrcamentosSearchParams) {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const [orcamentosRes, categoriasRes, servicosRes] = await Promise.all([
    supabase
      .from("orcamentos")
      .select("*, clientes(nome)")
      .order("created_at", { ascending: false })
      .overrideTypes<(OrcamentoRow & { clientes: { nome: string } | null })[], { merge: false }>(),
    supabase.from("orc_categorias").select("*").order("ordem").overrideTypes<OrcCategoriaRow[], { merge: false }>(),
    supabase.from("orc_servicos").select("*").order("nome").overrideTypes<OrcServicoRow[], { merge: false }>(),
  ]);

  const orcamentosBrutos = orcamentosRes.data ?? [];
  const categorias = categoriasRes.data ?? [];
  const servicos = servicosRes.data ?? [];

  const ids = orcamentosBrutos.map((o) => o.id);
  const { data: todosItens } =
    ids.length > 0
      ? await supabase.from("orc_itens").select("*").in("orcamento_id", ids).overrideTypes<OrcItemRow[], { merge: false }>()
      : { data: [] as OrcItemRow[] };

  const itensPorOrcamento = new Map<string, OrcItemRow[]>();
  for (const item of todosItens ?? []) {
    const lista = itensPorOrcamento.get(item.orcamento_id) ?? [];
    lista.push(item);
    itensPorOrcamento.set(item.orcamento_id, lista);
  }

  let orcamentos = orcamentosBrutos.map((o) => {
    const itens = itensPorOrcamento.get(o.id) ?? [];
    const { total } = calcularTotalOrcamento(itens, o.desconto_tipo, o.desconto_valor);
    return { ...o, cliente_nome: o.clientes?.nome ?? null, itens, total, statusExibicao: calcularStatusExibicao(o) };
  });

  if (searchParams.status && searchParams.status !== "todos") {
    orcamentos = orcamentos.filter((o) => o.statusExibicao === searchParams.status);
  }
  if (searchParams.busca?.trim()) {
    const termo = searchParams.busca.trim().toLowerCase();
    orcamentos = orcamentos.filter((o) => o.titulo.toLowerCase().includes(termo) || o.nome_destinatario.toLowerCase().includes(termo));
  }

  const abertos = orcamentos.filter((o) => o.statusExibicao === "enviado" || o.statusExibicao === "visualizado");
  const hoje = new Date();
  const aprovadosMes = orcamentos.filter((o) => {
    if (o.statusExibicao !== "aprovado" || !o.aprovado_em) return false;
    const d = new Date(o.aprovado_em);
    return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  });
  const decididos = orcamentos.filter((o) => o.statusExibicao === "aprovado" || o.statusExibicao === "recusado");
  const taxaAprovacao = decididos.length > 0 ? orcamentos.filter((o) => o.statusExibicao === "aprovado").length / decididos.length : 0;

  return {
    orcamentos,
    categorias,
    servicosComCategoria: enriquecerServicos(servicos, categorias),
    valorEmAberto: abertos.reduce((acc, o) => acc + o.total, 0),
    valorAprovadoMes: aprovadosMes.reduce((acc, o) => acc + o.total, 0),
    totalAbertos: abertos.length,
    taxaAprovacao,
    filtroStatus: searchParams.status ?? "todos",
    filtroBusca: searchParams.busca ?? "",
  };
}

/** Só o catálogo (categorias + serviços) — usado pela tela `/catalogo`, sem precisar carregar a lista inteira de orçamentos. */
export async function buscarDadosCatalogo() {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const [categoriasRes, servicosRes] = await Promise.all([
    supabase.from("orc_categorias").select("*").order("ordem").overrideTypes<OrcCategoriaRow[], { merge: false }>(),
    supabase.from("orc_servicos").select("*").order("nome").overrideTypes<OrcServicoRow[], { merge: false }>(),
  ]);

  const categorias = categoriasRes.data ?? [];
  const servicos = servicosRes.data ?? [];

  return { categorias, servicosComCategoria: enriquecerServicos(servicos, categorias) };
}

/** Dados de apoio pro construtor (`/novo` e `/[id]/editar`): catálogo pra montar itens + lista de clientes pra pré-preencher o destinatário. */
export async function buscarDadosConstrutor() {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const [categoriasRes, servicosRes, clientesRes] = await Promise.all([
    supabase.from("orc_categorias").select("*").order("ordem").overrideTypes<OrcCategoriaRow[], { merge: false }>(),
    supabase.from("orc_servicos").select("*").eq("ativo", true).order("nome").overrideTypes<OrcServicoRow[], { merge: false }>(),
    supabase.from("clientes").select("id, nome, email, telefone").order("nome").overrideTypes<{ id: string; nome: string; email: string | null; telefone: string | null }[], { merge: false }>(),
  ]);

  const categorias = categoriasRes.data ?? [];
  const servicos = servicosRes.data ?? [];

  return { categorias, servicosComCategoria: enriquecerServicos(servicos, categorias), clientes: clientesRes.data ?? [] };
}

/** Um orçamento completo (cabeçalho + itens + nome do cliente vinculado) — usado pelas telas de detalhe e edição. Chama `notFound()` se o id não existir (ou não pertencer à empresa — RLS já filtra isso sozinho). */
export async function buscarOrcamentoPorId(id: string) {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const { data: orcamento } = await supabase
    .from("orcamentos")
    .select("*, clientes(nome)")
    .eq("id", id)
    .single<OrcamentoRow & { clientes: { nome: string } | null }>();
  if (!orcamento) notFound();

  const { data: itens } = await supabase
    .from("orc_itens")
    .select("*")
    .eq("orcamento_id", id)
    .order("ordem")
    .overrideTypes<OrcItemRow[], { merge: false }>();

  const { total, subtotal, desconto } = calcularTotalOrcamento(itens ?? [], orcamento.desconto_tipo, orcamento.desconto_valor);

  return {
    ...orcamento,
    cliente_nome: orcamento.clientes?.nome ?? null,
    itens: itens ?? [],
    subtotal,
    desconto,
    total,
    statusExibicao: calcularStatusExibicao(orcamento),
  };
}
