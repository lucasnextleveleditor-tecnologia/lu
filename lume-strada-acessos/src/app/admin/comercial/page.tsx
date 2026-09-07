import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { AnotacaoRow, LeadComRelacoes, LeadRow } from "@/lib/types/comercial";
import type { TipoServicoRow } from "@/lib/types/producao";
import { leadEstaAberto } from "@/lib/utils/comercial";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { IconTarget, IconTrendingUp, IconCheckCircle, IconAlertTriangle } from "@/components/ui/icons";
import { ComercialWorkspace } from "@/components/admin/comercial/ComercialWorkspace";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";

export default async function ComercialPage() {
  const { supabase } = await requireModuloOuRedirect("comercial");
  const { dict } = await getDictionary();

  const [leadsRes, anotacoesRes, tiposServicoRes] = await Promise.all([
    supabase.from("crm_leads").select("*").order("created_at", { ascending: false }).overrideTypes<LeadRow[], { merge: false }>(),
    supabase
      .from("crm_anotacoes")
      .select("*")
      .order("created_at", { ascending: false })
      .overrideTypes<AnotacaoRow[], { merge: false }>(),
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

  const anotacoesPorLead = new Map<string, AnotacaoRow[]>();
  for (const a of anotacoes) anotacoesPorLead.set(a.lead_id, [...(anotacoesPorLead.get(a.lead_id) ?? []), a]);

  // KPIs do topo
  const leadsAbertos = leadsComRelacoes.filter(leadEstaAberto);
  const totalEmNegociacao = leadsAbertos.reduce((acc, l) => acc + (l.valor_estimado ?? 0), 0);
  const fechados = leadsComRelacoes.filter((l) => l.status === "fechado_ganha");
  const perdidos = leadsComRelacoes.filter((l) => l.status === "perdido");
  const taxaConversao = fechados.length + perdidos.length > 0 ? fechados.length / (fechados.length + perdidos.length) : null;

  const inicioMes = new Date();
  inicioMes.setDate(1);
  const inicioMesIso = inicioMes.toISOString().slice(0, 10);
  const fechadosNoMes = fechados.filter((l) => l.updated_at.slice(0, 10) >= inicioMesIso);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{dict.comercial.tituloPagina}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{dict.comercial.subtituloPagina}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={IconTarget}
          label={dict.comercial.statEmNegociacao}
          value={fmtBRL(totalEmNegociacao)}
          hint={dict.comercial.hintLeadsAbertos.replace("{count}", String(leadsAbertos.length))}
        />
        <StatTile
          icon={IconTrendingUp}
          label={dict.comercial.statTaxaConversao}
          value={taxaConversao != null ? `${Math.round(taxaConversao * 100)}%` : "—"}
          tone={taxaConversao != null && taxaConversao >= 0.5 ? "good" : "neutral"}
          hint={dict.comercial.hintTaxaConversao.replace("{ganhos}", String(fechados.length)).replace("{perdidos}", String(perdidos.length))}
        />
        <StatTile
          icon={IconCheckCircle}
          label={dict.comercial.statFechadosMes}
          value={fechadosNoMes.length}
          tone="good"
          hint={dict.comercial.hintFechadosMes}
        />
        <StatTile
          icon={IconAlertTriangle}
          label={dict.comercial.statFollowupsAtrasados}
          value={leadsAbertos.filter((l) => l.proximo_contato_em && l.proximo_contato_em < new Date().toISOString().slice(0, 10)).length}
          tone="warning"
          hint={dict.comercial.hintFollowupsAtrasados}
        />
      </div>

      <ComercialWorkspace leads={leadsComRelacoes} anotacoesPorLead={Object.fromEntries(anotacoesPorLead)} tiposServico={tiposServico} />
    </div>
  );
}
