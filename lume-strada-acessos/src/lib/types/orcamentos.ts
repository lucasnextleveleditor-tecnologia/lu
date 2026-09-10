import { todayISO } from "@/lib/utils/format";
export type OrcCategoriaRow = {
  id: string;
  nome: string;
  emoji: string | null;
  ordem: number;
  created_at: string;
};

export type UnidadeServico = "unico" | "hora" | "dia" | "mes" | "pacote";

export interface OrcServicoRow {
  id: string;
  categoria_id: string | null;
  nome: string;
  descricao: string | null;
  valor_padrao: number;
  /** Custo estimado (mão de obra, equipamento, terceirizados...) — opcional, usado só pra sugerir a margem na Calculadora de Margem (`/admin/orcamentos/calculadora`). Nunca aparece pro cliente nem entra no PDF/proposta. 0 = custo não cadastrado ainda. */
  custo_padrao: number;
  unidade: UnidadeServico;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

/** Serviço do catálogo enriquecido com o nome da categoria (join em memória). */
export type ServicoComCategoria = OrcServicoRow & { categoria_nome: string | null };

export type StatusOrcamento = "rascunho" | "enviado" | "visualizado" | "aprovado" | "recusado" | "expirado";
export type DescontoTipo = "percentual" | "fixo";

/**
 * Perfil profissional escolhido ao criar um orçamento — mesma lista de
 * `CATEGORIAS_PORTFOLIO` em `src/lib/utils/orcamentos.ts` (mantidas
 * separadas só porque este arquivo não pode importar de `utils/` sem criar
 * import circular; se uma lista mudar, atualize a outra junto).
 */
export type PerfilOrcamento = "filmmaker" | "videomaker" | "social_media" | "storymaker" | "designer" | "fotografo" | "agencia_marketing";

export interface OrcamentoRow {
  id: string;
  titulo: string;
  /** Tag do perfil profissional usado ao criar (ver `PerfilOrcamento`) — só sugestão/rótulo, nunca restringe o catálogo disponível. Null = orçamento avulso, sem tipo. */
  tipo_perfil: PerfilOrcamento | null;
  /** Slug do tipo de serviço escolhido dentro do perfil (ver `ModeloContratoServico.tipoServico` em `src/lib/contratos/modelos/`) — livre, validado em código de app. Null = sem tipo de serviço específico. */
  tipo_servico: string | null;
  cliente_id: string | null;
  lead_id: string | null;
  nome_destinatario: string;
  email_destinatario: string | null;
  whatsapp_destinatario: string | null;
  status: StatusOrcamento;
  validade_dias: number;
  data_expiracao: string | null; // ISO date
  desconto_tipo: DescontoTipo | null;
  desconto_valor: number;
  condicoes_pagamento: string | null;
  observacoes: string | null;
  /** Texto da proposta de trabalho DESTE orçamento (não confundir com `companies.orc_texto_institucional`, que é global da empresa) — ver `supabase/orcamentos-pdf-institucional.sql`. Aparece no PDF (`OrcamentoPdfDocument.tsx`). Null = seção omitida. */
  texto_proposta: string | null;
  /** Objetivos alcançados com este projeto/orçamento específico — mesma origem/uso de `texto_proposta`. Null = seção omitida. */
  objetivos: string | null;
  /** Cor de destaque (hex) desta proposta específica — ver `supabase/orcamentos-proposta-completa.sql`. Null = usa a cor padrão do app. */
  cor_destaque: string | null;
  /** Path no bucket orcamentos-midia da imagem de fundo da capa desta proposta. Null = usa o banner da agência ou o degradê padrão. */
  capa_path: string | null;
  /** Subtítulo/badge da capa (ex: "Proposta Premium"). Null = usa o rótulo padrão. */
  capa_subtitulo: string | null;
  /** Fator de escala do texto da capa (0.80 a 1.20). */
  escala_texto_capa: number;
  /** Quantidade de diárias/dias previstos, texto livre. Null = seção omitida. */
  quantidade_diarias: string | null;
  /** Equipe escalada, separada por vírgula. Null = seção omitida. */
  equipe_escalada: string | null;
  token: string;
  enviado_em: string | null;
  visualizado_em: string | null;
  visualizacoes_count: number;
  aprovado_em: string | null;
  aprovado_por_nome: string | null;
  /** CPF de quem aprovou, só dígitos (11) — coletado no próprio momento da aprovação, pra já vir pronto na hora de gerar o contrato. A assinatura desenhada na tela fica pra uma etapa futura. */
  aprovado_por_cpf: string | null;
  recusado_em: string | null;
  motivo_recusa: string | null;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrcItemRow {
  id: string;
  orcamento_id: string;
  servico_id: string | null;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valor_unitario: number;
  opcional: boolean;
  selecionado: boolean;
  ordem: number;
  created_at: string;
}

export type OrcamentoComRelacoes = OrcamentoRow & { cliente_nome: string | null; itens: OrcItemRow[] };

// ----------------------------------------------------------------------------
// Proposta Comercial Web v2 — Itens de Entrega (deliverables: o quê + prazo,
// diferente de `OrcItemRow` que é linha de PREÇO) e Colunas de Investimento
// (blocos descritivos ao lado do total, ver `supabase/orcamentos-proposta-completa.sql`).
// ----------------------------------------------------------------------------
export interface OrcItemEntregaRow {
  id: string;
  orcamento_id: string;
  item: string;
  prazo: string | null;
  ordem: number;
  created_at: string;
}

export interface OrcColunaInvestimentoRow {
  id: string;
  orcamento_id: string;
  titulo: string;
  /** Uma linha por item, texto puro (mesmo padrão de `clientesAtendidos`). */
  itens: string | null;
  ordem: number;
  created_at: string;
}

/**
 * Total de um orçamento — soma só os itens SELECIONADOS (obrigatórios
 * sempre entram; opcionais só se `selecionado = true`, é o mecanismo de
 * "personalização" do cliente no link público) e aplica o desconto por
 * cima. Mesma função usada no painel admin (preview) E na página pública
 * (recálculo ao vivo quando o cliente marca/desmarca um item) — um único
 * lugar de verdade pro cálculo, nunca duplicado entre servidor/cliente.
 */
export function calcularTotalOrcamento(
  itens: Pick<OrcItemRow, "quantidade" | "valor_unitario" | "opcional" | "selecionado">[],
  descontoTipo: DescontoTipo | null,
  descontoValor: number
): { subtotal: number; desconto: number; total: number } {
  const subtotal = itens.filter((i) => !i.opcional || i.selecionado).reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
  const desconto = !descontoTipo ? 0 : descontoTipo === "percentual" ? subtotal * (descontoValor / 100) : Math.min(descontoValor, subtotal);
  return { subtotal, desconto, total: Math.max(0, subtotal - desconto) };
}

export function calcularStatusExibicao(o: Pick<OrcamentoRow, "status" | "data_expiracao">): StatusOrcamento {
  const jaDecidido = o.status === "aprovado" || o.status === "recusado";
  if (jaDecidido || o.status === "rascunho") return o.status;
  const hoje = todayISO();
  if (o.data_expiracao && o.data_expiracao < hoje) return "expirado";
  return o.status;
}

// ----------------------------------------------------------------------------
// Fase 1 — Portfólio + Marca da agência (ver `supabase/orcamentos-portfolio-e-marca.sql`)
// ----------------------------------------------------------------------------
export type TipoMidiaPortfolio = "imagem" | "video";

export interface PortfolioItemRow {
  id: string;
  titulo: string;
  tipo_midia: TipoMidiaPortfolio;
  /** Path dentro do bucket "orcamentos-midia" — a URL pública é resolvida no data.ts, nunca gravada no banco. */
  path: string;
  categoria_profissao: string | null;
  ordem: number;
  created_at: string;
  updated_at: string;
}

/** Item de portfólio já com a URL pública resolvida (bucket público) — o que os componentes de fato usam pra `<img>`/`<video src>`. */
export type PortfolioItemComUrl = PortfolioItemRow & { url: string };

/** `companies.orc_logo_path`/`orc_banner_path`/`orc_rodape_path` já resolvidos pra URL pública — mesmo raciocínio de `PortfolioItemComUrl`. */
export interface MarcaOrcamentoComUrls {
  orcLogoUrl: string | null;
  orcBannerUrl: string | null;
  orcRodapeUrl: string | null;
}

// ----------------------------------------------------------------------------
// Fase 2 — Tipos de Orçamento por perfil (ver `supabase/orcamentos-tipos.sql`)
// ----------------------------------------------------------------------------
export interface OrcTipoOrcamentoRow {
  id: string;
  perfil: PerfilOrcamento;
  condicoes_pagamento_padrao: string | null;
  observacoes_padrao: string | null;
  validade_dias_padrao: number;
  created_at: string;
  updated_at: string;
}

export interface OrcTipoOrcamentoItemRow {
  id: string;
  tipo_orcamento_id: string;
  servico_id: string | null;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valor_unitario: number;
  opcional: boolean;
  ordem: number;
  created_at: string;
}

export type TipoOrcamentoComItens = OrcTipoOrcamentoRow & { itens: OrcTipoOrcamentoItemRow[] };

// ----------------------------------------------------------------------------
// PDF profissional de Orçamento (capa institucional + proposta) — ver
// `supabase/orcamentos-pdf-institucional.sql` e `src/lib/pdf/OrcamentoPdfDocument.tsx`.
// ----------------------------------------------------------------------------

/** Dados institucionais da empresa, já resolvidos (URLs públicas, lista de clientes já parseada) — o que `OrcamentoPdfDocument` de fato consome pra montar a capa. */
export interface DadosInstitucionaisOrcamento {
  /** Nome de MARCA (`companies.nome_app`, via `getNomeApp()`) — usado no "Muito prazer, somos a empresa X" da capa. */
  nomeMarca: string;
  /** Razão social real (`companies.nome`) — usado no rodapé jurídico da capa, nunca no lugar de `nomeMarca`. */
  nomeLegal: string | null;
  cpfCnpj: string | null;
  endereco: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  /** `companies.orc_rodape_path` já resolvido — banner de FECHAMENTO, exibido depois do portfólio/institucional (capa do PDF e página pública), nunca confundir com `bannerUrl` (topo). */
  rodapeUrl: string | null;
  textoInstitucional: string | null;
  /** `companies.orc_clientes_atendidos` já dividido por linha, com `trim()` e linhas vazias removidas. */
  clientesAtendidos: string[];
  /** `companies.orc_texto_encerramento` — mensagem de agradecimento/encerramento exibida no fim da proposta (depois do `rodapeUrl`), ex: "Foi um prazer te atender, esperamos ter sucesso juntos!". Padrão pra todos os orçamentos. Null = seção omitida. */
  textoEncerramento: string | null;
  /** `companies.orc_clientes_logos_paths` já resolvidos pra URL pública — sempre 6 posições, slot vazio = `null` (preserva a posição, ver `LogoClienteUploadField`). Complementa `clientesAtendidos` (texto) com imagens de fato; pra exibição (preview público), filtre os `null` antes de mapear. */
  clientesLogosUrls: (string | null)[];
  /** `companies.orc_logos_tamanho_px` — altura em pixels de exibição dos logos acima. */
  logosTamanhoPx: number;
  /** `companies.orc_email_comercial` — exibido no encerramento da proposta. Null = omitido. */
  emailComercial: string | null;
  /** `companies.orc_site_comercial` — exibido no encerramento da proposta. Null = omitido. */
  siteComercial: string | null;
}
