import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { notFound } from "next/navigation";
import type { ContratoRow, ContratoItemRow, ContratoTipoRow } from "@/lib/types/contratos";
import type { OrcamentoRow, OrcItemRow, PerfilOrcamento } from "@/lib/types/orcamentos";
import { calcularTotalOrcamento } from "@/lib/types/orcamentos";
import { CATEGORIAS_PORTFOLIO } from "@/lib/utils/orcamentos";

/** Mesmo bucket da marca das propostas — a logo do contrato mora ao lado das outras imagens da empresa. */
const BUCKET_ORCAMENTOS_MIDIA = "orcamentos-midia";

export interface ContratosSearchParams {
  status?: string;
  busca?: string;
}

/**
 * Busca + monta os dados da tela principal de Contratos — lista com o total
 * de cada um já calculado, e os totalizadores dos StatTiles do topo. Mesmo
 * princípio de `buscarDadosOrcamentos`.
 */
export async function buscarDadosContratos(searchParams: ContratosSearchParams) {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const { data: contratosBrutos } = await supabase
    .from("contratos")
    .select("*, clientes(nome), orcamentos(titulo)")
    .order("created_at", { ascending: false })
    .overrideTypes<(ContratoRow & { clientes: { nome: string } | null; orcamentos: { titulo: string } | null })[], { merge: false }>();

  const lista = contratosBrutos ?? [];
  const ids = lista.map((c) => c.id);
  const { data: todosItens } =
    ids.length > 0 ? await supabase.from("contratos_itens").select("*").in("contrato_id", ids).overrideTypes<ContratoItemRow[], { merge: false }>() : { data: [] as ContratoItemRow[] };

  const itensPorContrato = new Map<string, ContratoItemRow[]>();
  for (const item of todosItens ?? []) {
    const grupo = itensPorContrato.get(item.contrato_id) ?? [];
    grupo.push(item);
    itensPorContrato.set(item.contrato_id, grupo);
  }

  let contratos = lista.map((c) => {
    const itens = itensPorContrato.get(c.id) ?? [];
    const total = itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
    return { ...c, cliente_nome: c.clientes?.nome ?? null, orcamento_titulo: c.orcamentos?.titulo ?? null, itens, total };
  });

  if (searchParams.status && searchParams.status !== "todos") {
    contratos = contratos.filter((c) => c.status === searchParams.status);
  }
  if (searchParams.busca?.trim()) {
    const termo = searchParams.busca.trim().toLowerCase();
    contratos = contratos.filter((c) => c.titulo.toLowerCase().includes(termo) || c.nome_cliente.toLowerCase().includes(termo));
  }

  const aguardandoAssinatura = contratos.filter((c) => c.status === "enviado");
  const hoje = new Date();
  const assinadosMes = contratos.filter((c) => {
    if (c.status !== "assinado" || !c.assinado_em) return false;
    const d = new Date(c.assinado_em);
    return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  });
  const decididos = contratos.filter((c) => c.status === "assinado" || c.status === "recusado");
  const taxaAssinatura = decididos.length > 0 ? contratos.filter((c) => c.status === "assinado").length / decididos.length : 0;

  return {
    contratos,
    valorAguardandoAssinatura: aguardandoAssinatura.reduce((acc, c) => acc + c.total, 0),
    valorAssinadoMes: assinadosMes.reduce((acc, c) => acc + c.total, 0),
    totalAguardando: aguardandoAssinatura.length,
    taxaAssinatura,
    filtroStatus: searchParams.status ?? "todos",
    filtroBusca: searchParams.busca ?? "",
  };
}

export interface OrcamentoParaVincular {
  id: string;
  titulo: string;
  tipo_perfil: PerfilOrcamento | null;
  tipo_servico: string | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  nome_destinatario: string;
  email_destinatario: string | null;
  whatsapp_destinatario: string | null;
  condicoes_pagamento: string | null;
  itens: { nome: string; descricao: string | null; quantidade: number; valor_unitario: number }[];
}

