import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { PortfolioItemRow, PortfolioItemComUrl, MarcaOrcamentoComUrls } from "@/lib/types/orcamentos";

const BUCKET = "orcamentos-midia";

type CompanyMarcaRow = {
  orc_logo_path: string | null;
  orc_banner_path: string | null;
  orc_rodape_path: string | null;
  orc_texto_institucional: string | null;
  orc_clientes_atendidos: string | null;
};

/** Textos institucionais crus (ainda não parseados/resolvidos) — o que a tela `/admin/orcamentos/portfolio` edita via `InstitucionalOrcamentoForm`. Ver `DadosInstitucionaisOrcamento` (`src/lib/types/orcamentos.ts`) pra versão já pronta pro PDF. */
export interface InstitucionalOrcamentoBruto {
  textoInstitucional: string | null;
  clientesAtendidos: string | null;
}

/**
 * Busca os itens de portfólio + a marca (logo/banner/rodapé) + o conteúdo
 * institucional (texto de apresentação, clientes atendidos) da empresa de
 * quem chama, já com URL pública resolvida — `companies` é lido via RLS
 * normal (`companies_select_own`, `id = current_company_id()`), não precisa
 * de Service Role pra LER (só pra escrever, ver `portfolio-actions.ts`).
 */
export async function buscarDadosPortfolio() {
  const { supabase } = await requireModuloOuRedirect("orcamentos");

  const [itensRes, companyRes] = await Promise.all([
    supabase
      .from("orc_portfolio_itens")
      .select("*")
      .order("ordem")
      .order("created_at", { ascending: false })
      .overrideTypes<PortfolioItemRow[], { merge: false }>(),
    supabase
      .from("companies")
      .select("orc_logo_path, orc_banner_path, orc_rodape_path, orc_texto_institucional, orc_clientes_atendidos")
      .single<CompanyMarcaRow>(),
  ]);

  const itens: PortfolioItemComUrl[] = (itensRes.data ?? []).map((item) => ({
    ...item,
    url: supabase.storage.from(BUCKET).getPublicUrl(item.path).data.publicUrl,
  }));

  const empresa = companyRes.data;
  const marca: MarcaOrcamentoComUrls = {
    orcLogoUrl: empresa?.orc_logo_path ? supabase.storage.from(BUCKET).getPublicUrl(empresa.orc_logo_path).data.publicUrl : null,
    orcBannerUrl: empresa?.orc_banner_path ? supabase.storage.from(BUCKET).getPublicUrl(empresa.orc_banner_path).data.publicUrl : null,
    orcRodapeUrl: empresa?.orc_rodape_path ? supabase.storage.from(BUCKET).getPublicUrl(empresa.orc_rodape_path).data.publicUrl : null,
  };
  const institucional: InstitucionalOrcamentoBruto = {
    textoInstitucional: empresa?.orc_texto_institucional ?? null,
    clientesAtendidos: empresa?.orc_clientes_atendidos ?? null,
  };

  return { itens, marca, institucional };
}
