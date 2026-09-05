"use client";

import { useState } from "react";
import type { MetaDiariaRow, TrafegoRegistroRow } from "@/lib/types/database";
import type { ClienteRow } from "@/lib/types/cadastros";
import type { StatusTrafego } from "@/lib/utils/trafego";
import { DateNav } from "@/components/admin/trafego/DateNav";
import { MetaCard } from "@/components/admin/trafego/MetaCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PremiumStatTile } from "@/components/admin/trafego/PremiumStatTile";
import { ClienteModal } from "@/components/admin/cadastros/ClienteModal";
import { IconTrendingUp, IconCheckCircle, IconAlertTriangle, IconPauseCircle, IconPlus } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ClientesTrafegoTabProps {
  data: string;
  clientes: ClienteRow[];
  metaPorCliente: Record<string, MetaDiariaRow>;
  registrosPorMeta: Record<string, TrafegoRegistroRow[]>;
  contagemStatus: Record<StatusTrafego, number>;
  onClienteCriado: (cliente: Pick<ClienteRow, "id" | "nome" | "cor">) => void;
}

/**
 * Fluxo por-cliente já existente antes da aba Info-Produtos. `clientes`
 * passou a vir do cadastro completo (`clientes`, não mais `profiles`/
 * role=cliente) — todo cliente cadastrado aparece aqui, com ou sem login
 * (mesma mudança de Produção). "+ Novo Cliente" cadastra sem sair da tela.
 */
export function ClientesTrafegoTab({ data, clientes, metaPorCliente, registrosPorMeta, contagemStatus, onClienteCriado }: ClientesTrafegoTabProps) {
  const { dict } = useLocale();
  const [novoClienteAberto, setNovoClienteAberto] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">{dict.trafego.clientesDescricao}</p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setNovoClienteAberto(true)} className="px-3 py-2 text-xs">
            <IconPlus className="h-3.5 w-3.5" />
            {dict.trafego.novoClienteBotao}
          </Button>
          <DateNav data={data} />
        </div>
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

      {novoClienteAberto && (
        <ClienteModal
          onCreated={(cliente) => {
            onClienteCriado(cliente);
          }}
          onClose={() => setNovoClienteAberto(false)}
        />
      )}
    </div>
  );
}
