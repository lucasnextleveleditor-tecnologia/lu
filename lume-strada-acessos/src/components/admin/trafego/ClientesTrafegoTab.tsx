import type { MetaDiariaRow, ProfileRow, TrafegoRegistroRow } from "@/lib/types/database";
import type { StatusTrafego } from "@/lib/utils/trafego";
import { DateNav } from "@/components/admin/trafego/DateNav";
import { MetaCard } from "@/components/admin/trafego/MetaCard";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { IconTrendingUp, IconCheckCircle, IconAlertTriangle, IconPauseCircle } from "@/components/ui/icons";

type ClienteResumido = Pick<ProfileRow, "id" | "full_name" | "email">;

interface ClientesTrafegoTabProps {
  data: string;
  clientes: ClienteResumido[];
  metaPorCliente: Record<string, MetaDiariaRow>;
  registrosPorMeta: Record<string, TrafegoRegistroRow[]>;
  contagemStatus: Record<StatusTrafego, number>;
}

/** Fluxo por-cliente já existente antes da aba Info-Produtos — extraído do antigo `page.tsx` sem mudar nenhuma lógica. */
export function ClientesTrafegoTab({ data, clientes, metaPorCliente, registrosPorMeta, contagemStatus }: ClientesTrafegoTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">Cada card liga o cliente à Meta do Dia e ao status atual do tráfego lançado.</p>
        <DateNav data={data} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={IconTrendingUp} label="No Caminho" value={contagemStatus.no_caminho} tone="good" hint="≥60% da meta do dia" />
        <StatTile icon={IconCheckCircle} label="Meta Batida" value={contagemStatus.meta_batida} tone="good" hint="100% ou mais investido" />
        <StatTile icon={IconAlertTriangle} label="Abaixo da Meta" value={contagemStatus.abaixo_da_meta} tone="warning" hint="Precisa de atenção" />
        <StatTile icon={IconPauseCircle} label="Sem Meta Definida" value={contagemStatus.sem_meta} tone="neutral" hint="Nenhuma meta lançada hoje" />
      </div>

      {!clientes.length ? (
        <Card className="py-14 text-center text-sm text-ink-muted">Nenhum cliente cadastrado ainda.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {clientes.map((cliente) => {
            const meta = metaPorCliente[cliente.id] ?? null;
            const registrosDoCard = meta ? registrosPorMeta[meta.id] ?? [] : [];
            return <MetaCard key={cliente.id} cliente={cliente} data={data} meta={meta} registros={registrosDoCard} />;
          })}
        </div>
      )}
    </div>
  );
}
