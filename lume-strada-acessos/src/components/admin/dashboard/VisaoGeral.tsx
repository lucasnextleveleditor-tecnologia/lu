import type { ComponentType, SVGProps } from "react";
import type { TarefaAgendaItem, LeadAgendaItem } from "@/lib/types/dashboard";
import type { StatusSessaoWhatsapp } from "@/lib/types/whatsapp";
import { STATUS_SESSAO_META } from "@/lib/utils/whatsapp";
import { hojeISO } from "@/lib/utils/dashboard";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { OlhoValoresToggle } from "@/components/ui/OlhoValoresToggle";
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
  IconColumns,
} from "@/components/ui/icons";
import { getDictionary } from "@/lib/i18n/getDictionary";

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

/**
 * Cabeçalho de seção — mesmo padrão visual já usado dentro de `AgendaDoDia`
 * pra separar Captações/Entregas/Follow-ups (ícone + rótulo em versalete,
 * `ink-muted`). Reaproveitado aqui pra separar cada MÓDULO (Produção,
 * Comercial, Financeiro...) em vez de deixar os cards de fontes diferentes
 * soltos numa grade só — era exatamente isso que fazia a Visão Geral
 * "misturar" dado de módulos diferentes numa mesma fileira.
 */
function SecaoDashboard({
  icon: Icon,
  titulo,
  acao,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  titulo: string;
  /** Slot opcional pra uma ação no canto direito do cabeçalho da seção — hoje só o Financeiro usa (`OlhoValoresToggle`). */
  acao?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          <Icon className="h-3.5 w-3.5" />
          {titulo}
        </p>
        {acao}
      </div>
      {children}
    </div>
  );
}

