import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { calcularStatusExibicao, calcularTotalOrcamento } from "@/lib/types/orcamentos";
import type { OrcamentoRow, OrcItemRow, PortfolioItemRow, PortfolioItemComUrl, DadosInstitucionaisOrcamento } from "@/lib/types/orcamentos";

const BUCKET_ORCAMENTOS_MIDIA = "orcamentos-midia";

interface EmpresaPublicaRow {
  nome: string | null;
  nome_app: string | null;
  cpf_cnpj: string | null;
  endereco: string | null;
  orc_logo_path: string | null;
  orc_banner_path: string | null;
  orc_rodape_path: string | null;
  orc_texto_institucional: string | null;
  orc_clientes_atendidos: string | null;
}

/**
 * Mesma montagem de `buscarDadosInstitucionaisEmpresa` (`admin/orcamentos/data.ts`),
 * mas via Service Role — a página pública não tem sessão/RLS pra filtrar
 * "a própria empresa", então a empresa já vem junto do `select` por token
 * (ver `buscarOrcamentoPublicoPorToken` abaixo) e só passa por aqui pra
 * resolver as URLs públicas e parsear a lista de clientes atendidos.
 */
function montarInstitucional(admin: ReturnType<typeof createAdminClient>, empresa: EmpresaPublicaRow | null): DadosInstitucionaisOrcamento {
  const clientesAtendidos = (empresa?.orc_clientes_atendidos ?? "")
    .split("\n")
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0);

  return {
    nomeMarca: empresa?.nome_app?.trim() || empresa?.nome?.trim() || "",
    nomeLegal: empresa?.nome?.trim() || null,
    cpfCnpj: empresa?.cpf_cnpj || null,
    endereco: empresa?.endereco || null,
    logoUrl: empresa?.orc_logo_path ? admin.storage.from(BUCKET_ORCAMENTOS_MIDIA).getPublicUrl(empresa.orc_logo_path).data.publicUrl : null,
    bannerUrl: empresa?.orc_banner_path ? admin.storage.from(BUCKET_ORCAMENTOS_MIDIA).getPublicUrl(empresa.orc_banner_path).data.publicUrl : null,
    rodapeUrl: empresa?.orc_rodape_path ? admin.storage.from(BUCKET_ORCAMENTOS_MIDIA).getPublicUrl(empresa.orc_rodape_path).data.publicUrl : null,
    textoInstitucional: empresa?.orc_texto_institucional || null,
    clientesAtendidos,
  };
}

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
    .select(
      "*, companies(nome, nome_app, cpf_cnpj, endereco, orc_logo_path, orc_banner_path, orc_rodape_path, orc_texto_institucional, orc_clientes_atendidos)"
    )
    .eq("token", token)
    .single<OrcamentoRow & { companies: EmpresaPublicaRow | null }>();
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

  // Itens de Portfólio anexados (Fase 2) — exibidos como "Nossos Trabalhos"
  // pro cliente. Via Service Role, igual o resto desta função (não existe
  // sessão/RLS aqui — só o token na URL).
  const { data: portfolioLinks } = await admin
    .from("orc_orcamento_portfolio")
    .select("ordem, orc_portfolio_itens(*)")
    .eq("orcamento_id", orcamento.id)
    .order("ordem")
    .overrideTypes<{ ordem: number; orc_portfolio_itens: PortfolioItemRow | null }[], { merge: false }>();

  const portfolio: PortfolioItemComUrl[] = (portfolioLinks ?? [])
    .map((link) => link.orc_portfolio_itens)
    .filter((item): item is PortfolioItemRow => !!item)
    .map((item) => ({ ...item, url: admin.storage.from(BUCKET_ORCAMENTOS_MIDIA).getPublicUrl(item.path).data.publicUrl }));

  return {
    ...orcamento,
    empresaNome: orcamento.companies?.nome ?? null,
    institucional: montarInstitucional(admin, orcamento.companies),
    itens: itens ?? [],
    subtotal,
    desconto,
    total,
    statusExibicao,
    podeInteragir,
    portfolio,
  };
}
