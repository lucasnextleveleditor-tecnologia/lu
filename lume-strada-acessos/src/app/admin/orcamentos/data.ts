import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { notFound } from "next/navigation";
import type {
  OrcamentoRow,
  OrcCategoriaRow,
  OrcServicoRow,
  OrcItemRow,
  ServicoComCategoria,
  OrcTipoOrcamentoRow,
  OrcTipoOrcamentoItemRow,
  TipoOrcamentoComItens,
  PerfilOrcamento,
  PortfolioItemRow,
  PortfolioItemComUrl,
  DadosInstitucionaisOrcamento,
} from "@/lib/types/orcamentos";
import { calcularStatusExibicao, calcularTotalOrcamento } from "@/lib/types/orcamentos";
import { CATEGORIAS_PORTFOLIO } from "@/lib/utils/orcamentos";
import { getNomeApp } from "@/lib/branding/getNomeApp";

const BUCKET_ORCAMENTOS_MIDIA = "orcamentos-midia";

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

/**
 * Dados de apoio pro construtor (`/novo` e `/[id]/editar`): catálogo pra
 * montar itens, lista de clientes pra pré-preencher o destinatário, os
 * modelos por perfil (Fase 2 — pré-preenchem o construtor quando um tipo é
 * escolhido) e a biblioteca de Portfólio (Fase 1 — seleção de itens pra
 * anexar ao orçamento).
 */
export async function buscarDadosConstrutor() {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const [categoriasRes, servicosRes, clientesRes, tiposRes, portfolioRes, institucional] = await Promise.all([
    supabase.from("orc_categorias").select("*").order("ordem").overrideTypes<OrcCategoriaRow[], { merge: false }>(),
    supabase.from("orc_servicos").select("*").eq("ativo", true).order("nome").overrideTypes<OrcServicoRow[], { merge: false }>(),
    supabase.from("clientes").select("id, nome, email, telefone").order("nome").overrideTypes<{ id: string; nome: string; email: string | null; telefone: string | null }[], { merge: false }>(),
    supabase.from("orc_tipos_orcamento").select("*").overrideTypes<OrcTipoOrcamentoRow[], { merge: false }>(),
    supabase.from("orc_portfolio_itens").select("*").order("ordem").order("created_at", { ascending: false }).overrideTypes<PortfolioItemRow[], { merge: false }>(),
    // Marca/institucional (Fase 1/PDF) — buscada junto pra alimentar o preview
    // ao vivo do construtor (`OrcamentoBuilder`), que agora mostra o mesmo
    // visual da página pública enquanto o usuário digita.
    buscarDadosInstitucionaisEmpresa(),
  ]);

  const categorias = categoriasRes.data ?? [];
  const servicos = servicosRes.data ?? [];
  const tipos = tiposRes.data ?? [];

  const tipoIds = tipos.map((t) => t.id);
  const { data: tipoItens } =
    tipoIds.length > 0
      ? await supabase.from("orc_tipos_orcamento_itens").select("*").in("tipo_orcamento_id", tipoIds).order("ordem").overrideTypes<OrcTipoOrcamentoItemRow[], { merge: false }>()
      : { data: [] as OrcTipoOrcamentoItemRow[] };

  const itensPorTipo = new Map<string, OrcTipoOrcamentoItemRow[]>();
  for (const item of tipoItens ?? []) {
    const lista = itensPorTipo.get(item.tipo_orcamento_id) ?? [];
    lista.push(item);
    itensPorTipo.set(item.tipo_orcamento_id, lista);
  }

  const tiposOrcamento = {} as Record<PerfilOrcamento, TipoOrcamentoComItens | null>;
  for (const perfil of CATEGORIAS_PORTFOLIO) {
    const tipo = tipos.find((t) => t.perfil === perfil) ?? null;
    tiposOrcamento[perfil] = tipo ? { ...tipo, itens: itensPorTipo.get(tipo.id) ?? [] } : null;
  }

  const portfolioItens: PortfolioItemComUrl[] = (portfolioRes.data ?? []).map((item) => ({
    ...item,
    url: supabase.storage.from(BUCKET_ORCAMENTOS_MIDIA).getPublicUrl(item.path).data.publicUrl,
  }));

  return { categorias, servicosComCategoria: enriquecerServicos(servicos, categorias), clientes: clientesRes.data ?? [], tiposOrcamento, portfolioItens, institucional };
}

