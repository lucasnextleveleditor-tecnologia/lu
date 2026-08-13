import { createClient } from "@/lib/supabase/server";
import type { AnotacaoRow, LeadComRelacoes, LeadRow } from "@/lib/types/comercial";
import type { TipoServicoRow } from "@/lib/types/producao";
import { leadEstaAberto } from "@/lib/utils/comercial";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { IconTarget, IconTrendingUp, IconCheckCircle, IconAlertTriangle } from "@/components/ui/icons";
import { ComercialWorkspace } from "@/components/admin/comercial/ComercialWorkspace";

export const dynamic = "force-dynamic";

export default async function ComercialPage() {
  const supabase = await createClient();

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
        <h1 className="text-lg font-semibold tracking-tight">CRM &amp; Vendas</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Funil de pré-vendas, follow-up e conversão de leads em clientes.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={IconTarget} label="Em Negociação" value={fmtBRL(totalEmNegociacao)} hint={`${leadsAbertos.length} lead(s) em aberto`} />
        <StatTile
          icon={IconTrendingUp}
          label="Taxa de Conversão"
          value={taxaConversao != null ? `${Math.round(taxaConversao * 100)}%` : "—"}
          tone={taxaConversao != null && taxaConversao >= 0.5 ? "good" : "neutral"}
          hint={`${fechados.length} ganhos · ${perdidos.length} perdidos`}
        />
        <StatTile icon={IconCheckCircle} label="Fechados no Mês" value={fechadosNoMes.length} tone="good" hint="Negócios ganhos" />
        <StatTile
          icon={IconAlertTriangle}
          label="Follow-ups Atrasados"
          value={leadsAbertos.filter((l) => l.proximo_contato_em && l.proximo_contato_em < new Date().toISOString().slice(0, 10)).length}
          tone="warning"
          hint="Precisam de contato"
        />
      </div>

      <ComercialWorkspace leads={leadsComRelacoes} anotacoesPorLead={Object.fromEntries(anotacoesPorLead)} tiposServico={tiposServico} />
    </div>
  );
}
