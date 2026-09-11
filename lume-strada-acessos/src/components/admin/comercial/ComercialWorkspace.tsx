"use client";

import { useState, type ComponentType } from "react";
import type { AnotacaoRow, LeadComRelacoes } from "@/lib/types/comercial";
import type { TipoServicoRow } from "@/lib/types/producao";
import { IconRotateCcw, IconColumns, IconList, IconPlus } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";
import { cn } from "@/lib/utils/cn";
import { LeadKanbanBoard } from "@/components/admin/comercial/LeadKanbanBoard";
import { ListaLeads } from "@/components/admin/comercial/ListaLeads";
import { LeadModal } from "@/components/admin/comercial/LeadModal";
import { LeadDetalheModal } from "@/components/admin/comercial/LeadDetalheModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ComercialDict } from "@/lib/i18n/dictionaries/pt/comercial";

type Visao = "kanban" | "lista" | "perdidos";

interface ComercialWorkspaceProps {
  leads: LeadComRelacoes[];
  anotacoesPorLead: Record<string, AnotacaoRow[]>;
  tiposServico: TipoServicoRow[];
  equipe: { id: string; nome: string }[];
}

function etapaLabel(dict: ComercialDict, status: LeadComRelacoes["status"]): string {
  const MAPA: Record<LeadComRelacoes["status"], string> = {
    lead_frio: dict.etapaLeadFrio,
    contato_inicial: dict.etapaContatoInicial,
    reuniao_realizada: dict.etapaReuniaoRealizada,
    proposta_enviada: dict.etapaPropostaEnviada,
    negociacao: dict.etapaNegociacao,
    fechado_ganha: dict.etapaFechadoGanha,
    perdido: dict.etapaPerdido,
  };
  return MAPA[status];
}

function buildVisoes(dict: ComercialDict): { value: Visao; label: string; icon: ComponentType<{ className?: string }> }[] {
  return [
    { value: "kanban", label: dict.visaoFunil, icon: IconColumns },
    { value: "lista", label: dict.visaoLista, icon: IconList },
    // Perdidos fora do funil: a coluna "Perdido" no Kanban cresce para sempre
    // e vira lixo visual entre as etapas que ainda podem virar dinheiro.
    { value: "perdidos", label: dict.visaoPerdidos, icon: IconRotateCcw },
  ];
}

export function ComercialWorkspace({ leads, anotacoesPorLead, tiposServico, equipe }: ComercialWorkspaceProps) {
  const { dict } = useLocale();
  const [visao, setVisao] = useState<Visao>("kanban");
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [leadDetalheId, setLeadDetalheId] = useState<string | null>(null);

  const leadDetalhe = leads.find((l) => l.id === leadDetalheId) ?? null;
  const VISOES = buildVisoes(dict.comercial);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-base-700 bg-base-900/60 p-1">
          {VISOES.map((v) => (
            <button
              key={v.value}
              onClick={() => setVisao(v.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                visao === v.value ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
              )}
            >
              <v.icon className="h-3.5 w-3.5" />
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ExportMenuButton
            targetId="comercial-export-area"
            nomeArquivo="comercial-leads"
            dadosCSV={leads.map((l) => ({
              nome: l.nome,
              status: etapaLabel(dict.comercial, l.status),
              origem: l.origem ?? "",
              valorEstimado: (l.valor_estimado ?? 0).toFixed(2),
              proximoContato: l.proximo_contato_em ?? "",
              criadoEm: l.created_at.slice(0, 10),
            }))}
            colunasCSV={[
              { chave: "nome", rotulo: dict.common.nome },
              { chave: "status", rotulo: dict.comercial.colEtapaFunil },
              { chave: "origem", rotulo: dict.comercial.origem },
              { chave: "valorEstimado", rotulo: dict.comercial.valorEstimadoLabel },
              { chave: "proximoContato", rotulo: dict.comercial.colProximoContatoCsv },
              { chave: "criadoEm", rotulo: dict.comercial.colCriadoEm },
            ]}
          />
          <Button onClick={() => setModalNovoAberto(true)}>
            <IconPlus className="h-4 w-4" />
            {dict.comercial.novoLead}
          </Button>
        </div>
      </div>

      <div id="comercial-export-area">
        {/* O funil e a lista deixam de mostrar os perdidos: eles têm visão
            própria agora, e mantê-los nas duas seria contar o mesmo lead duas
            vezes em telas que servem para medir o que ainda está de pé. */}
        {visao === "kanban" && <LeadKanbanBoard leads={leads.filter((l) => l.status !== "perdido")} onAbrirLead={setLeadDetalheId} />}
        {visao === "lista" && <ListaLeads leads={leads.filter((l) => l.status !== "perdido")} onAbrirLead={setLeadDetalheId} />}
        {visao === "perdidos" && <ListaLeads leads={leads.filter((l) => l.status === "perdido")} onAbrirLead={setLeadDetalheId} />}
      </div>

      {modalNovoAberto && <LeadModal tiposServico={tiposServico} onClose={() => setModalNovoAberto(false)} />}

      {leadDetalhe && (
        <LeadDetalheModal
          lead={leadDetalhe}
          anotacoes={anotacoesPorLead[leadDetalhe.id] ?? []}
          tiposServico={tiposServico}
          equipe={equipe}
          onClose={() => setLeadDetalheId(null)}
        />
      )}
    </div>
  );
}