/** Um orçamento completo (cabeçalho + itens + nome do cliente vinculado) — usado pelas telas de detalhe e edição. Chama `notFound()` se o id não existir (ou não pertencer à empresa — RLS já filtra isso sozinho). */
export async function buscarOrcamentoPorId(id: string) {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  // `clientes` embutido com os campos jurídicos completos (documento,
  // endereco, email, telefone) além de `nome` — não usado pela tela de
  // detalhe (que só lê `cliente_nome`), mas necessário pro PDF de orçamento
  // (`OrcamentoPdfDocument.tsx`, via `src/app/api/orcamentos/[id]/pdf/route.tsx`),
  // que exibe os dados completos do cliente no cabeçalho da proposta.
  const { data: orcamento } = await supabase
    .from("orcamentos")
    .select("*, clientes(nome, documento, endereco, email, telefone)")
    .eq("id", id)
    .single<
      OrcamentoRow & {
        clientes: { nome: string; documento: string | null; endereco: string | null; email: string | null; telefone: string | null } | null;
      }
    >();
  if (!orcamento) notFound();

  const { data: itens } = await supabase
    .from("orc_itens")
    .select("*")
    .eq("orcamento_id", id)
    .order("ordem")
    .overrideTypes<OrcItemRow[], { merge: false }>();

  const { total, subtotal, desconto } = calcularTotalOrcamento(itens ?? [], orcamento.desconto_tipo, orcamento.desconto_valor);

  // Itens de Portfólio já anexados a este orçamento (Fase 2) — resolvidos
  // com URL pública pra exibição direta (detalhe admin, construtor de
  // edição). `orc_portfolio_itens` embutido via o relacionamento de FK de
  // `orc_orcamento_portfolio.portfolio_item_id`, mesmo padrão de
  // `clientes(nome)` usado acima.
  const { data: portfolioLinks } = await supabase
    .from("orc_orcamento_portfolio")
    .select("ordem, orc_portfolio_itens(*)")
    .eq("orcamento_id", id)
    .order("ordem")
    .overrideTypes<{ ordem: number; orc_portfolio_itens: PortfolioItemRow | null }[], { merge: false }>();

  const portfolio: PortfolioItemComUrl[] = (portfolioLinks ?? [])
    .map((link) => link.orc_portfolio_itens)
    .filter((item): item is PortfolioItemRow => !!item)
    .map((item) => ({ ...item, url: supabase.storage.from(BUCKET_ORCAMENTOS_MIDIA).getPublicUrl(item.path).data.publicUrl }));

  return {
    ...orcamento,
    cliente_nome: orcamento.clientes?.nome ?? null,
    itens: itens ?? [],
    subtotal,
    desconto,
    total,
    statusExibicao: calcularStatusExibicao(orcamento),
    portfolio,
  };
}

/**
 * Dados institucionais da empresa pra capa do PDF de orçamento (ver
 * `OrcamentoPdfDocument.tsx`) — nome de marca (`nome_app`, via `getNomeApp()`),
 * razão social/CPF-CNPJ/endereço (dados jurídicos, rodapé da capa), logo e
 * banner já resolvidos pra URL pública, e o conteúdo institucional livre
 * (texto de apresentação + clientes atendidos, editados em
 * `/admin/orcamentos/portfolio`, ver `InstitucionalOrcamentoForm.tsx`).
 * UMA query em `companies` com tudo — chamado em paralelo com
 * `buscarOrcamentoPorId` dentro da rota da API do PDF.
 */
export async function buscarDadosInstitucionaisEmpresa(): Promise<DadosInstitucionaisOrcamento> {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const [{ data: empresa }, nomeMarca] = await Promise.all([
    supabase
      .from("companies")
      .select("nome, cpf_cnpj, endereco, orc_logo_path, orc_banner_path, orc_rodape_path, orc_texto_institucional, orc_clientes_atendidos")
      .maybeSingle<{
        nome: string | null;
        cpf_cnpj: string | null;
        endereco: string | null;
        orc_logo_path: string | null;
        orc_banner_path: string | null;
        orc_rodape_path: string | null;
        orc_texto_institucional: string | null;
        orc_clientes_atendidos: string | null;
      }>(),
    getNomeApp(),
  ]);

  const clientesAtendidos = (empresa?.orc_clientes_atendidos ?? "")
    .split("\n")
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0);

  return {
    nomeMarca,
    nomeLegal: empresa?.nome?.trim() || null,
    cpfCnpj: empresa?.cpf_cnpj || null,
    endereco: empresa?.endereco || null,
    logoUrl: empresa?.orc_logo_path ? supabase.storage.from(BUCKET_ORCAMENTOS_MIDIA).getPublicUrl(empresa.orc_logo_path).data.publicUrl : null,
    bannerUrl: empresa?.orc_banner_path ? supabase.storage.from(BUCKET_ORCAMENTOS_MIDIA).getPublicUrl(empresa.orc_banner_path).data.publicUrl : null,
    rodapeUrl: empresa?.orc_rodape_path ? supabase.storage.from(BUCKET_ORCAMENTOS_MIDIA).getPublicUrl(empresa.orc_rodape_path).data.publicUrl : null,
    textoInstitucional: empresa?.orc_texto_institucional || null,
    clientesAtendidos,
  };
}
