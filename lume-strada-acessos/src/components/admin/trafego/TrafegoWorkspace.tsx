"use client";

import { useState } from "react";
import type { MetaDiariaRow, ProfileRow, TrafegoRegistroRow } from "@/lib/types/database";
import type { AnuncioComRelacoes, FechamentoSemanalRow, MetaCalendarioRow, ProdutoRow } from "@/lib/types/infoprodutos";
import type { StatusTrafego } from "@/lib/utils/trafego";
import { cn } from "@/lib/utils/cn";
import { ClientesTrafegoTab } from "@/components/admin/trafego/ClientesTrafegoTab";
import { InfoProdutosWorkspace } from "@/components/admin/trafego/infoprodutos/InfoProdutosWorkspace";
import { IconUsers, IconBarChart2 } from "@/components/ui/icons";

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
  const [aba, setAba] = useState<Aba>("clientes");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Tráfego & Metas</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Tráfego por cliente e o tracking de anúncios dos seus próprios infoprodutos.</p>
      </div>

      <div className="flex gap-1.5 border-b border-base-800">
        <button
          onClick={() => setAba("clientes")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition",
            aba === "clientes" ? "border-accent text-ink-primary" : "border-transparent text-ink-muted hover:text-ink-secondary"
          )}
        >
          <IconUsers className="h-4 w-4" /> Clientes
        </button>
        <button
          onClick={() => setAba("info_produtos")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition",
            aba === "info_produtos" ? "border-accent text-ink-primary" : "border-transparent text-ink-muted hover:text-ink-secondary"
          )}
        >
          <IconBarChart2 className="h-4 w-4" /> Info-Produtos
        </button>
      </div>

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
  );
}
