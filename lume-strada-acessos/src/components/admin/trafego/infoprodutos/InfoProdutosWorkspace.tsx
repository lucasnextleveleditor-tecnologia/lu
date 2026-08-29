"use client";

import { useMemo, useState } from "react";
import type { AnuncioComRelacoes, FechamentoSemanalRow, MetaCalendarioRow, ProdutoRow } from "@/lib/types/infoprodutos";
import type { ClienteRow } from "@/lib/types/cadastros";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Dashboard7Dias } from "@/components/admin/trafego/infoprodutos/Dashboard7Dias";
import { AnunciosManager } from "@/components/admin/trafego/infoprodutos/AnunciosManager";
import { CalendarioMetas } from "@/components/admin/trafego/infoprodutos/CalendarioMetas";
import { ProdutosManager } from "@/components/admin/trafego/infoprodutos/ProdutosManager";
import { IconBarChart2, IconFilm, IconCalendar, IconTag, IconUsers } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface InfoProdutosWorkspaceProps {
  clientes: ClienteRow[];
  produtos: ProdutoRow[];
  anuncios: AnuncioComRelacoes[];
  metasCalendario: MetaCalendarioRow[];
  fechamentos: FechamentoSemanalRow[];
}

// Ordem pensada pro fluxo natural de preenchimento: primeiro cadastra o
// produto (o que está sendo vendido), depois lança os anúncios do dia (que
// referenciam esses produtos), depois define as metas de lucro no
// calendário, e só então a Visão Geral faz sentido (ela agrega os outros
// três). Antes a ordem era Visão Geral -> Anúncios -> Calendário -> Produtos,
// o que obrigava a olhar um resumo vazio antes de ter cadastrado qualquer coisa.
type SubAba = "produtos" | "anuncios" | "calendario" | "visao_geral";

/**
 * Tracking de anúncios dos infoprodutos — SEPARADO POR CLIENTE (ver migração
 * `infoprodutos_por_cliente_e_trafego_tipo_resultado`): cada cliente tem seu
 * próprio espaço completo de produtos/anúncios/calendário/fechamentos, nunca
 * misturado com o de outro cliente. O seletor abaixo troca qual cliente está
 * sendo visualizado; os dados das 4 sub-abas são sempre filtrados pra esse
 * cliente só. Lucro Líquido é sempre (Receita Bruta - Investimento) -
 * Reembolsos, nunca faturamento bruto.
 */
export function InfoProdutosWorkspace({ clientes, produtos, anuncios, metasCalendario, fechamentos }: InfoProdutosWorkspaceProps) {
  const { dict } = useLocale();
  const [subAba, setSubAba] = useState<SubAba>("produtos");
  const [clienteId, setClienteId] = useState<string>(clientes[0]?.id ?? "");

  const SUB_ABAS: { chave: SubAba; label: string; icon: typeof IconBarChart2 }[] = [
    { chave: "produtos", label: dict.trafego.produtosAba, icon: IconTag },
    { chave: "anuncios", label: dict.trafego.anunciosAba, icon: IconFilm },
    { chave: "calendario", label: dict.trafego.calendarioMetasAba, icon: IconCalendar },
    { chave: "visao_geral", label: dict.trafego.visaoGeralAba, icon: IconBarChart2 },
  ];

  // Cada uma das 4 tabelas guarda `cliente_cadastro_id` — filtra em memória
  // pro cliente selecionado (mesmo espírito de "busca tudo de uma vez,
  // agrupa em memória" já usado no resto do módulo, ver `page.tsx`).
  const produtosDoCliente = useMemo(() => produtos.filter((p) => p.cliente_cadastro_id === clienteId), [produtos, clienteId]);
  const anunciosDoCliente = useMemo(() => anuncios.filter((a) => a.cliente_cadastro_id === clienteId), [anuncios, clienteId]);
  const metasCalendarioDoCliente = useMemo(
    () => metasCalendario.filter((m) => m.cliente_cadastro_id === clienteId),
    [metasCalendario, clienteId]
  );
  const fechamentosDoCliente = useMemo(() => fechamentos.filter((f) => f.cliente_cadastro_id === clienteId), [fechamentos, clienteId]);

  if (clientes.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-14 text-center">
        <IconUsers className="h-6 w-6 text-ink-muted" />
        <p className="text-sm text-ink-muted">{dict.trafego.nenhumClienteParaInfoprodutos}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-base-800 bg-base-900/50 p-3">
        <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink-secondary">
          <IconUsers className="h-3.5 w-3.5" /> {dict.trafego.infoProdutosClienteLabel}
        </label>
        <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="max-w-xs">
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>
      </div>

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

      {/* `key={clienteId}` força um remount limpo de cada sub-aba ao trocar
          de cliente — evita que estado local (dia selecionado, modal aberto,
          confirmação de exclusão pendente) vaze de um cliente pro outro. */}
      {subAba === "produtos" && <ProdutosManager key={clienteId} produtos={produtosDoCliente} clienteCadastroId={clienteId} />}
      {subAba === "anuncios" && (
        <AnunciosManager key={clienteId} anuncios={anunciosDoCliente} produtos={produtosDoCliente} clienteCadastroId={clienteId} />
      )}
      {subAba === "calendario" && <CalendarioMetas key={clienteId} metasCalendario={metasCalendarioDoCliente} clienteCadastroId={clienteId} />}
      {subAba === "visao_geral" && (
        <Dashboard7Dias
          key={clienteId}
          anuncios={anunciosDoCliente}
          metasCalendario={metasCalendarioDoCliente}
          fechamentos={fechamentosDoCliente}
          clienteCadastroId={clienteId}
        />
      )}
    </div>
  );
}
