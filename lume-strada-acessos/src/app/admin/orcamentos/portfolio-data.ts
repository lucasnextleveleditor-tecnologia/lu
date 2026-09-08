import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { PortfolioItemRow, PortfolioItemComUrl } from "@/lib/types/orcamentos";

const BUCKET = "orcamentos-midia";

/**
 * Busca só os itens de portfólio (fotos/vídeos reutilizáveis entre vários
 * orçamentos) já com URL pública resolvida. Marca da agência (logo/banner/
 * rodapé) e conteúdo institucional (texto de apresentação, clientes
 * atendidos, mensagem de encerramento) NÃO vivem mais aqui — foram pro
 * construtor de orçamento (`MarcaApresentacaoCard.tsx`, ver
 * `buscarDadosInstitucionaisEmpresa` em `admin/orcamentos/data.ts`), pra
 * ficar tudo na mesma tela onde o orçamento é montado.
 */
export async function buscarDadosPortfolio() {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const { data } = await supabase
    .from("orc_portfolio_itens")
    .select("*")
    .order("ordem")
    .order("created_at", { ascending: false })
    .overrideTypes<PortfolioItemRow[], { merge: false }>();

  const itens: PortfolioItemComUrl[] = (data ?? []).map((item) => ({
    ...item,
    url: supabase.storage.from(BUCKET).getPublicUrl(item.path).data.publicUrl,
  }));

  return { itens };
}
