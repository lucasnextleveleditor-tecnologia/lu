"use client";

import { useState } from "react";
import type { MetaDiariaRow, ProfileRow, TrafegoRegistroRow } from "@/lib/types/database";
import type { AnuncioComRelacoes, FechamentoSemanalRow, MetaCalendarioRow, ProdutoRow } from "@/lib/types/infoprodutos";
import type { StatusTrafego } from "@/lib/utils/trafego";
import { cn } from "@/lib/utils/cn";
import { ClientesTrafegoTab } from "@/components/admin/trafego/ClientesTrafegoTab";
import { InfoProdutosWorkspace } from "@/components/admin/trafego/infoprodutos/InfoProdutosWorkspace";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import { IconUsers, IconBarChart2 } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type ClienteResumido = Pick<ProfileRow, "id" | "full_name" | "email">;

interface TrafegoWorkspaceProps {
  data: string;
  clientes: ClienteResumido[];
  metaPorCliente: Record<string, MetaDiariaRow>;
  registrosPorMeta: Record<string, TrafegoRegistroRow[]>;
  contagemStatus: Record<StatusTrafego, number>;
  produtos: ProdutoRow[];
  anuncios: AnuncioComRelacoes[];
  metasCalendario: MetaCalendarioRow[];
  fechamentos: FechamentoSemanalRow[];
}

type Aba = "clientes" | "info_produtos";

/**
 * Duas abas dentro do mesmo módulo Tráfego & Metas: "Clientes" (fluxo já
 * existente, intocado) e "Info-Produtos" (novo — tracking de anúncios dos
 * próprios produtos digitais da agência, com calendário de metas de lucro
 * líquido e fechamento semanal com reembolsos).
 */
export function TrafegoWorkspace(props: TrafegoWorkspaceProps) {
  const { dict } = useLocale();
  const [aba, setAba] = useState<Aba>("clientes");

  // CSV muda de forma conforme a aba ativa — cada uma tem colunas bem
  // diferentes (cliente x anúncio), então não faz sentido um formato só.
  const csvClientes = props.clientes.map((c) => {
    const meta = props.metaPorCliente[c.id];
    const registros = meta ? (props.registrosPorMeta[meta.id] ?? []) : [];
    return {
      cliente: c.full_name || c.email,
      investido: registros.reduce((s, r) => s + r.valor_investido, 0).toFixed(2),
      leadsGerados: registros.reduce((s, r) => s + r.leads_gerados, 0),
      metaInvestimento: (meta?.valor_investido_meta ?? 0).toFixed(2),
    };
  });
  const csvAnuncios = props.anuncios.map((a) => ({
    data: a.data,
    anuncio: a.nome_anuncio ?? "",
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
        {aba === "clientes" ? (
          <ExportMenuButton
            targetId="trafego-export-area"
            nomeArquivo={`trafego-clientes-${props.data}`}
            dadosCSV={csvClientes}
            colunasCSV={[
              { chave: "cliente", rotulo: dict.trafego.csvColCliente },
              { chave: "investido", rotulo: dict.trafego.csvColInvestido },
              { chave: "leadsGerados", rotulo: dict.trafego.csvColLeadsGerados },
              { chave: "metaInvestimento", rotulo: dict.trafego.csvColMetaInvestimento },
            ]}
          />
        ) : (
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
        )}
      </div>

      <div className="flex gap-1.5 border-b border-base-800">
        <button
          onClick={() => setAba("clientes")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition",
            aba === "clientes" ? "border-accent text-ink-primary" : "border-transparent text-ink-muted hover:text-ink-secondary"
          )}
        >
          <IconUsers className="h-4 w-4" /> {dict.trafego.abaClientes}
        </button>
        <button
          onClick={() => setAba("info_produtos")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition",
            aba === "info_produtos" ? "border-accent text-ink-primary" : "border-transparent text-ink-muted hover:text-ink-secondary"
          )}
        >
          <IconBarChart2 className="h-4 w-4" /> {dict.trafego.abaInfoProdutos}
        </button>
      </div>

      <div id="trafego-export-area">
        {aba === "clientes" ? (
          <ClientesTrafegoTab
            data={props.data}
            clientes={props.clientes}
            metaPorCliente={props.metaPorCliente}
            registrosPorMeta={props.registrosPorMeta}
            contagemStatus={props.contagemStatus}
          />
        ) : (
          <InfoProdutosWorkspace
            produtos={props.produtos}
            anuncios={props.anuncios}
            metasCalendario={props.metasCalendario}
            fechamentos={props.fechamentos}
          />
        )}
      </div>
    </div>
  );
}