export async function VisaoGeral({
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
  const { dict } = await getDictionary();
  const mostrarProducao = captacoesHoje !== null || entregasHoje !== null || tarefasAtrasadas !== null || entregasAguardandoAprovacao !== null;
  const mostrarComercial = leadsEmAberto !== null || followUpsAtrasados !== null || valorPropostasAbertas !== null;
  const mostrarFinanceiro = saldoConsolidado !== null || contasVencidas !== null || financeiroDoMes !== null;
  const mostrarInventario = resumoInventario !== null;
  const mostrarTrafego = resumoTrafegoHoje !== null;
  const mostrarWhatsapp = whatsapp !== null;
  const mostrarAgenda = agendaHoje !== null;

  const nenhumaSecaoVisivel =
    !mostrarProducao && !mostrarComercial && !mostrarFinanceiro && !mostrarInventario && !mostrarTrafego && !mostrarWhatsapp && !mostrarAgenda;

  if (nenhumaSecaoVisivel) {
    return (
      <div className="rounded-2xl border border-dashed border-base-700 p-10 text-center text-sm text-ink-muted">
        {dict.dashboard.nenhumCardLiberado}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {mostrarProducao && (
        <SecaoDashboard icon={IconColumns} titulo={dict.dashboard.secaoProducao}>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {captacoesHoje !== null && (
              <StatTile
                icon={IconCamera}
                label={dict.dashboard.captacoesHojeLabel}
                value={captacoesHoje}
                hint={dict.dashboard.captacoesHojeHint}
              />
            )}
            {entregasHoje !== null && (
              <StatTile
                icon={IconExternalLink}
                label={dict.dashboard.entregasHojeLabel}
                value={entregasHoje}
                hint={dict.dashboard.entregasHojeHint}
              />
            )}
            {tarefasAtrasadas !== null && (
              <StatTile
                icon={IconAlertTriangle}
                label={dict.dashboard.tarefasAtrasadasLabel}
                value={tarefasAtrasadas}
                tone={tarefasAtrasadas > 0 ? "critical" : "neutral"}
                hint={dict.dashboard.tarefasAtrasadasHint}
              />
            )}
            {entregasAguardandoAprovacao !== null && (
              <StatTile
                icon={IconCheckCircle}
                label={dict.dashboard.aguardandoAprovacaoLabel}
                value={entregasAguardandoAprovacao}
                tone={entregasAguardandoAprovacao > 0 ? "warning" : "neutral"}
                hint={dict.dashboard.aguardandoAprovacaoHint}
              />
            )}
          </div>
        </SecaoDashboard>
      )}

      {mostrarComercial && (
        <SecaoDashboard icon={IconTarget} titulo={dict.dashboard.secaoComercial}>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {leadsEmAberto !== null && (
              <StatTile
                icon={IconTarget}
                label={dict.dashboard.leadsEmAbertoLabel}
                value={leadsEmAberto}
                hint={dict.dashboard.leadsEmAbertoHint}
              />
            )}
            {followUpsAtrasados !== null && (
              <StatTile
                icon={IconActivity}
                label={dict.dashboard.followUpsAtrasadosLabel}
                value={followUpsAtrasados}
                tone={followUpsAtrasados > 0 ? "warning" : "neutral"}
                hint={dict.dashboard.followUpsAtrasadosHint}
              />
            )}
            {valorPropostasAbertas !== null && (
              <StatTile
                icon={IconDollarSign}
                label={dict.dashboard.propostasAbertasLabel}
                value={fmtBRL(valorPropostasAbertas)}
                hint={dict.dashboard.propostasAbertasHint}
              />
            )}
          </div>
        </SecaoDashboard>
      )}

      {mostrarFinanceiro && (
        <SecaoDashboard icon={IconWallet} titulo={dict.dashboard.secaoFinanceiro} acao={<OlhoValoresToggle />}>
          <div className="space-y-4">
            {(saldoConsolidado !== null || contasVencidas !== null) && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {saldoConsolidado !== null && (
                  <StatTile
                    icon={IconWallet}
                    label={dict.dashboard.saldoConsolidadoLabel}
                    value={<ValorPrivado valor={fmtBRL(saldoConsolidado)} />}
                    hint={dict.dashboard.saldoConsolidadoHint}
                  />
                )}
                {contasVencidas !== null && (
                  <StatTile
                    icon={IconCreditCard}
                    label={dict.dashboard.contasVencidasLabel}
                    value={contasVencidas}
                    tone={contasVencidas > 0 ? "critical" : "neutral"}
                    hint={dict.dashboard.contasVencidasHint}
                  />
                )}
              </div>
            )}
            {financeiroDoMes !== null && (
              <div className="lg:max-w-md">
                <FinanceiroDoMesCard receitas={financeiroDoMes.receitas} despesas={financeiroDoMes.despesas} />
              </div>
            )}
          </div>
        </SecaoDashboard>
      )}

      {(mostrarInventario || mostrarTrafego || mostrarWhatsapp) && (
        <SecaoDashboard icon={IconBox} titulo={dict.dashboard.secaoOutrosModulos}>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {resumoInventario !== null && (
              <StatTile
                icon={IconBox}
                label={dict.dashboard.itensEmManutencaoLabel}
                value={resumoInventario.manutencao}
                tone={resumoInventario.manutencao > 0 ? "warning" : "neutral"}
                hint={
                  resumoInventario.emprestados > 0
                    ? dict.dashboard.emprestadosNoMomento.replace("{n}", String(resumoInventario.emprestados))
                    : dict.dashboard.nenhumItemEmprestado
                }
              />
            )}
            {resumoTrafegoHoje !== null && (
              <StatTile
                icon={IconTrendingUp}
                label={dict.dashboard.investidoAdsHojeLabel}
                value={fmtBRL(resumoTrafegoHoje.totalInvestido)}
                hint={dict.dashboard.leadsGeradosHoje.replace("{n}", String(resumoTrafegoHoje.totalLeads))}
              />
            )}
            {whatsapp !== null && (
              <StatTile
                icon={IconMessageCircle}
                label={dict.dashboard.whatsappLabel}
                value={whatsapp.status ? STATUS_SESSAO_META[whatsapp.status].label : dict.dashboard.naoConfigurado}
                tone={whatsapp.status ? STATUS_SESSAO_META[whatsapp.status].tone : "neutral"}
                hint={
                  whatsapp.status
                    ? dict.dashboard.conversasHoje.replace("{n}", String(whatsapp.conversasHoje))
                    : dict.dashboard.conecteEmAdminWhatsapp
                }
              />
            )}
          </div>
        </SecaoDashboard>
      )}

      {mostrarAgenda && (
        <AgendaDoDia
          data={hojeISO()}
          titulo={dict.dashboard.agendaDeHojeTitulo}
          captacoes={agendaHoje.captacoes}
          entregas={agendaHoje.entregas}
          followUps={agendaHoje.followUps}
        />
      )}
    </div>
  );
}
