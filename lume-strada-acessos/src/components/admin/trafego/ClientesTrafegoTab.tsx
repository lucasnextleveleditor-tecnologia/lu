"use client";

import type { MetaDiariaRow, ProfileRow, TrafegoRegistroRow } from "@/lib/types/database";
import type { StatusTrafego } from "@/lib/utils/trafego";
import { DateNav } from "@/components/admin/trafego/DateNav";
import { MetaCard } from "@/components/admin/trafego/MetaCard";
import { Card } from "@/components/ui/Card";
import { PremiumStatTile } from "@/components/admin/trafego/PremiumStatTile";
import { IconTrendingUp, IconCheckCircle, IconAlertTriangle, IconPauseCircle } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

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
  const { dict } = useLocale();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">{dict.trafego.clientesDescricao}</p>
        <DateNav data={data} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <PremiumStatTile
          icon={IconTrendingUp}
          label={dict.trafego.statNoCaminho}
          value={contagemStatus.no_caminho}
          tone="good"
          hint={dict.trafego.statNoCaminhoHint}
        />
        <PremiumStatTile
          icon={IconCheckCircle}
          label={dict.trafego.statMetaBatida}
          value={contagemStatus.meta_batida}
          tone="good"
          hint={dict.trafego.statMetaBatidaHint}
        />
        <PremiumStatTile
          icon={IconAlertTriangle}
          label={dict.trafego.statAbaixoMeta}
          value={contagemStatus.abaixo_da_meta}
          tone="warning"
          hint={dict.trafego.statAbaixoMetaHint}
        />
        <PremiumStatTile
          icon={IconPauseCircle}
          label={dict.trafego.statSemMeta}
          value={contagemStatus.sem_meta}
          tone="neutral"
          hint={dict.trafego.statSemMetaHint}
        />
      </div>

      {!clientes.length ? (
        <Card className="py-14 text-center text-sm text-ink-muted">{dict.trafego.nenhumClienteCadastrado}</Card>
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
