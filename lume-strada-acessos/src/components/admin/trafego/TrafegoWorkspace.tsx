"use client";

import type { ClienteRow } from "@/lib/types/cadastros";
import type { AnuncioComRelacoes, CriativoRow, FechamentoSemanalRow, MetaCalendarioRow, ProdutoRow, TaxaPadraoRow } from "@/lib/types/infoprodutos";
import { InfoProdutosWorkspace } from "@/components/admin/trafego/infoprodutos/InfoProdutosWorkspace";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface TrafegoWorkspaceProps {
  clientes: ClienteRow[];
  produtos: ProdutoRow[];
  criativos: CriativoRow[];
  anuncios: AnuncioComRelacoes[];
  metasCalendario: MetaCalendarioRow[];
  fechamentos: FechamentoSemanalRow[];
  taxasPadrao: TaxaPadraoRow[];
}

/**
 * Módulo Tráfego & Metas — só o tracking de anúncios dos próprios produtos
 * digitais da agência (Info-Produtos), com calendário de metas de lucro
 * líquido e fechamento semanal com reembolsos. A antiga aba "Clientes"
 * (Meta do Dia por cliente) foi retirada daqui (ver comentário em
 * `page.tsx`) — sobrou só essa tela, então não existe mais seletor de aba.
 */
export function TrafegoWorkspace(props: TrafegoWorkspaceProps) {
  const { dict } = useLocale();

  const csvAnuncios = props.anuncios.map((a) => ({
    data: a.data,
    anuncio: a.criativo_nome ?? a.nome_anuncio ?? "",
    investimento: a.investimento.toFixed(2),
    receitaBruta: a.receita_bruta.toFixed(2),
    vendas: a.vendas_principal + a.vendas_order_bump,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{dict.trafego.tituloPagina}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{dict.trafego.subtituloPagina}</p>
        </div>
        <ExportMenuButton
          targetId="trafego-export-area"
          nomeArquivo="trafego-infoprodutos"
          dadosCSV={csvAnuncios}
          colunasCSV={[
            { chave: "data", rotulo: dict.common.data },
            { chave: "anuncio", rotulo: dict.trafego.csvColAnuncio },
            { chave: "investimento", rotulo: dict.trafego.csvColInvestimento },
            { chave: "receitaBruta", rotulo: dict.trafego.csvColReceitaBruta },
            { chave: "vendas", rotulo: dict.trafego.csvColVendas },
          ]}
        />
      </div>

      <div id="trafego-export-area">
        <InfoProdutosWorkspace
          clientes={props.clientes}
          produtos={props.produtos}
          criativos={props.criativos}
          anuncios={props.anuncios}
          metasCalendario={props.metasCalendario}
          fechamentos={props.fechamentos}
          taxasPadrao={props.taxasPadrao}
        />
      </div>
    </div>
  );
}
