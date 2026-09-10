"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MetaDiariaRow, TrafegoRegistroRow } from "@/lib/types/database";
import type { ClienteRow } from "@/lib/types/cadastros";
import { calcularResumoTrafego, type StatusTrafego } from "@/lib/utils/trafego";
import { ClientesTrafegoTab } from "@/components/admin/trafego/ClientesTrafegoTab";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import { IconChevronLeft } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface Props {
  data: string;
  clientes: ClienteRow[];
  metaPorCliente: Record<string, MetaDiariaRow>;
  registrosPorMeta: Record<string, TrafegoRegistroRow[]>;
}

/**
 * O caminho de TRÁFEGO PARA LEADS.
 *
 * É o fluxo por cliente e por dia: meta de investimento, quanto já foi
 * gasto, quantos leads saíram e a que custo. Não há produto, order bump,
 * taxa de plataforma nem fechamento semanal aqui — nada disso existe numa
 * campanha de captação, e era justamente o entulho que atrapalhava quem só
 * queria acompanhar leads.
 *
 * O cadastro de cliente é o MESMO dos infoprodutos: o cliente que vende um
 * curso hoje pode estar captando lead amanhã, e obrigá-lo a existir duas
 * vezes só criaria dois nomes iguais para conciliar depois.
 */
export function TrafegoLeadsWorkspace({ data, clientes: clientesIniciais, metaPorCliente, registrosPorMeta }: Props) {
  const { dict } = useLocale();
  const [clientes, setClientes] = useState(clientesIniciais);

  // A contagem de status é derivada, nunca gravada — mesma conta que cada
  // card faz para si, feita uma vez aqui para o resumo do topo.
  const contagemStatus = useMemo(() => {
    const contagem: Record<StatusTrafego, number> = { sem_meta: 0, abaixo_da_meta: 0, no_caminho: 0, meta_batida: 0 };
    for (const cliente of clientes) {
      const meta = metaPorCliente[cliente.id] ?? null;
      const registros = meta ? (registrosPorMeta[meta.id] ?? []) : [];
      contagem[calcularResumoTrafego(meta, registros).status] += 1;
    }
    return contagem;
  }, [clientes, metaPorCliente, registrosPorMeta]);

  const csv = useMemo(
    () =>
      clientes.map((cliente) => {
        const meta = metaPorCliente[cliente.id] ?? null;
        const resumo = calcularResumoTrafego(meta, meta ? (registrosPorMeta[meta.id] ?? []) : []);
        return {
          cliente: cliente.nome,
          investido: resumo.totalInvestido.toFixed(2),
          metaInvestimento: (meta?.valor_investido_meta ?? 0).toFixed(2),
          leads: String(resumo.totalLeads),
          custoPorLead: resumo.custoPorLead != null ? resumo.custoPorLead.toFixed(2) : "",
        };
      }),
    [clientes, metaPorCliente, registrosPorMeta]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/trafego"
            className="mb-1 inline-flex items-center gap-1 text-xs text-ink-muted transition hover:text-ink-primary"
          >
            <IconChevronLeft className="h-3 w-3" /> {dict.trafego.trocarCaminho}
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">{dict.trafego.leadsTitulo}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{dict.trafego.leadsSubtitulo}</p>
        </div>
        <ExportMenuButton
          targetId="trafego-leads-export"
          nomeArquivo={`trafego-leads-${data}`}
          dadosCSV={csv}
          colunasCSV={[
            { chave: "cliente", rotulo: dict.trafego.csvColCliente },
            { chave: "investido", rotulo: dict.trafego.csvColInvestido },
            { chave: "metaInvestimento", rotulo: dict.trafego.csvColMetaInvestimento },
            { chave: "leads", rotulo: dict.trafego.csvColLeadsGerados },
            { chave: "custoPorLead", rotulo: dict.trafego.csvColCustoPorLead },
          ]}
        />
      </div>

      <div id="trafego-leads-export">
        <ClientesTrafegoTab
          data={data}
          clientes={clientes}
          metaPorCliente={metaPorCliente}
          registrosPorMeta={registrosPorMeta}
          contagemStatus={contagemStatus}
          onClienteCriado={(cliente) =>
            // Entra na lista sem recarregar a página: quem acabou de cadastrar
            // quer lançar a meta do dia dele agora, não depois de um F5.
            setClientes((atual) =>
              atual.some((c) => c.id === cliente.id) ? atual : [...atual, cliente as ClienteRow].sort((a, b) => a.nome.localeCompare(b.nome))
            )
          }
        />
      </div>
    </div>
  );
}