/** Dados jurídicos da própria empresa (o CONTRATADO) — ver `supabase/contratos-modelos-integracao.sql`. Alimenta só os modelos ricos do banco de modelos (`BANCO_DE_MODELOS`); nada a ver com `nomeEmpresa`/`getNomeApp()` (branding, prop separada em `ContratoBuilder.tsx`). */
export interface EmpresaContratante {
  nome: string;
  cpfCnpj: string | null;
  endereco: string | null;
}

/**
 * Dados de apoio pro construtor (`/novo` e `/[id]/editar`): clientes pra um
 * contrato avulso, os modelos de cláusula por perfil (pré-preenchem o
 * construtor quando um perfil é escolhido), os orçamentos JÁ APROVADOS —
 * pra opção "gerar a partir de um orçamento", que herda cliente/itens/valor
 * automaticamente (ver `escolherOrcamento` em `ContratoBuilder.tsx`) — e os
 * dados jurídicos da própria empresa (CONTRATADO), pro auto-preenchimento
 * dos modelos ricos do banco de modelos (`BANCO_DE_MODELOS`).
 */
export async function buscarDadosConstrutorContrato() {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const [clientesRes, tiposRes, orcamentosRes, empresaRes] = await Promise.all([
    supabase
      .from("clientes")
      .select("id, nome, email, telefone, documento, endereco")
      .order("nome")
      .overrideTypes<{ id: string; nome: string; email: string | null; telefone: string | null; documento: string | null; endereco: string | null }[], { merge: false }>(),
    supabase.from("contratos_tipos").select("*").overrideTypes<ContratoTipoRow[], { merge: false }>(),
    supabase
      .from("orcamentos")
      .select("*, clientes(nome)")
      .eq("status", "aprovado")
      .order("aprovado_em", { ascending: false })
      .overrideTypes<(OrcamentoRow & { clientes: { nome: string } | null })[], { merge: false }>(),
    // Mesmo padrão RLS-scoped de `getNomeApp()` (ver `src/lib/branding/getNomeApp.ts`):
    // `companies_select_own` já restringe a UMA linha só (a própria empresa de
    // quem chama), então não precisa `.eq()`. Diferente de `getNomeApp()`, aqui
    // é a razão social real (`nome`), não o nome de marca (`nome_app`).
    supabase
      .from("companies")
      .select("nome, cpf_cnpj, endereco, contrato_logo_path")
      .maybeSingle<{ nome: string | null; cpf_cnpj: string | null; endereco: string | null; contrato_logo_path: string | null }>(),
  ]);

  const tipos = tiposRes.data ?? [];
  const tiposContrato = {} as Record<PerfilOrcamento, ContratoTipoRow | null>;
  for (const perfil of CATEGORIAS_PORTFOLIO) {
    tiposContrato[perfil] = tipos.find((t) => t.perfil === perfil) ?? null;
  }

  const orcamentosAprovados = orcamentosRes.data ?? [];
  const orcamentoIds = orcamentosAprovados.map((o) => o.id);
  const { data: itensDosOrcamentos } =
    orcamentoIds.length > 0
      ? await supabase.from("orc_itens").select("*").in("orcamento_id", orcamentoIds).order("ordem").overrideTypes<OrcItemRow[], { merge: false }>()
      : { data: [] as OrcItemRow[] };

  const itensPorOrcamento = new Map<string, OrcItemRow[]>();
  for (const item of itensDosOrcamentos ?? []) {
    const grupo = itensPorOrcamento.get(item.orcamento_id) ?? [];
    grupo.push(item);
    itensPorOrcamento.set(item.orcamento_id, grupo);
  }

  const orcamentosParaVincular: OrcamentoParaVincular[] = orcamentosAprovados.map((o) => ({
    id: o.id,
    titulo: o.titulo,
    tipo_perfil: o.tipo_perfil,
    tipo_servico: o.tipo_servico,
    cliente_id: o.cliente_id,
    cliente_nome: o.clientes?.nome ?? null,
    nome_destinatario: o.nome_destinatario,
    email_destinatario: o.email_destinatario,
    whatsapp_destinatario: o.whatsapp_destinatario,
    condicoes_pagamento: o.condicoes_pagamento,
    itens: (itensPorOrcamento.get(o.id) ?? [])
      .filter((i) => !i.opcional || i.selecionado)
      .map((i) => ({ nome: i.nome, descricao: i.descricao, quantidade: i.quantidade, valor_unitario: i.valor_unitario })),
  }));

  const empresa: EmpresaContratante = {
    nome: empresaRes.data?.nome?.trim() || "",
    cpfCnpj: empresaRes.data?.cpf_cnpj || null,
    endereco: empresaRes.data?.endereco || null,
  };

  const logoContratoUrl = empresaRes.data?.contrato_logo_path
    ? supabase.storage.from(BUCKET_ORCAMENTOS_MIDIA).getPublicUrl(empresaRes.data.contrato_logo_path).data.publicUrl
    : null;

  return { clientes: clientesRes.data ?? [], tiposContrato, orcamentosParaVincular, empresa, logoContratoUrl };
}

