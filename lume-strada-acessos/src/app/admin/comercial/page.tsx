import Link from "next/link";
import { redirect } from "next/navigation";
import { requireQualquerModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { AnotacaoRow, LeadComRelacoes, LeadRow } from "@/lib/types/comercial";
import type { TipoServicoRow } from "@/lib/types/producao";
import { leadEstaAberto } from "@/lib/utils/comercial";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { Button } from "@/components/ui/Button";
import { IconTarget, IconTrendingUp, IconCheckCircle, IconAlertTriangle, IconClipboardList, IconPercent, IconColumns, IconList, IconShieldCheck, IconPlus } from "@/components/ui/icons";
import { ComercialWorkspace } from "@/components/admin/comercial/ComercialWorkspace";
import { ComercialHubTabs, type AbaHubComercial, type ItemAbaHubComercial } from "@/components/admin/comercial/ComercialHubTabs";
import { OrcamentosManager } from "@/components/admin/orcamentos/OrcamentosManager";
import { CalculadoraMargem } from "@/components/admin/orcamentos/CalculadoraMargem";
import { ConfiguracoesOrcamentoMenu } from "@/components/admin/orcamentos/ConfiguracoesOrcamentoMenu";
import { buscarDadosOrcamentos, buscarDadosCatalogo } from "@/app/admin/orcamentos/data";
import { buscarEquipamentosParaCalculadora, buscarCustoFixoMensalEstimado } from "@/app/admin/orcamentos/calculadora-data";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";

/**
 * Hub Comercial unificado — junta o que antes eram duas telas/dois destinos
 * separados no menu lateral (CRM & Vendas em `/admin/comercial` e
 * Orçamentos em `/admin/orcamentos`) numa única tela com abas: Leads, Funil
 * de Propostas, Calculadora de Margem e Propostas (a antiga lista de
 * orçamentos). É o mesmo funil de verdade do negócio — lead entra, simula
 * preço, manda proposta, aprova — só que antes exigia trocar de destino no
 * meio do fluxo; ver decisão completa na conversa que pediu essa unificação.
 *
 * Cada aba é uma navegação de verdade (`?aba=...`), não um toggle de estado
 * local — cada uma busca um conjunto de dados diferente (leads vs.
 * orçamentos vs. catálogo), então só busca o necessário pra aba ativa.
 *
 * RBAC: Leads pede o módulo "comercial", Funil/Calculadora/Propostas pedem
 * "orcamentos" — são permissões INDEPENDENTES por funcionário (ver
 * `requireQualquerModuloOuRedirect`), então um funcionário com só uma delas
 * ligada continua caindo aqui, só que vendo (e podendo navegar) só pras
 * abas da permissão que tem. `/admin/orcamentos` (a URL antiga) e
 * `/admin/orcamentos/calculadora` viraram redirects pra cá, pra não quebrar
 * favoritos/links antigos.
 */
export default async function ComercialHubPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { supabase, chavesAutorizadas } = await requireQualquerModuloOuRedirect(["comercial", "orcamentos"]);
  const { dict } = await getDictionary();
  const { aba: abaParam } = await searchParams;

  const podeComercial = chavesAutorizadas.has("comercial");
  const podeOrcamentos = chavesAutorizadas.has("orcamentos");

  const TODAS_ABAS: (ItemAbaHubComercial & { habilitada: boolean })[] = [
    { value: "leads", label: dict.orcamentos.abaLeadsLabel, icon: IconTarget, habilitada: podeComercial },
    { value: "funil", label: dict.orcamentos.abaFunilLabel, icon: IconColumns, habilitada: podeOrcamentos },
    { value: "calculadora", label: dict.orcamentos.abaCalculadoraLabel, icon: IconPercent, habilitada: podeOrcamentos },
    { value: "propostas", label: dict.orcamentos.abaPropostasLabel, icon: IconList, habilitada: podeOrcamentos },
  ];
  const abasDisponiveis = TODAS_ABAS.filter((a) => a.habilitada);

  // Landing padrão (sem `?aba=` ou com um valor que o usuário não pode ver):
  // Leads em primeiro (mesma tela que já era o destino principal de quem
  // tinha "comercial"), senão Propostas (mesma lista que já era o destino
  // principal de quem só tinha "orcamentos" antes de virar hub) — NÃO é
  // simplesmente "a primeira aba habilitada", porque a ORDEM DE EXIBIÇÃO das
  // abas (Leads/Funil/Calculadora/Propostas) é uma escolha visual separada
  // da prioridade de landing.
  const ORDEM_PADRAO: AbaHubComercial[] = ["leads", "propostas", "funil", "calculadora"];
  const abaPadrao = ORDEM_PADRAO.find((valor) => abasDisponiveis.some((a) => a.value === valor));
  // Nunca deveria disparar — `requireQualquerModuloOuRedirect` já garante
  // `chavesAutorizadas` não vazio — mas fica como cinto de segurança em vez
  // de um `!` de asserção.
  if (!abaPadrao) redirect("/admin/dashboard");
  const abaAtiva: AbaHubComercial = abasDisponiveis.some((a) => a.value === abaParam) ? (abaParam as AbaHubComercial) : abaPadrao;

  // Busca só o necessário pra aba ativa — nunca busca dados de Leads sem
  // "comercial" nem de Orçamentos/Catálogo sem "orcamentos" (dupla trava:
  // além do filtro de abas acima, `buscarDadosOrcamentos`/`buscarDadosCatalogo`
  // fazem sua PRÓPRIA checagem de "orcamentos" por dentro).
  let dadosLeads: {
    leadsComRelacoes: LeadComRelacoes[];
    anotacoesPorLead: Record<string, AnotacaoRow[]>;
    tiposServico: TipoServicoRow[];
    totalEmNegociacao: number;
    taxaConversao: number | null;
    fechadosNoMesCount: number;
    followupsAtrasadosCount: number;
    leadsAbertosCount: number;
    ganhosCount: number;
    perdidosCount: number;
  } | null = null;

  if (abaAtiva === "leads" && podeComercial) {
    const [leadsRes, anotacoesRes, tiposServicoRes] = await Promise.all([
      supabase.from("crm_leads").select("*").order("created_at", { ascending: false }).overrideTypes<LeadRow[], { merge: false }>(),
      supabase.from("crm_anotacoes").select("*").order("created_at", { ascending: false }).overrideTypes<AnotacaoRow[], { merge: false }>(),
      supabase.from("prod_tipos_servico").select("*").order("nome").overrideTypes<TipoServicoRow[], { merge: false }>(),
    ]);

    const leads = leadsRes.data ?? [];
    const anotacoes = anotacoesRes.data ?? [];
    const tiposServico = tiposServicoRes.data ?? [];

    const nomeTipoServico = new Map(tiposServico.map((t) => [t.id, t.nome]));
    const leadsComRelacoes: LeadComRelacoes[] = leads.map((l) => ({
      ...l,
      tipo_servico_nome: l.tipo_servico_id ? (nomeTipoServico.get(l.tipo_servico_id) ?? null) : null,
    }));

    const anotacoesPorLead: Record<string, AnotacaoRow[]> = {};
    for (const a of anotacoes) anotacoesPorLead[a.lead_id] = [...(anotacoesPorLead[a.lead_id] ?? []), a];

    const leadsAbertos = leadsComRelacoes.filter(leadEstaAberto);
    const totalEmNegociacao = leadsAbertos.reduce((acc, l) => acc + (l.valor_estimado ?? 0), 0);
    const fechados = leadsComRelacoes.filter((l) => l.status === "fechado_ganha");
    const perdidos = leadsComRelacoes.filter((l) => l.status === "perdido");
    const taxaConversao = fechados.length + perdidos.length > 0 ? fechados.length / (fechados.length + perdidos.length) : null;

    const inicioMes = new Date();
    inicioMes.setDate(1);
    const inicioMesIso = inicioMes.toISOString().slice(0, 10);
    const fechadosNoMes = fechados.filter((l) => l.updated_at.slice(0, 10) >= inicioMesIso);

    dadosLeads = {
      leadsComRelacoes,
      anotacoesPorLead,
      tiposServico,
      totalEmNegociacao,
      taxaConversao,
      fechadosNoMesCount: fechadosNoMes.length,
      followupsAtrasadosCount: leadsAbertos.filter((l) => l.proximo_contato_em && l.proximo_contato_em < new Date().toISOString().slice(0, 10)).length,
      leadsAbertosCount: leadsAbertos.length,
      ganhosCount: fechados.length,
      perdidosCount: perdidos.length,
    };
  }

  const dadosOrcamentos = (abaAtiva === "funil" || abaAtiva === "propostas") && podeOrcamentos ? await buscarDadosOrcamentos({}) : null;
  const dadosCatalogo = abaAtiva === "calculadora" && podeOrcamentos ? await buscarDadosCatalogo() : null;
  const [equipamentos, custoFixoMensalEstimado] =
    abaAtiva === "calculadora" && podeOrcamentos ? await Promise.all([buscarEquipamentosParaCalculadora(), buscarCustoFixoMensalEstimado()]) : [[], 0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{dict.orcamentos.hubTitulo}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{dict.orcamentos.hubSubtitulo}</p>
        </div>
        {podeOrcamentos && (
          <div className="flex flex-wrap items-center gap-3">
            <ConfiguracoesOrcamentoMenu />
            <Link href="/admin/contratos">
              <Button variant="ghost" className="gap-1.5">
                <IconShieldCheck className="h-4 w-4" />
                {dict.orcamentos.contratosBtn}
              </Button>
            </Link>
            <Link href="/admin/orcamentos/novo">
              <Button className="gap-1.5">
                <IconPlus className="h-4 w-4" />
                {dict.orcamentos.novoOrcamentoBtn}
              </Button>
            </Link>
          </div>
        )}
      </div>

      <ComercialHubTabs abas={abasDisponiveis} abaAtiva={abaAtiva} />

      {abaAtiva === "leads" && dadosLeads && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              icon={IconTarget}
              label={dict.comercial.statEmNegociacao}
              value={fmtBRL(dadosLeads.totalEmNegociacao)}
              hint={dict.comercial.hintLeadsAbertos.replace("{count}", String(dadosLeads.leadsAbertosCount))}
            />
            <StatTile
              icon={IconTrendingUp}
              label={dict.comercial.statTaxaConversao}
              value={dadosLeads.taxaConversao != null ? `${Math.round(dadosLeads.taxaConversao * 100)}%` : "—"}
              tone={dadosLeads.taxaConversao != null && dadosLeads.taxaConversao >= 0.5 ? "good" : "neutral"}
              hint={dict.comercial.hintTaxaConversao.replace("{ganhos}", String(dadosLeads.ganhosCount)).replace("{perdidos}", String(dadosLeads.perdidosCount))}
            />
            <StatTile icon={IconCheckCircle} label={dict.comercial.statFechadosMes} value={dadosLeads.fechadosNoMesCount} tone="good" hint={dict.comercial.hintFechadosMes} />
            <StatTile
              icon={IconAlertTriangle}
              label={dict.comercial.statFollowupsAtrasados}
              value={dadosLeads.followupsAtrasadosCount}
              tone="warning"
              hint={dict.comercial.hintFollowupsAtrasados}
            />
          </div>

          <ComercialWorkspace leads={dadosLeads.leadsComRelacoes} anotacoesPorLead={dadosLeads.anotacoesPorLead} tiposServico={dadosLeads.tiposServico} />
        </div>
      )}

      {(abaAtiva === "funil" || abaAtiva === "propostas") && dadosOrcamentos && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile
              icon={IconClipboardList}
              label={dict.orcamentos.statEmAberto}
              value={fmtBRL(dadosOrcamentos.valorEmAberto)}
              hint={dict.orcamentos.hintOrcamentosAbertos.replace("{n}", String(dadosOrcamentos.totalAbertos))}
            />
            <StatTile icon={IconCheckCircle} label={dict.orcamentos.statAprovadoMes} value={fmtBRL(dadosOrcamentos.valorAprovadoMes)} tone="good" hint={dict.orcamentos.hintAprovadosDescricao} />
            <StatTile icon={IconPercent} label={dict.orcamentos.statTaxaAprovacao} value={fmtPercent(dadosOrcamentos.taxaAprovacao)} hint={dict.orcamentos.hintTaxaAprovacaoDescricao} />
          </div>

          <OrcamentosManager orcamentos={dadosOrcamentos.orcamentos} visao={abaAtiva === "funil" ? "funil" : "lista"} />
        </div>
      )}

      {abaAtiva === "calculadora" && dadosCatalogo && (
        <CalculadoraMargem
          categorias={dadosCatalogo.categorias}
          servicosComCategoria={dadosCatalogo.servicosComCategoria}
          equipamentos={equipamentos}
          custoFixoMensalEstimado={custoFixoMensalEstimado}
        />
      )}
    </div>
  );
}
