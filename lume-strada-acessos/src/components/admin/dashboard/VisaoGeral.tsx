import type { TarefaAgendaItem, LeadAgendaItem } from "@/lib/types/dashboard";
import type { StatusSessaoWhatsapp } from "@/lib/types/whatsapp";
import { STATUS_SESSAO_META } from "@/lib/utils/whatsapp";
import { hojeISO } from "@/lib/utils/dashboard";
import type { Tone } from "@/lib/utils/tone";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { OlhoValoresToggle } from "@/components/ui/OlhoValoresToggle";
import { AgendaDoDia } from "@/components/admin/dashboard/AgendaDoDia";
import { HeroResultado } from "@/components/admin/dashboard/HeroResultado";
import { PrecisaAtencao, type ItemAtencao } from "@/components/admin/dashboard/PrecisaAtencao";
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
  /** Contas não pagas que vencem HOJE — separado de `contasVencidas` de propósito (urgência diferente: ainda não atrasou, mas precisa de atenção hoje). */
  contasVencendoHoje: number | null;
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
  contasVencendoHoje,
  financeiroDoMes,
  resumoInventario,
  resumoTrafegoHoje,
  whatsapp,
  agendaHoje,
}: VisaoGeralProps) {
  const { dict } = await getDictionary();
  const mostrarProducao = captacoesHoje !== null || entregasHoje !== null || tarefasAtrasadas !== null || entregasAguardandoAprovacao !== null;
  const mostrarComercial = leadsEmAberto !== null || followUpsAtrasados !== null || valorPropostasAbertas !== null;
  const mostrarFinanceiro = saldoConsolidado !== null || contasVencidas !== null || contasVencendoHoje !== null || financeiroDoMes !== null;
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

  // --------------------------------------------------------------------------
  // Tudo que está atrasado ou vence hoje, num lugar só. Cada um destes era um
  // cartão inteiro na grade antiga — cinco cartões que, no dia comum, exibem
  // "0". Aqui viram linhas, e só aparecem quando existem de verdade.
  // --------------------------------------------------------------------------
  const itensAtencao: ItemAtencao[] = [
    tarefasAtrasadas !== null && {
      chave: "tarefas",
      icon: IconAlertTriangle,
      rotulo: dict.dashboard.tarefasAtrasadasLabel,
      quantidade: tarefasAtrasadas,
      tone: "critical" as const,
      href: "/admin/producao",
    },
    contasVencidas !== null && {
      chave: "contas-vencidas",
      icon: IconCreditCard,
      rotulo: dict.dashboard.contasVencidasLabel,
      quantidade: contasVencidas,
      tone: "critical" as const,
      href: "/admin/financeiro",
    },
    contasVencendoHoje !== null && {
      chave: "contas-hoje",
      icon: IconAlertTriangle,
      rotulo: dict.dashboard.contasVencendoHojeLabel,
      quantidade: contasVencendoHoje,
      tone: "warning" as const,
      href: "/admin/financeiro",
    },
    followUpsAtrasados !== null && {
      chave: "follow-ups",
      icon: IconActivity,
      rotulo: dict.dashboard.followUpsAtrasadosLabel,
      quantidade: followUpsAtrasados,
      tone: "warning" as const,
      href: "/admin/comercial",
    },
    entregasAguardandoAprovacao !== null && {
      chave: "aprovacao",
      icon: IconCheckCircle,
      rotulo: dict.dashboard.aguardandoAprovacaoLabel,
      quantidade: entregasAguardandoAprovacao,
      tone: "warning" as const,
      href: "/admin/producao",
    },
  ].filter(Boolean) as ItemAtencao[];

  // --------------------------------------------------------------------------
  // O "resto" — números que valem estar na tela, mas não valem interromper.
  // Vão todos na variante compacta, embaixo, depois de um divisor.
  // --------------------------------------------------------------------------
  const compactos = [
    captacoesHoje !== null && { chave: "captacoes", icon: IconCamera, label: dict.dashboard.captacoesHojeLabel, value: captacoesHoje },
    entregasHoje !== null && { chave: "entregas", icon: IconExternalLink, label: dict.dashboard.entregasHojeLabel, value: entregasHoje },
    leadsEmAberto !== null && { chave: "leads", icon: IconTarget, label: dict.dashboard.leadsEmAbertoLabel, value: leadsEmAberto },
    valorPropostasAbertas !== null && {
      chave: "propostas",
      icon: IconDollarSign,
      label: dict.dashboard.propostasAbertasLabel,
      value: fmtBRL(valorPropostasAbertas),
    },
    saldoConsolidado !== null && {
      chave: "saldo",
      icon: IconWallet,
      label: dict.dashboard.saldoConsolidadoLabel,
      value: <ValorPrivado valor={fmtBRL(saldoConsolidado)} />,
    },
    resumoInventario !== null && {
      chave: "inventario",
      icon: IconBox,
      label: dict.dashboard.itensEmManutencaoLabel,
      value: resumoInventario.manutencao,
      tone: resumoInventario.manutencao > 0 ? ("warning" as const) : undefined,
    },
    resumoTrafegoHoje !== null && {
      chave: "trafego",
      icon: IconTrendingUp,
      label: dict.dashboard.investidoAdsHojeLabel,
      value: fmtBRL(resumoTrafegoHoje.totalInvestido),
      hint: dict.dashboard.leadsGeradosHoje.replace("{n}", String(resumoTrafegoHoje.totalLeads)),
    },
    whatsapp !== null && {
      chave: "whatsapp",
      icon: IconMessageCircle,
      label: dict.dashboard.whatsappLabel,
      value: whatsapp.status ? STATUS_SESSAO_META[whatsapp.status].label : dict.dashboard.naoConfigurado,
      tone: whatsapp.status ? STATUS_SESSAO_META[whatsapp.status].tone : undefined,
    },
  ].filter(Boolean) as { chave: string; icon: typeof IconCamera; label: string; value: React.ReactNode; tone?: Tone; hint?: string }[];

  const temAtencao = itensAtencao.length > 0 || mostrarProducao || mostrarComercial || mostrarFinanceiro;

  return (
    <div className="space-y-8">
      {/* NÍVEL 1 — o herói e o que precisa de atenção, lado a lado. É a
          primeira coisa que a pessoa vê ao abrir o sistema: quanto sobrou no
          mês, e o que está pegando fogo. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {financeiroDoMes !== null ? (
          <HeroResultado receitas={financeiroDoMes.receitas} despesas={financeiroDoMes.despesas} />
        ) : (
          // Sem permissão de Financeiro, o herói passa a ser o dia — nunca um
          // buraco no layout, e nunca um dado que a pessoa não pode ver.
          <div className="rounded-2xl border border-base-700 bg-base-900/80 p-6 backdrop-blur-sm sm:p-7">
            <p className="text-xs font-medium text-ink-muted">{dict.dashboard.heroHojeLabel}</p>
            <p className="mt-2 text-[44px] font-semibold leading-none tracking-tight text-ink-primary sm:text-5xl">
              {(captacoesHoje ?? 0) + (entregasHoje ?? 0)}
            </p>
            <p className="mt-2 text-xs text-ink-muted">{dict.dashboard.heroHojeHint}</p>
          </div>
        )}

        {temAtencao && <PrecisaAtencao itens={itensAtencao} />}
      </div>

      {/* NÍVEL 2 — a agenda do dia, em largura inteira: é uma lista, e lista
          se lê melhor larga do que espremida numa coluna. */}
      {mostrarAgenda && (
        <AgendaDoDia
          data={hojeISO()}
          titulo={dict.dashboard.agendaDeHojeTitulo}
          captacoes={agendaHoje.captacoes}
          entregas={agendaHoje.entregas}
          followUps={agendaHoje.followUps}
        />
      )}

      {/* NÍVEL 3 — o resto, quieto, atrás de um divisor. Continua acessível
          sem competir com o que está acima. */}
      {compactos.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{dict.dashboard.maisNumeros}</p>
            <span className="h-px flex-1 bg-base-800" />
            {mostrarFinanceiro && <OlhoValoresToggle />}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {compactos.map((c) => (
              <StatTile key={c.chave} variant="compacto" icon={c.icon} label={c.label} value={c.value} tone={c.tone} hint={c.hint} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