/** Um contrato completo (cabeçalho + itens + nomes vinculados) — usado pelas telas de detalhe e edição. */
export async function buscarContratoPorId(id: string) {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const { data: contrato } = await supabase
    .from("contratos")
    .select("*, clientes(nome), orcamentos(titulo)")
    .eq("id", id)
    .single<ContratoRow & { clientes: { nome: string } | null; orcamentos: { titulo: string } | null }>();
  if (!contrato) notFound();

  const { data: itens } = await supabase.from("contratos_itens").select("*").eq("contrato_id", id).order("ordem").overrideTypes<ContratoItemRow[], { merge: false }>();

  return {
    ...contrato,
    cliente_nome: contrato.clientes?.nome ?? null,
    orcamento_titulo: contrato.orcamentos?.titulo ?? null,
    itens: itens ?? [],
  };
}

/**
 * O contrato já vinculado a um orçamento (`contratos.orcamento_id`), se
 * existir — usado pelo hub de detalhe do orçamento (`OrcamentoHub.tsx`, ver
 * `src/app/admin/orcamentos/[id]/page.tsx`) pra decidir a aba "Contrato":
 * mostra `ContratoDetalhe` quando já existe um contrato gerado a partir
 * desse orçamento, ou `ContratoBuilder` pré-preenchido quando ainda não
 * existe. `null` cobre tanto "nenhum contrato gerado ainda" quanto
 * "orçamento não encontrado" (RLS já filtra por empresa) — sem `notFound()`
 * de propósito, esta função nunca é a dona da página.
 */
export async function buscarContratoVinculado(orcamentoId: string): Promise<Awaited<ReturnType<typeof buscarContratoPorId>> | null> {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const { data: vinculo } = await supabase.from("contratos").select("id").eq("orcamento_id", orcamentoId).maybeSingle<{ id: string }>();
  if (!vinculo) return null;

  return buscarContratoPorId(vinculo.id);
}

/**
 * A logo que vai no topo do contrato, já como URL pronta para uso.
 *
 * Fica numa função à parte porque quem precisa dela são três lugares com
 * caminhos diferentes: o PDF gerado no servidor, a tela de detalhe e o link
 * público que o cliente abre — e nenhum deles precisa do resto dos dados do
 * construtor.
 */
export async function buscarLogoDoContrato(): Promise<string | null> {
  const { supabase } = await requireModuloOuRedirect("orcamentos");
  const { data } = await supabase
    .from("companies")
    .select("contrato_logo_path")
    .maybeSingle<{ contrato_logo_path: string | null }>();
  if (!data?.contrato_logo_path) return null;
  return supabase.storage.from(BUCKET_ORCAMENTOS_MIDIA).getPublicUrl(data.contrato_logo_path).data.publicUrl;
}
