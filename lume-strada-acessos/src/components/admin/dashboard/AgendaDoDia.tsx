"use client";

import Link from "next/link";
import type { TarefaAgendaItem, LeadAgendaItem } from "@/lib/types/dashboard";
import { STATUS_TAREFA_META } from "@/lib/utils/producao";
import { STATUS_LEAD_META } from "@/lib/utils/comercial";
import { fmtDiaSemanaEData } from "@/lib/utils/dashboard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IconCamera, IconExternalLink, IconTarget } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface AgendaDoDiaProps {
  data: string; // ISO yyyy-mm-dd
  captacoes: TarefaAgendaItem[];
  entregas: TarefaAgendaItem[];
  followUps: LeadAgendaItem[];
  titulo?: string;
}

/**
 * Agenda de UM dia — reaproveitada tanto na Visão Geral (sempre "hoje")
 * quanto no Calendário (o dia clicado na grade). Cada linha linka pro
 * módulo de origem (Produção ou Comercial): o Dashboard é uma visão
 * consolidada de leitura, não um editor — abrir/editar de verdade continua
 * acontecendo no board de cada módulo.
 */
export function AgendaDoDia({ data, captacoes, entregas, followUps, titulo }: AgendaDoDiaProps) {
  const { dict } = useLocale();
  const vazio = captacoes.length === 0 && entregas.length === 0 && followUps.length === 0;

  return (
    <Card className="p-5">
      <p className="mb-4 text-sm font-semibold capitalize text-ink-primary">{titulo ?? fmtDiaSemanaEData(data)}</p>

      {vazio ? (
        <p className="text-sm text-ink-muted">{dict.dashboard.nadaAgendado}</p>
      ) : (
        <div className="space-y-5">
          {captacoes.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <IconCamera className="h-3.5 w-3.5" /> {dict.dashboard.captacoes}
              </p>
              <div className="space-y-1.5">
                {captacoes.map((t) => (
                  <Link
                    key={t.id}
                    href="/admin/producao"
                    className="flex items-center justify-between gap-2 rounded-lg border border-base-800 px-3 py-2 text-sm transition hover:border-base-600"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-ink-primary">{t.titulo}</span>
                      {t.cliente_nome && <span className="block truncate text-xs text-ink-muted">{t.cliente_nome}</span>}
                    </span>
                    <Badge tone={STATUS_TAREFA_META[t.status].tone} label={STATUS_TAREFA_META[t.status].label} className="shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {entregas.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <IconExternalLink className="h-3.5 w-3.5" /> {dict.dashboard.entregas}
              </p>
              <div className="space-y-1.5">
                {entregas.map((t) => (
                  <Link
                    key={t.id}
                    href="/admin/producao"
                    className="flex items-center justify-between gap-2 rounded-lg border border-base-800 px-3 py-2 text-sm transition hover:border-base-600"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-ink-primary">{t.titulo}</span>
                      {t.cliente_nome && <span className="block truncate text-xs text-ink-muted">{t.cliente_nome}</span>}
                    </span>
                    <Badge tone={STATUS_TAREFA_META[t.status].tone} label={STATUS_TAREFA_META[t.status].label} className="shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {followUps.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <IconTarget className="h-3.5 w-3.5" /> {dict.dashboard.followUpsComercial}
              </p>
              <div className="space-y-1.5">
                {followUps.map((lead) => (
                  <Link
                    key={lead.id}
                    href="/admin/comercial"
                    className="flex items-center justify-between gap-2 rounded-lg border border-base-800 px-3 py-2 text-sm transition hover:border-base-600"
                  >
                    <span className="min-w-0 flex-1 truncate text-ink-primary">{lead.nome}</span>
                    <Badge tone={STATUS_LEAD_META[lead.status].tone} label={STATUS_LEAD_META[lead.status].label} className="shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
