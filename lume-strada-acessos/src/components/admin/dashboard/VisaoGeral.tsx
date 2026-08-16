import type { TarefaAgendaItem, LeadAgendaItem } from "@/lib/types/dashboard";
import type { StatusSessaoWhatsapp } from "@/lib/types/whatsapp";
import { STATUS_SESSAO_META } from "@/lib/utils/whatsapp";
import { hojeISO } from "@/lib/utils/dashboard";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { AgendaDoDia } from "@/components/admin/dashboard/AgendaDoDia";
import { FinanceiroDoMesCard } from "@/components/admin/dashboard/FinanceiroDoMesCard";
import {
  IconCamera,
  IconExternalLink,
  IconAlertTriangle,
  IconTarget,
  IconActivity,
  IconWallet,
  IconCheckCircle,
  IconDollarSign,
  IconCreditCard,
  IconBox,
  IconTrendingUp,
  IconMessageCircle,
} from "@/components/ui/icons";

interface VisaoGeralProps {
  captacoesHoje: number;
  entregasHoje: number;
  tarefasAtrasadas: number;
  /** Versões de entrega com `status_aprovacao = 'pendente'` — mesmo espírito operacional de "tarefas atrasadas", não é dado sensível, sempre visível. */
  entregasAguardandoAprovacao: number;
  leadsEmAberto: number;
  followUpsAtrasados: number;
  /** Soma de `valor_estimado` dos leads ainda em aberto (não fechado/perdido). */
  valorPropostasAbertas: number;
  /** `null` quando o usuário logado não tem permissão do módulo Financeiro — o card some, em vez de mostrar saldo pra quem não devia ver (ver `src/app/admin/dashboard/page.tsx`). */
  saldoConsolidado: number | null;
  /** `null` sem permissão de Financeiro. Contas não pagas com vencimento já passado. */
  contasVencidas: number | null;
  /** `null` sem permissão de Financeiro. */
  financeiroDoMes: { receitas: number; despesas: number } | null;
  /** `null` sem permissão de Inventário. */
  resumoInventario: { manutencao: number; emprestados: number } | null;
  /** `null` sem permissão de Tráfego. Soma de todos os clientes, hoje. */
  resumoTrafegoHoje: { totalInvestido: number; totalLeads: number } | null;
  /** `null` sem permissão de WhatsApp. `status: null` quando a sessão ainda não foi inicializada (SQL não rodado). */
  whatsapp: { status: StatusSessaoWhatsapp | null; conversasHoje: number } | null;
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
  entregasAguardandoAprovacao,
  leadsEmAberto,
  followUpsAtrasados,
  valorPropostasAbertas,
  saldoConsolidado,
  contasVencidas,
  financeiroDoMes,
  resumoInventario,
  resumoTrafegoHoje,
  whatsapp,
  agendaHoje,
}: VisaoGeralProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={IconCamera} label="Captações Hoje" value={captacoesHoje} hint="Gravações agendadas pra hoje" />
        <StatTile icon={IconExternalLink} label="Entregas Hoje" value={entregasHoje} hint="Prazos de entrega vencendo hoje" />
        <StatTile
          icon={IconAlertTriangle}
          label="Tarefas Atrasadas"
          value={tarefasAtrasadas}
          tone={tarefasAtrasadas > 0 ? "critical" : "neutral"}
          hint="Prazo vencido, ainda não concluídas"
        />
        <StatTile
          icon={IconCheckCircle}
          label="Aguardando Aprovação"
          value={entregasAguardandoAprovacao}
          tone={entregasAguardandoAprovacao > 0 ? "warning" : "neutral"}
          hint="Versões de entrega esperando o cliente"
        />

        <StatTile icon={IconTarget} label="Leads em Aberto" value={leadsEmAberto} hint="Ainda no funil comercial" />
        <StatTile
          icon={IconActivity}
          label="Follow-ups Atrasados"
          value={followUpsAtrasados}
          tone={followUpsAtrasados > 0 ? "warning" : "neutral"}
          hint="Próximo contato já venceu"
        />
        <StatTile
          icon={IconDollarSign}
          label="Propostas Abertas"
          value={fmtBRL(valorPropostasAbertas)}
          hint="Valor estimado, leads em aberto"
        />
        {saldoConsolidado !== null && (
          <StatTile icon={IconWallet} label="Saldo Consolidado" value={fmtBRL(saldoConsolidado)} hint="Soma das contas profissionais" />
        )}

        {contasVencidas !== null && (
          <StatTile
            icon={IconCreditCard}
            label="Contas Vencidas"
            value={contasVencidas}
            tone={contasVencidas > 0 ? "critical" : "neutral"}
            hint="Não pagas, com vencimento já passado"
          />
        )}
        {resumoInventario !== null && (
          <StatTile
            icon={IconBox}
            label="Itens em Manutenção"
            value={resumoInventario.manutencao}
            tone={resumoInventario.manutencao > 0 ? "warning" : "neutral"}
            hint={resumoInventario.emprestados > 0 ? `${resumoInventario.emprestados} emprestado(s) no momento` : "Nenhum item emprestado"}
          />
        )}
        {resumoTrafegoHoje !== null && (
          <StatTile
            icon={IconTrendingUp}
            label="Investido em Ads Hoje"
            value={fmtBRL(resumoTrafegoHoje.totalInvestido)}
            hint={`${resumoTrafegoHoje.totalLeads} leads gerados hoje`}
          />
        )}
        {whatsapp !== null && (
          <StatTile
            icon={IconMessageCircle}
            label="WhatsApp"
            value={whatsapp.status ? STATUS_SESSAO_META[whatsapp.status].label : "Não configurado"}
            tone={whatsapp.status ? STATUS_SESSAO_META[whatsapp.status].tone : "neutral"}
            hint={whatsapp.status ? `${whatsapp.conversasHoje} conversas hoje` : "Conecte em Admin → WhatsApp"}
          />
        )}
      </div>

      {financeiroDoMes !== null ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AgendaDoDia
              data={hojeISO()}
              titulo="Agenda de Hoje"
              captacoes={agendaHoje.captacoes}
              entregas={agendaHoje.entregas}
              followUps={agendaHoje.followUps}
            />
          </div>
          <FinanceiroDoMesCard receitas={financeiroDoMes.receitas} despesas={financeiroDoMes.despesas} />
        </div>
      ) : (
        <AgendaDoDia
          data={hojeISO()}
          titulo="Agenda de Hoje"
          captacoes={agendaHoje.captacoes}
          entregas={agendaHoje.entregas}
          followUps={agendaHoje.followUps}
        />
      )}
    </div>
  );
}
