"use client";

import { useState } from "react";
import type { AnuncioComRelacoes, FechamentoSemanalRow, MetaCalendarioRow, ProdutoRow } from "@/lib/types/infoprodutos";
import { cn } from "@/lib/utils/cn";
import { Dashboard7Dias } from "@/components/admin/trafego/infoprodutos/Dashboard7Dias";
import { AnunciosManager } from "@/components/admin/trafego/infoprodutos/AnunciosManager";
import { CalendarioMetas } from "@/components/admin/trafego/infoprodutos/CalendarioMetas";
import { ProdutosManager } from "@/components/admin/trafego/infoprodutos/ProdutosManager";
import { IconBarChart2, IconFilm, IconCalendar, IconTag } from "@/components/ui/icons";

interface InfoProdutosWorkspaceProps {
  produtos: ProdutoRow[];
  anuncios: AnuncioComRelacoes[];
  metasCalendario: MetaCalendarioRow[];
  fechamentos: FechamentoSemanalRow[];
}

type SubAba = "visao_geral" | "anuncios" | "calendario" | "produtos";

const SUB_ABAS: { chave: SubAba; label: string; icon: typeof IconBarChart2 }[] = [
  { chave: "visao_geral", label: "Visão Geral", icon: IconBarChart2 },
  { chave: "anuncios", label: "Anúncios", icon: IconFilm },
  { chave: "calendario", label: "Calendário de Metas", icon: IconCalendar },
  { chave: "produtos", label: "Produtos", icon: IconTag },
];

/** Tracking de anúncios dos infoprodutos da própria agência — Lucro Líquido é sempre (Receita Bruta - Investimento) - Reembolsos, nunca faturamento bruto. */
export function InfoProdutosWorkspace({ produtos, anuncios, metasCalendario, fechamentos }: InfoProdutosWorkspaceProps) {
  const [subAba, setSubAba] = useState<SubAba>("visao_geral");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-base-800 bg-base-900/50 p-1.5">
        {SUB_ABAS.map(({ chave, label, icon: Icon }) => (
          <button
            key={chave}
            onClick={() => setSubAba(chave)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition",
              subAba === chave ? "bg-accent text-base-950" : "text-ink-muted hover:bg-base-800 hover:text-ink-secondary"
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {subAba === "visao_geral" && <Dashboard7Dias anuncios={anuncios} metasCalendario={metasCalendario} fechamentos={fechamentos} />}
      {subAba === "anuncios" && <AnunciosManager anuncios={anuncios} produtos={produtos} />}
      {subAba === "calendario" && <CalendarioMetas metasCalendario={metasCalendario} />}
      {subAba === "produtos" && <ProdutosManager produtos={produtos} />}
    </div>
  );
}
