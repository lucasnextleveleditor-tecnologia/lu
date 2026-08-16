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
  // Todo card aqui é `| null` por DOIS motivos possíveis, nunca misturados
  // na leitura: (1) módulo sem permissão pro usuário logado — segurança,
  // dado sensível nem chega a ser calculado (ver `src/app/admin/dashboard/page.tsx`);
  // ou (2) card escondido de propósito pra ESSE funcionário via
  // `dashboard_config` — preferência do admin, não segurança. Os dois casos
  // resultam no mesmo `null` aqui porque o componente não precisa (nem
  // deve) diferenciar o motivo — só decide "mostra ou não mostra".
  captacoesHoje: number | null;
  entregasHoje: number | null;
  tarefasAtrasadas: number | null;
  /** Versões de entrega com `status_aprovacao = 'pendente'`. */
  entregasAguardandoAprovacao: number | null;
  leadsEmAberto: number | null;
  followUpsAtrasados: number | null;
  /** Soma de `valor_estimado` dos leads ainda em aberto (não fechado/perdido). */
  valorPropostasAbertas: number | null;
  saldoConsolidado: number | null;
  /** Contas não pagas com vencimento já passado. */
  contasVencidas: number | null;
  financeiroDoMes: { receitas: number; despesas: number } | null;
  resumoInventario: { manutencao: number; emprestados: number } | null;
  /** Soma de todos os clientes, hoje. */
  resumoTrafegoHoje: { totalInvestido: number; totalLeads: number } | null;
  /** `status: null` quando a sessão ainda não foi inicializada (SQL não rodado) — diferente do card inteiro vir `null` (sem permissão/escondido). */
  whatsapp: { status: StatusSessaoWhatsapp | null; conversasHoje: number } | null;
  agendaHoje: {
    captacoes: TarefaAgendaItem[];
    entregas: TarefaAgendaItem[];
    followUps: LeadAgendaItem[];
  } | null;
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
  const mostrarAgenda = agendaHoje !== null;
  const mostrarFinanceiroDoMes = financeiroDoMes !== null;

  const nenhumCardVisivel = [
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
  ].every((valor) => valor === null);

  if (nenhumCardVisivel) {
    return (
      <div className="rounded-2xl border border-dashed border-base-700 p-10 text-center text-sm text-ink-muted">
        Nenhum card liberado pro seu usuário ainda — fale com o administrador pra ajustar em Cadastros → Equipe.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {captacoesHoje !== null && (
          <StatTile icon={IconCamera} label="Captações Hoje" value={captacoesHoje} hint="Gravações agendadas pra hoje" />
        )}
        {entregasHoje !== null && (
          <StatTile icon={IconExternalLink} label="Entregas Hoje" value={entregasHoje} hint="Prazos de entrega vencendo hoje" />
        )}
        {tarefasAtrasadas !== null && (
          <StatTile
            icon={IconAlertTriangle}
            label="Tarefas Atrasadas"
            value={tarefasAtrasadas}
            tone={tarefasAtrasadas > 0 ? "critical" : "neutral"}
            hint="Prazo vencido, ainda não concluídas"
          />
        )}
        {entregasAguardandoAprovacao !== null && (
          <StatTile
            icon={IconCheckCircle}
            label="Aguardando Aprovação"
            value={entregasAguardandoAprovacao}
            tone={entregasAguardandoAprovacao > 0 ? "warning" : "neutral"}
            hint="Versões de entrega esperando o cliente"
          />
        )}

        {leadsEmAberto !== null && (
          <StatTile icon={IconTarget} label="Leads em Aberto" value={leadsEmAberto} hint="Ainda no funil comercial" />
        )}
        {followUpsAtrasados !== null && (
          <StatTile
            icon={IconActivity}
            label="Follow-ups Atrasados"
            value={followUpsAtrasados}
            tone={followUpsAtrasados > 0 ? "warning" : "neutral"}
            hint="Próximo contato já venceu"
          />
        )}
        {valorPropostasAbertas !== null && (
          <StatTile
            icon={IconDollarSign}
            label="Propostas Abertas"
            value={fmtBRL(valorPropostasAbertas)}
            hint="Valor estimado, leads em aberto"
          />
        )}
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

      {mostrarAgenda && mostrarFinanceiroDoMes && (
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
      )}
      {mostrarAgenda && !mostrarFinanceiroDoMes && (
        <AgendaDoDia
          data={hojeISO()}
          titulo="Agenda de Hoje"
          captacoes={agendaHoje.captacoes}
          entregas={agendaHoje.entregas}
          followUps={agendaHoje.followUps}
        />
      )}
      {!mostrarAgenda && mostrarFinanceiroDoMes && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FinanceiroDoMesCard receitas={financeiroDoMes.receitas} despesas={financeiroDoMes.despesas} />
        </div>
      )}
    </div>
  );
}
