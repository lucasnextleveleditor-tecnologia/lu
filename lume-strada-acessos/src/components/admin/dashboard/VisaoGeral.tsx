import type { TarefaAgendaItem, LeadAgendaItem } from "@/lib/types/dashboard";
import { hojeISO } from "@/lib/utils/dashboard";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { AgendaDoDia } from "@/components/admin/dashboard/AgendaDoDia";
import { IconCamera, IconExternalLink, IconAlertTriangle, IconTarget, IconActivity, IconWallet } from "@/components/ui/icons";

interface VisaoGeralProps {
  captacoesHoje: number;
  entregasHoje: number;
  tarefasAtrasadas: number;
  leadsEmAberto: number;
  followUpsAtrasados: number;
  saldoConsolidado: number;
  agendaHoje: {
    captacoes: TarefaAgendaItem[];
    entregas: TarefaAgendaItem[];
    followUps: LeadAgendaItem[];
  };
}

export function VisaoGeral({
  captacoesHoje,
  entregasHoje,
  tarefasAtrasadas,
  leadsEmAberto,
  followUpsAtrasados,
  saldoConsolidado,
  agendaHoje,
}: VisaoGeralProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile icon={IconCamera} label="Captações Hoje" value={captacoesHoje} hint="Gravações agendadas pra hoje" />
        <StatTile icon={IconExternalLink} label="Entregas Hoje" value={entregasHoje} hint="Prazos de entrega vencendo hoje" />
        <StatTile
          icon={IconAlertTriangle}
          label="Tarefas Atrasadas"
          value={tarefasAtrasadas}
          tone={tarefasAtrasadas > 0 ? "critical" : "neutral"}
          hint="Prazo vencido, ainda não concluídas"
        />
        <StatTile icon={IconTarget} label="Leads em Aberto" value={leadsEmAberto} hint="Ainda no funil comercial" />
        <StatTile
          icon={IconActivity}
          label="Follow-ups Atrasados"
          value={followUpsAtrasados}
          tone={followUpsAtrasados > 0 ? "warning" : "neutral"}
          hint="Próximo contato já venceu"
        />
        <StatTile icon={IconWallet} label="Saldo Consolidado" value={fmtBRL(saldoConsolidado)} hint="Soma de todas as contas" />
      </div>

      <AgendaDoDia
        data={hojeISO()}
        titulo="Agenda de Hoje"
        captacoes={agendaHoje.captacoes}
        entregas={agendaHoje.entregas}
        followUps={agendaHoje.followUps}
      />
    </div>
  );
}
