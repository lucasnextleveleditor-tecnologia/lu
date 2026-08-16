"use client";

import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { cn } from "@/lib/utils/cn";
import { todayISO, addDaysISO } from "@/lib/utils/format";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import {
  buscarRelatorioComercial,
  buscarRelatorioFinanceiro,
  buscarRelatorioInventario,
  buscarRelatorioProducao,
  buscarRelatorioTrafego,
} from "@/app/admin/relatorios/actions";
import type {
  RelatorioComercialData,
  RelatorioFinanceiroData,
  RelatorioInventarioData,
  RelatorioProducaoData,
  RelatorioTrafegoData,
} from "@/lib/types/relatorios";
import { ComercialReport } from "@/components/admin/relatorios/ComercialReport";
import { FinanceiroReport } from "@/components/admin/relatorios/FinanceiroReport";
import { ProducaoReport } from "@/components/admin/relatorios/ProducaoReport";
import { TrafegoReport } from "@/components/admin/relatorios/TrafegoReport";
import { InventarioReport } from "@/components/admin/relatorios/InventarioReport";
import { IconTarget, IconWallet, IconColumns, IconActivity, IconBox } from "@/components/ui/icons";

export type ChaveRelatorio = "comercial" | "financeiro" | "producao" | "trafego" | "inventario";

export interface ModuloRelatorio {
  chave: ChaveRelatorio;
  label: string;
  hint: string;
}

const META_MODULO: Record<ChaveRelatorio, { icon: ComponentType<SVGProps<SVGSVGElement>> }> = {
  comercial: { icon: IconTarget },
  financeiro: { icon: IconWallet },
  producao: { icon: IconColumns },
  trafego: { icon: IconActivity },
  inventario: { icon: IconBox },
};

interface EstadoModulo<T> {
  data: T | null;
  carregando: boolean;
  erro: string | null;
}

const ESTADO_INICIAL = { data: null, carregando: true, erro: null };

interface RelatoriosHubProps {
  /** Já filtrado no servidor pela permissão de cada módulo (`role === 'admin' || permissoes[chave]`) — o client só decide O QUE MOSTRAR entre esses, nunca refaz a checagem de acesso (isso é sempre reforçado de novo dentro de cada Server Action, ver `requireModulo`). */
  modulosPermitidos: ModuloRelatorio[];
}

/**
 * Hub de Business Intelligence — abas por módulo + um seletor de período
 * GLOBAL no topo (`DateRangePicker`) que filtra todos os gráficos de uma
 * vez (exceto Inventário, que é sempre uma foto do agora, não um intervalo
 * — ver comentário na Server Action). Cada aba busca seus próprios dados
 * via Server Action só quando é aberta pela primeira vez ou quando o
 * período muda — não busca os 5 módulos de uma vez (a maioria dos
 * funcionários só tem permissão pra 1-2 módulos mesmo, e cada relatório já
 * é uma query relativamente pesada).
 */
export function RelatoriosHub({ modulosPermitidos }: RelatoriosHubProps) {
  const [abaAtiva, setAbaAtiva] = useState<ChaveRelatorio | null>(modulosPermitidos[0]?.chave ?? null);
  const [dataInicio, setDataInicio] = useState(() => addDaysISO(todayISO(), -29));
  const [dataFim, setDataFim] = useState(() => todayISO());

  const [comercial, setComercial] = useState<EstadoModulo<RelatorioComercialData>>(ESTADO_INICIAL);
  const [financeiro, setFinanceiro] = useState<EstadoModulo<RelatorioFinanceiroData>>(ESTADO_INICIAL);
  const [producao, setProducao] = useState<EstadoModulo<RelatorioProducaoData>>(ESTADO_INICIAL);
  const [trafego, setTrafego] = useState<EstadoModulo<RelatorioTrafegoData>>(ESTADO_INICIAL);
  const [inventario, setInventario] = useState<EstadoModulo<RelatorioInventarioData>>(ESTADO_INICIAL);

  useEffect(() => {
    if (!abaAtiva) return;

    let cancelado = false;

    async function carregar() {
      if (abaAtiva === "comercial") {
        setComercial((s) => ({ ...s, carregando: true, erro: null }));
        const r = await buscarRelatorioComercial(dataInicio, dataFim);
        if (cancelado) return;
        setComercial(r.ok ? { data: r.data, carregando: false, erro: null } : { data: null, carregando: false, erro: r.error });
      } else if (abaAtiva === "financeiro") {
        setFinanceiro((s) => ({ ...s, carregando: true, erro: null }));
        const r = await buscarRelatorioFinanceiro(dataInicio, dataFim);
        if (cancelado) return;
        setFinanceiro(r.ok ? { data: r.data, carregando: false, erro: null } : { data: null, carregando: false, erro: r.error });
      } else if (abaAtiva === "producao") {
        setProducao((s) => ({ ...s, carregando: true, erro: null }));
        const r = await buscarRelatorioProducao(dataInicio, dataFim);
        if (cancelado) return;
        setProducao(r.ok ? { data: r.data, carregando: false, erro: null } : { data: null, carregando: false, erro: r.error });
      } else if (abaAtiva === "trafego") {
        setTrafego((s) => ({ ...s, carregando: true, erro: null }));
        const r = await buscarRelatorioTrafego(dataInicio, dataFim);
        if (cancelado) return;
        setTrafego(r.ok ? { data: r.data, carregando: false, erro: null } : { data: null, carregando: false, erro: r.error });
      } else if (abaAtiva === "inventario") {
        setInventario((s) => ({ ...s, carregando: true, erro: null }));
        const r = await buscarRelatorioInventario();
        if (cancelado) return;
        setInventario(r.ok ? { data: r.data, carregando: false, erro: null } : { data: null, carregando: false, erro: r.error });
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
    // Inventário não depende de `dataInicio`/`dataFim` de propósito (ver
    // comentário na Server Action) — mas ainda reage à troca de aba.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abaAtiva, dataInicio, dataFim]);

  if (modulosPermitidos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-base-700 p-10 text-center text-sm text-ink-muted">
        Nenhum relatório liberado pro seu usuário ainda — fale com o administrador pra ajustar em Cadastros → Equipe.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <DateRangePicker
        inicio={dataInicio}
        fim={dataFim}
        onChange={(i, f) => {
          setDataInicio(i);
          setDataFim(f);
        }}
      />

      <div className="flex flex-wrap gap-1.5 border-b border-base-800">
        {modulosPermitidos.map((m) => {
          const Icon = META_MODULO[m.chave].icon;
          const ativo = abaAtiva === m.chave;
          return (
            <button
              key={m.chave}
              type="button"
              onClick={() => setAbaAtiva(m.chave)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition",
                ativo ? "border-accent text-ink-primary" : "border-transparent text-ink-muted hover:text-ink-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              {m.label}
            </button>
          );
        })}
      </div>

      {abaAtiva === "comercial" && <ComercialReport data={comercial.data} carregando={comercial.carregando} erro={comercial.erro} />}
      {abaAtiva === "financeiro" && <FinanceiroReport data={financeiro.data} carregando={financeiro.carregando} erro={financeiro.erro} />}
      {abaAtiva === "producao" && <ProducaoReport data={producao.data} carregando={producao.carregando} erro={producao.erro} />}
      {abaAtiva === "trafego" && <TrafegoReport data={trafego.data} carregando={trafego.carregando} erro={trafego.erro} />}
      {abaAtiva === "inventario" && <InventarioReport data={inventario.data} carregando={inventario.carregando} erro={inventario.erro} />}
    </div>
  );
}
