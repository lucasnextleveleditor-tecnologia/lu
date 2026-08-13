import { createClient } from "@/lib/supabase/server";
import type { ProfileRow, MetaDiariaRow, TrafegoRegistroRow } from "@/lib/types/database";
import { todayISO } from "@/lib/utils/format";
import { calcularResumoTrafego, type StatusTrafego } from "@/lib/utils/trafego";
import { DateNav } from "@/components/admin/trafego/DateNav";
import { MetaCard } from "@/components/admin/trafego/MetaCard";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { IconTrendingUp, IconCheckCircle, IconAlertTriangle, IconPauseCircle } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

type ClienteResumido = Pick<ProfileRow, "id" | "full_name" | "email">;

interface TrafegoPageProps {
  searchParams: { data?: string };
}

const DATA_ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Painel de Tráfego & Metas Diárias — visão unificada
 * [Cliente] -> [Meta do Dia] -> [Status Atual do Tráfego], um card por
 * cliente. Meta e registros do dia SEMPRE vêm relacionados (nunca em silos
 * separados — ver supabase/schema.sql seção 5): busca-se todos os clientes,
 * depois as metas_diarias daquele dia, depois os trafego_registros presos a
 * essas metas, e tudo é agrupado em memória por cliente para o MetaCard.
 */
export default async function TrafegoPage({ searchParams }: TrafegoPageProps) {
  const data = searchParams.data && DATA_ISO_RE.test(searchParams.data) ? searchParams.data : todayISO();

  const supabase = await createClient();

  const { data: clientes } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "cliente")
    .order("full_name", { ascending: true })
    .overrideTypes<ClienteResumido[], { merge: false }>();

  const clienteIds = (clientes ?? []).map((c) => c.id);

  const { data: metas } = clienteIds.length
    ? await supabase
        .from("metas_diarias")
        .select("*")
        .eq("data", data)
        .in("cliente_id", clienteIds)
        .overrideTypes<MetaDiariaRow[], { merge: false }>()
    : { data: [] as MetaDiariaRow[] };

  const metaIds = (metas ?? []).map((m) => m.id);

  const { data: registros } = metaIds.length
    ? await supabase
        .from("trafego_registros")
        .select("*")
        .in("meta_id", metaIds)
        .order("created_at", { ascending: true })
        .overrideTypes<TrafegoRegistroRow[], { merge: false }>()
    : { data: [] as TrafegoRegistroRow[] };

  const metaPorCliente = new Map<string, MetaDiariaRow>();
  (metas ?? []).forEach((m) => metaPorCliente.set(m.cliente_id, m));

  const registrosPorMeta = new Map<string, TrafegoRegistroRow[]>();
  (registros ?? []).forEach((r) => {
    const lista = registrosPorMeta.get(r.meta_id) ?? [];
    lista.push(r);
    registrosPorMeta.set(r.meta_id, lista);
  });

  // KPIs do topo — mesmo cálculo de status usado em cada MetaCard, só
  // agregado por cliente pra dar a visão geral do dia de cara.
  const contagemStatus: Record<StatusTrafego, number> = { sem_meta: 0, abaixo_da_meta: 0, no_caminho: 0, meta_batida: 0 };
  (clientes ?? []).forEach((cliente) => {
    const meta = metaPorCliente.get(cliente.id) ?? null;
    const registrosDoCliente = meta ? registrosPorMeta.get(meta.id) ?? [] : [];
    const resumo = calcularResumoTrafego(meta ? { valor_investido_meta: meta.valor_investido_meta } : null, registrosDoCliente);
    contagemStatus[resumo.status]++;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Tráfego & Metas Diárias</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Cada card liga o cliente à Meta do Dia e ao status atual do tráfego lançado.
          </p>
        </div>
        <DateNav data={data} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={IconTrendingUp} label="No Caminho" value={contagemStatus.no_caminho} tone="good" hint="≥60% da meta do dia" />
        <StatTile icon={IconCheckCircle} label="Meta Batida" value={contagemStatus.meta_batida} tone="good" hint="100% ou mais investido" />
        <StatTile icon={IconAlertTriangle} label="Abaixo da Meta" value={contagemStatus.abaixo_da_meta} tone="warning" hint="Precisa de atenção" />
        <StatTile icon={IconPauseCircle} label="Sem Meta Definida" value={contagemStatus.sem_meta} tone="neutral" hint="Nenhuma meta lançada hoje" />
      </div>

      {!clientes?.length ? (
        <Card className="py-14 text-center text-sm text-ink-muted">Nenhum cliente cadastrado ainda.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {clientes.map((cliente) => {
            const meta = metaPorCliente.get(cliente.id) ?? null;
            const registrosDoCard = meta ? registrosPorMeta.get(meta.id) ?? [] : [];
            return <MetaCard key={cliente.id} cliente={cliente} data={data} meta={meta} registros={registrosDoCard} />;
          })}
        </div>
      )}
    </div>
  );
}
